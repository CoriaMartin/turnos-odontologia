package ar.edu.turnosodonto.prestaciones;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.jayway.jsonpath.JsonPath;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PrestacionIT {

    private static final String URL = "/api/prestaciones";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    private String token;

    private final List<Long> idsCreados = new ArrayList<>();

    @BeforeEach
    void preparar() throws Exception {
        String respuesta = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"odontologo@example.com\",\"password\":\"ClaveDePrueba123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        token = JsonPath.read(respuesta, "$.token");
    }

    @AfterEach
    void limpiar() {
        idsCreados.forEach(id -> jdbc.update("delete from prestacion where id = ?", id));
        idsCreados.clear();
    }

    private ResultActions ejecutar(MockHttpServletRequestBuilder pedido) throws Exception {
        return mvc.perform(pedido.header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    private static String json(String nombre, Integer duracionMinutos) {
        StringBuilder cuerpo = new StringBuilder("{");
        if (nombre != null) {
            cuerpo.append("\"nombre\":\"").append(nombre).append("\"");
        }
        if (duracionMinutos != null) {
            if (cuerpo.length() > 1) {
                cuerpo.append(",");
            }
            cuerpo.append("\"duracionMinutos\":").append(duracionMinutos);
        }
        return cuerpo.append("}").toString();
    }

    private ResultActions alta(String cuerpo) throws Exception {
        return ejecutar(post(URL).contentType(MediaType.APPLICATION_JSON).content(cuerpo));
    }

    private static long idDe(MvcResult resultado) throws Exception {
        return ((Number) JsonPath.read(resultado.getResponse().getContentAsString(), "$.id")).longValue();
    }

    private MvcResult crearResultado(String nombre, int duracionMinutos) throws Exception {
        MvcResult resultado = alta(json(nombre, duracionMinutos))
                .andExpect(status().isCreated())
                .andReturn();
        idsCreados.add(idDe(resultado));
        return resultado;
    }

    private long crear(String nombre, int duracionMinutos) throws Exception {
        return idDe(crearResultado(nombre, duracionMinutos));
    }

    private ResultActions patchActiva(long id, boolean activa) throws Exception {
        return ejecutar(patch(URL + "/" + id + "/activa")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"activa\":" + activa + "}"));
    }

    @Test
    void altaConDatosMinimos() throws Exception {
        MvcResult resultado = crearResultado("Limpieza Ficticia", 45);
        long id = idDe(resultado);

        assertThat(resultado.getResponse().getHeader(HttpHeaders.LOCATION)).isEqualTo(URL + "/" + id);
        assertThat(JsonPath.<Boolean>read(resultado.getResponse().getContentAsString(), "$.activa")).isTrue();
        assertThat(JsonPath.<Integer>read(resultado.getResponse().getContentAsString(), "$.duracionMinutos"))
                .isEqualTo(45);
    }

    @Test
    void nombreConEspacios() throws Exception {
        MvcResult resultado = crearResultado("  Control Ficticio  ", 30);

        assertThat(JsonPath.<String>read(resultado.getResponse().getContentAsString(), "$.nombre"))
                .isEqualTo("Control Ficticio");
    }

    @Test
    void altaSinNombre() throws Exception {
        alta(json(null, 45))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("nombre")));
    }

    @Test
    void nombreVacio() throws Exception {
        alta(json("", 45))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("nombre")));
    }

    @Test
    void nombreDemasiadoLargo() throws Exception {
        alta(json("a".repeat(101), 45))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("nombre")));
    }

    @Test
    void duracionMenorAlMinimo() throws Exception {
        alta(json("Corta Ficticia", 4))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("duracionMinutos")));
    }

    @Test
    void duracionMayorAlMaximo() throws Exception {
        alta(json("Larga Ficticia", 481))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("duracionMinutos")));
    }

    @Test
    void altaSinDuracion() throws Exception {
        alta(json("Sin Duracion Ficticia", null))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("duracionMinutos")));
    }

    @Test
    void duracionEnElLimiteMinimo() throws Exception {
        MvcResult resultado = crearResultado("Minimo Ficticio", 5);

        assertThat(JsonPath.<Integer>read(resultado.getResponse().getContentAsString(), "$.duracionMinutos"))
                .isEqualTo(5);
    }

    @Test
    void duracionEnElLimiteMaximo() throws Exception {
        MvcResult resultado = crearResultado("Maximo Ficticio", 480);

        assertThat(JsonPath.<Integer>read(resultado.getResponse().getContentAsString(), "$.duracionMinutos"))
                .isEqualTo(480);
    }

    @Test
    void altaConNombreRepetido() throws Exception {
        crear("Limpieza Ficticia", 45);

        alta(json("Limpieza Ficticia", 30))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("NOMBRE_DUPLICADO"));
    }

    @Test
    void altaConDistintaCapitalizacion() throws Exception {
        crear("Limpieza Ficticia", 45);

        alta(json("limpieza ficticia", 30))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("NOMBRE_DUPLICADO"));
    }

    @Test
    void edicionConNombreDeOtraPrestacion() throws Exception {
        crear("Obturación Ficticia", 45);
        long segunda = crear("Extracción Ficticia", 45);

        ejecutar(put(URL + "/" + segunda).contentType(MediaType.APPLICATION_JSON)
                .content(json("obturación ficticia", 30)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("NOMBRE_DUPLICADO"));
    }

    @Test
    void listadoIncluyeInactivas() throws Exception {
        crear("Alfa Ficticia", 30);
        long inactiva = crear("Zeta Ficticia", 45);
        patchActiva(inactiva, false).andExpect(status().isOk());

        String respuesta = ejecutar(get(URL))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        List<Map<String, Object>> items = JsonPath.read(respuesta, "$");
        Map<String, Object> activa = items.stream()
                .filter(item -> "Alfa Ficticia".equals(item.get("nombre")))
                .findFirst().orElseThrow();
        Map<String, Object> dadaDeBaja = items.stream()
                .filter(item -> "Zeta Ficticia".equals(item.get("nombre")))
                .findFirst().orElseThrow();

        assertThat(activa.get("activa")).isEqualTo(true);
        assertThat(dadaDeBaja.get("activa")).isEqualTo(false);
        assertThat(items.indexOf(activa)).isLessThan(items.indexOf(dadaDeBaja));
    }

    @Test
    @Transactional
    void catalogoVacio() throws Exception {
        jdbc.update("delete from prestacion");

        ejecutar(get(URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void prestacionInexistente() throws Exception {
        ejecutar(get(URL + "/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("PRESTACION_NO_ENCONTRADA"));
    }

    @Test
    void edicionValidaDePrestacionActiva() throws Exception {
        long id = crear("Editar Ficticia", 30);

        ejecutar(put(URL + "/" + id).contentType(MediaType.APPLICATION_JSON)
                .content(json("Editada Ficticia", 60)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Editada Ficticia"))
                .andExpect(jsonPath("$.duracionMinutos").value(60));
    }

    @Test
    void edicionDePrestacionInactiva() throws Exception {
        long id = crear("Inactiva Editable Ficticia", 30);
        patchActiva(id, false).andExpect(status().isOk());

        ejecutar(put(URL + "/" + id).contentType(MediaType.APPLICATION_JSON)
                .content(json("Inactiva Editable Ficticia", 90)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activa").value(false))
                .andExpect(jsonPath("$.duracionMinutos").value(90));
    }

    @Test
    void desactivarSinBorrar() throws Exception {
        long id = crear("Desactivar Ficticia", 30);

        patchActiva(id, false)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activa").value(false));
        ejecutar(get(URL + "/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value((int) id))
                .andExpect(jsonPath("$.activa").value(false));
    }

    @Test
    void desactivarDosVeces() throws Exception {
        long id = crear("Idempotente Ficticia", 30);
        patchActiva(id, false).andExpect(status().isOk());

        patchActiva(id, false)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activa").value(false));
    }

    @Test
    void reactivar() throws Exception {
        long id = crear("Reactivar Ficticia", 30);
        patchActiva(id, false).andExpect(status().isOk());

        patchActiva(id, true)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activa").value(true));
    }

    @Test
    void sinTokenAlListar() throws Exception {
        mvc.perform(get(URL))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    @Test
    void sinTokenAlCrear() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content(json("Sin Token Ficticia", 30)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    @Test
    void sinTokenAlEditar() throws Exception {
        mvc.perform(put(URL + "/1").contentType(MediaType.APPLICATION_JSON).content(json("Sin Token Ficticia", 30)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    @Test
    void sinTokenAlCambiarActiva() throws Exception {
        mvc.perform(patch(URL + "/1/activa").contentType(MediaType.APPLICATION_JSON).content("{\"activa\":false}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }
}
