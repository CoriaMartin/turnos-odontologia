package ar.edu.turnosodonto.support;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.concurrent.atomic.AtomicReference;

/** Reloj de prueba que se puede adelantar, para probar vencimientos y bloqueos sin esperar. */
public class RelojMutable extends Clock {

    private final AtomicReference<Instant> ahora;
    private final ZoneId zona;

    public RelojMutable(Instant inicio, ZoneId zona) {
        this.ahora = new AtomicReference<>(inicio);
        this.zona = zona;
    }

    public void avanzar(Duration duracion) {
        ahora.updateAndGet(i -> i.plus(duracion));
    }

    @Override
    public ZoneId getZone() {
        return zona;
    }

    @Override
    public Clock withZone(ZoneId otraZona) {
        return new RelojMutable(ahora.get(), otraZona);
    }

    @Override
    public Instant instant() {
        return ahora.get();
    }
}
