# Tasks

## 1. Base de datos

- [x] 1.1 Escribir `V4__pacientes.sql` (extensión `unaccent`, tabla `paciente` con `CHECK` de DNI y textos, `UNIQUE` de DNI, índice de listado) y habilitar `spring.flyway.out-of-order`; verificar con `PacienteRepositoryIT` que la base rechaza un DNI inválido y uno repetido
- [x] 1.2 Crear `Paciente` y `PacienteRepository` con la búsqueda nativa paginada; verificar con `PacienteRepositoryIT` que encuentra "Gómez" buscando `gomez` y no devuelve inactivos

## 2. Servicio y API

- [x] 2.1 Crear las excepciones, `PacienteService` y `PaginaResponse`; verificar que compila
- [x] 2.2 Crear `PacienteController` con `PacienteRequest`/`PacienteResponse` validados; verificar con `PacienteIT` los escenarios de alta, DNI válido, DNI único, datos obligatorios y formato
- [x] 2.3 Verificar con `PacienteIT` los escenarios de búsqueda (sin tildes, por DNI, inactivos, paginación, tamaño excesivo), consulta por id, edición, baja lógica, acceso sin token y logs sin datos personales

## 3. Seed de desarrollo

- [x] 3.1 Crear `PacientesDeEjemplo` con `@Profile("dev")`; verificar con un test que no se ejecuta en el perfil `test` y documentar en el README cómo activarlo

## 4. Verificación integral

- [x] 4.1 Correr `./mvnw verify` completo y confirmar que pasan los tests de C-01, C-03, C-04 y C-06 y que cada escenario de la spec tiene su test

## Workflow follow-up

- Archivar el change (`openspec archive pacientes-gestion`) y sincronizar specs.
- Marcar `[x]` en C-06 de `CHANGES.md` en el mismo PR.
- Abrir PR `martin/C-06-pacientes-gestion` → `main`.
