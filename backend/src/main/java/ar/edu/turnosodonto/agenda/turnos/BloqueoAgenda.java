package ar.edu.turnosodonto.agenda.turnos;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Serializa las altas que compiten por el mismo profesional o sillón con bloqueos de PostgreSQL
 * a nivel transacción ({@code pg_advisory_xact_lock}), que se liberan solos al confirmar o revertir.
 *
 * <p>Sin esto, dos INSERT simultáneos pueden quedar esperándose mutuamente en las dos restricciones
 * EXCLUDE (profesional y sillón) y PostgreSQL resuelve el deadlock abortando a uno con un error que no
 * es de solapamiento. Tomando siempre los bloqueos en el mismo orden (profesional, luego sillón) la
 * segunda solicitud espera, ve el turno ya confirmado y responde TURNO_SOLAPADO. Ajuste de apply de C-07.
 */
@Component
class BloqueoAgenda {

    private static final int CLASE_PROFESIONAL = 1;
    private static final int CLASE_SILLON = 2;

    private final JdbcTemplate jdbc;

    BloqueoAgenda(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Debe llamarse dentro de la transacción del alta, antes de buscar conflictos. */
    void bloquear(Long profesionalId, Long sillonId) {
        tomar(CLASE_PROFESIONAL, profesionalId);
        tomar(CLASE_SILLON, sillonId);
    }

    private void tomar(int clase, Long id) {
        jdbc.query("select pg_advisory_xact_lock(?, ?)", rs -> null, clase, Math.toIntExact(id));
    }
}
