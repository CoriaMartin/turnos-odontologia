package ar.edu.turnosodonto.agenda.turnos.web;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneId;

import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;
import ar.edu.turnosodonto.agenda.turnos.Turno;
import ar.edu.turnosodonto.shared.time.RelojConfig;

/** Turno para la API. Fechas ISO-8601 en la zona del consultorio. Sin DNI ni contacto del paciente. */
public record TurnoResponse(
        Long id,
        OffsetDateTime inicio,
        OffsetDateTime fin,
        EstadoTurno estado,
        long duracionMinutos,
        PacienteResumen paciente,
        PrestacionResumen prestacion,
        Long profesionalId,
        Long sillonId,
        String observaciones,
        int version,
        String motivoCancelacion,
        OffsetDateTime canceladoEn) {

    public record PacienteResumen(Long id, String nombre, String apellido) {
    }

    public record PrestacionResumen(Long id, String nombre) {
    }

    private static final ZoneId ZONA = RelojConfig.ZONA_CONSULTORIO;

    public static TurnoResponse de(Turno t) {
        return new TurnoResponse(
                t.getId(),
                t.getInicio().atZone(ZONA).toOffsetDateTime(),
                t.getFin().atZone(ZONA).toOffsetDateTime(),
                t.getEstado(),
                Duration.between(t.getInicio(), t.getFin()).toMinutes(),
                new PacienteResumen(t.getPaciente().getId(), t.getPaciente().getNombre(), t.getPaciente().getApellido()),
                new PrestacionResumen(t.getPrestacion().getId(), t.getPrestacion().getNombre()),
                t.getProfesional().getId(),
                t.getSillon().getId(),
                t.getObservaciones(),
                t.getVersion(),
                t.getMotivoCancelacion(),
                t.getCanceladoEn() == null ? null : t.getCanceladoEn().atZone(ZONA).toOffsetDateTime());
    }
}
