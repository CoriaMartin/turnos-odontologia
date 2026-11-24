package ar.edu.turnosodonto.agenda.dominio;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.function.Function;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ReglasAgendaTest {

    private static final Instant AHORA = Instant.parse("2026-12-01T15:00:00Z");

    @Test
    void unInicioAnteriorAAhoraEsPasado() {
        assertThat(ReglasAgenda.esPasado(AHORA.minusSeconds(60), AHORA)).isTrue();
    }

    @Test
    void ahoraMismoNoEsPasado() {
        assertThat(ReglasAgenda.esPasado(AHORA, AHORA)).isFalse();
    }

    @ParameterizedTest(name = "{0} minutos → {1}")
    @CsvSource({"4, false", "5, true", "45, true", "480, true", "481, false"})
    void limitesDeDuracion(int minutos, boolean valida) {
        assertThat(ReglasAgenda.duracionValida(minutos)).isEqualTo(valida);
    }

    @Test
    void primerConflictoDevuelveElPrimeroQueSeSuperpone() {
        Intervalo a = Intervalo.de(AHORA, Duration.ofMinutes(30));                       // [0, 30)
        Intervalo b = Intervalo.de(AHORA.plusSeconds(30 * 60), Duration.ofMinutes(30));  // [30, 60)
        Intervalo nuevo = Intervalo.de(AHORA.plusSeconds(40 * 60), Duration.ofMinutes(30)); // [40, 70)

        assertThat(ReglasAgenda.primerConflicto(nuevo, List.of(a, b), Function.identity())).contains(b);
    }

    @Test
    void sinConflictoCuandoSoloSonAdyacentes() {
        Intervalo existente = Intervalo.de(AHORA, Duration.ofMinutes(45));
        Intervalo adyacente = Intervalo.de(AHORA.plusSeconds(45 * 60), Duration.ofMinutes(30));

        assertThat(ReglasAgenda.primerConflicto(adyacente, List.of(existente), Function.identity())).isEmpty();
    }

    /** RN-CA-01/04: es tardía solo si faltan MENOS horas que el límite; exactamente en el límite no lo es. */
    @ParameterizedTest(name = "faltan {0} min con límite de {1} h → tardía {2}")
    @CsvSource({"1500, 24, false", "1440, 24, false", "1439, 24, true", "660, 24, true", "1500, 48, true", "1, 0, false"})
    void cancelacionTardia(int minutosHastaElInicio, int horasLimite, boolean tardia) {
        Instant inicio = AHORA.plus(Duration.ofMinutes(minutosHastaElInicio));

        assertThat(ReglasAgenda.esCancelacionTardia(inicio, AHORA, Duration.ofHours(horasLimite))).isEqualTo(tardia);
    }

    @Test
    void soloLosEstadosActivosOcupanHorario() {
        assertThat(EstadoTurno.queOcupanHorario())
                .containsExactlyInAnyOrder(EstadoTurno.PROGRAMADO, EstadoTurno.ATENDIDO, EstadoTurno.AUSENTE);
        assertThat(EstadoTurno.CANCELADO.ocupaHorario()).isFalse();
        assertThat(EstadoTurno.CANCELADO_TARDIO.ocupaHorario()).isFalse();
    }
}
