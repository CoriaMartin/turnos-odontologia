package ar.edu.turnosodonto.configuracion;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import ar.edu.turnosodonto.shared.persistence.EntidadAuditada;

/** Parámetros del consultorio. Fila única con id 1, creada por la migración V2. */
@Entity
@Table(name = "configuracion")
public class Configuracion extends EntidadAuditada {

    public static final short ID_UNICO = 1;

    @Id
    private Short id;

    @Column(name = "horas_cancelacion_tardia", nullable = false)
    private int horasCancelacionTardia;

    @Column(name = "horas_anticipacion_recordatorio", nullable = false)
    private int horasAnticipacionRecordatorio;

    @Column(name = "zona_horaria", nullable = false, columnDefinition = "text")
    private String zonaHoraria;

    protected Configuracion() {
    }

    /**
     * Cambia las ventanas de cancelación tardía y de recordatorio. Si algún valor es inválido
     * no modifica nada.
     */
    public void actualizar(int horasCancelacionTardia, int horasAnticipacionRecordatorio) {
        if (horasCancelacionTardia < 0) {
            throw new ConfiguracionInvalidaException("Las horas de cancelación tardía no pueden ser negativas.");
        }
        if (horasAnticipacionRecordatorio <= 0) {
            throw new ConfiguracionInvalidaException("Las horas de anticipación del recordatorio deben ser mayores a 0.");
        }
        this.horasCancelacionTardia = horasCancelacionTardia;
        this.horasAnticipacionRecordatorio = horasAnticipacionRecordatorio;
    }

    public Short getId() {
        return id;
    }

    public int getHorasCancelacionTardia() {
        return horasCancelacionTardia;
    }

    public int getHorasAnticipacionRecordatorio() {
        return horasAnticipacionRecordatorio;
    }

    public String getZonaHoraria() {
        return zonaHoraria;
    }
}
