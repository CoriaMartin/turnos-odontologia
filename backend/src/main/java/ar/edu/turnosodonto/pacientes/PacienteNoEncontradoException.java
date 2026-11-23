package ar.edu.turnosodonto.pacientes;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

public class PacienteNoEncontradoException extends NegocioException {

    public static final String CODIGO = "PACIENTE_NO_ENCONTRADO";

    public PacienteNoEncontradoException() {
        super(CODIGO, HttpStatus.NOT_FOUND, "No existe un paciente con ese identificador.");
    }
}
