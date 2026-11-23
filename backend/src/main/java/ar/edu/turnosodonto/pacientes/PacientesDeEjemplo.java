package ar.edu.turnosodonto.pacientes;

import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Pacientes FICTICIOS para desarrollo y demo. Solo con el perfil {@code dev} y solo si no hay pacientes.
 * DNIs con ceros a la izquierda, que no se asignan en Argentina (RN-DS-01).
 */
@Component
@Profile("dev")
public class PacientesDeEjemplo implements ApplicationRunner {

    private final PacienteRepository pacientes;

    public PacientesDeEjemplo(PacienteRepository pacientes) {
        this.pacientes = pacientes;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (pacientes.count() > 0) {
            return;
        }
        List<String> sufijos = List.of("Uno", "Dos", "Tres", "Cuatro", "Cinco");
        for (int i = 0; i < sufijos.size(); i++) {
            String sufijo = sufijos.get(i);
            pacientes.save(Paciente.nuevo(DatosPaciente.normalizados(
                    "Paciente", "Ficticio " + sufijo, "0000000" + (i + 1), null, null,
                    "paciente." + sufijo.toLowerCase() + "@example.com", "Obra social de ejemplo", null, i % 2 == 0)));
        }
    }
}
