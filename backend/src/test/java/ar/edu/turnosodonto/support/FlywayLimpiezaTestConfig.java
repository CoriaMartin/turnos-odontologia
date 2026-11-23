package ar.edu.turnosodonto.support;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * En el perfil test, cada contexto arranca con turnos_test limpia y migrada desde cero.
 * Solo existe en src/test y solo aplica al perfil test (que apunta a turnos_test).
 */
@Configuration
@Profile("test")
public class FlywayLimpiezaTestConfig {

    @Bean
    public FlywayMigrationStrategy limpiarYMigrar() {
        return flyway -> {
            flyway.clean();
            flyway.migrate();
        };
    }
}
