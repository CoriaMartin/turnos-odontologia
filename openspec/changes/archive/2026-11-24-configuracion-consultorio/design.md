## Context

C-03 estableció la configuración única del consultorio.
C-12 expone su consulta y actualización mediante una API protegida.
Depende de C-04 para la autenticación.

## Goals / Non-Goals

**Goals:**

- Consultar los parámetros vigentes.
- Actualizar las horas de cancelación tardía y recordatorio.
- Rechazar valores inválidos sin alterar la configuración.
- Preservar los turnos existentes.

**Non-Goals:**

- Modificar la zona horaria.
- Crear configuraciones adicionales.
- Implementar el envío de emails.
- Implementar la interfaz gráfica.

## Decisions

1. Reutilizar la fila única de configuración con id = 1.
2. Usar ConfiguracionController, ConfiguracionService y
   ConfiguracionRepository.
3. Validar los campos obligatorios mediante NotNull y Min.
4. Exigir cancelación mayor o igual a cero y recordatorio
   mayor o igual a uno.
5. Actualizar la configuración dentro de una transacción.
6. Devolver ambos parámetros y la zona horaria en la respuesta.
7. No modificar registros de turnos al actualizar la configuración.
   Los nuevos parámetros se aplican a operaciones futuras.

## Risks / Trade-offs

- Una solicitud inválida debe conservar los valores anteriores.
- La actualización no debe alterar estados ni horarios existentes.
- La aplicación efectiva de recordatorios se verifica en C-13.
