package ar.edu.turnosodonto.agenda.recursos;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Único punto desde donde la agenda obtiene el profesional y el sillón que ocupa un turno.
 * En el MVP hay uno de cada uno (DD-01); para multi-recurso se cambia esta clase, no sus llamadores.
 */
@Service
public class RecursosConsultorio {

    /** Profesional y sillón que ocupa un turno. */
    public record Recursos(Profesional profesional, Sillon sillon) {
    }

    private final ProfesionalRepository profesionales;
    private final SillonRepository sillones;

    public RecursosConsultorio(ProfesionalRepository profesionales, SillonRepository sillones) {
        this.profesionales = profesionales;
        this.sillones = sillones;
    }

    @Transactional(readOnly = true)
    public Recursos recursos() {
        Profesional profesional = profesionales.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ConsultorioNoConfiguradoException(
                        "No hay un profesional configurado en el consultorio."));
        Sillon sillon = sillones.findFirstByActivoTrueOrderByIdAsc()
                .orElseThrow(() -> new ConsultorioNoConfiguradoException(
                        "No hay un sillón activo en el consultorio."));
        return new Recursos(profesional, sillon);
    }
}
