package ar.edu.turnosodonto.agenda.turnos;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;

public interface TurnoRepository extends JpaRepository<Turno, Long> {

    /**
     * Turnos en los estados dados del profesional o del sillón cuyo intervalo [inicio, fin) se superpone
     * con el indicado, sin contar el turno {@code excluirId} (0 = ninguno). Misma condición que las EXCLUDE de V5.
     */
    @Query("""
            select t from Turno t
            where t.estado in :estados
              and (t.profesional.id = :profesionalId or t.sillon.id = :sillonId)
              and t.inicio < :fin and :inicio < t.fin
              and t.id <> :excluirId
            order by t.inicio, t.id
            """)
    List<Turno> buscarQueSeSuperponen(@Param("profesionalId") Long profesionalId, @Param("sillonId") Long sillonId,
            @Param("inicio") Instant inicio, @Param("fin") Instant fin,
            @Param("estados") Collection<EstadoTurno> estados, @Param("excluirId") Long excluirId);

    @Query("""
            select t from Turno t
            join fetch t.paciente
            join fetch t.prestacion
            where t.id = :id
            """)
    Optional<Turno> buscarConDetalle(@Param("id") Long id);

    /**
     * Cancelación (C-09): lee el turno con {@code SELECT ... FOR UPDATE}, solo sobre {@code turno} (sin join fetch
     * para no bloquear paciente ni prestación). Una cancelación simultánea espera y ve el estado ya confirmado.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from Turno t where t.id = :id")
    Optional<Turno> buscarParaActualizar(@Param("id") Long id);

    /** RN-PA-04 (C-09): turnos del paciente en el estado dado con inicio estrictamente posterior. Usa turno_paciente_idx. */
    boolean existsByPacienteIdAndEstadoAndInicioAfter(Long pacienteId, EstadoTurno estado, Instant inicio);

    /**
     * Agenda (C-08): turnos en los estados dados cuyo intervalo [inicio, fin) se superpone con el período
     * semiabierto [desde, hasta), ordenados por inicio. Trae paciente y prestación en la misma consulta.
     */
    @Query("""
            select t from Turno t
            join fetch t.paciente
            join fetch t.prestacion
            where t.inicio < :hasta and t.fin > :desde
              and t.estado in :estados
            order by t.inicio, t.id
            """)
    List<Turno> buscarAgenda(@Param("desde") Instant desde, @Param("hasta") Instant hasta,
            @Param("estados") Collection<EstadoTurno> estados);
}
