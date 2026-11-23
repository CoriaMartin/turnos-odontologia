package ar.edu.turnosodonto.agenda.recursos;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfesionalRepository extends JpaRepository<Profesional, Long> {

    Optional<Profesional> findFirstByOrderByIdAsc();
}
