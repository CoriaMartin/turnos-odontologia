package ar.edu.turnosodonto.prestaciones;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import ar.edu.turnosodonto.support.PersistenciaTest;

@PersistenciaTest
class PrestacionRepositoryIT {

    @Autowired
    private PrestacionRepository prestaciones;

    @Autowired
    private JdbcTemplate jdbc;

    private static DatosPrestacion datos(String nombre, int duracionMinutos) {
        return DatosPrestacion.normalizados(nombre, duracionMinutos);
    }

    @Test
    void laBaseRechazaDuracionMenorAlaMinima() {
        assertThatThrownBy(() -> jdbc.update(
                "insert into prestacion (nombre, duracion_minutos) values ('Duracion Corta Ficticia', 4)"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void laBaseRechazaDuracionMayorAlaMaxima() {
        assertThatThrownBy(() -> jdbc.update(
                "insert into prestacion (nombre, duracion_minutos) values ('Duracion Larga Ficticia', 481)"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void laBaseRechazaNombreRepetidoConDistintaCapitalizacion() {
        prestaciones.saveAndFlush(Prestacion.nuevo(datos("Limpieza Ficticia", 45)));

        assertThatThrownBy(() -> prestaciones.saveAndFlush(Prestacion.nuevo(datos("limpieza ficticia", 45))))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void existeNombreSinDistinguirMayusculas() {
        prestaciones.saveAndFlush(Prestacion.nuevo(datos("Control Ficticio", 30)));

        assertThat(prestaciones.existsByNombreIgnoreCase("control ficticio")).isTrue();
        assertThat(prestaciones.existsByNombreIgnoreCaseAndIdNot("control ficticio", 0L)).isTrue();
    }
}
