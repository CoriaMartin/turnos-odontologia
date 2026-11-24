package ar.edu.turnosodonto.notificaciones;

import java.time.Instant;
import java.util.Objects;
import jakarta.persistence.*;
import ar.edu.turnosodonto.agenda.turnos.Turno;
import ar.edu.turnosodonto.shared.persistence.EntidadAuditada;

@Entity
@Table(name = "notificacion")
public class Notificacion extends EntidadAuditada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "turno_id", nullable = false)
    private Turno turno;
    @Column(nullable = false, columnDefinition = "text")
    private String canal = "EMAIL";
    @Column(nullable = false, columnDefinition = "text")
    private String tipo = "RECORDATORIO";
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "text")
    private EstadoNotificacion estado;
    @Column(nullable = false)
    private int intentos;
    @Column(nullable = false, columnDefinition = "text")
    private String destinatario;
    @Column(name = "enviada_en")
    private Instant enviadaEn;
    @Column(columnDefinition = "text")
    private String error;

    protected Notificacion() {}

    public Notificacion(Turno turno) {
        this.turno = Objects.requireNonNull(turno);
    }

    public boolean puedeIntentar() {
        return estado != EstadoNotificacion.ENVIADA && intentos < 3;
    }

    public void registrarResultado(String destinatario, Instant enviadaEn) {
        if (!puedeIntentar()) {
            throw new IllegalStateException("Recordatorio sin intentos disponibles");
        }
        if (destinatario == null || destinatario.isBlank() || destinatario.length() > 254) {
            throw new IllegalArgumentException("Destinatario invalido");
        }
        this.destinatario = destinatario;
        this.intentos++;
        this.enviadaEn = enviadaEn;
        this.estado = enviadaEn == null ? EstadoNotificacion.FALLIDA : EstadoNotificacion.ENVIADA;
        this.error = enviadaEn == null ? "Fallo de transporte de email" : null;
    }

    public Long getId() { return id; }
    public Turno getTurno() { return turno; }
    public String getCanal() { return canal; }
    public String getTipo() { return tipo; }
    public EstadoNotificacion getEstado() { return estado; }
    public int getIntentos() { return intentos; }
    public String getDestinatario() { return destinatario; }
    public Instant getEnviadaEn() { return enviadaEn; }
    public String getError() { return error; }
}
