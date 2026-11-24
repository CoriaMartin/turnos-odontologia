package ar.edu.turnosodonto.agenda.turnos.web;

import jakarta.validation.constraints.Size;

/**
 * Cuerpo opcional de la cancelación (C-09). Sin {@code version}: el estado final ya impide cancelar dos veces.
 * {@code motivo} vacío o en blanco se guarda como nulo (RN-CA-03).
 */
public record CancelarTurnoRequest(@Size(max = 255) String motivo) {
}
