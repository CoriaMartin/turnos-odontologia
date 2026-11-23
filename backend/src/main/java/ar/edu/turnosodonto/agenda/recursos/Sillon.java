package ar.edu.turnosodonto.agenda.recursos;

import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import ar.edu.turnosodonto.shared.persistence.EntidadAuditada;

/** Sillón o box que ocupa un turno (RN-AG-02). */
@Entity
@Table(name = "sillon")
public class Sillon extends EntidadAuditada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "text")
    private String nombre;

    @Column(nullable = false)
    private boolean activo = true;

    protected Sillon() {
    }

    public Sillon(String nombre) {
        this.nombre = Objects.requireNonNull(nombre, "nombre");
    }

    public void desactivar() {
        this.activo = false;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public boolean isActivo() {
        return activo;
    }
}
