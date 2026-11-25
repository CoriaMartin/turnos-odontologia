package ar.edu.turnosodonto.agenda.turnos;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.DayOfWeek;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import ar.edu.turnosodonto.agenda.dominio.Intervalo;
import ar.edu.turnosodonto.shared.time.RelojConfig;

/**
 * Demo del perfil dev (C-20): al arrancar con {@code test,dev} se cargan pacientes y turnos ficticios
 * que cumplen las reglas de agenda, y un segundo intento no duplica nada.
 */
@SpringBootTest
@ActiveProfiles({"test", "dev"})
class DemoDevIT {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private TurnosDeEjemplo demo;

    @AfterEach
    void limpiar() {
        jdbc.update("delete from turno");
        jdbc.update("delete from paciente where dni like '0000000_'");
    }

    private List<Intervalo> intervalos() {
        return jdbc.query("select inicio, fin from turno order by inicio",
                (rs, i) -> new Intervalo(rs.getTimestamp("inicio").toInstant(), rs.getTimestamp("fin").toInstant()));
    }

    @Test
    void elArranqueDevCargaTurnosFicticiosValidosYNoLosDuplica() {
        assertThat(jdbc.queryForObject("select count(*) from paciente where dni like '0000000_'", Integer.class))
                .isEqualTo(5);
        List<Intervalo> turnos = intervalos();
        assertThat(turnos).hasSize(TurnosDeEjemplo.CANTIDAD);

        // Solo pacientes ficticios, en estado programado y en el futuro.
        assertThat(jdbc.queryForObject("""
                select count(*) from turno t join paciente p on p.id = t.paciente_id
                where p.dni like '0000000_' and t.estado = 'PROGRAMADO'""", Integer.class))
                .isEqualTo(TurnosDeEjemplo.CANTIDAD);
        assertThat(turnos).allSatisfy(t -> assertThat(t.inicio()).isAfter(Instant.now()));

        // Ninguno se superpone con otro y todos caen en un día hábil.
        for (int i = 1; i < turnos.size(); i++) {
            assertThat(turnos.get(i).seSuperponeCon(turnos.get(i - 1))).isFalse();
        }
        DayOfWeek dia = turnos.get(0).inicio().atZone(RelojConfig.ZONA_CONSULTORIO).getDayOfWeek();
        assertThat(dia).isNotIn(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);

        // Un segundo intento no duplica.
        demo.cargar();
        assertThat(intervalos()).hasSize(TurnosDeEjemplo.CANTIDAD);
    }
}
