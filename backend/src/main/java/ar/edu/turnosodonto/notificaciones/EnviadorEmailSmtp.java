package ar.edu.turnosodonto.notificaciones;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

@Component
public class EnviadorEmailSmtp implements EnviadorEmail {
    private final boolean habilitado;
    private final String remitente;
    private final JavaMailSenderImpl smtp;

    public EnviadorEmailSmtp(@Value("${MAIL_ENABLED:false}") boolean habilitado,
            @Value("${MAIL_HOST:}") String host, @Value("${MAIL_PORT:587}") int puerto,
            @Value("${MAIL_USERNAME:}") String usuario, @Value("${MAIL_PASSWORD:}") String clave,
            @Value("${MAIL_FROM:turnos@example.com}") String remitente) {
        this.habilitado = habilitado;
        this.remitente = remitente;
        this.smtp = new JavaMailSenderImpl();
        smtp.setHost(host);
        smtp.setPort(puerto);
        smtp.setUsername(usuario);
        smtp.setPassword(clave);
        var propiedades = smtp.getJavaMailProperties();
        propiedades.setProperty("mail.smtp.auth", Boolean.toString(!usuario.isBlank()));
        propiedades.setProperty("mail.smtp.starttls.enable", "true");
        propiedades.setProperty("mail.smtp.connectiontimeout", "5000");
        propiedades.setProperty("mail.smtp.timeout", "5000");
        propiedades.setProperty("mail.smtp.writetimeout", "5000");
    }

    public boolean habilitado() { return habilitado; }

    public void enviar(MensajeEmail mensaje) {
        if (!habilitado) throw new IllegalStateException("Correo deshabilitado");
        var correo = new SimpleMailMessage();
        correo.setFrom(remitente);
        correo.setTo(mensaje.destinatario());
        correo.setSubject(mensaje.asunto());
        correo.setText(mensaje.cuerpo());
        smtp.send(correo);
    }
}
