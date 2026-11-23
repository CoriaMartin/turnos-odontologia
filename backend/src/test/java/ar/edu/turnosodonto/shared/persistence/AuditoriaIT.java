package ar.edu.turnosodonto.shared.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import ar.edu.turnosodonto.agenda.recursos.Sillon;
import ar.edu.turnosodonto.agenda.recursos.SillonRepository;

/** Las fechas de auditoría salen del reloj inyectable (tarea 2.1). */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@Import({AuditoriaConfig.class, AuditoriaIT.RelojFijo.class})
class AuditoriaIT {

    static final Instant AHORA = Instant.parse("2026-03-10T13:00:00Z");

    @TestConfiguration
    static class RelojFijo {
        @Bean
        Clock reloj() {
            return Clock.fixed(AHORA, ZoneOffset.UTC);
        }
    }

    @Autowired
    private SillonRepository sillones;

    @Test
    void creadoYActualizadoTomanLaHoraDelReloj() {
        Sillon sillon = sillones.saveAndFlush(new Sillon("Sillón de prueba"));

        assertThat(sillon.getCreadoEn()).isEqualTo(AHORA);
        assertThat(sillon.getActualizadoEn()).isEqualTo(AHORA);
    }
}
