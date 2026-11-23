package ar.edu.turnosodonto.pacientes.web;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import ar.edu.turnosodonto.pacientes.DatosPaciente;

/** Alta y edición de paciente (RN-PA-01, RN-PA-02). */
public record PacienteRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 100) String apellido,
        @NotBlank @Pattern(regexp = "^\\s*[0-9]{7,8}\\s*$", message = "debe tener 7 u 8 dígitos, sin puntos ni letras")
        String dni,
        LocalDate fechaNacimiento,
        @Size(max = 30) String telefono,
        @Email @Size(max = 254) String email,
        @Size(max = 100) String obraSocial,
        @Size(max = 50) String numeroAfiliado,
        Boolean aceptaRecordatorios) {

    public DatosPaciente aDatos() {
        return DatosPaciente.normalizados(nombre, apellido, dni, fechaNacimiento, telefono, email,
                obraSocial, numeroAfiliado, aceptaRecordatorios);
    }

    /** Sin DNI, email ni teléfono (RN-DS-03). */
    @Override
    public String toString() {
        return "PacienteRequest[nombre=" + nombre + ", apellido=" + apellido + "]";
    }
}
