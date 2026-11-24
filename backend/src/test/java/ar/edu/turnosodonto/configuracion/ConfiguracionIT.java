package ar.edu.turnosodonto.configuracion;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;

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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ConfiguracionIT {

    private static final String URL = "/api/configuracion";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void restaurarConfiguracion() {
        jdbc.update("""
                UPDATE configuracion
                SET horas_cancelacion_tardia = 24,
                    horas_anticipacion_recordatorio = 24
                """);
    }

    @Test
    void consultarConfiguracionSinAutenticacionSeRechaza() throws Exception {
        mvc.perform(get(URL))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void consultarConfiguracionConAutenticacion() throws Exception {
        String token = iniciarSesion();

        mvc.perform(get(URL)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.horasCancelacionTardia").value(24))
                .andExpect(jsonPath("$.horasAnticipacionRecordatorio").value(24))
                .andExpect(jsonPath("$.zonaHoraria").value("America/Argentina/Buenos_Aires"));
    }

    @Test
    void actualizarConfiguracionConValoresValidos() throws Exception {
        String token = iniciarSesion();

        mvc.perform(put(URL)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "horasCancelacionTardia": 12,
                                    "horasAnticipacionRecordatorio": 48
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.horasCancelacionTardia").value(12))
                .andExpect(jsonPath("$.horasAnticipacionRecordatorio").value(48));

        mvc.perform(get(URL)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.horasCancelacionTardia").value(12))
                .andExpect(jsonPath("$.horasAnticipacionRecordatorio").value(48));
    }

    @Test
    void rechazarHorasCancelacionNegativas() throws Exception {
        String token = iniciarSesion();

        mvc.perform(put(URL)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "horasCancelacionTardia": -1,
                                    "horasAnticipacionRecordatorio": 48
                                }
                                """))
                .andExpect(status().isUnprocessableEntity());

        verificarConfiguracionSinCambios(token);
    }

    @Test
    void rechazarHorasRecordatorioEnCero() throws Exception {
        String token = iniciarSesion();

        mvc.perform(put(URL)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "horasCancelacionTardia": 12,
                                    "horasAnticipacionRecordatorio": 0
                                }
                                """))
                .andExpect(status().isUnprocessableEntity());

        verificarConfiguracionSinCambios(token);
    }

    private void verificarConfiguracionSinCambios(String token) throws Exception {
        mvc.perform(get(URL)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.horasCancelacionTardia").value(24))
                .andExpect(jsonPath("$.horasAnticipacionRecordatorio").value(24));
    }

    private String iniciarSesion() throws Exception {
        String respuesta = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "email": "odontologo@example.com",
                                    "password": "ClaveDePrueba123"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return JsonPath.read(respuesta, "$.token");
    }
}