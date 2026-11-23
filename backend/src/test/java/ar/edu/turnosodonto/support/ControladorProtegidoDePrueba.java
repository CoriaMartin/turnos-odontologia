package ar.edu.turnosodonto.support;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Ruta protegida mínima para probar la autenticación antes de que existan endpoints de negocio. */
@RestController
public class ControladorProtegidoDePrueba {

    @GetMapping("/api/prueba/protegida")
    public Map<String, String> protegida() {
        return Map.of("estado", "ok");
    }
}
