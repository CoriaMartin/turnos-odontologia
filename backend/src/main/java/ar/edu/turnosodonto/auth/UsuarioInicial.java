package ar.edu.turnosodonto.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import ar.edu.turnosodonto.agenda.recursos.Profesional;
import ar.edu.turnosodonto.agenda.recursos.ProfesionalRepository;
import ar.edu.turnosodonto.auth.config.AdminProperties;

/**
 * Crea el usuario odontólogo y su profesional en el primer arranque (spec usuario-inicial).
 * Si ya hay usuarios no toca nada. Nunca loguea el email ni la contraseña.
 */
@Component
public class UsuarioInicial implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(UsuarioInicial.class);

    static final String NOMBRE_POR_DEFECTO = "Odontólogo";
    static final String APELLIDO_POR_DEFECTO = "Titular";

    private final UsuarioRepository usuarios;
    private final ProfesionalRepository profesionales;
    private final PasswordEncoder passwordEncoder;
    private final AdminProperties admin;

    public UsuarioInicial(UsuarioRepository usuarios, ProfesionalRepository profesionales,
            PasswordEncoder passwordEncoder, AdminProperties admin) {
        this.usuarios = usuarios;
        this.profesionales = profesionales;
        this.passwordEncoder = passwordEncoder;
        this.admin = admin;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarios.count() > 0) {
            return;
        }
        String email = exigir(admin.email(), "ADMIN_EMAIL");
        String password = exigir(admin.password(), "ADMIN_PASSWORD");

        Usuario usuario = usuarios.save(new Usuario(email.trim(), passwordEncoder.encode(password), Rol.ODONTOLOGO));
        profesionales.save(new Profesional(usuario, NOMBRE_POR_DEFECTO, APELLIDO_POR_DEFECTO, null));
        log.info("Usuario inicial creado con su profesional");
    }

    private static String exigir(String valor, String variable) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalStateException(
                    "Falta la variable " + variable + ": se necesita para crear el usuario inicial.");
        }
        return valor;
    }
}
