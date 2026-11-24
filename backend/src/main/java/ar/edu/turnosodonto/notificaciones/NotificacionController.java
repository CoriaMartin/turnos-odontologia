package ar.edu.turnosodonto.notificaciones;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class NotificacionController {
    private final ConsultaNotificacionService servicio;

    public NotificacionController(ConsultaNotificacionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/api/turnos/{id}/notificaciones")
    public NotificacionResponse consultar(@PathVariable Long id) {
        return servicio.consultar(id);
    }
}
