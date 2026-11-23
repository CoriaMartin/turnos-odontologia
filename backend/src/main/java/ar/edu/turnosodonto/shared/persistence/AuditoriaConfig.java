package ar.edu.turnosodonto.shared.persistence;

import java.time.Clock;
import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Auditoría de fechas con el {@link Clock} inyectable, para que los tests con reloj fijo
 * controlen también {@code creado_en} y {@code actualizado_en}. Va en una configuración propia
 * (no en la clase principal) para no romper los slice tests.
 */
@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "proveedorFechaAuditoria")
public class AuditoriaConfig {

    @Bean
    public DateTimeProvider proveedorFechaAuditoria(Clock reloj) {
        return () -> Optional.of(reloj.instant());
    }
}
