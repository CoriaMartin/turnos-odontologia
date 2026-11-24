package ar.edu.turnosodonto.notificaciones;

public interface EnviadorEmail {
    boolean habilitado();
    void enviar(MensajeEmail mensaje);
}
