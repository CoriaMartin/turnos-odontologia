package ar.edu.turnosodonto.auth.login;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import com.jayway.jsonpath.JsonPath;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import ar.edu.turnosodonto.shared.time.RelojConfig;
import ar.edu.turnosodonto.support.RelojMutable;

/** Spec autenticacion: un test por escenario. Usuario inicial con credenciales ficticias de application-test.yml. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@ExtendWith(OutputCaptureExtension.class)
class AuthIT {

    private static final String EMAIL = "odontologo@example.com";
    private static final String CLAVE = "ClaveDePrueba123";
    private static final String PROTEGIDA = "/api/prueba/protegida";

    @TestConfiguration
    static class RelojDePrueba {
        @Bean
        @Primary
        RelojMutable relojMutable() {
            return new RelojMutable(Instant.now(), RelojConfig.ZONA_CONSULTORIO);
        }
    }

    @Autowired
    private MockMvc mvc;

    @Autowired
    private RelojMutable reloj;

    private ResultActions login(String email, String password) throws Exception {
        String cuerpo = "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
        return mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(cuerpo));
    }

    private String tokenValido() throws Exception {
        String respuesta = login(EMAIL, CLAVE).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(respuesta, "$.token");
    }

    private void fallar(int veces) throws Exception {
        for (int i = 0; i < veces; i++) {
            login(EMAIL, "ClaveIncorrecta").andExpect(status().isUnauthorized());
        }
    }

    /** Cada test arranca sin bloqueos: pasa el tiempo de bloqueo y un login exitoso reinicia el contador. */
    @BeforeEach
    void estadoLimpio() throws Exception {
        reloj.avanzar(Duration.ofMinutes(20));
        tokenValido();
    }

    @Test
    void loginExitosoSinDistinguirMayusculas() throws Exception {
        login("Odontologo@Example.com", CLAVE)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.expiraEn").isNotEmpty());
    }

    @Test
    void contrasenaIncorrecta() throws Exception {
        login(EMAIL, "ClaveIncorrecta")
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.codigo").value("CREDENCIALES_INVALIDAS"));
    }

    @Test
    void emailInexistenteConElMismoMensaje() throws Exception {
        String conClaveMala = login(EMAIL, "ClaveIncorrecta").andReturn().getResponse().getContentAsString();
        String conEmailInexistente = login("nadie@example.com", CLAVE)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("CREDENCIALES_INVALIDAS"))
                .andReturn().getResponse().getContentAsString();

        String detalle1 = JsonPath.read(conClaveMala, "$.detail");
        String detalle2 = JsonPath.read(conEmailInexistente, "$.detail");
        assertThat(detalle2).isEqualTo(detalle1);
    }

    @Test
    void contrasenaVaciaEsValidacionFallida() throws Exception {
        login(EMAIL, "")
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.codigo").value("VALIDACION_FALLIDA"))
                .andExpect(jsonPath("$.errores[*].campo", hasItem("password")));
    }

    @Test
    void sinTokenEsNoAutenticado() throws Exception {
        mvc.perform(get(PROTEGIDA))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"))
                .andExpect(jsonPath("$.instance").value(PROTEGIDA));
    }

    @Test
    void conTokenValidoSeAtiende() throws Exception {
        mvc.perform(get(PROTEGIDA).header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenValido()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ok"));
    }

    @Test
    void tokenVencidoEsNoAutenticado() throws Exception {
        String token = tokenValido();
        reloj.avanzar(Duration.ofMinutes(481));

        mvc.perform(get(PROTEGIDA).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    @Test
    void tokenConFirmaInvalidaEsNoAutenticado() throws Exception {
        String ajeno = Jwts.builder()
                .subject("1")
                .claim("email", EMAIL)
                .expiration(Date.from(reloj.instant().plus(Duration.ofHours(1))))
                .signWith(Keys.hmacShaKeyFor(
                        "otra-clave-ficticia-distinta-0123456789abcdef".getBytes(StandardCharsets.UTF_8)))
                .compact();

        mvc.perform(get(PROTEGIDA).header(HttpHeaders.AUTHORIZATION, "Bearer " + ajeno))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("NO_AUTENTICADO"));
    }

    @Test
    void healthSiguePublico() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }

    @Test
    void elQuintoFalloBloqueaAunConLaClaveCorrecta() throws Exception {
        fallar(5);

        login(EMAIL, CLAVE)
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.codigo").value("LOGIN_BLOQUEADO"));
    }

    @Test
    void seDesbloqueaALosQuinceMinutos() throws Exception {
        fallar(5);
        reloj.avanzar(Duration.ofMinutes(15));

        login(EMAIL, CLAVE).andExpect(status().isOk());
    }

    @Test
    void unLoginExitosoReiniciaElContador() throws Exception {
        fallar(4);
        tokenValido();

        login(EMAIL, "ClaveIncorrecta")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codigo").value("CREDENCIALES_INVALIDAS"));
    }

    @Test
    void laContrasenaNoApareceEnRespuestaNiLogs(CapturedOutput salida) throws Exception {
        String clave = "ContraseniaSecretaDePrueba987";
        String respuesta = login(EMAIL, clave).andReturn().getResponse().getContentAsString();

        assertThat(respuesta).doesNotContain(clave);
        assertThat(salida.getAll()).doesNotContain(clave);
    }

    @Test
    void corsRechazaOtroOrigen() throws Exception {
        mvc.perform(options("/api/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://otro-sitio.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    @Test
    void corsAceptaElOrigenDelFrontend() throws Exception {
        mvc.perform(options("/api/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
    }
}
