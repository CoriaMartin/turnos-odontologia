package ar.edu.turnosodonto.agenda.turnos;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** RN-AG-08: la prestación del turno debe estar activa. */
public class PrestacionInactivaException extends NegocioException {

    public static final String CODIGO = "PRESTACION_INACTIVA";

    public PrestacionInactivaException() {
        super(CODIGO, HttpStatus.UNPROCESSABLE_ENTITY, "La prestación está desactivada: elegí otra.");
    }
}
