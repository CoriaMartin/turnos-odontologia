package ar.edu.turnosodonto;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import ar.edu.turnosodonto.shared.time.RelojConfig;

/** Arranque del contexto contra turnos_test (tareas 2.1, 2.2, 2.3 y 3.1). */
@SpringBootTest
@ActiveProfiles("test")
@ExtendWith(OutputCaptureExtension.class)
class ContextoIT {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private Clock reloj;

    @Test
    void conectaATurnosTest() {
        assertThat(jdbc.queryForObject("select current_database()", String.class)).isEqualTo("turnos_test");
    }

    @Test
    void laMigracionV1HabilitaBtreeGist() {
        Integer cantidad = jdbc.queryForObject(
                "select count(*) from pg_extension where extname = 'btree_gist'", Integer.class);
        assertThat(cantidad).isEqualTo(1);
    }

    @Test
    void elRelojUsaLaZonaDelConsultorio() {
        assertThat(reloj.getZone()).isEqualTo(RelojConfig.ZONA_CONSULTORIO);
    }

    @Test
    void noSeGeneraContrasenaPorDefecto(CapturedOutput salida) {
        assertThat(salida.getAll()).doesNotContain("Using generated security password");
    }
}
