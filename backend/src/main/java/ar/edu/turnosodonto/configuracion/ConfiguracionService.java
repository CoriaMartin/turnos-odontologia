package ar.edu.turnosodonto.configuracion;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ar.edu.turnosodonto.agenda.recursos.ConsultorioNoConfiguradoException;

/** Consulta y actualización de la configuración única del consultorio. */
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

    @Transactional
    public Configuracion actualizar(int horasCancelacionTardia, int horasAnticipacionRecordatorio) {
        Configuracion configuracion = obtener();
        configuracion.actualizar(horasCancelacionTardia, horasAnticipacionRecordatorio);
        return configuracion;
    }
}