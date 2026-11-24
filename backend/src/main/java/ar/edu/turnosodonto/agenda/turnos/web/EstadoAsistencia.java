package ar.edu.turnosodonto.agenda.turnos.web;

import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;

public enum EstadoAsistencia {

    ATENDIDO,
    AUSENTE;

    public EstadoTurno aEstadoTurno() {
        return EstadoTurno.valueOf(name());
    }
}
