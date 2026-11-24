package ar.edu.turnosodonto.agenda.turnos;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.empty;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Timestamp;
import java.time.OffsetDateTime;

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
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * Spec turnos (C-08, consultar la agenda): un test por escenario.
 * Los turnos se preparan por SQL (la agenda no depende de la hora actual). Datos ficticios; cada test
 * borra sus turnos antes y después para no afectar otros tests.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TurnoAgendaIT {

    private static final String URL = "/api/turnos";
    private static final String ZONA = ":00-03:00";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    private String token;
    private long pacienteId;
    private long limpiezaId;
    private long profesionalId;
    private long sillonId;

    @BeforeEach
    void preparar() throws Exception {
        limpiar();
        pacienteId = jdbc.queryForObject(
                "insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio Agenda', '00000901') returning id",
                Long.class);
        limpiezaId = jdbc.queryForObject("select id from prestacion where nombre = 'Limpieza'", Long.class);
        profesionalId = jdbc.queryForObject("select id from profesional order by id limit 1", Long.class);
        sillonId = jdbc.queryForObject("select id from sillon where nombre = 'Sillón 1'", Long.class);
        String respuesta = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"odontologo@example.com\",\"password\":\"ClaveDePrueba123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        token = JsonPath.read(respuesta, "$.token");
    }

    @AfterEach
    void limpiar() {
        jdbc.update("delete from turno");
        jdbc.update("delete from paciente where dni like '000009%'");
    }

    /** Inserta un turno; {@code inicio} y {@code fin} como "2026-12-01T10:00". Devuelve su id. */
    private long turno(String inicio, String fin, String estado) {
        return jdbc.queryForObject("""
                insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin, estado)
                values (?, ?, ?, ?, ?, ?, ?) returning id""", Long.class,
                pacienteId, profesionalId, sillonId, limpiezaId, instante(inicio), instante(fin), estado);
    }

    private static Timestamp instante(String fechaHora) {
        return Timestamp.from(OffsetDateTime.parse(fechaHora + ZONA).toInstant());
    }

    private ResultActions agenda(String desde, String hasta) throws Exception {
        return agenda(desde, hasta, null);
    }

    private ResultActions agenda(String desde, String hasta, String incluirCancelados) throws Exception {
        MockHttpServletRequestBuilder pedido = get(URL).header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        if (desde != null) {
            pedido.param("desde", desde);
        }
        if (hasta != null) {
            pedido.param("hasta", hasta);
        }
        if (incluirCancelados != null) {
            pedido.param("incluirCancelados", incluirCancelados);
        }
        return mvc.perform(pedido);
    }

    private ResultActions agendaDelDia(String dia) throws Exception {
        OffsetDateTime desde = OffsetDateTime.parse(dia + "T00:00" + ZONA);
        return agenda(desde.toString(), desde.plusDays(1).toString());
    }

    // --- Consultar la agenda por período ---

    @Test
    void turnosDelPeriodoOrdenadosPorInicio() throws Exception {
        long t12 = turno("2026-12-01T12:00", "2026-12-01T12:45", "PROGRAMADO");
        long t10 = turno("2026-12-01T10:00", "2026-12-01T10:45", "PROGRAMADO");
        long t11 = turno("2026-12-01T11:00", "2026-12-01T11:45", "PROGRAMADO");
        turno("2026-12-02T10:00", "2026-12-02T10:45", "PROGRAMADO");

        agenda("2026-12-01T00:00-03:00", "2026-12-02T00:00-03:00")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", contains((int) t10, (int) t11, (int) t12)))
                .andExpect(jsonPath("$[0].inicio").value("2026-12-01T10:00:00-03:00"))
                .andExpect(jsonPath("$[0].fin").value("2026-12-01T10:45:00-03:00"))
                .andExpect(jsonPath("$[0].estado").value("PROGRAMADO"))
                .andExpect(jsonPath("$[0].duracionMinutos").value(45))
                .andExpect(jsonPath("$[0].paciente.id").value(pacienteId))
                .andExpect(jsonPath("$[0].paciente.nombre").value("Paciente"))
                .andExpect(jsonPath("$[0].paciente.apellido").value("Ficticio Agenda"))
                .andExpect(jsonPath("$[0].paciente", not(hasKey("dni"))))
                .andExpect(jsonPath("$[0].prestacion.id").value(limpiezaId))
                .andExpect(jsonPath("$[0].prestacion.nombre").value("Limpieza"));
    }

    @Test
    void periodoSinTurnos() throws Exception {
        turno("2026-12-04T10:00", "2026-12-04T10:45", "PROGRAMADO");

        agendaDelDia("2026-12-05")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", empty()));
    }

    @Test
    void turnoQueEmpiezaJustoEnElInicioDelPeriodo() throws Exception {
        long id = turno("2026-12-01T10:00", "2026-12-01T10:45", "PROGRAMADO");

        agenda("2026-12-01T10:00-03:00", "2026-12-01T12:00-03:00")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", contains((int) id)));
    }

    @Test
    void turnoQueTerminaJustoEnElInicioDelPeriodo() throws Exception {
        turno("2026-12-01T09:15", "2026-12-01T10:00", "PROGRAMADO");

        agenda("2026-12-01T10:00-03:00", "2026-12-01T12:00-03:00")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", empty()));
    }

    @Test
    void turnoQueEmpiezaJustoEnElFinDelPeriodo() throws Exception {
        turno("2026-12-01T12:00", "2026-12-01T12:45", "PROGRAMADO");

        agenda("2026-12-01T10:00-03:00", "2026-12-01T12:00-03:00")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", empty()));
    }

    @Test
    void turnoQueCruzaElInicioDelPeriodo() throws Exception {
        long id = turno("2026-12-01T23:30", "2026-12-02T00:15", "PROGRAMADO");

        agendaDelDia("2026-12-02")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", contains((int) id)));
    }

    // --- Filtro de cancelados ---

    @Test
    void canceladosIncluidosPorDefecto() throws Exception {
        turno("2026-12-01T10:00", "2026-12-01T10:45", "PROGRAMADO");
        turno("2026-12-01T11:00", "2026-12-01T11:45", "CANCELADO");
        turno("2026-12-01T12:00", "2026-12-01T12:45", "CANCELADO_TARDIO");

        agendaDelDia("2026-12-01")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].estado", contains("PROGRAMADO", "CANCELADO", "CANCELADO_TARDIO")));
    }

    @Test
    void canceladosExcluidos() throws Exception {
        long programado = turno("2026-12-01T10:00", "2026-12-01T10:45", "PROGRAMADO");
        turno("2026-12-01T11:00", "2026-12-01T11:45", "CANCELADO");
        turno("2026-12-01T12:00", "2026-12-01T12:45", "CANCELADO_TARDIO");

        agenda("2026-12-01T00:00-03:00", "2026-12-02T00:00-03:00", "false")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", contains((int) programado)))
                .andExpect(jsonPath("$[*].estado", containsInAnyOrder("PROGRAMADO")));
    }

    // --- Período de consulta válido ---

    @Test
    void faltaElPeriodo() throws Exception {
        agenda(null, "2026-12-02T00:00-03:00")
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("desde")));
    }

    @Test
    void finAnteriorAlInicio() throws Exception {
        agenda("2026-12-02T00:00-03:00", "2026-12-01T00:00-03:00")
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("hasta")));
    }

    @Test
    void periodoVacio() throws Exception {
        agenda("2026-12-01T00:00-03:00", "2026-12-01T00:00-03:00")
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("hasta")));
    }

    @Test
    void periodoDeExactamente31Dias() throws Exception {
        agenda("2026-12-01T00:00-03:00", "2027-01-01T00:00-03:00")
                .andExpect(status().isOk());
    }

    @Test
    void periodoMayorA31Dias() throws Exception {
        agenda("2026-12-01T00:00-03:00", "2027-01-01T00:01-03:00")
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("hasta")));
    }

    @Test
    void fechaSinZonaHoraria() throws Exception {
        agenda("2026-12-01T00:00", "2026-12-02T00:00-03:00")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SOLICITUD_INVALIDA"));
    }

    // --- Autenticación ---

    @Test
    void agendaSinToken() throws Exception {
        mvc.perform(get(URL).param("desde", "2026-12-01T00:00-03:00").param("hasta", "2026-12-02T00:00-03:00"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }
}
