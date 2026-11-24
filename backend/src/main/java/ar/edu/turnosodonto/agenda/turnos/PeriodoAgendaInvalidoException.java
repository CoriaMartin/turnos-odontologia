package ar.edu.turnosodonto.agenda.turnos;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.CodigosError;
import ar.edu.turnosodonto.shared.error.GlobalExceptionHandler.ErrorCampo;
import ar.edu.turnosodonto.shared.error.NegocioException;

/**
 * Período de agenda inválido (C-08). Responde como un error de validación por campo (spec api-errors):
 * 422 {@code VALIDACION_FALLIDA} con {@code errores}.
 */
public class PeriodoAgendaInvalidoException extends NegocioException {

    private final ErrorCampo error;

    public PeriodoAgendaInvalidoException(String campo, String mensaje) {
        super(CodigosError.VALIDACION_FALLIDA, HttpStatus.UNPROCESSABLE_ENTITY, "La solicitud tiene campos inválidos.");
        this.error = new ErrorCampo(campo, mensaje);
    }

    public ErrorCampo getError() {
        return error;
    }

    @Override
    public Map<String, Object> propiedades() {
        return Map.of("errores", List.of(error));
    }
}
