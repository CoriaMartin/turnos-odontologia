package ar.edu.turnosodonto.agenda.turnos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Timestamp;
import java.time.Instant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import ar.edu.turnosodonto.support.PersistenciaTest;

/**
 * Las restricciones EXCLUDE de V5 impiden solapamientos aun sin pasar por el servicio (RN-AG-09).
 * Inserta directo por JDBC; cada test termina en la violación porque PostgreSQL aborta la transacción.
 */
@PersistenciaTest
class TurnoRestriccionesIT {

    private static final Instant DIEZ = Instant.parse("2027-01-10T13:00:00Z"); // 10:00 en Argentina

    @Autowired
    private JdbcTemplate jdbc;

    private long pacienteId;
    private long profesionalId;
    private long sillonId;
    private long prestacionId;

    @BeforeEach
    void preparar() {
        jdbc.update("delete from turno");
        long usuarioId = jdbc.queryForObject(
                "insert into usuario (email, password_hash, rol) values ('restricciones@example.com', 'hash-ficticio', 'ODONTOLOGO') returning id",
                Long.class);
        profesionalId = jdbc.queryForObject(
                "insert into profesional (usuario_id, nombre, apellido) values (?, 'Ficticio', 'Restricciones') returning id",
                Long.class, usuarioId);
        sillonId = jdbc.queryForObject("insert into sillon (nombre) values ('Sillón de prueba C-07') returning id", Long.class);
        pacienteId = jdbc.queryForObject(
                "insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio Restricciones', '00000901') returning id",
                Long.class);
        prestacionId = jdbc.queryForObject("select id from prestacion where nombre = 'Limpieza'", Long.class);
    }

    private void insertar(int desdeMin, int hastaMin, String estado, long sillon) {
        jdbc.update("""
                insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin, estado)
                values (?, ?, ?, ?, ?, ?, ?)""",
                pacienteId, profesionalId, sillon, prestacionId,
                Timestamp.from(DIEZ.plusSeconds(desdeMin * 60L)), Timestamp.from(DIEZ.plusSeconds(hastaMin * 60L)), estado);
    }

    @Test
    void laBaseRechazaDosTurnosSuperpuestosDelMismoProfesional() {
        insertar(0, 45, "PROGRAMADO", sillonId);
        long otroSillon = jdbc.queryForObject("insert into sillon (nombre) values ('Otro sillón C-07') returning id", Long.class);

        assertThatThrownBy(() -> insertar(30, 60, "PROGRAMADO", otroSillon))
                .isInstanceOf(DataIntegrityViolationException.class)
                .hasMessageContaining("turno_sin_solape_profesional");
    }

    @Test
    void laBaseAceptaTurnosAdyacentesYEncimaDeUnCancelado() {
        insertar(0, 45, "PROGRAMADO", sillonId);
        insertar(45, 75, "PROGRAMADO", sillonId);
        insertar(-30, 0, "PROGRAMADO", sillonId);
        insertar(100, 145, "CANCELADO", sillonId);
        insertar(100, 145, "PROGRAMADO", sillonId);

        assertThat(jdbc.queryForObject("select count(*) from turno", Integer.class)).isEqualTo(5);
    }

    @Test
    void laBaseRechazaUnTurnoQueTerminaAntesDeEmpezar() {
        assertThatThrownBy(() -> insertar(45, 0, "PROGRAMADO", sillonId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
