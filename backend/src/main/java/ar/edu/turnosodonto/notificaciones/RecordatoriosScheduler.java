package ar.edu.turnosodonto.notificaciones;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ar.edu.turnosodonto.configuracion.ConfiguracionService;
import java.sql.Timestamp;

@Component
public class RecordatoriosScheduler {
    private final JdbcTemplate jdbc;
    private final ConfiguracionService configuracion;
    private final EnviadorEmail enviador;
    private final ProcesadorRecordatorio procesador;
    private final Clock reloj;

    public RecordatoriosScheduler(JdbcTemplate jdbc, ConfiguracionService configuracion,
            EnviadorEmail enviador, ProcesadorRecordatorio procesador, Clock reloj) {
        this.jdbc = jdbc;
        this.configuracion = configuracion;
        this.enviador = enviador;
        this.procesador = procesador;
        this.reloj = reloj;
    }

    @Scheduled(cron = "0 */15 * * * *")
    public void ejecutar() {
        if (!enviador.habilitado()) return;
        Instant ahora = reloj.instant();
        Instant hasta = ahora.plusSeconds(configuracion.obtener().getHorasAnticipacionRecordatorio() * 3600L);
        List<Long> ids = jdbc.queryForList("""
                select t.id from turno t join paciente p on p.id = t.paciente_id
                where t.estado = 'PROGRAMADO' and t.inicio > ? and t.inicio <= ?
                  and p.activo and p.acepta_recordatorios and p.email is not null
                  and not exists (select 1 from notificacion n where n.turno_id = t.id
                    and n.tipo = 'RECORDATORIO' and (n.estado = 'ENVIADA' or n.intentos >= 3))
                order by t.inicio, t.id
                """, Long.class, Timestamp.from(ahora), Timestamp.from(hasta));
        ids.forEach(procesador::procesar);
    }
}
