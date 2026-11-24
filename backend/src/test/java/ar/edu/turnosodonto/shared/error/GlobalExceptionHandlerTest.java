package ar.edu.turnosodonto.shared.error;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


/** Spec api-errors: un test por escenario, con un controlador de prueba. */
@WebMvcTest(controllers = GlobalExceptionHandlerTest.ControladorDePrueba.class)
@AutoConfigureMockMvc(addFilters = false) // la seguridad se prueba en AuthIT; acá solo el formato
@Import(GlobalExceptionHandlerTest.ControladorDePrueba.class)
class GlobalExceptionHandlerTest {

    static class ReglaDeEjemploException extends NegocioException {
        ReglaDeEjemploException() {
            super("EJEMPLO_REGLA", HttpStatus.CONFLICT, "La regla de ejemplo no se cumple.");
        }
    }

    static class ReglaConDatosExtraException extends NegocioException {
        ReglaConDatosExtraException() {
            super("EJEMPLO_CON_DATOS", HttpStatus.CONFLICT, "La regla con datos extra no se cumple.");
        }

        @Override
        public java.util.Map<String, Object> propiedades() {
            return java.util.Map.of("detalleExtra", java.util.Map.of("id", 7));
        }
    }

    record SolicitudDePrueba(@NotBlank String nombre) {
    }

    @RestController
    static class ControladorDePrueba {

        @GetMapping("/api/prueba/negocio")
        void negocio() {
            throw new ReglaDeEjemploException();
        }

        @GetMapping("/api/prueba/negocio-con-datos")
        void negocioConDatos() {
            throw new ReglaConDatosExtraException();
        }

        @GetMapping("/api/prueba/inesperado")
        void inesperado() {
            throw new IllegalStateException("detalle-interno-secreto");
        }

        @PostMapping("/api/prueba/validacion")
        void validacion(@Valid @RequestBody SolicitudDePrueba solicitud) {
        }
    }

    @Autowired
    private MockMvc mvc;

    @Test
    void rutaInexistente() throws Exception {
        mvc.perform(get("/api/no-existe"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.type").exists())
                .andExpect(jsonPath("$.title").exists())
                .andExpect(jsonPath("$.detail").exists())
                .andExpect(jsonPath("$.instance").value("/api/no-existe"))
                .andExpect(jsonPath("$.codigo").value(CodigosError.RECURSO_NO_ENCONTRADO));
    }

    @Test
    void errorDeNegocio() throws Exception {
        mvc.perform(get("/api/prueba/negocio"))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.codigo").value("EJEMPLO_REGLA"))
                .andExpect(jsonPath("$.instance").value("/api/prueba/negocio"));
    }

    @Test
    void errorDeNegocioConDatosExtra() throws Exception {
        mvc.perform(get("/api/prueba/negocio-con-datos"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("EJEMPLO_CON_DATOS"))
                .andExpect(jsonPath("$.detalleExtra.id").value(7));
    }

    @Test
    void campoObligatorioFaltante() throws Exception {
        mvc.perform(post("/api/prueba/validacion").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.codigo").value(CodigosError.VALIDACION_FALLIDA))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("nombre")));
    }

    @Test
    void cuerpoJsonMalFormado() throws Exception {
        mvc.perform(post("/api/prueba/validacion").contentType(MediaType.APPLICATION_JSON).content("{nombre:"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.codigo").value(CodigosError.SOLICITUD_INVALIDA));
    }

    @Test
    void excepcionNoControladaSinDetallesInternos() throws Exception {
        mvc.perform(get("/api/prueba/inesperado"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.codigo").value(CodigosError.ERROR_INTERNO))
                .andExpect(content().string(not(containsString("detalle-interno-secreto"))))
                .andExpect(content().string(not(containsString("IllegalStateException"))))
                .andExpect(content().string(not(containsString("at ar.edu"))));
    }
}
