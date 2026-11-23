package ar.edu.turnosodonto.agenda.recursos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;

import ar.edu.turnosodonto.auth.Rol;
import ar.edu.turnosodonto.auth.Usuario;
import ar.edu.turnosodonto.auth.UsuarioRepository;
import ar.edu.turnosodonto.support.PersistenciaTest;

/** Spec consultorio-recursos, requisito "Recursos únicos del consultorio". */
@PersistenciaTest
@Import(RecursosConsultorio.class)
class RecursosConsultorioIT {

    @Autowired
    private RecursosConsultorio recursosConsultorio;

    @Autowired
    private UsuarioRepository usuarios;

    @Autowired
    private ProfesionalRepository profesionales;

    @Autowired
    private SillonRepository sillones;

    private Profesional crearProfesional() {
        Usuario usuario = usuarios.saveAndFlush(
                new Usuario("dra.ejemplo@example.com", "hash-ficticio", Rol.ODONTOLOGO));
        return profesionales.saveAndFlush(new Profesional(usuario, "Ejemplo", "Ficticia", "MP-0000"));
    }

    @Test
    void consultorioConfiguradoDevuelveProfesionalYSillon() {
        Profesional profesional = crearProfesional();

        RecursosConsultorio.Recursos recursos = recursosConsultorio.recursos();

        assertThat(recursos.profesional().getId()).isEqualTo(profesional.getId());
        assertThat(recursos.sillon().getNombre()).isEqualTo("Sillón 1");
    }

    @Test
    void sinProfesionalFallaConConsultorioNoConfigurado() {
        assertThatThrownBy(recursosConsultorio::recursos)
                .isInstanceOf(ConsultorioNoConfiguradoException.class)
                .extracting("codigo").isEqualTo("CONSULTORIO_NO_CONFIGURADO");
    }

    @Test
    void sinSillonActivoFallaConConsultorioNoConfigurado() {
        crearProfesional();
        Sillon sillon = sillones.findByNombre("Sillón 1").orElseThrow();
        sillon.desactivar();
        sillones.saveAndFlush(sillon);

        assertThatThrownBy(recursosConsultorio::recursos)
                .isInstanceOf(ConsultorioNoConfiguradoException.class)
                .extracting("codigo").isEqualTo("CONSULTORIO_NO_CONFIGURADO");
    }
}
