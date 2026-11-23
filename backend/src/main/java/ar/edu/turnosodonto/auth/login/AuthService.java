package ar.edu.turnosodonto.auth.login;

import java.util.Locale;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ar.edu.turnosodonto.auth.Usuario;
import ar.edu.turnosodonto.auth.UsuarioRepository;
import ar.edu.turnosodonto.auth.token.TokenEmitido;
import ar.edu.turnosodonto.auth.token.TokenJwtService;

/** Login con email y contraseña (Flujo 1 de knowledge-base/07). Nunca loguea credenciales. */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final BloqueoLogin bloqueo;
    private final TokenJwtService tokens;
    /** Se compara contra este hash cuando el email no existe, para no revelarlo por el tiempo de respuesta. */
    private final String hashFicticio;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder,
            BloqueoLogin bloqueo, TokenJwtService tokens) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
        this.bloqueo = bloqueo;
        this.tokens = tokens;
        this.hashFicticio = passwordEncoder.encode("hash-ficticio-para-igualar-tiempos");
    }

    @Transactional(readOnly = true)
    public TokenEmitido login(String email, String password) {
        String emailNormalizado = email.trim().toLowerCase(Locale.ROOT);
        if (bloqueo.estaBloqueado(emailNormalizado)) {
            log.warn("Login rechazado: email bloqueado por intentos fallidos");
            throw new LoginBloqueadoException();
        }

        Optional<Usuario> usuario = usuarios.findByEmailIgnoreCase(emailNormalizado);
        String hash = usuario.map(Usuario::getPasswordHash).orElse(hashFicticio);
        boolean coincide = passwordEncoder.matches(password, hash);

        if (usuario.isEmpty() || !usuario.get().isActivo() || !coincide) {
            bloqueo.registrarFallo(emailNormalizado);
            log.info("Intento de login fallido");
            throw new CredencialesInvalidasException();
        }

        bloqueo.registrarExito(emailNormalizado);
        return tokens.emitir(usuario.get());
    }
}
