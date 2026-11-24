package ar.edu.turnosodonto.configuracion.web;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ConfiguracionRequest(

        @NotNull
        @Min(0)
        Integer horasCancelacionTardia,

        @NotNull
        @Min(1)
        Integer horasAnticipacionRecordatorio

) {
}