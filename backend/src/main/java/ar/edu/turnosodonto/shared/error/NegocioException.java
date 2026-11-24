package ar.edu.turnosodonto.shared.error;

import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;

/**
 * Base de los errores de negocio. Cada change define sus subclases con un código estable
 * (por ejemplo {@code TurnoSolapadoException} con {@code TURNO_SOLAPADO} y 409) y el
 * {@link GlobalExceptionHandler} las traduce a Problem Details sin conocer el dominio.
 */
public abstract class NegocioException extends RuntimeException {

    private final String codigo;
    private final HttpStatus estado;

    protected NegocioException(String codigo, HttpStatus estado, String mensaje) {
        super(mensaje);
        this.codigo = Objects.requireNonNull(codigo, "codigo");
        this.estado = Objects.requireNonNull(estado, "estado");
    }

    public String getCodigo() {
        return codigo;
    }

    public HttpStatus getEstado() {
        return estado;
    }

    /**
     * Datos extra que el error agrega al Problem Details (por ejemplo, el turno en conflicto).
     * Por defecto ninguno. Nunca deben incluir datos personales sensibles (RN-DS-03).
     */
    public Map<String, Object> propiedades() {
        return Map.of();
    }
}
