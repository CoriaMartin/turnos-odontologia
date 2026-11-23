package ar.edu.turnosodonto.auth.token;

/** Identidad del usuario extraída de un token válido. */
public record UsuarioAutenticado(Long id, String email) {
}
