package ar.edu.turnosodonto.pacientes.web;

import java.net.URI;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ar.edu.turnosodonto.pacientes.Paciente;
import ar.edu.turnosodonto.pacientes.PacienteService;
import ar.edu.turnosodonto.shared.web.PaginaResponse;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    private final PacienteService servicio;

    public PacienteController(PacienteService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public PaginaResponse<PacienteResponse> buscar(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return PaginaResponse.de(servicio.buscar(q, page, size), PacienteResponse::de);
    }

    @GetMapping("/{id}")
    public PacienteResponse obtener(@PathVariable Long id) {
        return PacienteResponse.de(servicio.obtener(id));
    }

    @PostMapping
    public ResponseEntity<PacienteResponse> crear(@Valid @RequestBody PacienteRequest solicitud) {
        Paciente paciente = servicio.crear(solicitud.aDatos());
        return ResponseEntity.created(URI.create("/api/pacientes/" + paciente.getId()))
                .body(PacienteResponse.de(paciente));
    }

    @PutMapping("/{id}")
    public PacienteResponse actualizar(@PathVariable Long id, @Valid @RequestBody PacienteRequest solicitud) {
        return PacienteResponse.de(servicio.actualizar(id, solicitud.aDatos()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> darDeBaja(@PathVariable Long id) {
        servicio.darDeBaja(id);
        return ResponseEntity.noContent().build();
    }
}
