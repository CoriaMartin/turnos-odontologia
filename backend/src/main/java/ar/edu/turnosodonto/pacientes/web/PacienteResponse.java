package ar.edu.turnosodonto.pacientes.web;

import java.time.LocalDate;

import ar.edu.turnosodonto.pacientes.Paciente;

public record PacienteResponse(
        Long id,
        String nombre,
        String apellido,
        String dni,
        LocalDate fechaNacimiento,
        String telefono,
        String email,
        String obraSocial,
        String numeroAfiliado,
        boolean aceptaRecordatorios,
        boolean activo) {

    public static PacienteResponse de(Paciente p) {
        return new PacienteResponse(p.getId(), p.getNombre(), p.getApellido(), p.getDni(), p.getFechaNacimiento(),
                p.getTelefono(), p.getEmail(), p.getObraSocial(), p.getNumeroAfiliado(),
                p.isAceptaRecordatorios(), p.isActivo());
    }

    /** Sin DNI, email ni teléfono (RN-DS-03). */
    @Override
    public String toString() {
        return "PacienteResponse[id=" + id + "]";
    }
}
