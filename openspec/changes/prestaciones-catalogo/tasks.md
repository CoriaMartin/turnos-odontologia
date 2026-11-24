# Tasks

## 1. Base de datos

- [ ] 1.1 Escribir `V3__prestaciones.sql` (tabla `prestacion` con textos y `CHECK (length(nombre) <= 100)`, `CHECK (duracion_minutos BETWEEN 5 AND 480)`, `CREATE UNIQUE INDEX prestacion_nombre_lower_uk ON prestacion (lower(nombre))`, `activa`, auditoría y seed de 5 prestaciones); verificar con `PrestacionRepositoryIT` que la base rechaza duraciones 4 y 481, un nombre repetido y su variante con distinta capitalización
- [ ] 1.2 Crear `Prestacion` (extiende `EntidadAuditada`) y `PrestacionRepository` con listado ordenado por nombre y consultas de existencia; verificar con `PrestacionRepositoryIT` el esquema y las restricciones usando registros creados por el propio test, sin asumir una cantidad exacta de filas del seed

## 2. Servicio y API

- [ ] 2.1 Crear `PrestacionNoEncontradoException` (404 `PRESTACION_NO_ENCONTRADA`), `NombreDuplicadoException` (409 `NOMBRE_DUPLICADO`) y `PrestacionService` con `DatosPrestacion.normalizados(...)`, búsquedas `existsByNombreIgnoreCase`/`existsByNombreIgnoreCaseAndIdNot` y traducción de la violación de `prestacion_nombre_lower_uk`; verificar que compila
- [ ] 2.2 Crear `PrestacionController` con `PrestacionRequest`/`PrestacionResponse` validados; verificar con `PrestacionIT` los escenarios de alta, recorte de nombre, falta del campo `nombre`, nombre de 101 caracteres, duración 4/481, falta del campo `duracionMinutos` y duraciones 5/480
- [ ] 2.3 Verificar con `PrestacionIT` los escenarios de nombre único en alta y edición, incluida la variante de mayúsculas/minúsculas, listado con inactivas, catálogo vacío, consulta por id inexistente, edición válida, edición de inactiva, desactivación sin borrar, idempotencia, reactivación, y acceso sin token en GET, POST, PUT y PATCH

## 3. Verificación integral

- [ ] 3.1 Correr `./mvnw verify` completo y confirmar que pasan los tests de C-01, C-03, C-04, C-06 y C-05, y que cada escenario de la spec tiene su test
- [ ] 3.2 Dejar registrado en el change que el escenario ejecutable de RN-PR-02 ("cambiar la duración no modifica turnos existentes") se traslada a C-07, cuando exista la tabla `turno`; en C-05 queda como invariante de diseño documentada en `design.md`
- [ ] 3.3 Confirmar que ningún test borra el seed de forma permanente: cada test limpia solo sus propios ids y el escenario "Catálogo vacío" usa `@Transactional` con rollback

## Workflow follow-up

- Archivar el change (`openspec archive prestaciones-catalogo`) y sincronizar specs.
- Marcar `[x]` en C-05 de `CHANGES.md` en el mismo PR.
- Abrir PR `zaira/C-05-prestaciones-catalogo` → `main`.
