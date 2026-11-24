package ar.edu.turnosodonto.pacientes;

import java.time.Instant;

/**
 * Puerto para la guarda RN-PA-04 (C-09). Lo implementa el módulo de agenda: así {@code pacientes} no depende de
 * {@code agenda}, que ya depende de {@code pacientes}.
 */
public interface TurnosDePaciente {

    /** Si el paciente tiene turnos PROGRAMADO cuyo inicio es estrictamente posterior a {@code ahora}. */
    boolean tieneProgramadosDesde(Long pacienteId, Instant ahora);
}
