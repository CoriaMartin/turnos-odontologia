package ar.edu.turnosodonto.auth.config;

import java.nio.charset.StandardCharsets;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Configuración de seguridad. Se valida al arrancar: un secreto faltante o corto impide levantar
 * el sistema con un mensaje que nombra la variable de entorno.
 */
@ConfigurationProperties("app.seguridad")
public record SeguridadProperties(
        String jwtSecret,
        @DefaultValue("480") int jwtExpMinutos,
        @DefaultValue("http://localhost:5173") String frontendOrigin) {

    static final int BYTES_MINIMOS_SECRETO = 32;

    public SeguridadProperties {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("Falta la variable JWT_SECRET (clave para firmar los tokens).");
        }
        if (jwtSecret.getBytes(StandardCharsets.UTF_8).length < BYTES_MINIMOS_SECRETO) {
            throw new IllegalStateException(
                    "JWT_SECRET debe tener al menos " + BYTES_MINIMOS_SECRETO + " bytes.");
        }
        if (jwtExpMinutos <= 0) {
            throw new IllegalStateException("JWT_EXP_MINUTES debe ser mayor a 0.");
        }
    }
}
