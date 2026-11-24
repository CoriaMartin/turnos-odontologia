package ar.edu.turnosodonto.agenda.turnos.web;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import ar.edu.turnosodonto.agenda.dominio.ReglasAgenda;
import ar.edu.turnosodonto.agenda.turnos.TurnoService;

/**
 * Nuevo horario de un turno. {@code version} es la que devolvió el GET del turno (bloqueo optimista).
 * {@code duracionMinutos} opcional: por defecto se conserva la duración actual.
 */
public record ReprogramarTurnoRequest(
        @NotNull OffsetDateTime inicio,
        @Min(ReglasAgenda.DURACION_MINIMA_MINUTOS) @Max(ReglasAgenda.DURACION_MAXIMA_MINUTOS) Integer duracionMinutos,
        @NotNull Integer version) {

    public TurnoService.NuevoHorario aNuevoHorario() {
        return new TurnoService.NuevoHorario(inicio.toInstant(), duracionMinutos, version);
    }
}
