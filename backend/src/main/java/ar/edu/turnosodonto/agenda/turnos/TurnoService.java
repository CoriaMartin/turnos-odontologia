package ar.edu.turnosodonto.agenda.turnos;

import java.sql.SQLException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ar.edu.turnosodonto.agenda.dominio.Intervalo;
import ar.edu.turnosodonto.agenda.dominio.ReglasAgenda;
import ar.edu.turnosodonto.agenda.recursos.RecursosConsultorio;
import ar.edu.turnosodonto.pacientes.Paciente;
import ar.edu.turnosodonto.pacientes.PacienteService;
import ar.edu.turnosodonto.prestaciones.Prestacion;
import ar.edu.turnosodonto.prestaciones.PrestacionService;

/**
 * Creación y consulta de turnos (spec turnos). El no solapamiento se valida acá y además lo garantiza
 * la base con las restricciones EXCLUDE (RN-AG-09): si dos solicitudes compiten, la base rechaza la
 * segunda y se responde el mismo error.
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

    private final TurnoRepository turnos;
    private final PacienteService pacientes;
    private final PrestacionService prestaciones;
    private final RecursosConsultorio recursosConsultorio;
    private final ConsultaConflictos conflictos;
    private final BloqueoAgenda bloqueo;
    private final Clock reloj;

    public TurnoService(TurnoRepository turnos, PacienteService pacientes, PrestacionService prestaciones,
            RecursosConsultorio recursosConsultorio, ConsultaConflictos conflictos, BloqueoAgenda bloqueo,
            Clock reloj) {
        this.turnos = turnos;
        this.pacientes = pacientes;
        this.prestaciones = prestaciones;
        this.recursosConsultorio = recursosConsultorio;
        this.conflictos = conflictos;
        this.bloqueo = bloqueo;
        this.reloj = reloj;
    }

    @Transactional
    public Turno crear(NuevoTurno nuevo) {
        if (ReglasAgenda.esPasado(nuevo.inicio(), reloj.instant())) {
            throw new TurnoEnPasadoException();
        }
        Paciente paciente = pacientes.obtener(nuevo.pacienteId());
        if (!paciente.isActivo()) {
            throw new PacienteInactivoParaTurnoException();
        }
        Prestacion prestacion = prestaciones.obtener(nuevo.prestacionId());
        if (!prestacion.isActiva()) {
            throw new PrestacionInactivaException();
        }
        int minutos = nuevo.duracionMinutos() != null ? nuevo.duracionMinutos() : prestacion.getDuracionMinutos();
        if (!ReglasAgenda.duracionValida(minutos)) {
            throw new IllegalArgumentException("Duración fuera de rango: la valida la API (5 a 480 minutos).");
        }
        Intervalo intervalo = Intervalo.de(nuevo.inicio(), Duration.ofMinutes(minutos));

        RecursosConsultorio.Recursos recursos = recursosConsultorio.recursos();
        Long profesionalId = recursos.profesional().getId();
        Long sillonId = recursos.sillon().getId();

        // Serializa altas simultáneas sobre los mismos recursos (evita el deadlock entre las dos EXCLUDE).
        bloqueo.bloquear(profesionalId, sillonId);
        conflictos.buscar(profesionalId, sillonId, intervalo).ifPresent(conflicto -> {
            throw new TurnoSolapadoException(conflicto);
        });

        Turno turno = Turno.programar(paciente, recursos.profesional(), recursos.sillon(), prestacion,
                intervalo, nuevo.observaciones());
        try {
            turnos.saveAndFlush(turno);
        } catch (DataIntegrityViolationException e) {
            if (esViolacionDeExclusion(e)) {
                // Otra transacción ocupó el horario entre la verificación y el INSERT.
                throw new TurnoSolapadoException(
                        conflictos.buscarEnTransaccionNueva(profesionalId, sillonId, intervalo).orElse(null));
            }
            throw e;
        }
        log.info("Turno creado id={}", turno.getId());
        return turno;
    }

    @Transactional(readOnly = true)
    public Turno obtener(Long id) {
        return turnos.buscarConDetalle(id).orElseThrow(TurnoNoEncontradoException::new);
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
