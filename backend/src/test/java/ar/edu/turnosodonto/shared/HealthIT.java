package ar.edu.turnosodonto.shared;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

/** Spec service-health: servicio operativo, respuesta mínima y endpoints no expuestos. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class HealthIT {

    @Autowired
    private TestRestTemplate http;

    @Test
    void servicioOperativoRespondeUpSinCredenciales() {
        ResponseEntity<String> respuesta = http.getForEntity("/actuator/health", String.class);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(respuesta.getBody()).contains("\"status\":\"UP\"");
    }

    @Test
    void respuestaMinimaSinDetallesInternos() {
        String cuerpo = http.getForObject("/actuator/health", String.class);

        assertThat(cuerpo)
                .doesNotContain("components")
                .doesNotContain("jdbc:")
                .doesNotContain("turnos_test")
                .doesNotContain("details");
    }

    @Test
    void endpointDeEntornoNoExpuesto() {
        ResponseEntity<String> respuesta = http.getForEntity("/actuator/env", String.class);

        assertThat(respuesta.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
