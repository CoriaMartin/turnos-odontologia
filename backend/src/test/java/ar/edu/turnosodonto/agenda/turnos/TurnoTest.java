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
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

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

/** Transiciones de reprogramación (RN-ES-03) y cancelación (RN-CA) en la entidad, sin Spring ni base. */
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

    // --- Cancelación (C-09, RN-CA, RN-ES-02). MANIANA está 25 h después de AHORA. ---

    private static final Duration LIMITE_24_H = Duration.ofHours(24);

    @Test
    void cancelacionAnticipadaQuedaCanceladoYRegistraHoraYMotivo() {
        turno.cancelar("  Viaje imprevisto  ", AHORA, LIMITE_24_H);

        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.CANCELADO);
        assertThat(turno.getCanceladoEn()).isEqualTo(AHORA);
        assertThat(turno.getMotivoCancelacion()).isEqualTo("Viaje imprevisto");
        assertThat(turno.intervalo()).isEqualTo(Intervalo.de(MANIANA, Duration.ofMinutes(45)));
    }

    @Test
    void cancelacionConMenosHorasQueElLimiteEsTardia() {
        Instant onceHorasAntes = MANIANA.minus(Duration.ofHours(11));

        turno.cancelar(null, onceHorasAntes, LIMITE_24_H);

        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.CANCELADO_TARDIO);
    }

    @Test
    void cancelacionExactamenteEnElLimiteNoEsTardia() {
        turno.cancelar(null, MANIANA.minus(LIMITE_24_H), LIMITE_24_H);

        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.CANCELADO);
    }

    @Test
    void conLimiteCeroNuncaEsTardia() {
        turno.cancelar(null, MANIANA.minusSeconds(1), Duration.ZERO);

        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.CANCELADO);
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   "})
    void motivoVacioQuedaNulo(String motivo) {
        turno.cancelar(motivo, AHORA, LIMITE_24_H);

        assertThat(turno.getMotivoCancelacion()).isNull();
    }

    @ParameterizedTest
    @EnumSource(value = EstadoTurno.class, names = {"CANCELADO", "CANCELADO_TARDIO", "ATENDIDO", "AUSENTE"})
    void unTurnoQueNoEstaProgramadoNoSeCancela(EstadoTurno estado) throws Exception {
        forzarEstado(estado);

        assertThatThrownBy(() -> turno.cancelar("Otro motivo", AHORA, LIMITE_24_H))
                .isInstanceOf(TransicionInvalidaException.class);
        assertThat(turno.getEstado()).isEqualTo(estado);
        assertThat(turno.getMotivoCancelacion()).isNull();
        assertThat(turno.getCanceladoEn()).isNull();
    }

    @Test
    void unTurnoQueEmpiezaJustoAhoraNoSeCancela() {
        assertThatThrownBy(() -> turno.cancelar(null, MANIANA, LIMITE_24_H))
                .isInstanceOf(TransicionInvalidaException.class)
                .extracting("codigo").isEqualTo("TRANSICION_INVALIDA");
        assertThat(turno.getEstado()).isEqualTo(EstadoTurno.PROGRAMADO);
        assertThat(turno.getCanceladoEn()).isNull();
    }
}
