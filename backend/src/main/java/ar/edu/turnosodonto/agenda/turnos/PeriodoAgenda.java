package ar.edu.turnosodonto.agenda.turnos;

import java.time.Duration;
import java.time.Instant;

/** Período semiabierto [desde, hasta) de una consulta de agenda (C-08): obligatorio, no vacío y de hasta 31 días. */
public record PeriodoAgenda(Instant desde, Instant hasta) {

    /** 31 días exactos: la zona del consultorio no tiene horario de verano (design D4). */
    public static final Duration MAXIMO = Duration.ofDays(31);

    public PeriodoAgenda {
        if (desde == null) {
            throw new PeriodoAgendaInvalidoException("desde", "Indicá desde qué fecha y hora querés ver la agenda.");
        }
        if (hasta == null) {
            throw new PeriodoAgendaInvalidoException("hasta", "Indicá hasta qué fecha y hora querés ver la agenda.");
        }
        if (!hasta.isAfter(desde)) {
            throw new PeriodoAgendaInvalidoException("hasta", "La fecha final tiene que ser posterior a la inicial.");
        }
        if (Duration.between(desde, hasta).compareTo(MAXIMO) > 0) {
            throw new PeriodoAgendaInvalidoException("hasta", "Podés ver hasta 31 días por vez. Elegí un período más corto.");
        }
    }
}
