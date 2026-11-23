package ar.edu.turnosodonto.configuracion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import ar.edu.turnosodonto.support.PersistenciaTest;

/** Spec configuracion-consultorio. */
@PersistenciaTest
@Import(ConfiguracionService.class)
class ConfiguracionPersistenciaIT {

    @Autowired
    private ConfiguracionService servicio;

    @Autowired
    private ConfiguracionRepository repositorio;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void laMigracionCreaLaConfiguracionPorDefecto() {
        Configuracion configuracion = servicio.obtener();

        assertThat(configuracion.getHorasCancelacionTardia()).isEqualTo(24);
        assertThat(configuracion.getHorasAnticipacionRecordatorio()).isEqualTo(24);
        assertThat(configuracion.getZonaHoraria()).isEqualTo("America/Argentina/Buenos_Aires");
    }

    @Test
    void segundaConfiguracionSeRechaza() {
        assertThat(repositorio.count()).isEqualTo(1);
        // Tras un error, PostgreSQL aborta la transacción del test: la violación va al final.
        assertThatThrownBy(() -> jdbc.update("insert into configuracion (id) values (2)"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void otraFilaConElMismoIdSeRechaza() {
        assertThatThrownBy(() -> jdbc.update("insert into configuracion (id) values (1)"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void cancelacionTardiaNegativaSeRechazaYConservaElValor() {
        Configuracion configuracion = servicio.obtener();

        assertThatThrownBy(() -> configuracion.actualizar(-1, 24))
                .isInstanceOf(ConfiguracionInvalidaException.class)
                .extracting("codigo").isEqualTo("CONFIGURACION_INVALIDA");
        assertThat(configuracion.getHorasCancelacionTardia()).isEqualTo(24);
        // La base también lo impide, aunque se saltee el dominio.
        assertThatThrownBy(() -> jdbc.update("update configuracion set horas_cancelacion_tardia = -1"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void recordatorioEnCeroSeRechaza() {
        Configuracion configuracion = servicio.obtener();

        assertThatThrownBy(() -> configuracion.actualizar(24, 0))
                .isInstanceOf(ConfiguracionInvalidaException.class);
        assertThatThrownBy(() -> jdbc.update("update configuracion set horas_anticipacion_recordatorio = 0"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void cancelacionTardiaEnCeroSeAcepta() {
        Configuracion configuracion = servicio.obtener();

        configuracion.actualizar(0, 24);
        repositorio.saveAndFlush(configuracion);

        assertThat(jdbc.queryForObject("select horas_cancelacion_tardia from configuracion", Integer.class))
                .isZero();
    }
}
