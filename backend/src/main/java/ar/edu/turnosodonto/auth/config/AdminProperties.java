package ar.edu.turnosodonto.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Datos del usuario inicial. Solo se exigen cuando la base no tiene usuarios
 * (ver {@code UsuarioInicial}); en arranques posteriores pueden faltar.
 */
@ConfigurationProperties("app.admin")
public record AdminProperties(String email, String password) {
}
