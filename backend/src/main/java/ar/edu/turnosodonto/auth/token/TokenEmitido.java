package ar.edu.turnosodonto.auth.token;

import java.time.Instant;

/** Token firmado y su vencimiento. */
public record TokenEmitido(String token, Instant expiraEn) {
}
