package ar.edu.turnosodonto.pacientes;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    boolean existsByDni(String dni);

    boolean existsByDniAndIdNot(String dni, Long id);

    /**
     * Pacientes activos cuyo apellido o nombre contiene el patrón sin distinguir mayúsculas ni tildes,
     * o cuyo DNI lo contiene. {@code patron} ya viene con comodines y con % y _ escapados.
     */
    @Query(value = """
            select p.* from paciente p
            where p.activo
              and (:filtrar = false
                   or lower(unaccent(p.apellido)) like lower(unaccent(:patron)) escape '\\'
                   or lower(unaccent(p.nombre)) like lower(unaccent(:patron)) escape '\\'
                   or p.dni like :patron escape '\\')
            order by lower(p.apellido), lower(p.nombre), p.id
            """,
            countQuery = """
            select count(*) from paciente p
            where p.activo
              and (:filtrar = false
                   or lower(unaccent(p.apellido)) like lower(unaccent(:patron)) escape '\\'
                   or lower(unaccent(p.nombre)) like lower(unaccent(:patron)) escape '\\'
                   or p.dni like :patron escape '\\')
            """,
            nativeQuery = true)
    Page<Paciente> buscarActivos(@Param("filtrar") boolean filtrar, @Param("patron") String patron, Pageable pagina);
}
