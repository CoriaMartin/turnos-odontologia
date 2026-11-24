package ar.edu.turnosodonto.agenda.turnos;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

public class TurnoNoEncontradoException extends NegocioException {

    public static final String CODIGO = "TURNO_NO_ENCONTRADO";

    public TurnoNoEncontradoException() {
        super(CODIGO, HttpStatus.NOT_FOUND, "No existe un turno con ese identificador.");
    }
}
