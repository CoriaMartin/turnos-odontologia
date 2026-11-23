package ar.edu.turnosodonto.auth.login;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

public class LoginBloqueadoException extends NegocioException {

    public static final String CODIGO = "LOGIN_BLOQUEADO";

    public LoginBloqueadoException() {
        super(CODIGO, HttpStatus.TOO_MANY_REQUESTS,
                "Demasiados intentos fallidos. Probá de nuevo en 15 minutos.");
    }
}
