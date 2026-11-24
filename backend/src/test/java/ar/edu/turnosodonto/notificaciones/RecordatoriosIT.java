package ar.edu.turnosodonto.notificaciones;

import java.time.*;
import java.sql.Timestamp;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.context.ApplicationEventPublisher;
import ar.edu.turnosodonto.agenda.turnos.TurnoReprogramado;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = "MAIL_ENABLED=false")
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
@ActiveProfiles("test")
class RecordatoriosIT {
    static final Instant AHORA = Instant.parse("2099-11-30T12:00:00Z");
    @TestConfiguration
    static class Config {
        @Bean @Primary Clock relojRecordatorios() {
            return Clock.fixed(AHORA, ZoneId.of("America/Argentina/Buenos_Aires"));
        }
        @Bean @Primary EnviadorEmailEnMemoria dobleCorreo() { return new EnviadorEmailEnMemoria(); }
    }
    @Autowired JdbcTemplate jdbc;
    @Autowired RecordatoriosScheduler scheduler;
    @Autowired ProcesadorRecordatorio procesador;
    @Autowired EnviadorEmailEnMemoria doble;
    @Autowired ConsultaNotificacionService consulta;
    @Autowired TransactionTemplate tx;
    @Autowired ApplicationEventPublisher eventos;
    long paciente;
    @BeforeEach void preparar() {
        doble.limpiar();
        jdbc.update("update configuracion set horas_anticipacion_recordatorio=24");
        paciente = jdbc.queryForObject("insert into paciente(nombre,apellido,dni,email,acepta_recordatorios) values ('Prueba','Recordatorio','00000992','paciente@example.com',true) returning id", Long.class);
    }
    @AfterEach void limpiar() {
        jdbc.update("delete from notificacion where turno_id in (select id from turno where paciente_id=?)", paciente);
        jdbc.update("delete from turno where paciente_id=?", paciente);
        jdbc.update("delete from paciente where id=?", paciente);
        jdbc.update("update configuracion set horas_anticipacion_recordatorio=24");
    }
    long turno(long horas) {
        Instant inicio = AHORA.plusSeconds(horas*3600);
        return jdbc.queryForObject("""
            insert into turno(paciente_id,profesional_id,sillon_id,prestacion_id,inicio,fin)
            values (?,(select min(id) from profesional),(select min(id) from sillon),(select min(id) from prestacion),?,?) returning id
            """, Long.class,paciente,Timestamp.from(inicio),Timestamp.from(inicio.plusSeconds(1800)));
    }
    @Test void dentroVentanaSinDuplicados() {
        long id=turno(24); scheduler.ejecutar(); scheduler.ejecutar();
        assertThat(doble.mensajes()).hasSize(1);
        assertThat(doble.mensajes().getFirst().destinatario()).isEqualTo("paciente@example.com");
        assertThat(consulta.consultar(id).estado()).isEqualTo("ENVIADA");
        assertThat(consulta.consultar(id).enviadaEn()).isEqualTo(AHORA);
    }
    @Test void fueraVentanaYCambioConfiguracion() {
        long id=turno(30); scheduler.ejecutar(); assertThat(doble.mensajes()).isEmpty();
        jdbc.update("update configuracion set horas_anticipacion_recordatorio=48");
        scheduler.ejecutar(); assertThat(consulta.consultar(id).estado()).isEqualTo("ENVIADA");
    }
    @Test void pasado() { long id=turno(-1); scheduler.ejecutar(); assertThat(doble.mensajes()).isEmpty(); assertThat(consulta.consultar(id).estado()).isEqualTo("NO_APLICA"); }
    @Test void sinConsentimiento() { long id=turno(2); jdbc.update("update paciente set acepta_recordatorios=false where id=?",paciente); scheduler.ejecutar(); assertThat(doble.mensajes()).isEmpty(); assertThat(consulta.consultar(id).estado()).isEqualTo("NO_CONSENTIDO"); }
    @Test void sinEmail() { long id=turno(2); jdbc.update("update paciente set email=null where id=?",paciente); scheduler.ejecutar(); assertThat(doble.mensajes()).isEmpty(); assertThat(consulta.consultar(id).estado()).isEqualTo("NO_APLICA"); }
    @Test void reintentoExitoso() { long id=turno(2); doble.fallar(true); scheduler.ejecutar(); assertThat(consulta.consultar(id).intentos()).isEqualTo(1); assertThat(consulta.consultar(id).estado()).isEqualTo("PENDIENTE"); doble.fallar(false); scheduler.ejecutar(); assertThat(consulta.consultar(id).intentos()).isEqualTo(2); assertThat(consulta.consultar(id).estado()).isEqualTo("ENVIADA"); }
    @Test void agotaIntentos() { long id=turno(2); doble.fallar(true); for(int i=0;i<3;i++) scheduler.ejecutar(); doble.fallar(false); scheduler.ejecutar(); assertThat(doble.mensajes()).isEmpty(); assertThat(consulta.consultar(id).intentos()).isEqualTo(3); assertThat(consulta.consultar(id).estado()).isEqualTo("FALLIDA"); }
    @Test void concurrencia() throws Exception { long id=turno(2); try(var pool=Executors.newFixedThreadPool(2)) { var a=pool.submit(()->procesador.procesar(id)); var b=pool.submit(()->procesador.procesar(id)); a.get(10,TimeUnit.SECONDS); b.get(10,TimeUnit.SECONDS); } assertThat(doble.mensajes()).hasSize(1); }
    @Test void reinicioYRollback() { long id=turno(2); scheduler.ejecutar(); var evento=new TurnoReprogramado(id,AHORA.plusSeconds(7200),AHORA.plusSeconds(10800)); tx.executeWithoutResult(s->{eventos.publishEvent(evento);s.setRollbackOnly();}); assertThat(consulta.consultar(id).estado()).isEqualTo("ENVIADA"); tx.executeWithoutResult(s->{jdbc.update("update turno set inicio=?,fin=? where id=?",Timestamp.from(evento.inicioNuevo()),Timestamp.from(evento.inicioNuevo().plusSeconds(1800)),id);eventos.publishEvent(evento);}); assertThat(consulta.consultar(id).estado()).isEqualTo("PENDIENTE"); scheduler.ejecutar(); assertThat(doble.mensajes()).hasSize(2); }

