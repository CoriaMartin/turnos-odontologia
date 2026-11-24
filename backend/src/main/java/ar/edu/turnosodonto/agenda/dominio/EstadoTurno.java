package ar.edu.turnosodonto.agenda.dominio;

import java.util.EnumSet;
import java.util.Set;

/** Estados del turno (RN-ES). Los cancelados no ocupan el horario (RN-AG-10). */
public enum EstadoTurno {
    PROGRAMADO,
    ATENDIDO,
    AUSENTE,
    CANCELADO,
    CANCELADO_TARDIO;

    private static final Set<EstadoTurno> QUE_OCUPAN_HORARIO = EnumSet.of(PROGRAMADO, ATENDIDO, AUSENTE);

    public boolean ocupaHorario() {
        return QUE_OCUPAN_HORARIO.contains(this);
    }

    /** Estados que cuentan para el no solapamiento (RN-AG-01/02). Deben coincidir con el WHERE de las EXCLUDE de V5. */
    public static Set<EstadoTurno> queOcupanHorario() {
        return EnumSet.copyOf(QUE_OCUPAN_HORARIO);
    }
}
