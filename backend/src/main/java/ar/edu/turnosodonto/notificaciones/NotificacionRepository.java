package ar.edu.turnosodonto.notificaciones;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    Optional<Notificacion> findByTurnoIdAndTipo(Long turnoId, String tipo);
    void deleteByTurnoIdAndTipo(Long turnoId, String tipo);
}
