package ar.edu.turnosodonto.agenda.turnos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.lang.reflect.Field;
import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;
import ar.edu.turnosodonto.agenda.dominio.Intervalo;
import ar.edu.turnosodonto.agenda.recursos.Profesional;
import ar.edu.turnosodonto.agenda.recursos.Sillon;
import ar.edu.turnosodonto.auth.Rol;
import ar.edu.turnosodonto.auth.Usuario;
import ar.edu.turnosodonto.pacientes.DatosPaciente;
import ar.edu.turnosodonto.pacientes.Paciente;
import ar.edu.turnosodonto.prestaciones.DatosPrestacion;
import ar.edu.turnosodonto.prestaciones.Prestacion;

/** Transición de reprogramación en la entidad (RN-ES-03), sin Spring ni base. */
class TurnoTest {

    private static final Instant AHORA = Instant.parse("2026-11-30T12:00:00Z");
    private static final Instant MANIANA = Instant.parse("2026-12-01T13:00:00Z");

    private Turno turno;

    @BeforeEach
    void preparar() {
        Paciente paciente = Paciente.nuevo(DatosPaciente.normalizados(
                "Paciente", "Ficticio", "00000601", null, null, null, null, null, false));
        Profesional profesional = new Profesional(
                new Usuario("odontologo@example.com", "hash-ficticio", Rol.ODONTOLOGO), "Odontólogo", "Titular", null);
        Prestacion limpieza = Prestacion.nuevo(new DatosPrestacion("Limpieza", 45));
        turno = Turno.programar(paciente, profesional, new Sillon("Sillón 1"), limpieza,
                Intervalo.de(MANIANA, Duration.ofMinutes(45)), null);
    }

    private void forzarEstado(EstadoTurno estado) throws Exception {
        Field campo = Turno.class.getDeclaredField("estado");
        campo.setAccessible(true);
        campo.set(turno, estado);
    }

    @Test
    void unTurnoProgramadoYFuturoSeReprograma() {
        Intervalo nuevo = Intervalo.de(MANIANA.plusSeconds(2 * 3600), Duration.ofMinutes(45));

        turno.reprogramar(nuevo, AHORA);

        assertThat(turno.intervalo()).isEqualTo(nuevo);
        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.PROGRAMADO);
    }

    @ParameterizedTest
    @EnumSource(value = EstadoTurno.class, names = {"CANCELADO", "CANCELADO_TARDIO", "ATENDIDO", "AUSENTE"})
    void unTurnoQueNoEstaProgramadoNoSeReprograma(EstadoTurno estado) throws Exception {
        forzarEstado(estado);
        Intervalo original = turno.intervalo();

        assertThatThrownBy(() -> turno.reprogramar(Intervalo.de(MANIANA.plusSeconds(7200), Duration.ofMinutes(45)), AHORA))
                .isInstanceOf(TransicionInvalidaException.class);
        assertThat(turno.intervalo()).isEqualTo(original);
    }

    @Test
    void unTurnoQueYaEmpezoNoSeReprograma() {
        Instant duranteElTurno = MANIANA.plusSeconds(10 * 60);

        assertThatThrownBy(() -> turno.validarReprogramable(duranteElTurno))
                .isInstanceOf(TransicionInvalidaException.class)
                .extracting("codigo").isEqualTo("TRANSICION_INVALIDA");
    }
}
