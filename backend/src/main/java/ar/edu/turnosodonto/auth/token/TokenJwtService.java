package ar.edu.turnosodonto.auth.token;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import ar.edu.turnosodonto.auth.Usuario;
import ar.edu.turnosodonto.auth.config.SeguridadProperties;

/**
 * Emite y valida tokens JWT HS256. Emisión y validación usan el mismo {@link Clock} inyectable,
 * así el vencimiento se puede probar sin esperar.
 */
@Service
public class TokenJwtService {

    static final String CLAIM_EMAIL = "email";
    static final String CLAIM_ROL = "rol";

    private final SecretKey clave;
    private final Duration duracion;
    private final Clock reloj;

    public TokenJwtService(SeguridadProperties propiedades, Clock reloj) {
        this.clave = Keys.hmacShaKeyFor(propiedades.jwtSecret().getBytes(StandardCharsets.UTF_8));
        this.duracion = Duration.ofMinutes(propiedades.jwtExpMinutos());
        this.reloj = reloj;
    }

    public TokenEmitido emitir(Usuario usuario) {
        Instant ahora = reloj.instant();
        Instant vence = ahora.plus(duracion);
        String token = Jwts.builder()
                .subject(String.valueOf(usuario.getId()))
                .claim(CLAIM_EMAIL, usuario.getEmail())
                .claim(CLAIM_ROL, usuario.getRol().name())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(vence))
                .signWith(clave)
                .compact();
        return new TokenEmitido(token, vence);
    }

    /** Devuelve la identidad si el token es válido, está vigente y fue firmado con nuestra clave. */
    public Optional<UsuarioAutenticado> validar(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(clave)
                    .clock(() -> Date.from(reloj.instant()))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.of(new UsuarioAutenticado(
                    Long.valueOf(claims.getSubject()), claims.get(CLAIM_EMAIL, String.class)));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
