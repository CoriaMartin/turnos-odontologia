package ar.edu.turnosodonto.prestaciones;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

public class NombreDuplicadoException extends NegocioException {

    public static final String CODIGO = "NOMBRE_DUPLICADO";

    public NombreDuplicadoException() {
        super(CODIGO, HttpStatus.CONFLICT, "Ya existe una prestación con ese nombre.");
    }
}
