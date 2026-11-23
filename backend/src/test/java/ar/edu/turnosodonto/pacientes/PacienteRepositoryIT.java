package ar.edu.turnosodonto.pacientes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;

import ar.edu.turnosodonto.support.PersistenciaTest;

/** Restricciones de la tabla paciente y búsqueda sin tildes, a nivel base (tareas 1.1 y 1.2). */
@PersistenciaTest
class PacienteRepositoryIT {

    @Autowired
    private PacienteRepository pacientes;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void sinPacientes() {
        pacientes.deleteAllInBatch();
    }

    private static DatosPaciente datos(String apellido, String dni) {
        return DatosPaciente.normalizados("Paciente", apellido, dni, null, null, null, null, null, false);
    }

    @Test
    void laBaseRechazaUnDniConLetras() {
        assertThatThrownBy(() -> jdbc.update(
                "insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio', '12A45678')"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void laBaseRechazaUnDniRepetido() {
        pacientes.saveAndFlush(Paciente.nuevo(datos("Ficticio Uno", "00000001")));

        assertThatThrownBy(() -> pacientes.saveAndFlush(Paciente.nuevo(datos("Ficticio Dos", "00000001"))))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void buscaSinTildesNiMayusculasYExcluyeInactivos() {
        pacientes.saveAndFlush(Paciente.nuevo(datos("Gómez Ficticio", "00000011")));
        Paciente inactivo = Paciente.nuevo(datos("Gomez Inactivo", "00000012"));
        inactivo.darDeBaja();
        pacientes.saveAndFlush(inactivo);

        var resultado = pacientes.buscarActivos(true, "%gomez%", PageRequest.of(0, 20));

        assertThat(resultado.getContent()).extracting(Paciente::getApellido).containsExactly("Gómez Ficticio");
    }
}
