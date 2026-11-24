package ar.edu.turnosodonto.agenda.turnos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
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
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import ar.edu.turnosodonto.shared.time.RelojConfig;
import ar.edu.turnosodonto.support.RelojMutable;

/**
 * Spec turnos (C-07): un test por escenario. Hora actual fija: 2026-11-30 09:00 (Argentina).
 * Datos ficticios; cada test borra sus turnos antes y después para no afectar otros tests.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TurnoIT {

    private static final String URL = "/api/turnos";
    private static final OffsetDateTime AHORA = OffsetDateTime.parse("2026-11-30T09:00:00-03:00");
    private static final String DIA = "2026-12-01T";
    private static final String ZONA = ":00-03:00";

    @TestConfiguration
    static class RelojDePrueba {
        @Bean
        @Primary
        RelojMutable relojMutable() {
            return new RelojMutable(AHORA.toInstant(), RelojConfig.ZONA_CONSULTORIO);
        }
    }

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    private String token;
    private long pacienteId;
    private long limpiezaId; // 45 minutos

    @BeforeEach
    void preparar() throws Exception {
        limpiar();
        pacienteId = jdbc.queryForObject(
                "insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio Turnos', '00000801') returning id",
                Long.class);
        limpiezaId = jdbc.queryForObject("select id from prestacion where nombre = 'Limpieza'", Long.class);
        String respuesta = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"odontologo@example.com\",\"password\":\"ClaveDePrueba123\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        token = JsonPath.read(respuesta, "$.token");
    }

    @AfterEach
    void limpiar() {
        jdbc.update("delete from turno");
        jdbc.update("delete from paciente where dni like '000008%'");
        jdbc.update("delete from prestacion where nombre like 'Prueba C-07%'");
    }

    private ResultActions crear(String hora, Integer duracion) throws Exception {
        return crear(pacienteId, limpiezaId, DIA + hora + ZONA, duracion);
    }

    private ResultActions crear(long paciente, long prestacion, String inicio, Integer duracion) throws Exception {
        String cuerpo = "{\"pacienteId\":" + paciente + ",\"prestacionId\":" + prestacion
                + (inicio == null ? "" : ",\"inicio\":\"" + inicio + "\"")
                + (duracion == null ? "" : ",\"duracionMinutos\":" + duracion) + "}";
        return mvc.perform(post(URL).header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(cuerpo));
    }

    private int cantidadDeTurnos() {
        return jdbc.queryForObject("select count(*) from turno", Integer.class);
    }

    // --- Crear un turno ---

    @Test
    void turnoEnHorarioLibre() throws Exception {
        long profesionalId = jdbc.queryForObject("select id from profesional order by id limit 1", Long.class);

        crear("10:00", null)
                .andExpect(status().isCreated())
                .andExpect(header().exists(HttpHeaders.LOCATION))
                .andExpect(jsonPath("$.estado").value("PROGRAMADO"))
                .andExpect(jsonPath("$.inicio").value("2026-12-01T10:00:00-03:00"))
                .andExpect(jsonPath("$.fin").value("2026-12-01T10:45:00-03:00"))
                .andExpect(jsonPath("$.duracionMinutos").value(45))
                .andExpect(jsonPath("$.paciente.id").value(pacienteId))
                .andExpect(jsonPath("$.prestacion.nombre").value("Limpieza"))
                .andExpect(jsonPath("$.profesionalId").value(profesionalId))
                .andExpect(jsonPath("$.sillonId").isNumber());
    }

    // --- Duración ---

    @Test
    void duracionEditada() throws Exception {
        crear("10:00", 60)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fin").value("2026-12-01T11:00:00-03:00"));
    }

    @Test
    void duracionFueraDeRango() throws Exception {
        crear("10:00", 500)
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("duracionMinutos")));
    }

    // --- Sin solapamiento ---

    @Test
    void solapamientoParcial() throws Exception {
        String respuesta = crear("10:00", null).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        int idExistente = JsonPath.read(respuesta, "$.id");

        crear("10:30", 30)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TURNO_SOLAPADO"))
                .andExpect(jsonPath("$.turnoEnConflicto.id").value(idExistente))
                .andExpect(jsonPath("$.turnoEnConflicto.inicio").value("2026-12-01T10:00:00-03:00"))
                .andExpect(jsonPath("$.turnoEnConflicto.fin").value("2026-12-01T10:45:00-03:00"));
        assertThat(cantidadDeTurnos()).isEqualTo(1);
    }

    @Test
    void solapamientoTotal() throws Exception {
        crear("10:00", 60).andExpect(status().isCreated());

        crear("10:15", 30)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TURNO_SOLAPADO"));
    }

    @Test
    void turnoQueEmpiezaJustoCuandoTerminaOtro() throws Exception {
        crear("10:00", null).andExpect(status().isCreated());

        crear("10:45", 30).andExpect(status().isCreated());
    }

    @Test
    void turnoQueTerminaJustoCuandoEmpiezaOtro() throws Exception {
        crear("10:00", null).andExpect(status().isCreated());

        crear("09:30", 30).andExpect(status().isCreated());
    }

    // --- Cancelados ---

    @Test
    void horarioDeUnTurnoCancelado() throws Exception {
        long profesionalId = jdbc.queryForObject("select id from profesional order by id limit 1", Long.class);
        long sillonId = jdbc.queryForObject("select id from sillon where nombre = 'Sillón 1'", Long.class);
        jdbc.update("""
                insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin, estado)
                values (?, ?, ?, ?, ?, ?, 'CANCELADO')""",
                pacienteId, profesionalId, sillonId, limpiezaId,
                Timestamp.from(OffsetDateTime.parse(DIA + "10:00" + ZONA).toInstant()),
                Timestamp.from(OffsetDateTime.parse(DIA + "10:45" + ZONA).toInstant()));

        crear("10:00", null).andExpect(status().isCreated());
    }

    // --- Pasado ---

    @Test
    void inicioEnElPasado() throws Exception {
        crear(pacienteId, limpiezaId, AHORA.minusHours(1).toString(), null)
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("TURNO_EN_PASADO"));
        assertThat(cantidadDeTurnos()).isZero();
    }

    // --- Paciente y prestación ---

    @Test
    void pacienteDadoDeBaja() throws Exception {
        long inactivo = jdbc.queryForObject(
                "insert into paciente (nombre, apellido, dni, activo) values ('Paciente', 'Ficticio Baja', '00000802', false) returning id",
                Long.class);

        crear(inactivo, limpiezaId, DIA + "10:00" + ZONA, null)
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("PACIENTE_INACTIVO"));
    }

    @Test
    void prestacionInactiva() throws Exception {
        long inactiva = jdbc.queryForObject(
                "insert into prestacion (nombre, duracion_minutos, activa) values ('Prueba C-07 inactiva', 30, false) returning id",
                Long.class);

        crear(pacienteId, inactiva, DIA + "10:00" + ZONA, null)
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("PRESTACION_INACTIVA"));
    }

    @Test
    void pacienteInexistente() throws Exception {
        crear(999999L, limpiezaId, DIA + "10:00" + ZONA, null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("PACIENTE_NO_ENCONTRADO"));
    }

    // --- Datos obligatorios ---

    @Test
    void sinInicio() throws Exception {
        crear(pacienteId, limpiezaId, null, null)
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("inicio")));
    }

    // --- Consultar ---

    @Test
    void turnoExistente() throws Exception {
        String respuesta = crear("10:00", null).andReturn().getResponse().getContentAsString();
        int id = JsonPath.read(respuesta, "$.id");

        mvc.perform(get(URL + "/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.inicio").value("2026-12-01T10:00:00-03:00"))
                .andExpect(jsonPath("$.fin").value("2026-12-01T10:45:00-03:00"))
                .andExpect(jsonPath("$.estado").value("PROGRAMADO"))
                .andExpect(jsonPath("$.paciente.apellido").value("Ficticio Turnos"))
                .andExpect(jsonPath("$.prestacion.nombre").value("Limpieza"))
                .andExpect(jsonPath("$.version").value(0));
    }

    @Test
    void turnoInexistente() throws Exception {
        mvc.perform(get(URL + "/999999").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("TURNO_NO_ENCONTRADO"));
    }

    @Test
    void sinToken() throws Exception {
        mvc.perform(post(URL).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }
}
