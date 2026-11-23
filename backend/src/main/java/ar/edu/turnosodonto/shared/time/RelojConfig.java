package ar.edu.turnosodonto.shared.time;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Reloj único del sistema. Toda regla que dependa de "ahora" (turnos en el pasado,
 * cancelación tardía, recordatorios) debe inyectar este {@link Clock} en lugar de llamar
 * a {@code now()} directamente, para que los tests puedan fijar la hora.
 */
@Configuration
public class RelojConfig {

    public static final ZoneId ZONA_CONSULTORIO = ZoneId.of("America/Argentina/Buenos_Aires");

    @Bean
    public Clock reloj() {
        return Clock.system(ZONA_CONSULTORIO);
    }
}
