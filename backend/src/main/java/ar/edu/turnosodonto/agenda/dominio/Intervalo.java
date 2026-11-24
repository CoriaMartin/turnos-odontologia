package ar.edu.turnosodonto.agenda.dominio;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

/**
 * Intervalo semiabierto {@code [inicio, fin)} (RN-AG-03): un intervalo que empieza exactamente
 * cuando termina otro no se superpone con él. Dominio puro, sin Spring.
 */
public record Intervalo(Instant inicio, Instant fin) {

    public Intervalo {
        Objects.requireNonNull(inicio, "inicio");
        Objects.requireNonNull(fin, "fin");
        if (!fin.isAfter(inicio)) {
            throw new IllegalArgumentException("El fin del intervalo debe ser posterior al inicio.");
        }
    }

    public static Intervalo de(Instant inicio, Duration duracion) {
        return new Intervalo(inicio, inicio.plus(duracion));
    }

    public boolean seSuperponeCon(Intervalo otro) {
        return inicio.isBefore(otro.fin) && otro.inicio.isBefore(fin);
    }

    public Duration duracion() {
        return Duration.between(inicio, fin);
    }
}
