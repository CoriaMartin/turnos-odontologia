package ar.edu.turnosodonto.agenda.recursos;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** Falta el profesional o el sillón activo: el consultorio no puede operar. */
public class ConsultorioNoConfiguradoException extends NegocioException {

    public static final String CODIGO = "CONSULTORIO_NO_CONFIGURADO";

    public ConsultorioNoConfiguradoException(String mensaje) {
        super(CODIGO, HttpStatus.SERVICE_UNAVAILABLE, mensaje);
    }
}
