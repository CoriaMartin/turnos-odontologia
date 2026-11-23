package ar.edu.turnosodonto.pacientes;

import java.time.LocalDate;
import java.util.Locale;

/**
 * Datos editables de un paciente, ya normalizados: textos sin espacios sobrantes, opcionales
 * vacíos como {@code null} y email en minúsculas.
 */
public record DatosPaciente(
        String nombre,
        String apellido,
        String dni,
        LocalDate fechaNacimiento,
        String telefono,
        String email,
        String obraSocial,
        String numeroAfiliado,
        boolean aceptaRecordatorios) {

    public static DatosPaciente normalizados(String nombre, String apellido, String dni, LocalDate fechaNacimiento,
            String telefono, String email, String obraSocial, String numeroAfiliado, Boolean aceptaRecordatorios) {
        String emailNormalizado = opcional(email);
        return new DatosPaciente(
                nombre.trim(),
                apellido.trim(),
                dni.trim(),
                fechaNacimiento,
                opcional(telefono),
                emailNormalizado == null ? null : emailNormalizado.toLowerCase(Locale.ROOT),
                opcional(obraSocial),
                opcional(numeroAfiliado),
                Boolean.TRUE.equals(aceptaRecordatorios));
    }

    private static String opcional(String valor) {
        if (valor == null) {
            return null;
        }
        String recortado = valor.trim();
        return recortado.isEmpty() ? null : recortado;
    }

    /** Sin DNI, email ni teléfono (RN-DS-03). */
    @Override
    public String toString() {
        return "DatosPaciente[nombre=" + nombre + ", apellido=" + apellido + "]";
    }
}
