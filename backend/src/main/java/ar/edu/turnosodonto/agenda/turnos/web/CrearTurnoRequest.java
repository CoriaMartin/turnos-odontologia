package ar.edu.turnosodonto.agenda.turnos.web;

import java.time.OffsetDateTime;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import ar.edu.turnosodonto.agenda.dominio.ReglasAgenda;
import ar.edu.turnosodonto.agenda.turnos.TurnoService;

/**
 * Solicitud de alta de turno. {@code inicio} con zona horaria obligatoria (RN-GL-01).
 * {@code duracionMinutos} opcional: por defecto la de la prestación (RN-AG-05).
 */
public record CrearTurnoRequest(
        @NotNull Long pacienteId,
        @NotNull Long prestacionId,
        @NotNull OffsetDateTime inicio,
        @Min(ReglasAgenda.DURACION_MINIMA_MINUTOS) @Max(ReglasAgenda.DURACION_MAXIMA_MINUTOS) Integer duracionMinutos,
        @Size(max = 500) String observaciones) {

    public TurnoService.NuevoTurno aNuevoTurno() {
        String obs = observaciones == null || observaciones.isBlank() ? null : observaciones.trim();
        return new TurnoService.NuevoTurno(pacienteId, prestacionId, inicio.toInstant(), duracionMinutos, obs);
    }
}
