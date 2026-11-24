package ar.edu.turnosodonto.prestaciones;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import ar.edu.turnosodonto.shared.persistence.EntidadAuditada;

@Entity
@Table(name = "prestacion")
public class Prestacion extends EntidadAuditada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "text")
    private String nombre;

    @Column(name = "duracion_minutos", nullable = false)
    private int duracionMinutos;

    @Column(nullable = false)
    private boolean activa = true;

    protected Prestacion() {
    }

    public static Prestacion nuevo(DatosPrestacion datos) {
        Prestacion prestacion = new Prestacion();
        prestacion.actualizar(datos);
        return prestacion;
    }

    public void actualizar(DatosPrestacion datos) {
        this.nombre = datos.nombre();
        this.duracionMinutos = datos.duracionMinutos();
    }

    public void activar() {
        this.activa = true;
    }

    public void desactivar() {
        this.activa = false;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public int getDuracionMinutos() {
        return duracionMinutos;
    }

    public boolean isActiva() {
        return activa;
    }

    @Override
    public String toString() {
        return "Prestacion[id=" + id + ", activa=" + activa + "]";
    }
}
