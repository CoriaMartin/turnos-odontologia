package ar.edu.turnosodonto.agenda.turnos;

import java.time.ZoneId;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;
import ar.edu.turnosodonto.agenda.dominio.Intervalo;
import ar.edu.turnosodonto.shared.time.RelojConfig;

/**
 * Busca el turno que choca con un intervalo. Tiene su propio método con transacción nueva para el caso
 * de carrera: cuando PostgreSQL rechaza el INSERT por la EXCLUDE, la transacción original queda abortada
 * y no admite más consultas.
 */
@Component
class ConsultaConflictos {

    private static final ZoneId ZONA = RelojConfig.ZONA_CONSULTORIO;

    private final TurnoRepository turnos;

    ConsultaConflictos(TurnoRepository turnos) {
        this.turnos = turnos;
    }

    @Transactional(readOnly = true)
    public Optional<TurnoSolapadoException.TurnoEnConflicto> buscar(Long profesionalId, Long sillonId, Intervalo intervalo) {
        return primero(profesionalId, sillonId, intervalo);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public Optional<TurnoSolapadoException.TurnoEnConflicto> buscarEnTransaccionNueva(Long profesionalId, Long sillonId,
            Intervalo intervalo) {
        return primero(profesionalId, sillonId, intervalo);
    }

    private Optional<TurnoSolapadoException.TurnoEnConflicto> primero(Long profesionalId, Long sillonId,
            Intervalo intervalo) {
        return turnos.buscarQueSeSuperponen(profesionalId, sillonId, intervalo.inicio(), intervalo.fin(),
                        EstadoTurno.queOcupanHorario())
                .stream()
                .findFirst()
                .map(t -> new TurnoSolapadoException.TurnoEnConflicto(
                        t.getId(), t.getInicio().atZone(ZONA).toOffsetDateTime(), t.getFin().atZone(ZONA).toOffsetDateTime()));
    }
}
