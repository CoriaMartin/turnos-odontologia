package ar.edu.turnosodonto.configuracion.web;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ar.edu.turnosodonto.configuracion.ConfiguracionService;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    private final ConfiguracionService servicio;

    public ConfiguracionController(ConfiguracionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ConfiguracionResponse obtener() {
        return ConfiguracionResponse.de(servicio.obtener());
    }

    @PutMapping
    public ConfiguracionResponse actualizar(
            @Valid @RequestBody ConfiguracionRequest solicitud) {
        return ConfiguracionResponse.de(servicio.actualizar(
                solicitud.horasCancelacionTardia(),
                solicitud.horasAnticipacionRecordatorio()));
    }
}