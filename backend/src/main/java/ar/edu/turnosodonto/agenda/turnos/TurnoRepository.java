package ar.edu.turnosodonto.agenda.turnos;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
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
}