    @Autowired ar.edu.turnosodonto.agenda.turnos.TurnoService servicioTurnos;
    @Autowired org.springframework.test.web.servlet.MockMvc mvc;

    @Test void canceladoEntreConsultaYEnvio() {
        long id = turno(2);
        servicioTurnos.cancelar(id, "Prueba ficticia");
        procesador.procesar(id);
        scheduler.ejecutar();
        assertThat(doble.mensajes()).isEmpty();
        assertThat(jdbc.queryForObject("select count(*) from notificacion where turno_id=?", Long.class,id)).isZero();
    }

    @Test void reprogramacionRealAntesYDespuesDelEnvio() {
        long id = turno(2);
        servicioTurnos.reprogramar(id, new ar.edu.turnosodonto.agenda.turnos.TurnoService.NuevoHorario(AHORA.plusSeconds(10800),null,0));
        scheduler.ejecutar();
        assertThat(doble.mensajes()).hasSize(1);
        assertThat(doble.mensajes().getFirst().cuerpo()).contains("30/11/2099 12:00");
        int version = servicioTurnos.obtener(id).getVersion();
        servicioTurnos.reprogramar(id, new ar.edu.turnosodonto.agenda.turnos.TurnoService.NuevoHorario(AHORA.plusSeconds(14400),null,version));
        assertThat(consulta.consultar(id).estado()).isEqualTo("PENDIENTE");
        scheduler.ejecutar();
        assertThat(doble.mensajes()).hasSize(2);
        assertThat(doble.mensajes().getLast().cuerpo()).contains("30/11/2099 13:00");
    }

    @Test void falloPersistido() {
        long id = turno(2);
        doble.fallar(true);
        scheduler.ejecutar();
        assertThat(jdbc.queryForObject("select estado from notificacion where turno_id=?",String.class,id)).isEqualTo("FALLIDA");
        assertThat(jdbc.queryForObject("select intentos from notificacion where turno_id=?",Integer.class,id)).isEqualTo(1);
    }

    @Test void endpointAutenticacionYConsulta() throws Exception {
        long id = turno(2);
        String respuesta = mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/auth/login")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content("{\"email\":\"odontologo@example.com\",\"password\":\"ClaveDePrueba123\"}"))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk()).andReturn().getResponse().getContentAsString();
        String token = com.jayway.jsonpath.JsonPath.read(respuesta,"$.token");
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/turnos/{id}/notificaciones",id))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isUnauthorized());
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/turnos/{id}/notificaciones",id).header("Authorization","Bearer "+token))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.estado").value("PENDIENTE"));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/turnos/{id}/notificaciones",Long.MAX_VALUE).header("Authorization","Bearer "+token))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isNotFound());
    }
}