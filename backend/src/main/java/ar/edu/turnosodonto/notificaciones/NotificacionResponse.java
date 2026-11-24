package ar.edu.turnosodonto.notificaciones;

import java.time.Instant;

public record NotificacionResponse(Long turnoId, String estado, int intentos, Instant enviadaEn) {
}
