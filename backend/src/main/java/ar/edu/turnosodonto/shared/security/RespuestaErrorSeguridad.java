package ar.edu.turnosodonto.shared.security;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

/**
 * Rechazos de la capa de seguridad con el mismo formato que el resto de la API
 * (Problem Details + {@code codigo}, spec api-errors).
 */
class RespuestaErrorSeguridad implements AuthenticationEntryPoint, AccessDeniedHandler {

    static final String NO_AUTENTICADO = "NO_AUTENTICADO";
    static final String ACCESO_DENEGADO = "ACCESO_DENEGADO";

    private final ObjectMapper mapper;

    RespuestaErrorSeguridad(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException ex)
            throws IOException {
        escribir(request, response, HttpStatus.UNAUTHORIZED, NO_AUTENTICADO,
                "Necesitás iniciar sesión para acceder a este recurso.");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex)
            throws IOException {
        escribir(request, response, HttpStatus.FORBIDDEN, ACCESO_DENEGADO,
                "No tenés permiso para acceder a este recurso.");
    }

    private void escribir(HttpServletRequest request, HttpServletResponse response, HttpStatus estado,
            String codigo, String detalle) throws IOException {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("type", "about:blank");
        cuerpo.put("title", estado.getReasonPhrase());
        cuerpo.put("status", estado.value());
        cuerpo.put("detail", detalle);
        cuerpo.put("instance", request.getRequestURI());
        cuerpo.put("codigo", codigo);
        response.setStatus(estado.value());
        // Mismo Content-Type que el resto de la API; Jackson escribe UTF-8, el default de JSON.
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), cuerpo);
    }
}
