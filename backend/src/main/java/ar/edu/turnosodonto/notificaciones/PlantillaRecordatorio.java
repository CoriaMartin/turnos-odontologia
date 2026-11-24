package ar.edu.turnosodonto.notificaciones;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PlantillaRecordatorio {
    private final String contacto;

    public PlantillaRecordatorio(@Value("${MAIL_CONTACTO:${MAIL_FROM:turnos@example.com}}") String contacto) {
        this.contacto = contacto;
    }

    public MensajeEmail crear(String destinatario, Instant inicio, ZoneId zona) {
        var fecha = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(zona).format(inicio);
        return new MensajeEmail(destinatario, "Recordatorio de turno",
                "Fecha y hora: " + fecha + "\nConsultorio odontológico\nContacto: " + contacto);
    }
}
