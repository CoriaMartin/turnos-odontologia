package ar.edu.turnosodonto.agenda.turnos;

import java.sql.SQLException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;
import ar.edu.turnosodonto.agenda.dominio.Intervalo;
import ar.edu.turnosodonto.agenda.dominio.ReglasAgenda;
import ar.edu.turnosodonto.agenda.recursos.RecursosConsultorio;
import ar.edu.turnosodonto.pacientes.Paciente;
import ar.edu.turnosodonto.pacientes.PacienteService;
import ar.edu.turnosodonto.prestaciones.Prestacion;
import ar.edu.turnosodonto.prestaciones.PrestacionService;

/**
 * Alta, reprogramación y consulta de turnos (spec turnos). El no solapamiento se valida acá y además lo
 * garantiza la base con las restricciones EXCLUDE (RN-AG-09): si dos solicitudes compiten, la base rechaza
 * la segunda y se responde el mismo error.
 */
@Service
public class TurnoService {

    private static final Logger log = LoggerFactory.getLogger(TurnoService.class);

    /** SQLSTATE de PostgreSQL para violación de una restricción EXCLUDE. */
    static final String SQLSTATE_EXCLUSION = "23P01";

    /** Datos para crear un turno. {@code duracionMinutos} nulo = la duración de la prestación. */
    public record NuevoTurno(Long pacienteId, Long prestacionId, Instant inicio, Integer duracionMinutos,
            String observaciones) {
    }

    /** Nuevo horario. {@code duracionMinutos} nulo = la duración actual del turno; {@code version} la que leyó el cliente. */
    public record NuevoHorario(Instant inicio, Integer duracionMinutos, int version) {
    }

    private final TurnoRepository turnos;
    private final PacienteService pacientes;
    private final PrestacionService prestaciones;
    private final RecursosConsultorio recursosConsultorio;
    private final ConsultaConflictos conflictos;
    private final BloqueoAgenda bloqueo;
    private final ApplicationEventPublisher eventos;
    private final Clock reloj;

    public TurnoService(TurnoRepository turnos, PacienteService pacientes, PrestacionService prestaciones,
            RecursosConsultorio recursosConsultorio, ConsultaConflictos conflictos, BloqueoAgenda bloqueo,
            ApplicationEventPublisher eventos, Clock reloj) {
        this.turnos = turnos;
        this.pacientes = pacientes;
        this.prestaciones = prestaciones;
        this.recursosConsultorio = recursosConsultorio;
        this.conflictos = conflictos;
        this.bloqueo = bloqueo;
        this.eventos = eventos;
        this.reloj = reloj;
    }

    @Transactional
    public Turno crear(NuevoTurno nuevo) {
        validarNoPasado(nuevo.inicio());
        Paciente paciente = pacientes.obtener(nuevo.pacienteId());
        if (!paciente.isActivo()) {
            throw new PacienteInactivoParaTurnoException();
        }
        Prestacion prestacion = prestaciones.obtener(nuevo.prestacionId());
        if (!prestacion.isActiva()) {
            throw new PrestacionInactivaException();
        }
        int minutos = nuevo.duracionMinutos() != null ? nuevo.duracionMinutos() : prestacion.getDuracionMinutos();
        Intervalo intervalo = intervalo(nuevo.inicio(), minutos);

        RecursosConsultorio.Recursos recursos = recursosConsultorio.recursos();
        Long profesionalId = recursos.profesional().getId();
        Long sillonId = recursos.sillon().getId();

        // Serializa altas simultáneas sobre los mismos recursos (evita el deadlock entre las dos EXCLUDE).
        bloqueo.bloquear(profesionalId, sillonId);
        verificarSinConflicto(profesionalId, sillonId, intervalo, ConsultaConflictos.NINGUNO);

        Turno turno = Turno.programar(paciente, recursos.profesional(), recursos.sillon(), prestacion,
                intervalo, nuevo.observaciones());
        guardar(turno, profesionalId, sillonId, intervalo, ConsultaConflictos.NINGUNO);
        log.info("Turno creado id={}", turno.getId());
        return turno;
    }

