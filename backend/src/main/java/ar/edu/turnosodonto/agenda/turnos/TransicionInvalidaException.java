package ar.edu.turnosodonto.agenda.turnos;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** RN-ES-02/04: la operación no es válida para el estado actual del turno. Reutilizable por C-09 y C-11. */
public class TransicionInvalidaException extends NegocioException {

    public static final String CODIGO = "TRANSICION_INVALIDA";

    public TransicionInvalidaException(String mensaje) {
        super(CODIGO, HttpStatus.CONFLICT, mensaje);
    }
}
