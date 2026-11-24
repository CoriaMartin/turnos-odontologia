package ar.edu.turnosodonto.agenda.turnos;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/**
 * RN-AG-08 / RN-PA-03. Mismo código que en pacientes (PACIENTE_INACTIVO) pero 422:
 * acá es un dato inválido de la solicitud, no un conflicto de edición.
 */
public class PacienteInactivoParaTurnoException extends NegocioException {

    public static final String CODIGO = "PACIENTE_INACTIVO";

    public PacienteInactivoParaTurnoException() {
        super(CODIGO, HttpStatus.UNPROCESSABLE_ENTITY, "El paciente está dado de baja: no se le pueden dar turnos.");
    }
}
