package ar.edu.turnosodonto.notificaciones;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@ConditionalOnProperty(name = "MAIL_ENABLED", havingValue = "true")
public class RecordatoriosSchedulingConfig {
}
