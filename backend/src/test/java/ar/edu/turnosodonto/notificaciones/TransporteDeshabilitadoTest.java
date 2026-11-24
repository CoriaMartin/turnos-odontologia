package ar.edu.turnosodonto.notificaciones;

import java.time.Clock;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.jdbc.core.JdbcTemplate;
import ar.edu.turnosodonto.agenda.turnos.TurnoRepository;
import ar.edu.turnosodonto.configuracion.ConfiguracionService;
import static org.mockito.Mockito.*;

class TransporteDeshabilitadoTest {

    @Mock EnviadorEmail enviador;
    @Mock JdbcTemplate jdbc;
    @Mock TurnoRepository turnos;
    @Mock NotificacionRepository notificaciones;
    @Mock ConfiguracionService configuracion;
    @Mock PlantillaRecordatorio plantilla;
    @Mock Clock reloj;

    @InjectMocks RecordatoriosScheduler scheduler;
    @InjectMocks ProcesadorRecordatorio procesador;

    @Test
    void deshabilitadoNoProcesaNiRegistra() throws Exception {
        try (var mocks = MockitoAnnotations.openMocks(this)) {
            when(enviador.habilitado()).thenReturn(false);

            scheduler.ejecutar();
            procesador.procesar(1L);

            verifyNoInteractions(jdbc, turnos, notificaciones,
                    configuracion, plantilla, reloj);

            verify(enviador, never()).enviar(any());
        }
    }
}