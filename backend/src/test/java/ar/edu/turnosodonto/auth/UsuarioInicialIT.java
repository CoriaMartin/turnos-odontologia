package ar.edu.turnosodonto.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import ar.edu.turnosodonto.agenda.recursos.Profesional;
import ar.edu.turnosodonto.agenda.recursos.ProfesionalRepository;
import ar.edu.turnosodonto.agenda.recursos.RecursosConsultorio;
import ar.edu.turnosodonto.auth.config.AdminProperties;

/** Spec usuario-inicial. El contexto ya arrancó con las credenciales ficticias de application-test.yml. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UsuarioInicialIT {

    private static final String EMAIL = "odontologo@example.com";
    private static final String CLAVE = "ClaveDePrueba123";

    @Autowired
    private UsuarioRepository usuarios;

    @Autowired
    private ProfesionalRepository profesionales;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RecursosConsultorio recursosConsultorio;

    @Test
    void elArranqueCreaElUsuarioConContrasenaCifradaYSuProfesional() {
        List<Usuario> todos = usuarios.findAll();
        assertThat(todos).hasSize(1);
        Usuario usuario = todos.get(0);
        assertThat(usuario.getEmail()).isEqualTo(EMAIL);
        assertThat(usuario.getRol()).isEqualTo(Rol.ODONTOLOGO);
        assertThat(usuario.getPasswordHash()).isNotEqualTo(CLAVE).startsWith("$2");
        assertThat(passwordEncoder.matches(CLAVE, usuario.getPasswordHash())).isTrue();

        Profesional profesional = profesionales.findAll().get(0);
        assertThat(profesional.getNombre()).isEqualTo("Odontólogo");
        assertThat(profesional.getApellido()).isEqualTo("Titular");

        assertThatCode(recursosConsultorio::recursos).doesNotThrowAnyException();
    }

    @Test
    void unSegundoArranqueConOtraContrasenaNoModificaNada() throws Exception {
        UsuarioInicial otroArranque = new UsuarioInicial(usuarios, profesionales, passwordEncoder,
                new AdminProperties(EMAIL, "OtraClaveDistinta456"));

        otroArranque.run(null);

        assertThat(usuarios.count()).isEqualTo(1);
        assertThat(profesionales.count()).isEqualTo(1);
        Usuario usuario = usuarios.findByEmailIgnoreCase(EMAIL).orElseThrow();
        assertThat(passwordEncoder.matches(CLAVE, usuario.getPasswordHash())).isTrue();
    }

    @Test
    void sinUsuariosYSinAdminPasswordElArranqueFalla() {
        profesionales.deleteAll();
        usuarios.deleteAll();
        usuarios.flush();
        UsuarioInicial arranque = new UsuarioInicial(usuarios, profesionales, passwordEncoder,
                new AdminProperties(EMAIL, null));

        assertThatThrownBy(() -> arranque.run(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("ADMIN_PASSWORD");
    }
}
