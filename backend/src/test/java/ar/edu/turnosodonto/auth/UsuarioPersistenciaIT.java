package ar.edu.turnosodonto.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import ar.edu.turnosodonto.support.PersistenciaTest;

/** Spec usuarios. */
@PersistenciaTest
class UsuarioPersistenciaIT {

    /** Los contextos completos crean el usuario inicial (C-04); este slice parte sin usuarios. Se revierte al terminar. */
    @org.junit.jupiter.api.BeforeEach
    void sinUsuarios(@Autowired ar.edu.turnosodonto.agenda.recursos.ProfesionalRepository profesionalesExistentes,
            @Autowired ar.edu.turnosodonto.auth.UsuarioRepository usuariosExistentes) {
        profesionalesExistentes.deleteAllInBatch();
        usuariosExistentes.deleteAllInBatch();
    }

    private static final String HASH_FICTICIO = "$2a$10$hashFicticioDePruebaNoEsUnaClaveReal000000000000000000";

    @Autowired
    private UsuarioRepository usuarios;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void emailRepetidoConOtraCapitalizacionSeRechaza() {
        usuarios.saveAndFlush(new Usuario("odontologo@example.com", HASH_FICTICIO, Rol.ODONTOLOGO));

        assertThatThrownBy(() -> usuarios.saveAndFlush(
                new Usuario("Odontologo@Example.com", HASH_FICTICIO, Rol.ODONTOLOGO)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rolDesconocidoSeRechaza() {
        assertThatThrownBy(() -> jdbc.update(
                "insert into usuario (email, password_hash, rol) values (?, ?, ?)",
                "otro@example.com", HASH_FICTICIO, "ADMIN"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void usuarioSinEmailSeRechaza() {
        assertThatThrownBy(() -> new Usuario(null, HASH_FICTICIO, Rol.ODONTOLOGO))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> jdbc.update(
                "insert into usuario (email, password_hash, rol) values (null, ?, 'ODONTOLOGO')", HASH_FICTICIO))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void usuarioNuevoNaceActivo() {
        Usuario guardado = usuarios.saveAndFlush(new Usuario("activo@example.com", HASH_FICTICIO, Rol.ODONTOLOGO));

        assertThat(guardado.isActivo()).isTrue();
        assertThat(usuarios.findByEmailIgnoreCase("ACTIVO@example.com")).isPresent();
    }
}
