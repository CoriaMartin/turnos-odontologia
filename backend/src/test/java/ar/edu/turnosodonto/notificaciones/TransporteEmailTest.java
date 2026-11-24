package ar.edu.turnosodonto.notificaciones;

import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class TransporteEmailTest {
    @Test void plantillaLimitada() {
        var mensaje = new PlantillaRecordatorio("contacto@example.com").crear("paciente@example.com",
                Instant.parse("2026-12-01T13:00:00Z"), ZoneId.of("America/Argentina/Buenos_Aires"));
        assertThat(mensaje.destinatario()).isEqualTo("paciente@example.com");
        assertThat(mensaje.cuerpo()).isEqualTo("Fecha y hora: 01/12/2026 10:00\nConsultorio odontológico\nContacto: contacto@example.com");
    }
    @Test void deshabilitadoNoEnvia() {
        var smtp = new EnviadorEmailSmtp(false, "", 587, "", "", "turnos@example.com");
        assertThat(smtp.habilitado()).isFalse();
        assertThatThrownBy(() -> smtp.enviar(new MensajeEmail("paciente@example.com", "Prueba", "Prueba")))
                .isInstanceOf(IllegalStateException.class);
    }
    @Test void doblePermiteSimularFallo() {
        var doble = new EnviadorEmailEnMemoria();
        var mensaje = new MensajeEmail("paciente@example.com", "Prueba", "Prueba");
        doble.fallar(true);
        assertThatThrownBy(() -> doble.enviar(mensaje)).isInstanceOf(org.springframework.mail.MailSendException.class);
        assertThat(doble.mensajes()).isEmpty();
        doble.fallar(false);
        doble.enviar(mensaje);
        assertThat(doble.mensajes()).containsExactly(mensaje);
    }
}
