package ar.edu.turnosodonto.prestaciones;

import java.util.Objects;

public record DatosPrestacion(String nombre, int duracionMinutos) {

    public static DatosPrestacion normalizados(String nombre, Integer duracionMinutos) {
        return new DatosPrestacion(nombre.trim(), Objects.requireNonNull(duracionMinutos, "duracionMinutos"));
    }
}
