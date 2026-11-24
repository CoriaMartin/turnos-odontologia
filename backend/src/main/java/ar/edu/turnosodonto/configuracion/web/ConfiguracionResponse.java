package ar.edu.turnosodonto.configuracion.web;

import ar.edu.turnosodonto.configuracion.Configuracion;

public record ConfiguracionResponse(
        int horasCancelacionTardia,
        int horasAnticipacionRecordatorio,
        String zonaHoraria
) {

    public static ConfiguracionResponse de(Configuracion configuracion) {
        return new ConfiguracionResponse(
                configuracion.getHorasCancelacionTardia(),
                configuracion.getHorasAnticipacionRecordatorio(),
                configuracion.getZonaHoraria()
        );
    }
}