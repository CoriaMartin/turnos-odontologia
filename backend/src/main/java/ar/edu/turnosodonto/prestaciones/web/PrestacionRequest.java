package ar.edu.turnosodonto.prestaciones.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import ar.edu.turnosodonto.prestaciones.DatosPrestacion;

public record PrestacionRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotNull @Min(5) @Max(480) Integer duracionMinutos) {

    public DatosPrestacion aDatos() {
        return DatosPrestacion.normalizados(nombre, duracionMinutos);
    }
}
