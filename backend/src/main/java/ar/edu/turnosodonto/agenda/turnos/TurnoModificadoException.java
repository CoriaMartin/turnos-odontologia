package ar.edu.turnosodonto.agenda.turnos;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** Bloqueo optimista: el turno cambió desde que el cliente lo leyó. */
public class TurnoModificadoException extends NegocioException {

    public static final String CODIGO = "TURNO_MODIFICADO";

    public TurnoModificadoException() {
        super(CODIGO, HttpStatus.CONFLICT,
                "El turno se modificó mientras lo editabas. Volvé a cargarlo y probá de nuevo.");
    }
}
