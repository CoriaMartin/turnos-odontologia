package ar.edu.turnosodonto.auth.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({SeguridadProperties.class, AdminProperties.class})
public class PropiedadesAuthConfig {
}
