package ar.edu.turnosodonto.pacientes;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

public class PacienteInactivoException extends NegocioException {

    public static final String CODIGO = "PACIENTE_INACTIVO";

    public PacienteInactivoException() {
        super(CODIGO, HttpStatus.CONFLICT, "El paciente está dado de baja y no se puede modificar.");
    }
}
