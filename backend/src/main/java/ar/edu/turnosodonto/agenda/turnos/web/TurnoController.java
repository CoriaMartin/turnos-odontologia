package ar.edu.turnosodonto.agenda.turnos.web;

import java.net.URI;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    /** Agenda (C-08): período [desde, hasta) obligatorio y de hasta 31 días; lo valida el servicio para responder 422. */
    @GetMapping
    public List<TurnoResponse> agenda(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime hasta,
            @RequestParam(defaultValue = "true") boolean incluirCancelados) {
        return servicio.agenda(aInstante(desde), aInstante(hasta), incluirCancelados).stream()
                .map(TurnoResponse::de)
                .toList();
    }

    private static Instant aInstante(OffsetDateTime fecha) {
        return fecha == null ? null : fecha.toInstant();
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
