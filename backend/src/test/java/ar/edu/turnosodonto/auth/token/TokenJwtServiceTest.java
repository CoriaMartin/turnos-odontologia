package ar.edu.turnosodonto.auth.token;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import ar.edu.turnosodonto.auth.Rol;
import ar.edu.turnosodonto.auth.Usuario;
import ar.edu.turnosodonto.auth.config.SeguridadProperties;
import ar.edu.turnosodonto.support.RelojMutable;

class TokenJwtServiceTest {

    private static final String SECRETO = "secreto-ficticio-solo-para-tests-0123456789abcdef";

    private RelojMutable reloj;
    private TokenJwtService servicio;
    private Usuario usuario;

    @BeforeEach
    void preparar() throws Exception {
        reloj = new RelojMutable(Instant.parse("2026-03-10T12:00:00Z"), ZoneOffset.UTC);
        servicio = new TokenJwtService(new SeguridadProperties(SECRETO, 480, "http://localhost:5173"), reloj);
        usuario = new Usuario("odontologo@example.com", "hash-ficticio", Rol.ODONTOLOGO);
        Field id = Usuario.class.getDeclaredField("id");
        id.setAccessible(true);
        id.set(usuario, 7L);
    }

    @Test
    void tokenEmitidoEsValidoYVenceSegunLaConfiguracion() {
        TokenEmitido emitido = servicio.emitir(usuario);

        assertThat(emitido.expiraEn()).isEqualTo(Instant.parse("2026-03-10T20:00:00Z"));
        assertThat(servicio.validar(emitido.token()))
                .contains(new UsuarioAutenticado(7L, "odontologo@example.com"));
    }

    @Test
    void tokenVencidoNoEsValido() {
        TokenEmitido emitido = servicio.emitir(usuario);
        reloj.avanzar(Duration.ofMinutes(481));

        assertThat(servicio.validar(emitido.token())).isEmpty();
    }

    @Test
    void tokenFirmadoConOtraClaveNoEsValido() {
        TokenJwtService otro = new TokenJwtService(
                new SeguridadProperties("otra-clave-ficticia-distinta-0123456789abcdef", 480, "x"), reloj);
        String ajeno = otro.emitir(usuario).token();

        assertThat(servicio.validar(ajeno)).isEmpty();
    }

    @Test
    void textoQueNoEsTokenNoEsValido() {
        assertThat(servicio.validar("no-es-un-token")).isEmpty();
    }
}
