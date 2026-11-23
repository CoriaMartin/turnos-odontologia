package ar.edu.turnosodonto.shared;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

/**
 * Spec service-health, escenario "Base de datos caída". En lugar de apagar PostgreSQL,
 * se reemplaza el indicador de la base por uno que informa DOWN.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class HealthBaseCaidaIT {

    @TestConfiguration
    static class BaseCaidaConfig {
        /** Mismo nombre que el indicador autoconfigurado de la base, que así queda desactivado. */
        @Bean(name = "dbHealthContributor")
        HealthIndicator baseCaida() {
            return () -> Health.down().withDetail("motivo", "simulado").build();
        }
    }

    @Autowired
    private TestRestTemplate http;

    @Test
    void baseCaidaRespondeDown503() {
        ResponseEntity<String> respuesta = http.getForEntity("/actuator/health", String.class);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(respuesta.getBody()).contains("\"status\":\"DOWN\"").doesNotContain("simulado");
    }
}
