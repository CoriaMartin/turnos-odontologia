package ar.edu.turnosodonto.agenda.turnos;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** RN-AG-06 / DD-12. */
public class TurnoEnPasadoException extends NegocioException {

    public static final String CODIGO = "TURNO_EN_PASADO";

    public TurnoEnPasadoException() {
        super(CODIGO, HttpStatus.UNPROCESSABLE_ENTITY, "No se pueden dar turnos en el pasado. Elegí un horario futuro.");
    }
}
