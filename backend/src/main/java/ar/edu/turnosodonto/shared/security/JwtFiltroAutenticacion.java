package ar.edu.turnosodonto.shared.security;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import ar.edu.turnosodonto.auth.token.TokenJwtService;

/**
 * Si la solicitud trae {@code Authorization: Bearer <token>} válido, la autentica con rol
 * ODONTOLOGO. Un token inválido no corta la cadena: deja el contexto vacío y el punto de entrada
 * de seguridad responde 401. No se registra como bean para que Spring Boot no lo agregue dos veces.
 */
class JwtFiltroAutenticacion extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";
    static final String ROL = "ROLE_ODONTOLOGO";

    private final TokenJwtService tokens;

    JwtFiltroAutenticacion(TokenJwtService tokens) {
        this.tokens = tokens;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String encabezado = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (encabezado != null && encabezado.startsWith(PREFIJO)) {
            tokens.validar(encabezado.substring(PREFIJO.length()).trim()).ifPresent(usuario -> {
                var autenticacion = new UsernamePasswordAuthenticationToken(
                        usuario, null, List.of(new SimpleGrantedAuthority(ROL)));
                SecurityContextHolder.getContext().setAuthentication(autenticacion);
            });
        }
        chain.doFilter(request, response);
    }
}
