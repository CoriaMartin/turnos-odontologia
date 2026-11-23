package ar.edu.turnosodonto.agenda.recursos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import ar.edu.turnosodonto.auth.Rol;
import ar.edu.turnosodonto.auth.Usuario;
import ar.edu.turnosodonto.auth.UsuarioRepository;
import ar.edu.turnosodonto.support.PersistenciaTest;

/** Spec consultorio-recursos: sillón inicial, sillón duplicado y un profesional por usuario. */
@PersistenciaTest
class RecursosPersistenciaIT {

    @Autowired
    private SillonRepository sillones;

    @Autowired
    private ProfesionalRepository profesionales;

    @Autowired
    private UsuarioRepository usuarios;

    @Test
    void laMigracionCreaUnUnicoSillonActivo() {
        List<Sillon> todos = sillones.findAll();

        assertThat(todos).hasSize(1);
        assertThat(todos.get(0).getNombre()).isEqualTo("Sillón 1");
        assertThat(todos.get(0).isActivo()).isTrue();
    }

    @Test
    void sillonDuplicadoSeRechaza() {
        assertThatThrownBy(() -> sillones.saveAndFlush(new Sillon("Sillón 1")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void segundoProfesionalParaElMismoUsuarioSeRechaza() {
        Usuario usuario = usuarios.saveAndFlush(
                new Usuario("dra.ejemplo@example.com", "hash-ficticio", Rol.ODONTOLOGO));
        profesionales.saveAndFlush(new Profesional(usuario, "Ejemplo", "Ficticia", null));

        assertThatThrownBy(() -> profesionales.saveAndFlush(new Profesional(usuario, "Otra", "Ficticia", null)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
