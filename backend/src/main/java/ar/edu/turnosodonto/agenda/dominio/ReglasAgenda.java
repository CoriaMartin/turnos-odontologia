package ar.edu.turnosodonto.agenda.dominio;

import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import java.util.function.Function;

/** Reglas de agenda como funciones puras (RN-AG-01..06). */
public final class ReglasAgenda {

    public static final int DURACION_MINIMA_MINUTOS = 5;
    public static final int DURACION_MAXIMA_MINUTOS = 480;

    private ReglasAgenda() {
    }

    /** RN-AG-06 / DD-12: no se aceptan inicios anteriores a la hora actual. */
    public static boolean esPasado(Instant inicio, Instant ahora) {
        return inicio.isBefore(ahora);
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
