package ar.edu.turnosodonto.agenda.turnos;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import ar.edu.turnosodonto.agenda.dominio.EstadoTurno;
import ar.edu.turnosodonto.agenda.dominio.Intervalo;
import ar.edu.turnosodonto.agenda.dominio.ReglasAgenda;
import ar.edu.turnosodonto.agenda.recursos.Profesional;
import ar.edu.turnosodonto.agenda.recursos.Sillon;
import ar.edu.turnosodonto.agenda.turnos.web.EstadoAsistencia;
import ar.edu.turnosodonto.pacientes.Paciente;
import ar.edu.turnosodonto.prestaciones.Prestacion;
import ar.edu.turnosodonto.shared.persistence.EntidadAuditada;

/** Turno de la agenda. Nace en PROGRAMADO (RN-ES-01); se reprograma (C-10) o se cancela (C-09). */
@Entity
@Table(name = "turno")
public class Turno extends EntidadAuditada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "profesional_id", nullable = false)
    private Profesional profesional;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "sillon_id", nullable = false)
    private Sillon sillon;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "prestacion_id", nullable = false)
    private Prestacion prestacion;

    @Column(nullable = false)
    private Instant inicio;

    @Column(nullable = false)
    private Instant fin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "text")
    private EstadoTurno estado;

    @Column(name = "motivo_cancelacion", columnDefinition = "text")
    private String motivoCancelacion;

    @Column(name = "cancelado_en")
    private Instant canceladoEn;

    @Column(columnDefinition = "text")
    private String observaciones;

    @Version
    @Column(nullable = false)
    private int version;

    protected Turno() {
    }

    public static Turno programar(Paciente paciente, Profesional profesional, Sillon sillon, Prestacion prestacion,
            Intervalo intervalo, String observaciones) {
        Turno turno = new Turno();
        turno.paciente = Objects.requireNonNull(paciente, "paciente");
        turno.profesional = Objects.requireNonNull(profesional, "profesional");
        turno.sillon = Objects.requireNonNull(sillon, "sillon");
        turno.prestacion = Objects.requireNonNull(prestacion, "prestacion");
        turno.inicio = intervalo.inicio();
        turno.fin = intervalo.fin();
        turno.estado = EstadoTurno.PROGRAMADO;
        turno.observaciones = observaciones;
        return turno;
    }

    public Intervalo intervalo() {
        return new Intervalo(inicio, fin);
    }

    /**
     * RN-ES-03: solo un turno PROGRAMADO cuyo inicio todavía no llegó cambia de horario.
     * El no solapamiento lo valida el servicio (y la base).
     */
    public void reprogramar(Intervalo nuevo, Instant ahora) {
        validarReprogramable(ahora);
        this.inicio = nuevo.inicio();
        this.fin = nuevo.fin();
    }

    /**
     * Valida la transición sin modificar el turno. El servicio la llama antes de buscar conflictos: si el
     * turno ya estuviera modificado, la consulta haría flush del cambio y la EXCLUDE saltaría dentro de ella.
     */
    public void validarReprogramable(Instant ahora) {
        if (estado != EstadoTurno.PROGRAMADO) {
            throw new TransicionInvalidaException("Solo se pueden reprogramar turnos programados.");
        }
        if (!inicio.isAfter(ahora)) {
            throw new TransicionInvalidaException("El turno ya empezó: no se puede reprogramar.");
        }
    }

    /**
     * RN-ES-02 y RN-CA: solo un turno PROGRAMADO cuyo inicio todavía no llegó se cancela. Queda CANCELADO_TARDIO
     * si falta menos que {@code limiteTardio} para el inicio; si no, CANCELADO. Conserva el intervalo: el horario
     * se libera porque los estados cancelados no cuentan para las EXCLUDE (RN-AG-10).
     */
    public void cancelar(String motivo, Instant ahora, Duration limiteTardio) {
        if (estado != EstadoTurno.PROGRAMADO) {
            throw new TransicionInvalidaException("Solo se pueden cancelar turnos programados.");
        }
        if (!inicio.isAfter(ahora)) {
            throw new TransicionInvalidaException("El turno ya empezó: no se puede cancelar.");
        }
        this.estado = ReglasAgenda.esCancelacionTardia(inicio, ahora, limiteTardio)
                ? EstadoTurno.CANCELADO_TARDIO
                : EstadoTurno.CANCELADO;
        this.canceladoEn = ahora;
        this.motivoCancelacion = normalizarMotivo(motivo);
    }

    public void registrarAsistencia(EstadoAsistencia estadoAsistencia, Instant ahora) {
        if (estado != EstadoTurno.PROGRAMADO) {
            throw new TransicionInvalidaException("Solo se puede registrar asistencia de turnos programados.");
        }
        if (ahora.isBefore(inicio)) {
            throw new TransicionInvalidaException("El turno todavía no empezó.");
        }
        this.estado = estadoAsistencia.aEstadoTurno();
    }

    private static String normalizarMotivo(String motivo) {
        if (motivo == null || motivo.isBlank()) {
            return null;
        }
        return motivo.strip();
    }

    public String getMotivoCancelacion() {
        return motivoCancelacion;
    }

    public Instant getCanceladoEn() {
        return canceladoEn;
    }

    public int getVersion() {
        return version;
    }

    public Long getId() {
        return id;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public Profesional getProfesional() {
        return profesional;
    }

    public Sillon getSillon() {
        return sillon;
    }

    public Prestacion getPrestacion() {
        return prestacion;
    }

    public Instant getInicio() {
        return inicio;
    }

    public Instant getFin() {
        return fin;
    }

    public EstadoTurno getEstado() {
        return estado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    @Override
    public String toString() {
        return "Turno[id=" + id + ", inicio=" + inicio + ", fin=" + fin + ", estado=" + estado + "]";
    }
}
