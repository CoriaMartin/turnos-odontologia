package ar.edu.turnosodonto.agenda.recursos;

import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import ar.edu.turnosodonto.auth.Usuario;
import ar.edu.turnosodonto.shared.persistence.EntidadAuditada;

/** Profesional que atiende los turnos. Uno por usuario. */
@Entity
@Table(name = "profesional")
public class Profesional extends EntidadAuditada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(nullable = false, columnDefinition = "text")
    private String nombre;

    @Column(nullable = false, columnDefinition = "text")
    private String apellido;

    @Column(columnDefinition = "text")
    private String matricula;

    protected Profesional() {
    }

    public Profesional(Usuario usuario, String nombre, String apellido, String matricula) {
        this.usuario = Objects.requireNonNull(usuario, "usuario");
        this.nombre = Objects.requireNonNull(nombre, "nombre");
        this.apellido = Objects.requireNonNull(apellido, "apellido");
        this.matricula = matricula;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public String getMatricula() {
        return matricula;
    }
}
