package ar.edu.turnosodonto.agenda.turnos;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.RepeatedTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

/**
 * Spec turnos, escenarios de concurrencia con POST reales simultáneos.
 *
 * <p>"Dos creaciones concurrentes en el mismo horario": dos POST reales simultáneos,
 * cada uno en su propia transacción. Exactamente uno se crea; el otro recibe TURNO_SOLAPADO, ya sea porque
 * el servicio vio el turno ya confirmado o porque la restricción EXCLUDE rechazó el INSERT (23P01).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class TurnoConcurrenciaIT {

    @Autowired
    private TestRestTemplate http;

    @Autowired
    private JdbcTemplate jdbc;

    private String token;
    private long pacienteId;
    private long limpiezaId;

    @BeforeEach
    void preparar() {
        limpiar();
        pacienteId = jdbc.queryForObject(
                "insert into paciente (nombre, apellido, dni) values ('Paciente', 'Ficticio Concurrencia', '00000701') returning id",
                Long.class);
        limpiezaId = jdbc.queryForObject("select id from prestacion where nombre = 'Limpieza'", Long.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> login = http.postForObject("/api/auth/login",
                Map.of("email", "odontologo@example.com", "password", "ClaveDePrueba123"), Map.class);
        token = (String) login.get("token");
    }

    @AfterEach
    void limpiar() {
        jdbc.update("delete from turno");
        jdbc.update("delete from paciente where dni like '000007%'");
    }

    @RepeatedTest(5)
    void dosCreacionesConcurrentesEnElMismoHorario() throws Exception {
        OffsetDateTime inicio = OffsetDateTime.parse("2027-02-01T10:00:00-03:00");
        String cuerpo = "{\"pacienteId\":" + pacienteId + ",\"prestacionId\":" + limpiezaId
                + ",\"inicio\":\"" + inicio + "\"}";
        HttpHeaders encabezados = new HttpHeaders();
        encabezados.setContentType(MediaType.APPLICATION_JSON);
        encabezados.setBearerAuth(token);
        HttpEntity<String> pedido = new HttpEntity<>(cuerpo, encabezados);

        CountDownLatch largada = new CountDownLatch(1);
        ExecutorService hilos = Executors.newFixedThreadPool(2);
        try {
            List<Future<ResponseEntity<String>>> respuestas = new ArrayList<>();
            for (int i = 0; i < 2; i++) {
                respuestas.add(hilos.submit(() -> {
                    largada.await();
                    return http.postForEntity("/api/turnos", pedido, String.class);
                }));
            }
            largada.countDown();

            List<HttpStatus> estados = new ArrayList<>();
            List<String> cuerpos = new ArrayList<>();
            for (Future<ResponseEntity<String>> r : respuestas) {
                ResponseEntity<String> respuesta = r.get(30, TimeUnit.SECONDS);
                estados.add(HttpStatus.valueOf(respuesta.getStatusCode().value()));
                cuerpos.add(respuesta.getBody());
            }

            assertThat(estados).containsExactlyInAnyOrder(HttpStatus.CREATED, HttpStatus.CONFLICT);
            assertThat(cuerpos).anySatisfy(c -> assertThat(c).contains("TURNO_SOLAPADO"));
            assertThat(jdbc.queryForObject("select count(*) from turno", Integer.class)).isEqualTo(1);
        } finally {
            hilos.shutdownNow();
        }
    }

    /**
     * Spec turnos (C-09), escenario "Dos cancelaciones concurrentes": el SELECT ... FOR UPDATE serializa las dos;
     * la segunda ve el turno ya cancelado y responde TRANSICION_INVALIDA. Queda el motivo de la que respondió 200.
     */
    @RepeatedTest(5)
    void dosCancelacionesConcurrentesDelMismoTurno() throws Exception {
        HttpHeaders encabezados = new HttpHeaders();
        encabezados.setContentType(MediaType.APPLICATION_JSON);
        encabezados.setBearerAuth(token);
        String alta = "{\"pacienteId\":" + pacienteId + ",\"prestacionId\":" + limpiezaId
                + ",\"inicio\":\"2027-02-01T10:00:00-03:00\"}";
        @SuppressWarnings("unchecked")
        Map<String, Object> turno = http.postForObject("/api/turnos", new HttpEntity<>(alta, encabezados), Map.class);
        String url = "/api/turnos/" + turno.get("id") + "/cancelacion";
        List<String> motivos = List.of("Motivo A", "Motivo B");

        CountDownLatch largada = new CountDownLatch(1);
        ExecutorService hilos = Executors.newFixedThreadPool(2);
        try {
            List<Future<ResponseEntity<String>>> respuestas = new ArrayList<>();
            for (String motivo : motivos) {
                HttpEntity<String> pedido = new HttpEntity<>("{\"motivo\":\"" + motivo + "\"}", encabezados);
                respuestas.add(hilos.submit(() -> {
                    largada.await();
                    return http.postForEntity(url, pedido, String.class);
                }));
            }
            largada.countDown();

            List<HttpStatus> estados = new ArrayList<>();
            String motivoGanador = null;
            String cuerpoRechazado = null;
            for (int i = 0; i < respuestas.size(); i++) {
                ResponseEntity<String> respuesta = respuestas.get(i).get(30, TimeUnit.SECONDS);
                HttpStatus estado = HttpStatus.valueOf(respuesta.getStatusCode().value());
                estados.add(estado);
                if (estado == HttpStatus.OK) {
                    motivoGanador = motivos.get(i);
                } else {
                    cuerpoRechazado = respuesta.getBody();
                }
            }

            assertThat(estados).containsExactlyInAnyOrder(HttpStatus.OK, HttpStatus.CONFLICT);
            assertThat(cuerpoRechazado).contains("TRANSICION_INVALIDA");
            assertThat(jdbc.queryForObject("select motivo_cancelacion from turno where id = ?", String.class,
                    ((Number) turno.get("id")).longValue())).isEqualTo(motivoGanador);
        } finally {
            hilos.shutdownNow();
        }
    }
}
