package ar.edu.turnosodonto.pacientes;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** RN-PA-04: no se da de baja un paciente con turnos programados futuros. */
public class PacienteConTurnosFuturosException extends NegocioException {

    public static final String CODIGO = "PACIENTE_CON_TURNOS_FUTUROS";

    public PacienteConTurnosFuturosException() {
        super(CODIGO, HttpStatus.CONFLICT,
                "El paciente tiene turnos programados. Cancelalos antes de darlo de baja.");
    }
}
