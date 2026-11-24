package ar.edu.turnosodonto.agenda.turnos;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.nullValue;
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
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import ar.edu.turnosodonto.shared.time.RelojConfig;
import ar.edu.turnosodonto.support.RelojMutable;

/**
 * Delta de la spec turnos (C-09, cancelar): un test por escenario. Hora actual fija: 2026-11-30 09:00 (-03:00).
 * Configuración por defecto: 24 horas de cancelación tardía.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TurnoCancelacionIT {

    private static final OffsetDateTime AHORA = OffsetDateTime.parse("2026-11-30T09:00:00-03:00");
    private static final String HOY = "2026-11-30T";
    private static final String MANIANA = "2026-12-01T";
    private static final String ZONA = ":00-03:00";
    private static final String MOTIVO = "Viaje imprevisto";

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
    private long limpiezaId;

    @BeforeEach
    void preparar() throws Exception {
        limpiar();
        pacienteId = jdbc.queryForObject(
                "insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio Cancela', '00001001') returning id",
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
        jdbc.update("delete from paciente where dni like '000010%'");
        jdbc.update("update configuracion set horas_cancelacion_tardia = 24 where id = 1");
    }

    private ResultActions crearTurno(String inicio) throws Exception {
        String cuerpo = "{\"pacienteId\":" + pacienteId + ",\"prestacionId\":" + limpiezaId
                + ",\"inicio\":\"" + inicio + ZONA + "\"}";
        return mvc.perform(post("/api/turnos").header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(cuerpo));
    }

    private int crear(String inicio) throws Exception {
        String respuesta = crearTurno(inicio).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.id");
    }

    private long insertarDirecto(OffsetDateTime inicio, String estado) {
        long profesionalId = jdbc.queryForObject("select id from profesional order by id limit 1", Long.class);
        long sillonId = jdbc.queryForObject("select id from sillon where nombre = 'Sillón 1'", Long.class);
        return jdbc.queryForObject("""
                insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin, estado)
                values (?, ?, ?, ?, ?, ?, ?) returning id""", Long.class,
                pacienteId, profesionalId, sillonId, limpiezaId,
                Timestamp.from(inicio.toInstant()), Timestamp.from(inicio.plusMinutes(45).toInstant()), estado);
    }

    private MockHttpServletRequestBuilder pedidoCancelacion(long id) {
        return post("/api/turnos/" + id + "/cancelacion").header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }

    private ResultActions cancelar(long id, String cuerpoJson) throws Exception {
        return mvc.perform(pedidoCancelacion(id).contentType(MediaType.APPLICATION_JSON).content(cuerpoJson));
    }

    private ResultActions cancelarConMotivo(long id, String motivo) throws Exception {
        return cancelar(id, "{\"motivo\":\"" + motivo + "\"}");
    }

    private ResultActions consultar(long id) throws Exception {
        return mvc.perform(get("/api/turnos/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    // --- C-12: cambios de configuracion ---

    @Test
    void actualizarConfiguracionNoModificaTurnoExistente() throws Exception {
        int id = crear(MANIANA + "10:00");

        var antes = jdbc.queryForMap(
                "select * from turno where id = ?", id);

        try {
            mvc.perform(
                    org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                            .put("/api/configuracion")
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                        "horasCancelacionTardia": 48,
                                        "horasAnticipacionRecordatorio": 12
                                    }
                                    """))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.horasCancelacionTardia").value(48))
                    .andExpect(jsonPath("$.horasAnticipacionRecordatorio").value(12));

            var despues = jdbc.queryForMap(
                    "select * from turno where id = ?", id);

            org.assertj.core.api.Assertions.assertThat(despues)
                    .isEqualTo(antes);

            consultar(id)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.estado").value("PROGRAMADO"));
        } finally {
            jdbc.update("""
                    update configuracion
                    set horas_cancelacion_tardia = 24,
                        horas_anticipacion_recordatorio = 24
                    where id = 1
                    """);
        }
    }

    // --- Cancelar un turno ---

    @Test
    void cancelacionConMotivo() throws Exception {
        int id = crear(MANIANA + "10:00");

        cancelarConMotivo(id, MOTIVO)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.inicio").value("2026-12-01T10:00:00-03:00"))
                .andExpect(jsonPath("$.fin").value("2026-12-01T10:45:00-03:00"))
                .andExpect(jsonPath("$.paciente.apellido").value("Ficticio Cancela"))
                .andExpect(jsonPath("$.prestacion.nombre").value("Limpieza"))
                .andExpect(jsonPath("$.motivoCancelacion").value(MOTIVO))
                .andExpect(jsonPath("$.canceladoEn").value("2026-11-30T09:00:00-03:00"));
    }

    @Test
    void cancelacionSinCuerpo() throws Exception {
        int id = crear(MANIANA + "10:00");

        mvc.perform(pedidoCancelacion(id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CANCELADO"))
                .andExpect(jsonPath("$.motivoCancelacion").value(nullValue()));
    }

    @Test
    void motivoEnBlanco() throws Exception {
        int id = crear(MANIANA + "10:00");

        cancelarConMotivo(id, "   ")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motivoCancelacion").value(nullValue()));
    }

    // --- Motivo acotado ---

    @Test
    void motivoDemasiadoLargo() throws Exception {
        int id = crear(MANIANA + "10:00");

        cancelarConMotivo(id, "x".repeat(256))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("motivo")));

        consultar(id).andExpect(jsonPath("$.estado").value("PROGRAMADO"));
    }

    @Test
    void motivoDeExactamente255Caracteres() throws Exception {
        int id = crear(MANIANA + "10:00");
        String motivo = "x".repeat(255);

        cancelarConMotivo(id, motivo)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.motivoCancelacion").value(motivo));
    }

    // --- Anticipada o tardía ---

    @Test
    void cancelacionAnticipada() throws Exception {
        int id = crear(MANIANA + "10:00");

        cancelar(id, "{}").andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("CANCELADO"));
    }

    @Test
    void cancelacionTardia() throws Exception {
        int id = crear(HOY + "20:00");

        cancelar(id, "{}").andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("CANCELADO_TARDIO"));
    }

    @Test
    void exactamenteEnElLimite() throws Exception {
        int id = crear(MANIANA + "09:00");

        cancelar(id, "{}").andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("CANCELADO"));
    }

    @Test
    void limiteConfiguradoDistinto() throws Exception {
        jdbc.update("update configuracion set horas_cancelacion_tardia = 48 where id = 1");
        int id = crear(MANIANA + "10:00");

        cancelar(id, "{}").andExpect(status().isOk()).andExpect(jsonPath("$.estado").value("CANCELADO_TARDIO"));
    }

    // --- Libera el horario ---

    @Test
    void nuevoTurnoEnElHorarioLiberado() throws Exception {
        int id = crear(HOY + "20:00");
        cancelar(id, "{}").andExpect(jsonPath("$.estado").value("CANCELADO_TARDIO"));

        crearTurno(HOY + "20:00").andExpect(status().isCreated());
    }

    // --- Solo programados y futuros ---

    @Test
    void turnoYaCancelado() throws Exception {
        int id = crear(MANIANA + "10:00");
        cancelarConMotivo(id, MOTIVO).andExpect(status().isOk());

        cancelarConMotivo(id, "Otro motivo")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));

        consultar(id)
                .andExpect(jsonPath("$.estado").value("CANCELADO"))
                .andExpect(jsonPath("$.motivoCancelacion").value(MOTIVO))
                .andExpect(jsonPath("$.canceladoEn").value("2026-11-30T09:00:00-03:00"));
    }

    @Test
    void turnoEnEstadoFinalDeAsistencia() throws Exception {
        long id = insertarDirecto(AHORA.minusHours(2), "ATENDIDO");

        cancelar(id, "{}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));
    }

    @Test
    void turnoQueYaEmpezo() throws Exception {
        long id = insertarDirecto(AHORA, "PROGRAMADO");

        cancelar(id, "{}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));

        consultar(id)
                .andExpect(jsonPath("$.estado").value("PROGRAMADO"))
                .andExpect(jsonPath("$.canceladoEn").value(nullValue()));
    }

    // --- Datos de cancelación en la consulta ---

    @Test
    void turnoCanceladoConsultado() throws Exception {
        int id = crear(MANIANA + "10:00");
        cancelarConMotivo(id, MOTIVO).andExpect(status().isOk());

        consultar(id)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("CANCELADO"))
                .andExpect(jsonPath("$.motivoCancelacion").value(MOTIVO))
                .andExpect(jsonPath("$.canceladoEn").value("2026-11-30T09:00:00-03:00"));
    }

    @Test
    void turnoNoCancelado() throws Exception {
        int id = crear(MANIANA + "10:00");

        consultar(id)
                .andExpect(jsonPath("$.motivoCancelacion").value(nullValue()))
                .andExpect(jsonPath("$.canceladoEn").value(nullValue()));
    }

    // --- Inexistente y acceso ---

    @Test
    void turnoInexistente() throws Exception {
        cancelar(999999L, "{}")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("TURNO_NO_ENCONTRADO"));
    }

    @Test
    void sinToken() throws Exception {
        mvc.perform(post("/api/turnos/1/cancelacion").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }
}
