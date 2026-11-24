package ar.edu.turnosodonto.notificaciones;

import java.util.ArrayList;
import java.util.List;
import org.springframework.mail.MailSendException;

public class EnviadorEmailEnMemoria implements EnviadorEmail {
    private final List<MensajeEmail> mensajes = new ArrayList<>();
    private boolean fallar;
    public boolean habilitado() { return true; }
    public synchronized void enviar(MensajeEmail mensaje) {
        if (fallar) throw new MailSendException("Fallo simulado");
        mensajes.add(mensaje);
    }
    public synchronized List<MensajeEmail> mensajes() { return List.copyOf(mensajes); }
    public synchronized void fallar(boolean valor) { fallar = valor; }
    public synchronized void limpiar() { mensajes.clear(); fallar = false; }
}
