package ar.edu.turnosodonto.agenda.turnos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.OffsetDateTime;

import org.junit.jupiter.api.Test;

/** Validación del período de agenda (C-08, spec turnos "Período de consulta válido"). */
class PeriodoAgendaTest {

    private static final Instant DESDE = OffsetDateTime.parse("2026-12-01T00:00:00-03:00").toInstant();

    @Test
    void periodoDeExactamente31DiasEsValido() {
        Instant hasta = OffsetDateTime.parse("2027-01-01T00:00:00-03:00").toInstant();

        assertThat(new PeriodoAgenda(DESDE, hasta).hasta()).isEqualTo(hasta);
    }

    @Test
    void periodoDe31DiasYUnMinutoEsInvalido() {
        Instant hasta = OffsetDateTime.parse("2027-01-01T00:01:00-03:00").toInstant();

        assertThatThrownBy(() -> new PeriodoAgenda(DESDE, hasta))
                .isInstanceOfSatisfying(PeriodoAgendaInvalidoException.class,
                        e -> assertThat(e.getError().campo()).isEqualTo("hasta"));
    }

    @Test
    void sinDesdeEsInvalido() {
        assertThatThrownBy(() -> new PeriodoAgenda(null, DESDE))
                .isInstanceOfSatisfying(PeriodoAgendaInvalidoException.class,
                        e -> assertThat(e.getError().campo()).isEqualTo("desde"));
    }

    @Test
    void sinHastaEsInvalido() {
        assertThatThrownBy(() -> new PeriodoAgenda(DESDE, null))
                .isInstanceOfSatisfying(PeriodoAgendaInvalidoException.class,
                        e -> assertThat(e.getError().campo()).isEqualTo("hasta"));
    }

    @Test
    void periodoVacioOInvertidoEsInvalido() {
        assertThatThrownBy(() -> new PeriodoAgenda(DESDE, DESDE))
                .isInstanceOf(PeriodoAgendaInvalidoException.class);
        assertThatThrownBy(() -> new PeriodoAgenda(DESDE, DESDE.minusSeconds(60)))
                .isInstanceOf(PeriodoAgendaInvalidoException.class);
    }

    @Test
    void elErrorSeExponeComoErroresPorCampo() {
        PeriodoAgendaInvalidoException e = new PeriodoAgendaInvalidoException("desde", "mensaje");

        assertThat(e.getCodigo()).isEqualTo("VALIDACION_FALLIDA");
        assertThat(e.getEstado().value()).isEqualTo(422);
        assertThat(e.propiedades()).containsKey("errores");
    }
}