    /** RN-ES-03: mueve un turno programado y futuro a otro horario, conservando el turno. */
    @Transactional
    public Turno reprogramar(Long id, NuevoHorario horario) {
        validarNoPasado(horario.inicio());
        Turno turno = turnos.buscarConDetalle(id).orElseThrow(TurnoNoEncontradoException::new);
        if (turno.getVersion() != horario.version()) {
            throw new TurnoModificadoException();
        }
        int minutos = horario.duracionMinutos() != null
                ? horario.duracionMinutos()
                : (int) turno.intervalo().duracion().toMinutes();
        Intervalo nuevo = intervalo(horario.inicio(), minutos);

        Long profesionalId = turno.getProfesional().getId();
        Long sillonId = turno.getSillon().getId();
        bloqueo.bloquear(profesionalId, sillonId);

        Instant ahora = reloj.instant();
        Instant inicioAnterior = turno.getInicio();
        // Validar y buscar conflictos ANTES de modificar: la consulta haría flush del turno ya cambiado.
        turno.validarReprogramable(ahora);
        verificarSinConflicto(profesionalId, sillonId, nuevo, turno.getId());
        turno.reprogramar(nuevo, ahora);
        guardar(turno, profesionalId, sillonId, nuevo, turno.getId());

        eventos.publishEvent(new TurnoReprogramado(turno.getId(), inicioAnterior, nuevo.inicio()));
        log.info("Turno reprogramado id={}", turno.getId());
        return turno;
    }

    @Transactional(readOnly = true)
    public Turno obtener(Long id) {
        return turnos.buscarConDetalle(id).orElseThrow(TurnoNoEncontradoException::new);
    }

    /**
     * Agenda (C-08): turnos que ocupan alguna parte del período, ordenados por inicio. Valida el período
     * (obligatorio, no vacío, máx. 31 días). Sin {@code incluirCancelados} omite CANCELADO y CANCELADO_TARDIO.
     */
    @Transactional(readOnly = true)
    public List<Turno> agenda(Instant desde, Instant hasta, boolean incluirCancelados) {
        PeriodoAgenda periodo = new PeriodoAgenda(desde, hasta);
        Set<EstadoTurno> estados = incluirCancelados
                ? EnumSet.allOf(EstadoTurno.class)
                : EstadoTurno.queOcupanHorario();
        return turnos.buscarAgenda(periodo.desde(), periodo.hasta(), estados);
    }

    private void validarNoPasado(Instant inicio) {
        if (ReglasAgenda.esPasado(inicio, reloj.instant())) {
            throw new TurnoEnPasadoException();
        }
    }

    private static Intervalo intervalo(Instant inicio, int minutos) {
        if (!ReglasAgenda.duracionValida(minutos)) {
            throw new IllegalArgumentException("Duración fuera de rango: la valida la API (5 a 480 minutos).");
        }
        return Intervalo.de(inicio, Duration.ofMinutes(minutos));
    }

    private void verificarSinConflicto(Long profesionalId, Long sillonId, Intervalo intervalo, long excluirId) {
        conflictos.buscar(profesionalId, sillonId, intervalo, excluirId).ifPresent(conflicto -> {
            throw new TurnoSolapadoException(conflicto);
        });
    }

    private void guardar(Turno turno, Long profesionalId, Long sillonId, Intervalo intervalo, long excluirId) {
        try {
            turnos.saveAndFlush(turno);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new TurnoModificadoException();
        } catch (DataIntegrityViolationException e) {
            if (esViolacionDeExclusion(e)) {
                // Otra transacción ocupó el horario entre la verificación y la escritura.
                throw new TurnoSolapadoException(
                        conflictos.buscarEnTransaccionNueva(profesionalId, sillonId, intervalo, excluirId).orElse(null));
            }
            throw e;
        }
    }

    private static boolean esViolacionDeExclusion(Throwable error) {
        for (Throwable causa = error; causa != null; causa = causa.getCause()) {
            if (causa instanceof SQLException sql && SQLSTATE_EXCLUSION.equals(sql.getSQLState())) {
                return true;
            }
        }
        return false;
    }
}
