package ar.edu.turnosodonto.agenda.turnos;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;

import ar.edu.turnosodonto.shared.error.NegocioException;

/**
 * El horario se superpone con otro turno del profesional o del sillón (RN-AG-01/02).
 * Informa el turno en conflicto (id, inicio, fin) sin datos del paciente.
 */
public class TurnoSolapadoException extends NegocioException {

    public static final String CODIGO = "TURNO_SOLAPADO";

    /** Resumen del turno con el que choca. */
    public record TurnoEnConflicto(Long id, OffsetDateTime inicio, OffsetDateTime fin) {
    }

    private final TurnoEnConflicto conflicto;

    public TurnoSolapadoException(TurnoEnConflicto conflicto) {
        super(CODIGO, HttpStatus.CONFLICT, "Ese horario se superpone con otro turno. Elegí otro horario.");
        this.conflicto = conflicto;
    }

    @Override
    public Map<String, Object> propiedades() {
        if (conflicto == null) {
            return Map.of();
        }
        Map<String, Object> turno = new LinkedHashMap<>();
        turno.put("id", conflicto.id());
        turno.put("inicio", conflicto.inicio());
        turno.put("fin", conflicto.fin());
        return Map.of("turnoEnConflicto", turno);
    }
}
