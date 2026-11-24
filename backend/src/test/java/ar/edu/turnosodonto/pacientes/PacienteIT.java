package ar.edu.turnosodonto.pacientes;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** Spec pacientes: un test por escenario. Todos los datos son ficticios (RN-DS-01). */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@ExtendWith(OutputCaptureExtension.class)
class PacienteIT {

    private static final String URL = "/api/pacientes";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ApplicationContext contexto;

    private String token;

    @BeforeEach
    void preparar() throws Exception {
        jdbc.update("delete from turno"); // FK turno → paciente (C-07)
        jdbc.update("delete from paciente");
        String respuesta = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"odontologo@example.com\",\"password\":\"ClaveDePrueba123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        token = JsonPath.read(respuesta, "$.token");
    }

    private ResultActions ejecutar(MockHttpServletRequestBuilder pedido) throws Exception {
        return mvc.perform(pedido.header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    private static String json(String nombre, String apellido, String dni, String extra) {
        String base = "\"nombre\":" + valor(nombre) + ",\"apellido\":" + valor(apellido) + ",\"dni\":" + valor(dni);
        return "{" + base + (extra == null ? "" : "," + extra) + "}";
    }

    private static String valor(String v) {
        return v == null ? "null" : "\"" + v + "\"";
    }

    private ResultActions alta(String cuerpo) throws Exception {
        return ejecutar(post(URL).contentType(MediaType.APPLICATION_JSON).content(cuerpo));
    }

    private long crear(String apellido, String dni) throws Exception {
        String respuesta = alta(json("Paciente", apellido, dni, null))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(respuesta, "$.id")).longValue();
    }

    // --- Alta y validaciones ---

    @Test
    void altaConDatosMinimos() throws Exception {
        alta(json("Paciente", "Ficticio Uno", "00000001", null))
                .andExpect(status().isCreated())
                .andExpect(header().exists(HttpHeaders.LOCATION))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.activo").value(true))
                .andExpect(jsonPath("$.aceptaRecordatorios").value(false));
    }

    @Test
    void dniConLetras() throws Exception {
        alta(json("Paciente", "Ficticio", "12A45678", null))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("dni")));
    }

    @Test
    void dniDeSeisDigitos() throws Exception {
        alta(json("Paciente", "Ficticio", "123456", null))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("dni")));
    }

    @Test
    void altaConDniRepetido() throws Exception {
        crear("Ficticio Uno", "00000001");

        alta(json("Paciente", "Ficticio Dos", "00000001", null))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("DNI_DUPLICADO"));
    }

    @Test
    void sinApellido() throws Exception {
        alta(json("Paciente", null, "00000001", null))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("apellido")));
    }

    @Test
    void emailMalFormado() throws Exception {
        alta(json("Paciente", "Ficticio", "00000001", "\"email\":\"no-es-un-email\""))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("email")));
    }

    // --- Búsqueda ---

    @Test
    void busquedaSinTildesNiMayusculas() throws Exception {
        crear("Gómez Ficticio", "00000003");

        ejecutar(get(URL).param("q", "gomez"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido[*].apellido", hasItem("Gómez Ficticio")));
    }

    @Test
    void busquedaPorDni() throws Exception {
        crear("Ficticio Dos", "00000002");

        ejecutar(get(URL).param("q", "00000002"))
                .andExpect(jsonPath("$.contenido[*].dni", hasItem("00000002")));
    }

    @Test
    void losInactivosNoAparecen() throws Exception {
        long id = crear("Ficticio Baja", "00000004");
        ejecutar(delete(URL + "/" + id)).andExpect(status().isNoContent());

        ejecutar(get(URL).param("q", "Ficticio Baja"))
                .andExpect(jsonPath("$.contenido[*].id", not(hasItem((int) id))))
                .andExpect(jsonPath("$.totalElementos").value(0));
    }

    @Test
    void segundaPagina() throws Exception {
        crear("Ficticio A", "00000005");
        crear("Ficticio B", "00000006");
        crear("Ficticio C", "00000007");

        ejecutar(get(URL).param("size", "2").param("page", "1"))
                .andExpect(jsonPath("$.contenido.length()").value(1))
                .andExpect(jsonPath("$.contenido[0].apellido").value("Ficticio C"))
                .andExpect(jsonPath("$.pagina").value(1))
                .andExpect(jsonPath("$.totalElementos").value(3))
                .andExpect(jsonPath("$.totalPaginas").value(2));
    }

    @Test
    void tamanioExcesivoSeRecortaACien() throws Exception {
        ejecutar(get(URL).param("size", "500"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tamanio").value(100));
    }

    // --- Consulta, edición y baja ---

    @Test
    void pacienteInexistente() throws Exception {
        ejecutar(get(URL + "/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("PACIENTE_NO_ENCONTRADO"));
    }

    @Test
    void edicionValida() throws Exception {
        long id = crear("Ficticio Edita", "00000008");

        ejecutar(put(URL + "/" + id).contentType(MediaType.APPLICATION_JSON)
                .content(json("Paciente", "Ficticio Edita", "00000008",
                        "\"telefono\":\"1100000000\",\"aceptaRecordatorios\":true")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.telefono").value("1100000000"))
                .andExpect(jsonPath("$.aceptaRecordatorios").value(true));
    }

    @Test
    void edicionConDniDeOtroPaciente() throws Exception {
        crear("Ficticio Uno", "00000001");
        long segundo = crear("Ficticio Dos", "00000002");

        ejecutar(put(URL + "/" + segundo).contentType(MediaType.APPLICATION_JSON)
                .content(json("Paciente", "Ficticio Dos", "00000001", null)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("DNI_DUPLICADO"));
    }

    @Test
    void edicionDePacienteDadoDeBaja() throws Exception {
        long id = crear("Ficticio Baja", "00000009");
        ejecutar(delete(URL + "/" + id)).andExpect(status().isNoContent());

        ejecutar(put(URL + "/" + id).contentType(MediaType.APPLICATION_JSON)
                .content(json("Paciente", "Ficticio Baja", "00000009", null)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("PACIENTE_INACTIVO"));
    }

    @Test
    void bajaConservaElRegistro() throws Exception {
        long id = crear("Ficticio Baja", "00000010");

        ejecutar(delete(URL + "/" + id)).andExpect(status().isNoContent());
        ejecutar(delete(URL + "/" + id)).andExpect(status().isNoContent());

        ejecutar(get(URL + "/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activo").value(false))
                .andExpect(jsonPath("$.dni").value("00000010"));
    }

    // --- RN-PA-04 (C-09): la baja se rechaza con turnos programados futuros ---

    /** Turno insertado directo, con inicio relativo a la hora de la base. Devuelve su id. */
    private long insertarTurno(long pacienteId, String desplazamiento) {
        return jdbc.queryForObject("""
                insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin, estado)
                values (?, (select id from profesional order by id limit 1), (select id from sillon order by id limit 1),
                        (select id from prestacion where nombre = 'Limpieza'),
                        now() + cast(? as interval), now() + cast(? as interval) + interval '45 minutes', 'PROGRAMADO')
                returning id""", Long.class, pacienteId, desplazamiento, desplazamiento);
    }

    @Test
    void bajaBloqueadaPorUnTurnoProgramadoFuturo() throws Exception {
        long id = crear("Ficticio Con Turno", "00000011");
        insertarTurno(id, "1 day");

        ejecutar(delete(URL + "/" + id))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("PACIENTE_CON_TURNOS_FUTUROS"));

        ejecutar(get(URL + "/" + id)).andExpect(jsonPath("$.activo").value(true));
    }

    @Test
    void bajaPermitidaDespuesDeCancelarElTurno() throws Exception {
        long id = crear("Ficticio Cancelado", "00000012");
        long turnoId = insertarTurno(id, "1 day");
        ejecutar(post("/api/turnos/" + turnoId + "/cancelacion")).andExpect(status().isOk());

        ejecutar(delete(URL + "/" + id)).andExpect(status().isNoContent());
    }

    @Test
    void turnosPasadosNoBloqueanLaBaja() throws Exception {
        long id = crear("Ficticio Turno Pasado", "00000013");
        insertarTurno(id, "-1 hour");

        ejecutar(delete(URL + "/" + id)).andExpect(status().isNoContent());
    }

    // --- Acceso y datos sensibles ---

    @Test
    void sinToken() throws Exception {
        mvc.perform(get(URL))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    @Test
    void altaSinDatosPersonalesEnLogs(CapturedOutput salida) throws Exception {
        alta(json("Paciente", "Ficticio Log", "00000077",
                "\"email\":\"paciente.log@example.com\",\"telefono\":\"1199990000\""))
                .andExpect(status().isCreated());

        assertThat(salida.getAll())
                .doesNotContain("00000077")
                .doesNotContain("paciente.log@example.com")
                .doesNotContain("1199990000");
    }

    @Test
    void elSeedDeEjemploNoCorreFueraDelPerfilDev() {
        assertThat(contexto.getBeansOfType(PacientesDeEjemplo.class)).isEmpty();
    }
}
