# Tasks

> Requiere C-05 (`prestacion`) mergeado en `main` antes de empezar. Actualizar la rama desde `main` primero.

## 1. Dominio puro

- [x] 1.1 Crear `Intervalo`, `EstadoTurno` y `ReglasAgenda` en `agenda.dominio`; verificar con `IntervaloTest` y `ReglasAgendaTest` (solape parcial, total, contenido, igual, adyacente antes y después, pasado, duración 4/5/480/481)

## 2. Persistencia

- [x] 2.1 Escribir `V5__turnos.sql` (tabla, `CHECK`, dos `EXCLUDE` con `[)` y estados activos, índices de FK); verificar con `TurnoRestriccionesIT` que la base rechaza dos turnos superpuestos del mismo profesional y sillón y acepta adyacentes y cancelados
- [x] 2.2 Crear `Turno` y `TurnoRepository.buscarActivosQueSeSuperponen`; ajustar `PacienteIT` para borrar turnos antes que pacientes; verificar que los tests existentes siguen en verde

## 3. Servicio y API

- [x] 3.1 Agregar `propiedades()` a `NegocioException` y volcarlas en `GlobalExceptionHandler`; verificar con `GlobalExceptionHandlerTest` que una propiedad extra aparece en el Problem Details
- [x] 3.2 Crear excepciones (`TurnoSolapadoException`, `TurnoEnPasadoException`, `TurnoNoEncontradoException`, `PacienteInactivoParaTurnoException`, y las de prestación si C-05 no las trae) y `TurnoService.crear/obtener` con traducción de `23P01`; verificar que compila
- [x] 3.3 Crear `TurnoController` con `CrearTurnoRequest` y `TurnoResponse`; verificar con `TurnoIT` un test por escenario de la spec `turnos` (feliz, duración editada y fuera de rango, solape parcial y total, bordes adyacentes, cancelado, pasado, paciente y prestación inválidos, sin inicio, consulta, inexistente, sin token)
- [x] 3.4 Escribir `TurnoConcurrenciaIT` (dos POST simultáneos, 5 repeticiones); verificar exactamente una 201, una 409 y un solo turno por intervalo

## 4. Verificación integral

- [x] 4.1 Correr `./mvnw verify` completo y confirmar que pasan todos los tests y que cada escenario de la spec `turnos` tiene su test

## Workflow follow-up

- Archivar el change (`openspec archive crear-turno-sin-solapamientos`) y sincronizar specs.
- Marcar `[x]` en C-07 de `CHANGES.md` en el mismo PR.
- Abrir PR `martin/C-07-crear-turno-sin-solapamientos` → `main`.
- Guardar en Engram el resultado del ciclo OPSX (evidencia para la etapa 7 de la consigna).
