package ar.edu.turnosodonto.agenda.turnos.web;

import java.net.URI;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ar.edu.turnosodonto.agenda.turnos.Turno;
import ar.edu.turnosodonto.agenda.turnos.TurnoService;

@RestController
@RequestMapping("/api/turnos")
public class TurnoController {

    private final TurnoService servicio;

    public TurnoController(TurnoService servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    public ResponseEntity<TurnoResponse> crear(@Valid @RequestBody CrearTurnoRequest solicitud) {
        Turno turno = servicio.crear(solicitud.aNuevoTurno());
        return ResponseEntity.created(URI.create("/api/turnos/" + turno.getId())).body(TurnoResponse.de(turno));
    }

    @GetMapping("/{id}")
    public TurnoResponse obtener(@PathVariable Long id) {
        return TurnoResponse.de(servicio.obtener(id));
    }

    @PutMapping("/{id}/reprogramacion")
    public TurnoResponse reprogramar(@PathVariable Long id, @Valid @RequestBody ReprogramarTurnoRequest solicitud) {
        return TurnoResponse.de(servicio.reprogramar(id, solicitud.aNuevoHorario()));
    }
}
