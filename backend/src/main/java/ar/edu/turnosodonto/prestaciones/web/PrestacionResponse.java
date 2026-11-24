package ar.edu.turnosodonto.prestaciones.web;

import ar.edu.turnosodonto.prestaciones.Prestacion;

public record PrestacionResponse(Long id, String nombre, int duracionMinutos, boolean activa) {

    public static PrestacionResponse de(Prestacion prestacion) {
        return new PrestacionResponse(
                prestacion.getId(),
                prestacion.getNombre(),
                prestacion.getDuracionMinutos(),
                prestacion.isActiva());
    }
}
