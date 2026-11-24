package ar.edu.turnosodonto.agenda.dominio;

import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.function.Function;

/** Reglas de agenda como funciones puras (RN-AG-01..06, RN-CA-01/04). */
public final class ReglasAgenda {

    public static final int DURACION_MINIMA_MINUTOS = 5;
    public static final int DURACION_MAXIMA_MINUTOS = 480;

    private ReglasAgenda() {
    }

    /** RN-AG-06 / DD-12: no se aceptan inicios anteriores a la hora actual. */
    public static boolean esPasado(Instant inicio, Instant ahora) {
        return inicio.isBefore(ahora);
    }

    /**
     * RN-CA-01/04: la cancelación es tardía si entre {@code ahora} y el inicio falta estrictamente menos que
     * {@code limite}. Exactamente en el límite no es tardía.
     */
    public static boolean esCancelacionTardia(Instant inicio, Instant ahora, Duration limite) {
        return Duration.between(ahora, inicio).compareTo(limite) < 0;
    }

    /** RN-AG-05: duración entre 5 y 480 minutos. */
    public static boolean duracionValida(int minutos) {
        return minutos >= DURACION_MINIMA_MINUTOS && minutos <= DURACION_MAXIMA_MINUTOS;
    }

    /** Primer elemento (en el orden recibido) cuyo intervalo se superpone con el nuevo. */
    public static <T> Optional<T> primerConflicto(Intervalo nuevo, Collection<T> existentes,
            Function<T, Intervalo> intervaloDe) {
        return existentes.stream().filter(e -> intervaloDe.apply(e).seSuperponeCon(nuevo)).findFirst();
    }
}
