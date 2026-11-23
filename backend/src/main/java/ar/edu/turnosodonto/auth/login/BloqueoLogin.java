package ar.edu.turnosodonto.auth.login;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Bloqueo por intentos fallidos (RN-AU-03), en memoria y por email normalizado.
 * Se reinicia con el servidor (decisión del equipo para C-04).
 */
@Component
public class BloqueoLogin {

    static final int MAX_INTENTOS = 5;
    static final Duration DURACION_BLOQUEO = Duration.ofMinutes(15);

    private record Estado(int intentos, Instant bloqueadoHasta) {
    }

    private final Map<String, Estado> estados = new ConcurrentHashMap<>();
    private final Clock reloj;

    public BloqueoLogin(Clock reloj) {
        this.reloj = reloj;
    }

    public boolean estaBloqueado(String email) {
        Estado estado = estados.get(email);
        return estado != null && estado.bloqueadoHasta() != null
                && reloj.instant().isBefore(estado.bloqueadoHasta());
    }

    public void registrarFallo(String email) {
        Instant ahora = reloj.instant();
        estados.compute(email, (clave, anterior) -> {
            int intentos = (anterior == null || bloqueoVencido(anterior, ahora)) ? 1 : anterior.intentos() + 1;
            Instant hasta = intentos >= MAX_INTENTOS ? ahora.plus(DURACION_BLOQUEO) : null;
            return new Estado(intentos, hasta);
        });
    }

    public void registrarExito(String email) {
        estados.remove(email);
    }

    private static boolean bloqueoVencido(Estado estado, Instant ahora) {
        return estado.bloqueadoHasta() != null && !ahora.isBefore(estado.bloqueadoHasta());
    }
}
