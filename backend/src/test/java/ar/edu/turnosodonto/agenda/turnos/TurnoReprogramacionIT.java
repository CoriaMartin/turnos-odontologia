package ar.edu.turnosodonto.agenda.turnos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.List;

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
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import ar.edu.turnosodonto.shared.time.RelojConfig;
import ar.edu.turnosodonto.support.RelojMutable;

/** Delta de la spec turnos (C-10, reprogramar): un test por escenario. Hora actual fija: 2026-11-30 09:00. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@RecordApplicationEvents
class TurnoReprogramacionIT {

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

    /** Turno creado por la API: id y version. */
    record TurnoCreado(int id, int version) {
    }

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ApplicationEvents eventos;

    private String token;
    private long pacienteId;
    private long limpiezaId;

    @BeforeEach
    void preparar() throws Exception {
        limpiar();
        pacienteId = jdbc.queryForObject(
                "insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio Reprograma', '00000501') returning id",
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
        jdbc.update("delete from paciente where dni like '000005%'");
    }

    private TurnoCreado crear(String hora) throws Exception {
        String cuerpo = "{\"pacienteId\":" + pacienteId + ",\"prestacionId\":" + limpiezaId
                + ",\"inicio\":\"" + DIA + hora + ZONA + "\"}";
        String respuesta = mvc.perform(post("/api/turnos").header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(cuerpo))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return new TurnoCreado(JsonPath.read(respuesta, "$.id"), JsonPath.read(respuesta, "$.version"));
    }

    private ResultActions reprogramar(long id, String inicio, Integer duracion, Integer version) throws Exception {
        String cuerpo = "{" + String.join(",", List.of(
                        inicio == null ? "" : "\"inicio\":\"" + inicio + "\"",
                        duracion == null ? "" : "\"duracionMinutos\":" + duracion,
                        version == null ? "" : "\"version\":" + version).stream().filter(s -> !s.isEmpty()).toList())
                + "}";
        return mvc.perform(put("/api/turnos/" + id + "/reprogramacion")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(cuerpo));
    }

    private ResultActions reprogramar(TurnoCreado turno, String hora) throws Exception {
        return reprogramar(turno.id(), DIA + hora + ZONA, null, turno.version());
    }

    private long insertarDirecto(OffsetDateTime inicio, int minutos, String estado) {
        long profesionalId = jdbc.queryForObject("select id from profesional order by id limit 1", Long.class);
        long sillonId = jdbc.queryForObject("select id from sillon where nombre = 'Sillón 1'", Long.class);
        return jdbc.queryForObject("""
                insert into turno (paciente_id, profesional_id, sillon_id, prestacion_id, inicio, fin, estado)
                values (?, ?, ?, ?, ?, ?, ?) returning id""", Long.class,
                pacienteId, profesionalId, sillonId, limpiezaId,
                Timestamp.from(inicio.toInstant()), Timestamp.from(inicio.plusMinutes(minutos).toInstant()), estado);
    }

    private long eventosPublicados() {
        return eventos.stream(TurnoReprogramado.class).count();
    }

    // --- Reprogramar ---

    @Test
    void reprogramacionAUnHorarioLibre() throws Exception {
        TurnoCreado turno = crear("10:00");

        reprogramar(turno, "12:00")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(turno.id()))
                .andExpect(jsonPath("$.estado").value("PROGRAMADO"))
                .andExpect(jsonPath("$.inicio").value("2026-12-01T12:00:00-03:00"))
                .andExpect(jsonPath("$.fin").value("2026-12-01T12:45:00-03:00"))
                .andExpect(jsonPath("$.version").value(turno.version() + 1));
    }

    @Test
    void reprogramacionConOtraDuracion() throws Exception {
        TurnoCreado turno = crear("10:00");

        reprogramar(turno.id(), DIA + "12:00" + ZONA, 60, turno.version())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fin").value("2026-12-01T13:00:00-03:00"));
    }

    @Test
    void datosObligatorios() throws Exception {
        TurnoCreado turno = crear("10:00");

        reprogramar(turno.id(), null, null, null)
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errores[*].campo", hasItem("inicio")))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("version")));
    }

    // --- No solapamiento ---

    @Test
    void nuevoHorarioQueSolapaConOtroTurno() throws Exception {
        TurnoCreado a = crear("10:00");
        TurnoCreado b = crear("12:00");

        reprogramar(a, "12:30")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TURNO_SOLAPADO"))
                .andExpect(jsonPath("$.turnoEnConflicto.id").value(b.id()));

        mvc.perform(get("/api/turnos/" + a.id()).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$.inicio").value("2026-12-01T10:00:00-03:00"))
                .andExpect(jsonPath("$.version").value(a.version()));
        assertThat(eventosPublicados()).isZero();
    }

    @Test
    void moverDentroDeSuPropioIntervalo() throws Exception {
        TurnoCreado turno = crear("10:00");

        reprogramar(turno, "10:15")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fin").value("2026-12-01T11:00:00-03:00"));
    }

    @Test
    void nuevoHorarioAdyacenteAOtroTurno() throws Exception {
        TurnoCreado a = crear("10:00");
        crear("12:00");

        reprogramar(a, "12:45").andExpect(status().isOk());
    }

    // --- Pasado ---

    @Test
    void nuevoInicioEnElPasado() throws Exception {
        TurnoCreado turno = crear("10:00");

        reprogramar(turno.id(), AHORA.minusHours(1).toString(), null, turno.version())
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("TURNO_EN_PASADO"));
    }

    // --- Estado ---

    @Test
    void turnoCancelado() throws Exception {
        long id = insertarDirecto(OffsetDateTime.parse(DIA + "10:00" + ZONA), 45, "CANCELADO");

        reprogramar(id, DIA + "12:00" + ZONA, null, 0)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));
    }

    @Test
    void turnoQueYaEmpezo() throws Exception {
        long id = insertarDirecto(AHORA.minusMinutes(30), 60, "PROGRAMADO");

        reprogramar(id, DIA + "12:00" + ZONA, null, 0)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));
    }

    // --- Edición concurrente ---

    @Test
    void versionDesactualizada() throws Exception {
        TurnoCreado turno = crear("10:00");
        reprogramar(turno, "12:00").andExpect(status().isOk());

        reprogramar(turno, "15:00")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TURNO_MODIFICADO"));

        mvc.perform(get("/api/turnos/" + turno.id()).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(jsonPath("$.inicio").value("2026-12-01T12:00:00-03:00"))
                .andExpect(jsonPath("$.version").value(turno.version() + 1));
    }

    // --- Evento ---

    @Test
    void eventoPublicadoConInicioAnteriorYNuevo() throws Exception {
        TurnoCreado turno = crear("10:00");

        reprogramar(turno, "12:00").andExpect(status().isOk());

        assertThat(eventos.stream(TurnoReprogramado.class)).singleElement().satisfies(e -> {
            assertThat(e.turnoId()).isEqualTo((long) turno.id());
            assertThat(e.inicioAnterior()).isEqualTo(OffsetDateTime.parse(DIA + "10:00" + ZONA).toInstant());
            assertThat(e.inicioNuevo()).isEqualTo(OffsetDateTime.parse(DIA + "12:00" + ZONA).toInstant());
        });
    }

    @Test
    void sinEventoSiSeRechaza() throws Exception {
        TurnoCreado a = crear("10:00");
        crear("12:00");

        reprogramar(a, "12:15").andExpect(status().isConflict());

        assertThat(eventosPublicados()).isZero();
    }

    // --- Inexistente y acceso ---

    @Test
    void turnoInexistente() throws Exception {
        reprogramar(999999L, DIA + "12:00" + ZONA, null, 0)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("TURNO_NO_ENCONTRADO"));
    }

    @Test
    void sinToken() throws Exception {
        mvc.perform(put("/api/turnos/1/reprogramacion").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }
}
