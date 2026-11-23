package ar.edu.turnosodonto.auth.login;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import ar.edu.turnosodonto.support.RelojMutable;

class BloqueoLoginTest {

    private static final String EMAIL = "odontologo@example.com";

    private RelojMutable reloj;
    private BloqueoLogin bloqueo;

    @BeforeEach
    void preparar() {
        reloj = new RelojMutable(Instant.parse("2026-03-10T12:00:00Z"), ZoneOffset.UTC);
        bloqueo = new BloqueoLogin(reloj);
    }

    private void fallar(int veces) {
        for (int i = 0; i < veces; i++) {
            bloqueo.registrarFallo(EMAIL);
        }
    }

    @Test
    void cuatroFallosNoBloquean() {
        fallar(4);
        assertThat(bloqueo.estaBloqueado(EMAIL)).isFalse();
    }

    @Test
    void elQuintoFalloBloquea() {
        fallar(5);
        assertThat(bloqueo.estaBloqueado(EMAIL)).isTrue();
    }

    @Test
    void seDesbloqueaALosQuinceMinutos() {
        fallar(5);
        reloj.avanzar(Duration.ofMinutes(15).minusSeconds(1));
        assertThat(bloqueo.estaBloqueado(EMAIL)).isTrue();

        reloj.avanzar(Duration.ofSeconds(1));
        assertThat(bloqueo.estaBloqueado(EMAIL)).isFalse();
    }

    @Test
    void trasElDesbloqueoElContadorEmpiezaDeCero() {
        fallar(5);
        reloj.avanzar(Duration.ofMinutes(15));
        fallar(1);
        assertThat(bloqueo.estaBloqueado(EMAIL)).isFalse();
    }

    @Test
    void unExitoReiniciaElContador() {
        fallar(4);
        bloqueo.registrarExito(EMAIL);
        fallar(1);
        assertThat(bloqueo.estaBloqueado(EMAIL)).isFalse();
    }

    @Test
    void elBloqueoEsPorEmail() {
        fallar(5);
        assertThat(bloqueo.estaBloqueado("otro@example.com")).isFalse();
    }
}
