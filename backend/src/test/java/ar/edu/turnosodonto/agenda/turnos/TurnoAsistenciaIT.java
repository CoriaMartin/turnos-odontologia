package ar.edu.turnosodonto.agenda.turnos;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import com.jayway.jsonpath.JsonPath;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import ar.edu.turnosodonto.shared.time.RelojConfig;
import ar.edu.turnosodonto.support.RelojMutable;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TurnoAsistenciaIT {

    private static final OffsetDateTime AHORA = OffsetDateTime.parse("2026-11-30T09:00:00-03:00");
    private static final String HOY = "2026-11-30T";
    private static final String MANIANA = "2026-12-01T";
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
    private TestRestTemplate http;

    @Autowired
    private JdbcTemplate jdbc;

    private String token;
    private long pacienteId;
    private long limpiezaId;

    @BeforeEach
    void preparar() throws Exception {
        limpiar();
        pacienteId = jdbc.queryForObject(
                "insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio Asiste', '00001101') returning id",
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
        jdbc.update("delete from paciente where dni like '000011%'");
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

    private MockHttpServletRequestBuilder pedidoAsistencia(long id) {
        return post("/api/turnos/" + id + "/asistencia").header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }

    private ResultActions asistencia(long id, String estado) throws Exception {
        return mvc.perform(pedidoAsistencia(id).contentType(MediaType.APPLICATION_JSON)
                .content("{\"estado\":\"" + estado + "\"}"));
    }

    private ResultActions consultar(long id) throws Exception {
        return mvc.perform(get("/api/turnos/" + id).header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    @Test
    void atendidoEnElInicio() throws Exception {
        long id = insertarDirecto(AHORA, "PROGRAMADO");

        asistencia(id, "ATENDIDO")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.inicio").value("2026-11-30T09:00:00-03:00"))
                .andExpect(jsonPath("$.fin").value("2026-11-30T09:45:00-03:00"))
                .andExpect(jsonPath("$.paciente.apellido").value("Ficticio Asiste"))
                .andExpect(jsonPath("$.prestacion.nombre").value("Limpieza"))
                .andExpect(jsonPath("$.estado").value("ATENDIDO"));
    }

    @Test
    void ausenteEnElInicio() throws Exception {
        long id = insertarDirecto(AHORA, "PROGRAMADO");

        asistencia(id, "AUSENTE")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("AUSENTE"));
    }

    @Test
    void asistenciaDespuesDelFin() throws Exception {
        long id = insertarDirecto(AHORA.minusHours(2), "PROGRAMADO");

        asistencia(id, "ATENDIDO")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ATENDIDO"));
    }

    @Test
    void faltaElEstado() throws Exception {
        long id = insertarDirecto(AHORA, "PROGRAMADO");

        mvc.perform(pedidoAsistencia(id).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("estado")));

        consultar(id).andExpect(jsonPath("$.estado").value("PROGRAMADO"));
    }

    @Test
    void estadoNoAdmitido() throws Exception {
        long id = insertarDirecto(AHORA, "PROGRAMADO");

        asistencia(id, "PROGRAMADO")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.codigo").value("SOLICITUD_INVALIDA"));

        consultar(id).andExpect(jsonPath("$.estado").value("PROGRAMADO"));
    }

    @Test
    void turnoQueTodaviaNoEmpezo() throws Exception {
        int id = crear(MANIANA + "10:00");

        asistencia(id, "ATENDIDO")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));

        consultar(id).andExpect(jsonPath("$.estado").value("PROGRAMADO"));
    }

    @Test
    void dobleMarcadoDeUnTurnoAtendido() throws Exception {
        long id = insertarDirecto(AHORA.minusHours(2), "ATENDIDO");

        asistencia(id, "AUSENTE")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));

        consultar(id).andExpect(jsonPath("$.estado").value("ATENDIDO"));
    }

    @Test
    void dobleMarcadoDeUnTurnoAusente() throws Exception {
        long id = insertarDirecto(AHORA.minusHours(2), "AUSENTE");

        asistencia(id, "ATENDIDO")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));

        consultar(id).andExpect(jsonPath("$.estado").value("AUSENTE"));
    }

    @Test
    void turnoCancelado() throws Exception {
        long id = insertarDirecto(AHORA.minusHours(2), "CANCELADO");

        asistencia(id, "ATENDIDO")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));
    }

    @Test
    void turnoCanceladoTardiamente() throws Exception {
        long id = insertarDirecto(AHORA.minusHours(2), "CANCELADO_TARDIO");

        asistencia(id, "AUSENTE")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TRANSICION_INVALIDA"));
    }

    @Test
    void horarioOcupadoPorUnTurnoAtendido() throws Exception {
        insertarDirecto(AHORA, "ATENDIDO");

        crearTurno(HOY + "09:15")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TURNO_SOLAPADO"));
    }

    @Test
    void horarioOcupadoPorUnTurnoAusente() throws Exception {
        insertarDirecto(AHORA, "AUSENTE");

        crearTurno(HOY + "09:00")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codigo").value("TURNO_SOLAPADO"));
    }

    @Test
    void turnoInexistente() throws Exception {
        asistencia(999999L, "ATENDIDO")
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.codigo").value("TURNO_NO_ENCONTRADO"));
    }

    @Test
    void sinToken() throws Exception {
        mvc.perform(post("/api/turnos/1/asistencia").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\":\"ATENDIDO\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    @RepeatedTest(5)
    void dosMarcadosConcurrentesDelMismoTurno() throws Exception {
        long id = insertarDirecto(AHORA, "PROGRAMADO");
        HttpHeaders encabezados = new HttpHeaders();
        encabezados.setContentType(MediaType.APPLICATION_JSON);
        encabezados.setBearerAuth(token);
        List<String> estadosSolicitados = List.of("ATENDIDO", "AUSENTE");

        CountDownLatch largada = new CountDownLatch(1);
        ExecutorService hilos = Executors.newFixedThreadPool(2);
        try {
            List<Future<ResponseEntity<String>>> respuestas = new ArrayList<>();
            for (String estado : estadosSolicitados) {
                HttpEntity<String> pedido = new HttpEntity<>("{\"estado\":\"" + estado + "\"}", encabezados);
                respuestas.add(hilos.submit(() -> {
                    largada.await();
                    return http.postForEntity("/api/turnos/" + id + "/asistencia", pedido, String.class);
                }));
            }
            largada.countDown();

            List<HttpStatus> estados = new ArrayList<>();
            String estadoGanador = null;
            String cuerpoRechazado = null;
            for (int i = 0; i < respuestas.size(); i++) {
                ResponseEntity<String> respuesta = respuestas.get(i).get(30, TimeUnit.SECONDS);
                HttpStatus estado = HttpStatus.valueOf(respuesta.getStatusCode().value());
                estados.add(estado);
                if (estado == HttpStatus.OK) {
                    estadoGanador = estadosSolicitados.get(i);
                } else {
                    cuerpoRechazado = respuesta.getBody();
                }
            }

            assertThat(estados).containsExactlyInAnyOrder(HttpStatus.OK, HttpStatus.CONFLICT);
            assertThat(cuerpoRechazado).contains("TRANSICION_INVALIDA");
            assertThat(jdbc.queryForObject("select estado from turno where id = ?", String.class, id))
                    .isEqualTo(estadoGanador);
        } finally {
            hilos.shutdownNow();
        }
    }
}
