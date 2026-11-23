package ar.edu.turnosodonto.configuracion;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ar.edu.turnosodonto.agenda.recursos.ConsultorioNoConfiguradoException;

/** Lectura de la configuración única del consultorio. Los endpoints llegan en C-12. */
@Service
public class ConfiguracionService {

    private final ConfiguracionRepository repositorio;

    public ConfiguracionService(ConfiguracionRepository repositorio) {
        this.repositorio = repositorio;
    }

    @Transactional(readOnly = true)
    public Configuracion obtener() {
        return repositorio.findById(Configuracion.ID_UNICO)
                .orElseThrow(() -> new ConsultorioNoConfiguradoException(
                        "Falta la configuración del consultorio."));
    }
}
