package ar.edu.turnosodonto.configuracion;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** Valores de configuración fuera de sus límites (spec configuracion-consultorio). */
public class ConfiguracionInvalidaException extends NegocioException {

    public static final String CODIGO = "CONFIGURACION_INVALIDA";

    public ConfiguracionInvalidaException(String mensaje) {
        super(CODIGO, HttpStatus.UNPROCESSABLE_ENTITY, mensaje);
    }
}
