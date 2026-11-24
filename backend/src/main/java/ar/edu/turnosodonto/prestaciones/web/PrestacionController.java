package ar.edu.turnosodonto.prestaciones.web;

import java.net.URI;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ar.edu.turnosodonto.prestaciones.Prestacion;
import ar.edu.turnosodonto.prestaciones.PrestacionService;

@RestController
@RequestMapping("/api/prestaciones")
public class PrestacionController {

    private final PrestacionService servicio;

    public PrestacionController(PrestacionService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<PrestacionResponse> listar() {
        return servicio.listar().stream().map(PrestacionResponse::de).toList();
    }

    @GetMapping("/{id}")
    public PrestacionResponse obtener(@PathVariable Long id) {
        return PrestacionResponse.de(servicio.obtener(id));
    }

    @PostMapping
    public ResponseEntity<PrestacionResponse> crear(@Valid @RequestBody PrestacionRequest solicitud) {
        Prestacion prestacion = servicio.crear(solicitud.aDatos());
        return ResponseEntity.created(URI.create("/api/prestaciones/" + prestacion.getId()))
                .body(PrestacionResponse.de(prestacion));
    }

    @PutMapping("/{id}")
    public PrestacionResponse actualizar(@PathVariable Long id, @Valid @RequestBody PrestacionRequest solicitud) {
        return PrestacionResponse.de(servicio.actualizar(id, solicitud.aDatos()));
    }

    @PatchMapping("/{id}/activa")
    public PrestacionResponse cambiarActiva(@PathVariable Long id, @Valid @RequestBody ActivaRequest solicitud) {
        return PrestacionResponse.de(servicio.cambiarActiva(id, Boolean.TRUE.equals(solicitud.activa())));
    }
}
