package ar.edu.turnosodonto.pacientes;

import java.time.Clock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Gestión de pacientes (spec pacientes). Los logs llevan solo el id (RN-DS-03). */
@Service
public class PacienteService {

    private static final Logger log = LoggerFactory.getLogger(PacienteService.class);

    static final int TAMANIO_POR_DEFECTO = 20;
    static final int TAMANIO_MAXIMO = 100;
    private static final String RESTRICCION_DNI = "paciente_dni_uk";

    private final PacienteRepository pacientes;
    private final TurnosDePaciente turnos;
    private final Clock reloj;

    public PacienteService(PacienteRepository pacientes, TurnosDePaciente turnos, Clock reloj) {
        this.pacientes = pacientes;
        this.turnos = turnos;
        this.reloj = reloj;
    }

    @Transactional
    public Paciente crear(DatosPaciente datos) {
        if (pacientes.existsByDni(datos.dni())) {
            throw new DniDuplicadoException();
        }
        Paciente paciente = guardar(Paciente.nuevo(datos));
        log.info("Paciente creado id={}", paciente.getId());
        return paciente;
    }

    @Transactional
    public Paciente actualizar(Long id, DatosPaciente datos) {
        Paciente paciente = obtener(id);
        if (!paciente.isActivo()) {
            throw new PacienteInactivoException();
        }
        if (pacientes.existsByDniAndIdNot(datos.dni(), id)) {
            throw new DniDuplicadoException();
        }
        paciente.actualizar(datos);
        guardar(paciente);
        log.info("Paciente actualizado id={}", id);
        return paciente;
    }

    /** Baja lógica. RN-PA-04: se rechaza si hay turnos programados futuros (los que ya empezaron no cuentan). */
    @Transactional
    public void darDeBaja(Long id) {
        Paciente paciente = obtener(id);
        if (paciente.isActivo()) {
            if (turnos.tieneProgramadosDesde(id, reloj.instant())) {
                throw new PacienteConTurnosFuturosException();
            }
            paciente.darDeBaja();
            log.info("Paciente dado de baja id={}", id);
        }
    }

    @Transactional(readOnly = true)
    public Paciente obtener(Long id) {
        return pacientes.findById(id).orElseThrow(PacienteNoEncontradoException::new);
    }

    @Transactional(readOnly = true)
    public Page<Paciente> buscar(String texto, int pagina, int tamanio) {
        String q = texto == null ? "" : texto.trim();
        PageRequest pedido = PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanio, 1, TAMANIO_MAXIMO));
        return pacientes.buscarActivos(!q.isEmpty(), "%" + escaparLike(q) + "%", pedido);
    }

    /** Guarda y traduce la violación del DNI único (dos altas simultáneas) a un error de negocio. */
    private Paciente guardar(Paciente paciente) {
        try {
            return pacientes.saveAndFlush(paciente);
        } catch (DataIntegrityViolationException e) {
            if (e.getMostSpecificCause().getMessage() != null
                    && e.getMostSpecificCause().getMessage().contains(RESTRICCION_DNI)) {
                throw new DniDuplicadoException();
            }
            throw e;
        }
    }

    private static String escaparLike(String texto) {
        return texto.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
