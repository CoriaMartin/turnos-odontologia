package ar.edu.turnosodonto.support;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import ar.edu.turnosodonto.shared.persistence.AuditoriaConfig;
import ar.edu.turnosodonto.shared.time.RelojConfig;

/**
 * Slice JPA contra PostgreSQL real (turnos_test) con las migraciones Flyway aplicadas.
 * Cada test corre en una transacción que se revierte al terminar.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import({AuditoriaConfig.class, RelojConfig.class})
public @interface PersistenciaTest {
}
