export type CampoHoras = 'cancelacionTardia' | 'recordatorio';
export type HorasFormulario = Record<CampoHoras, string>;
export type ErroresHoras = Partial<Record<CampoHoras, string>>;

export const VALOR_POR_DEFECTO: HorasFormulario = {
  cancelacionTardia: '24',
  recordatorio: '24',
};

export const CAMPOS: readonly CampoHoras[] = ['cancelacionTardia', 'recordatorio'];

export function aFormulario(valores: {
  horasCancelacionTardia: number;
  horasAnticipacionRecordatorio: number;
}): HorasFormulario {
  return {
    cancelacionTardia: String(valores.horasCancelacionTardia),
    recordatorio: String(valores.horasAnticipacionRecordatorio),
  };
}

export function validarHoras(formulario: HorasFormulario): ErroresHoras {
  const errores: ErroresHoras = {};
  for (const campo of CAMPOS) {
    const texto = formulario[campo].trim();
    if (texto === '') {
      errores[campo] = 'Ingresá la cantidad de horas.';
    } else if (!/^-?\d+$/.test(texto)) {
      errores[campo] = 'Debe ser un número entero.';
    } else if (campo === 'cancelacionTardia' && Number(texto) < 0) {
      errores[campo] = 'Debe ser ≥ 0';
    } else if (campo === 'recordatorio' && Number(texto) <= 0) {
      errores[campo] = 'Debe ser > 0';
    }
  }
  return errores;
}

export function aHorasConfiguracion(formulario: HorasFormulario) {
  return {
    horasCancelacionTardia: Number(formulario.cancelacionTardia),
    horasAnticipacionRecordatorio: Number(formulario.recordatorio),
  };
}
