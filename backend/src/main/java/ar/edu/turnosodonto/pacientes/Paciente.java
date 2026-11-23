package ar.edu.turnosodonto.pacientes;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import ar.edu.turnosodonto.shared.persistence.EntidadAuditada;

/** Paciente del consultorio. La baja es lógica (RN-PA-03). */
@Entity
@Table(name = "paciente")
public class Paciente extends EntidadAuditada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "text")
    private String nombre;

    @Column(nullable = false, columnDefinition = "text")
    private String apellido;

    @Column(nullable = false, columnDefinition = "text")
    private String dni;

    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;

    @Column(columnDefinition = "text")
    private String telefono;

    @Column(columnDefinition = "text")
    private String email;

    @Column(name = "obra_social", columnDefinition = "text")
    private String obraSocial;

    @Column(name = "numero_afiliado", columnDefinition = "text")
    private String numeroAfiliado;

    @Column(name = "acepta_recordatorios", nullable = false)
    private boolean aceptaRecordatorios;

    @Column(nullable = false)
    private boolean activo = true;

    protected Paciente() {
    }

    public static Paciente nuevo(DatosPaciente datos) {
        Paciente paciente = new Paciente();
        paciente.aplicar(datos);
        return paciente;
    }

    public void actualizar(DatosPaciente datos) {
        aplicar(datos);
    }

    public void darDeBaja() {
        this.activo = false;
    }

    private void aplicar(DatosPaciente datos) {
        this.nombre = datos.nombre();
        this.apellido = datos.apellido();
        this.dni = datos.dni();
        this.fechaNacimiento = datos.fechaNacimiento();
        this.telefono = datos.telefono();
        this.email = datos.email();
        this.obraSocial = datos.obraSocial();
        this.numeroAfiliado = datos.numeroAfiliado();
        this.aceptaRecordatorios = datos.aceptaRecordatorios();
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public String getDni() {
        return dni;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getEmail() {
        return email;
    }

    public String getObraSocial() {
        return obraSocial;
    }

    public String getNumeroAfiliado() {
        return numeroAfiliado;
    }

    public boolean isAceptaRecordatorios() {
        return aceptaRecordatorios;
    }

    public boolean isActivo() {
        return activo;
    }

    /** Sin DNI, email ni teléfono (RN-DS-03). */
    @Override
    public String toString() {
        return "Paciente[id=" + id + ", activo=" + activo + "]";
    }
}
