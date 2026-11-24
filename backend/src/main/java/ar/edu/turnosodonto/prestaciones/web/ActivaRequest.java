package ar.edu.turnosodonto.prestaciones.web;

import jakarta.validation.constraints.NotNull;

public record ActivaRequest(@NotNull Boolean activa) {
}
