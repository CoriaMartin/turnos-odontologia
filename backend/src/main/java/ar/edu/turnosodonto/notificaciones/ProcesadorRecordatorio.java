package ar.edu.turnosodonto.notificaciones;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ar.edu.turnosodonto.agenda.turnos.TurnoRepository;
import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;
import ar.edu.turnosodonto.configuracion.ConfiguracionService;

@Service
public class ProcesadorRecordatorio {
    private final TurnoRepository turnos;
    private final NotificacionRepository notificaciones;
    private final ConfiguracionService configuracion;
    private final EnviadorEmail enviador;
    private final PlantillaRecordatorio plantilla;
    private final Clock reloj;

    public ProcesadorRecordatorio(TurnoRepository turnos, NotificacionRepository notificaciones,
            ConfiguracionService configuracion, EnviadorEmail enviador, PlantillaRecordatorio plantilla, Clock reloj) {
        this.turnos = turnos;
        this.notificaciones = notificaciones;
        this.configuracion = configuracion;
        this.enviador = enviador;
        this.plantilla = plantilla;
        this.reloj = reloj;
    }

    @Transactional
    public void procesar(Long id) {
        if (!enviador.habilitado()) return;
        var turno = turnos.buscarParaActualizar(id).orElse(null);
        if (turno == null || turno.getEstado() != EstadoTurno.PROGRAMADO) return;
        var ahora = reloj.instant();
        var config = configuracion.obtener();
        if (!turno.getInicio().isAfter(ahora) || turno.getInicio().isAfter(
                ahora.plusSeconds(config.getHorasAnticipacionRecordatorio() * 3600L))) return;
        var paciente = turno.getPaciente();
        var email = paciente.getEmail();
        if (!paciente.isActivo() || !paciente.isAceptaRecordatorios() || email == null || email.isBlank()) return;
        var registro = notificaciones.findByTurnoIdAndTipo(id, "RECORDATORIO")
                .orElseGet(() -> new Notificacion(turno));
        if (!registro.puedeIntentar()) return;
        var mensaje = plantilla.crear(email, turno.getInicio(), ZoneId.of(config.getZonaHoraria()));
        try {
            enviador.enviar(mensaje);
        } catch (MailException fallo) {
            registro.registrarResultado(email, null);
            notificaciones.saveAndFlush(registro);
            return;
        }
        registro.registrarResultado(email, reloj.instant());
        notificaciones.saveAndFlush(registro);
    }
}
