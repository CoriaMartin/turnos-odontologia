package ar.edu.turnosodonto.shared.error;

import java.net.URI;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Traduce toda excepción de la API a Problem Details (RFC 7807) con un campo {@code codigo}.
 * Ver spec {@code api-errors}.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    static final String CAMPO_CODIGO = "codigo";
    static final String CAMPO_ERRORES = "errores";

    /** Campo inválido de una solicitud. */
    public record ErrorCampo(String campo, String mensaje) {
    }

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ProblemDetail> manejarNegocio(NegocioException ex, HttpServletRequest request) {
        ProblemDetail detalle = ProblemDetail.forStatusAndDetail(ex.getEstado(), ex.getMessage());
        return responder(detalle, ex.getCodigo(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> manejarInesperada(Exception ex, HttpServletRequest request) {
        // La traza va al log del servidor; nunca a la respuesta.
        log.error("Error no controlado en {} {}", request.getMethod(), request.getRequestURI(), ex);
        ProblemDetail detalle = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado. Intentá de nuevo más tarde.");
        return responder(detalle, CodigosError.ERROR_INTERNO, request);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<ErrorCampo> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(GlobalExceptionHandler::aErrorCampo)
                .toList();
        ProblemDetail detalle = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNPROCESSABLE_ENTITY, "La solicitud tiene campos inválidos.");
        detalle.setProperty(CAMPO_CODIGO, CodigosError.VALIDACION_FALLIDA);
        detalle.setProperty(CAMPO_ERRORES, errores);
        completarInstancia(detalle, request);
        return ResponseEntity.unprocessableEntity().body(detalle);
    }

    /** Agrega {@code codigo} e {@code instance} a los errores estándar de Spring MVC (404, 400, 405, 415...). */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception ex, @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        ResponseEntity<Object> respuesta = super.handleExceptionInternal(ex, body, headers, statusCode, request);
        if (respuesta != null && respuesta.getBody() instanceof ProblemDetail detalle) {
            if (detalle.getProperties() == null || !detalle.getProperties().containsKey(CAMPO_CODIGO)) {
                detalle.setProperty(CAMPO_CODIGO, codigoGenerico(statusCode));
            }
            completarInstancia(detalle, request);
        }
        return respuesta;
    }

    private static String codigoGenerico(HttpStatusCode status) {
        if (status.value() == HttpStatus.NOT_FOUND.value()) {
            return CodigosError.RECURSO_NO_ENCONTRADO;
        }
        if (status.value() == HttpStatus.UNPROCESSABLE_ENTITY.value()) {
            return CodigosError.VALIDACION_FALLIDA;
        }
        return status.is5xxServerError() ? CodigosError.ERROR_INTERNO : CodigosError.SOLICITUD_INVALIDA;
    }

    private static ErrorCampo aErrorCampo(FieldError error) {
        return new ErrorCampo(error.getField(), error.getDefaultMessage());
    }

    private static ResponseEntity<ProblemDetail> responder(
            ProblemDetail detalle, String codigo, HttpServletRequest request) {
        detalle.setProperty(CAMPO_CODIGO, codigo);
        detalle.setInstance(URI.create(request.getRequestURI()));
        return ResponseEntity.status(detalle.getStatus()).body(detalle);
    }

    private static void completarInstancia(ProblemDetail detalle, WebRequest request) {
        if (detalle.getInstance() == null && request instanceof ServletWebRequest servlet) {
            detalle.setInstance(URI.create(servlet.getRequest().getRequestURI()));
        }
    }
}
