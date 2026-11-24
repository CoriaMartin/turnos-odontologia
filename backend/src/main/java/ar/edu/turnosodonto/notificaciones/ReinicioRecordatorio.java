package ar.edu.turnosodonto.notificaciones;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import ar.edu.turnosodonto.agenda.turnos.TurnoReprogramado;

@Component
public class ReinicioRecordatorio {
    private final NotificacionRepository notificaciones;

    public ReinicioRecordatorio(NotificacionRepository notificaciones) {
        this.notificaciones = notificaciones;
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void reiniciar(TurnoReprogramado evento) {
        notificaciones.deleteByTurnoIdAndTipo(evento.turnoId(), "RECORDATORIO");
        notificaciones.flush();
    }
}
