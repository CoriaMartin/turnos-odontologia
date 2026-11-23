# Tasks

## 1. Migración y convención de tipos

- [x] 1.1 Escribir `V2__core.sql` (usuario, profesional, sillon, configuracion con `text` + `CHECK`, índice único `lower(email)`, FK, auditoría y seed de "Sillón 1" y configuración id 1); verificar que `./mvnw verify` aplica V1 y V2 sobre `turnos_test`
- [x] 1.2 Actualizar `knowledge-base/04_modelo_de_datos.md` con la convención `text` + `CHECK` y los tipos de estas cuatro tablas; verificar que no quedan `varchar` en esas secciones

## 2. Auditoría y entidades

- [x] 2.1 Crear `EntidadAuditada` y `AuditoriaConfig` (`@EnableJpaAuditing` con `DateTimeProvider` basado en el `Clock`); verificar con un test que `creado_en` toma la hora del reloj fijo
- [x] 2.2 Crear `Usuario` + `Rol` y `UsuarioRepository`; verificar con tests los escenarios de la spec `usuarios` (email repetido con otra capitalización, rol desconocido, sin email, activo por defecto)
- [x] 2.3 Crear `Profesional`, `Sillon` y sus repositorios; verificar con tests el sillón inicial, el sillón duplicado y el segundo profesional para el mismo usuario
- [x] 2.4 Crear `Configuracion`, `ConfiguracionRepository` y `ConfiguracionService.obtener()`; verificar con tests los escenarios de `configuracion-consultorio` (valores por defecto, segunda configuración, cancelación -1, recordatorio 0, cancelación 0)

## 3. Recursos del consultorio

- [x] 3.1 Crear `RecursosConsultorio` y `ConsultorioNoConfiguradoException` (`CONSULTORIO_NO_CONFIGURADO`, 503); verificar con tests los tres escenarios de `Recursos únicos del consultorio`

## 4. Verificación integral

- [x] 4.1 Correr `./mvnw verify` completo y confirmar que pasan los tests de C-01 y C-03 y que cada escenario de las tres specs tiene su test

## Workflow follow-up

- Archivar el change (`openspec archive core-models`) y sincronizar specs.
- Marcar `[x]` en C-03 de `CHANGES.md` en el mismo PR.
- Abrir PR `martin/C-03-core-models` → `main`.
