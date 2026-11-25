package ar.edu.turnosodonto.agenda.turnos;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import ar.edu.turnosodonto.pacientes.Paciente;
import ar.edu.turnosodonto.pacientes.PacienteRepository;
import ar.edu.turnosodonto.prestaciones.Prestacion;
import ar.edu.turnosodonto.prestaciones.PrestacionRepository;
import ar.edu.turnosodonto.shared.time.RelojConfig;

/**
 * Turnos FICTICIOS para la demo (C-20). Solo con el perfil {@code dev} y solo si no hay turnos.
 * Corre al terminar el arranque, después del usuario inicial y de los pacientes de ejemplo, y crea los turnos
 * con {@link TurnoService#crear}, así respetan las mismas reglas de agenda que la API. Si algo falla, solo
 * advierte: la demo nunca impide que la aplicación arranque.
 */
@Component
@Profile("dev")
public class TurnosDeEjemplo {

    private static final Logger log = LoggerFactory.getLogger(TurnosDeEjemplo.class);

    /** Pacientes ficticios de PacientesDeEjemplo (DNIs 0000000N, RN-DS-01). */
    private static final String PREFIJO_DNI_FICTICIO = "0000000";
    private static final LocalTime PRIMER_TURNO = LocalTime.of(9, 0);
    private static final Duration ESPACIO_ENTRE_TURNOS = Duration.ofMinutes(15);
    static final int CANTIDAD = 6;

    private final TurnoService turnos;
    private final TurnoRepository repositorio;
    private final PacienteRepository pacientes;
    private final PrestacionRepository prestaciones;
    private final Clock reloj;

    public TurnosDeEjemplo(TurnoService turnos, TurnoRepository repositorio, PacienteRepository pacientes,
            PrestacionRepository prestaciones, Clock reloj) {
        this.turnos = turnos;
        this.repositorio = repositorio;
        this.pacientes = pacientes;
        this.prestaciones = prestaciones;
        this.reloj = reloj;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void cargar() {
        if (repositorio.count() > 0) {
            return;
        }
        List<Paciente> ficticios = pacientes.findAll().stream()
                .filter(p -> p.isActivo() && p.getDni().startsWith(PREFIJO_DNI_FICTICIO))
                .toList();
        List<Prestacion> activas = prestaciones.findAllByOrderByNombreAsc().stream()
                .filter(Prestacion::isActiva)
                .toList();
        if (ficticios.isEmpty() || activas.isEmpty()) {
            log.warn("Demo: no hay pacientes ficticios o prestaciones activas; no se cargan turnos de ejemplo");
            return;
        }

        ZonedDateTime inicio = proximoDiaHabil().atTime(PRIMER_TURNO).atZone(RelojConfig.ZONA_CONSULTORIO);
        try {
            for (int i = 0; i < CANTIDAD; i++) {
                Prestacion prestacion = activas.get(i % activas.size());
                Paciente paciente = ficticios.get(i % ficticios.size());
                turnos.crear(new TurnoService.NuevoTurno(paciente.getId(), prestacion.getId(), inicio.toInstant(),
                        null, "Turno de ejemplo para la demo"));
                inicio = inicio.plusMinutes(prestacion.getDuracionMinutos()).plus(ESPACIO_ENTRE_TURNOS);
            }
            log.info("Demo: {} turnos de ejemplo cargados", CANTIDAD);
        } catch (RuntimeException e) {
            log.warn("Demo: no se pudieron cargar los turnos de ejemplo ({})", e.getMessage());
        }
    }

    /** Mañana o, si cae en fin de semana, el lunes siguiente. */
    LocalDate proximoDiaHabil() {
        LocalDate dia = LocalDate.now(reloj.withZone(RelojConfig.ZONA_CONSULTORIO)).plusDays(1);
        while (dia.getDayOfWeek() == DayOfWeek.SATURDAY || dia.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dia = dia.plusDays(1);
        }
        return dia;
    }
}
