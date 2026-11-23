package ar.edu.turnosodonto.auth.login;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/** Mismo error para email inexistente, contraseña incorrecta o usuario inactivo. */
public class CredencialesInvalidasException extends NegocioException {

    public static final String CODIGO = "CREDENCIALES_INVALIDAS";
    static final String MENSAJE = "Email o contraseña incorrectos.";

    public CredencialesInvalidasException() {
        super(CODIGO, HttpStatus.UNAUTHORIZED, MENSAJE);
    }
}
