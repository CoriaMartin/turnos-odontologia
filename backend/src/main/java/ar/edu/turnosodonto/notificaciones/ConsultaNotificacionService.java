package ar.edu.turnosodonto.notificaciones;

import java.time.Clock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ar.edu.turnosodonto.agenda.turnos.TurnoRepository;
import ar.edu.turnosodonto.agenda.turnos.TurnoNoEncontradoException;
import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;

@Service
public class ConsultaNotificacionService {
    private final TurnoRepository turnos;
    private final NotificacionRepository notificaciones;
    private final Clock reloj;

    public ConsultaNotificacionService(TurnoRepository turnos, NotificacionRepository notificaciones, Clock reloj) {
        this.turnos = turnos;
        this.notificaciones = notificaciones;
        this.reloj = reloj;
    }

    @Transactional(readOnly = true)
    public NotificacionResponse consultar(Long id) {
        var turno = turnos.buscarConDetalle(id).orElseThrow(TurnoNoEncontradoException::new);
        var registro = notificaciones.findByTurnoIdAndTipo(id, "RECORDATORIO").orElse(null);
        int intentos = registro == null ? 0 : registro.getIntentos();
        if (registro != null && registro.getEstado() == EstadoNotificacion.ENVIADA) {
            return new NotificacionResponse(id, "ENVIADA", intentos, registro.getEnviadaEn());
        }
        var paciente = turno.getPaciente();
        String estado;
        if (turno.getEstado() != EstadoTurno.PROGRAMADO || !turno.getInicio().isAfter(reloj.instant())
                || !paciente.isActivo() || paciente.getEmail() == null || paciente.getEmail().isBlank()) {
            estado = "NO_APLICA";
        } else if (!paciente.isAceptaRecordatorios()) {
            estado = "NO_CONSENTIDO";
        } else {
            estado = intentos >= 3 ? "FALLIDA" : "PENDIENTE";
        }
        return new NotificacionResponse(id, estado, intentos, null);
    }
}
