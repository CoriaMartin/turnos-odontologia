package ar.edu.turnosodonto.prestaciones;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

public class PrestacionNoEncontradoException extends NegocioException {

    public static final String CODIGO = "PRESTACION_NO_ENCONTRADA";

    public PrestacionNoEncontradoException() {
        super(CODIGO, HttpStatus.NOT_FOUND, "No existe una prestación con ese identificador.");
    }
}
