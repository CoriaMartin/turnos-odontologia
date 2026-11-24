package ar.edu.turnosodonto.agenda.dominio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.Instant;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/** Intervalos semiabiertos [inicio, fin) (RN-AG-03), sin Spring ni base. */
class IntervaloTest {

    private static final Instant BASE = Instant.parse("2026-12-01T13:00:00Z"); // 10:00 en Argentina

    private static Intervalo de(int desdeMin, int hastaMin) {
        return new Intervalo(BASE.plusSeconds(desdeMin * 60L), BASE.plusSeconds(hastaMin * 60L));
    }

    @ParameterizedTest(name = "[{0},{1}) vs [0,45) → {2}")
    @CsvSource({
            "30, 60, true",    // solapamiento parcial por la derecha
            "-30, 15, true",   // solapamiento parcial por la izquierda
            "15, 30, true",    // contenido
            "-15, 60, true",   // contenedor
            "0, 45, true",     // igual
            "45, 75, false",   // empieza justo cuando termina (borde)
            "-30, 0, false",   // termina justo cuando empieza (borde)
            "60, 90, false",   // después, separado
            "-60, -30, false"  // antes, separado
    })
    void superposicionSemiabierta(int desde, int hasta, boolean seSuperpone) {
        Intervalo existente = de(0, 45);
        Intervalo nuevo = de(desde, hasta);

        assertThat(nuevo.seSuperponeCon(existente)).isEqualTo(seSuperpone);
        assertThat(existente.seSuperponeCon(nuevo)).isEqualTo(seSuperpone);
    }

    @Test
    void seConstruyeDesdeUnaDuracion() {
        Intervalo intervalo = Intervalo.de(BASE, Duration.ofMinutes(45));

        assertThat(intervalo.fin()).isEqualTo(BASE.plusSeconds(45 * 60));
        assertThat(intervalo.duracion()).isEqualTo(Duration.ofMinutes(45));
    }

    @Test
    void finIgualAlInicioNoEsValido() {
        assertThatThrownBy(() -> new Intervalo(BASE, BASE)).isInstanceOf(IllegalArgumentException.class);
    }
}
