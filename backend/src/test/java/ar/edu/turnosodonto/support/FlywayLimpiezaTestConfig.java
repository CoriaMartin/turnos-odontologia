package ar.edu.turnosodonto.support;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * En el perfil test, cada contexto arranca con turnos_test
 * limpia y migrada desde cero.
 */
@Configuration
@Profile("test")
public class FlywayLimpiezaTestConfig {

    @Bean
    public FlywayMigrationStrategy limpiarYMigrar() {
        return flyway -> {
            try (var conexion = flyway.getConfiguration()
                    .getDataSource().getConnection()) {

                String base = conexion.getCatalog();

                if (!"turnos_test".equals(base)) {
                    throw new IllegalStateException(
                        "Se impide limpiar una base distinta de turnos_test: " + base
                    );
                }

            } catch (java.sql.SQLException e) {
                throw new IllegalStateException(
                    "No se pudo verificar la base de pruebas", e
                );
            }

            flyway.clean();
            flyway.migrate();
        };
    }
}
