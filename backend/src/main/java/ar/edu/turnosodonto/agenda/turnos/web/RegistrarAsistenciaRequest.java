package ar.edu.turnosodonto.agenda.turnos.web;

import jakarta.validation.constraints.NotNull;

public record RegistrarAsistenciaRequest(@NotNull EstadoAsistencia estado) {
}
