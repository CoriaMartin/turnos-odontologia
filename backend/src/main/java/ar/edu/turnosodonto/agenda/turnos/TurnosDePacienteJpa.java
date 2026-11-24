package ar.edu.turnosodonto.agenda.turnos;

import java.time.Instant;

import org.springframework.stereotype.Component;

import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;
import ar.edu.turnosodonto.pacientes.TurnosDePaciente;

/** Adaptador del puerto {@link TurnosDePaciente} (RN-PA-04, C-09) sobre la tabla de turnos. */
@Component
class TurnosDePacienteJpa implements TurnosDePaciente {

    private final TurnoRepository turnos;

    TurnosDePacienteJpa(TurnoRepository turnos) {
        this.turnos = turnos;
    }

    @Override
    public boolean tieneProgramadosDesde(Long pacienteId, Instant ahora) {
        return turnos.existsByPacienteIdAndEstadoAndInicioAfter(pacienteId, EstadoTurno.PROGRAMADO, ahora);
    }
}
