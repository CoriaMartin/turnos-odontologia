package ar.edu.turnosodonto.auth.config;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

/** Spec usuario-inicial, requisito "Configuración de seguridad obligatoria". */
class SeguridadPropertiesTest {

    @Test
    void secretoCortoImpideArrancarYNombraLaVariable() {
        assertThatThrownBy(() -> new SeguridadProperties("corto", 480, "http://localhost:5173"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
    }

    @Test
    void secretoFaltanteImpideArrancar() {
        assertThatThrownBy(() -> new SeguridadProperties("", 480, "http://localhost:5173"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
    }

    @Test
    void secretoDe32BytesEsValido() {
        assertThatCode(() -> new SeguridadProperties("0123456789abcdef0123456789abcdef", 480, "x"))
                .doesNotThrowAnyException();
    }
}
