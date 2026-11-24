package ar.edu.turnosodonto.agenda.turnos;

import java.time.Instant;

/**
 * Evento de dominio: un turno cambió de horario. Se publica dentro de la transacción de la reprogramación;
 * los consumidores (recordatorios, C-13) deben escucharlo con
 * {@code @TransactionalEventListener(phase = AFTER_COMMIT)} para no actuar sobre un cambio revertido.
 */
public record TurnoReprogramado(Long turnoId, Instant inicioAnterior, Instant inicioNuevo) {
}
