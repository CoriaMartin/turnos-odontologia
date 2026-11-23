package ar.edu.turnosodonto.agenda.recursos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SillonRepository extends JpaRepository<Sillon, Long> {

    Optional<Sillon> findFirstByActivoTrueOrderByIdAsc();

    Optional<Sillon> findByNombre(String nombre);
}
