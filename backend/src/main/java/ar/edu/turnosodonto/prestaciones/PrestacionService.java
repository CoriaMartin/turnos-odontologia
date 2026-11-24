package ar.edu.turnosodonto.prestaciones;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PrestacionService {

    private static final Logger log = LoggerFactory.getLogger(PrestacionService.class);

    private static final String INDICE_NOMBRE = "prestacion_nombre_lower_uk";

    private final PrestacionRepository prestaciones;

    public PrestacionService(PrestacionRepository prestaciones) {
        this.prestaciones = prestaciones;
    }

    @Transactional
    public Prestacion crear(DatosPrestacion datos) {
        if (prestaciones.existsByNombreIgnoreCase(datos.nombre())) {
            throw new NombreDuplicadoException();
        }
        Prestacion prestacion = guardar(Prestacion.nuevo(datos));
        log.info("Prestación creada id={}", prestacion.getId());
        return prestacion;
    }

    @Transactional
    public Prestacion actualizar(Long id, DatosPrestacion datos) {
        Prestacion prestacion = obtener(id);
        if (prestaciones.existsByNombreIgnoreCaseAndIdNot(datos.nombre(), id)) {
            throw new NombreDuplicadoException();
        }
        prestacion.actualizar(datos);
        guardar(prestacion);
        log.info("Prestación actualizada id={}", id);
        return prestacion;
    }

    @Transactional
    public Prestacion cambiarActiva(Long id, boolean activa) {
        Prestacion prestacion = obtener(id);
        if (activa) {
            prestacion.activar();
        } else {
            prestacion.desactivar();
        }
        guardar(prestacion);
        log.info("Prestación activa id={} activa={}", id, activa);
        return prestacion;
    }

    @Transactional(readOnly = true)
    public Prestacion obtener(Long id) {
        return prestaciones.findById(id).orElseThrow(PrestacionNoEncontradoException::new);
    }

    @Transactional(readOnly = true)
    public List<Prestacion> listar() {
        return prestaciones.findAllByOrderByNombreAsc();
    }

    private Prestacion guardar(Prestacion prestacion) {
        try {
            return prestaciones.saveAndFlush(prestacion);
        } catch (DataIntegrityViolationException e) {
            if (e.getMostSpecificCause().getMessage() != null
                    && e.getMostSpecificCause().getMessage().contains(INDICE_NOMBRE)) {
                throw new NombreDuplicadoException();
            }
            throw e;
        }
    }
}
