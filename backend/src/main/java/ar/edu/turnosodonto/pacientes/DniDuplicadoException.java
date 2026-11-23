package ar.edu.turnosodonto.pacientes;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** El mensaje no repite el DNI (RN-DS-03). */
public class DniDuplicadoException extends NegocioException {

    public static final String CODIGO = "DNI_DUPLICADO";

    public DniDuplicadoException() {
        super(CODIGO, HttpStatus.CONFLICT, "Ya existe un paciente con ese DNI.");
    }
}
