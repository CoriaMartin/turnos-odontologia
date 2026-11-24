package ar.edu.turnosodonto.notificaciones;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import ar.edu.turnosodonto.agenda.turnos.TurnoRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class NotificacionPersistenciaIT {
    @Autowired JdbcTemplate jdbc;
    @Autowired TurnoRepository turnos;
    @Autowired NotificacionRepository notificaciones;
    private long turnoId;
    private static final String EMAIL = "paciente@example.com";
    private static final Instant ENVIO = Instant.parse("2026-12-01T12:00:00Z");

    @BeforeEach
    void preparar() {
        long paciente = jdbc.queryForObject("insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio Notificacion', '00000991') returning id", Long.class);
        turnoId = jdbc.queryForObject("""
            insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin)
            values (?, (select min(id) from profesional), (select min(id) from sillon),
            (select min(id) from prestacion), '2099-12-01T12:00:00Z', '2099-12-01T13:00:00Z') returning id
            """, Long.class, paciente);
    }

    private Notificacion nueva() {
        return new Notificacion(turnos.findById(turnoId).orElseThrow());
    }

    @Test
    void registraEnvio() {
        Notificacion n = nueva();
        n.registrarResultado(EMAIL, ENVIO);
        notificaciones.saveAndFlush(n);
        Notificacion guardada = notificaciones.findByTurnoIdAndTipo(turnoId, "RECORDATORIO").orElseThrow();
        assertThat(guardada.getEstado()).isEqualTo(EstadoNotificacion.ENVIADA);
        assertThat(guardada.getIntentos()).isEqualTo(1);
        assertThat(guardada.getEnviadaEn()).isEqualTo(ENVIO);
        assertThat(guardada.getError()).isNull();
        assertThatThrownBy(() -> n.registrarResultado(EMAIL, ENVIO)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void falloYReintentoExitoso() {
        Notificacion n = nueva();
        n.registrarResultado(EMAIL, null);
        notificaciones.saveAndFlush(n);
        assertThat(n.getEstado()).isEqualTo(EstadoNotificacion.FALLIDA);
        assertThat(n.getError()).isNotBlank();
        assertThat(n.getEnviadaEn()).isNull();
        n.registrarResultado(EMAIL, ENVIO);
        notificaciones.saveAndFlush(n);
        assertThat(n.getIntentos()).isEqualTo(2);
        assertThat(n.getEstado()).isEqualTo(EstadoNotificacion.ENVIADA);
        assertThat(n.getError()).isNull();
    }

    @Test
    void limitaIntentos() {
        Notificacion n = nueva();
        for (int i = 0; i < 3; i++) n.registrarResultado(EMAIL, null);
        notificaciones.saveAndFlush(n);
        assertThat(n.getIntentos()).isEqualTo(3);
        assertThat(n.puedeIntentar()).isFalse();
        assertThatThrownBy(() -> n.registrarResultado(EMAIL, null)).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void restriccionUnica() {
        Notificacion n = nueva();
        n.registrarResultado(EMAIL, ENVIO);
        notificaciones.saveAndFlush(n);
        Notificacion duplicada = nueva();
        duplicada.registrarResultado(EMAIL, ENVIO);
        assertThatThrownBy(() -> notificaciones.saveAndFlush(duplicada)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rechazaEnviadaSinFecha() {
        assertThatThrownBy(() -> jdbc.update("insert into notificacion (turno_id, canal, tipo, estado, intentos, destinatario) values (?, 'EMAIL', 'RECORDATORIO', 'ENVIADA', 1, ?)", turnoId, EMAIL)).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rechazaCuartoIntentoEnBase() {
        assertThatThrownBy(() -> jdbc.update("insert into notificacion (turno_id, canal, tipo, estado, intentos, destinatario) values (?, 'EMAIL', 'RECORDATORIO', 'FALLIDA', 4, ?)", turnoId, EMAIL)).isInstanceOf(DataIntegrityViolationException.class);
    }
}