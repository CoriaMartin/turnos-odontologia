## Why

C-05 quedó archivado con la spec vigente y un comportamiento de producción correcto, pero tres escenarios ya exigidos por esa spec no tienen evidencia ejecutable: el nombre duplicado de una prestación inactiva, el recorte de espacios al editar y el acceso sin token a `GET /api/prestaciones/{id}`. Explicitarlos cierra la trazabilidad de "un test por escenario" sin modificar código que ya funciona.

## What Changes

- Agregar tres tests de integración en `PrestacionIT`: alta con el nombre de una prestación desactivada → 409 `NOMBRE_DUPLICADO`; edición con `"  Nombre  "` → nombre guardado y devuelto recortado; `GET /api/prestaciones/{id}` sin token → 401 `NO_AUTENTICADO`.
- Explicitar tres escenarios Given/When/Then en los requisitos vigentes `Nombre único`, `Edición de prestación` y `Acceso autenticado`, reutilizando su texto normativo sin duplicar requisitos ni alterar su semántica.
- No cambia código de producción, migraciones, DTOs, reglas de seguridad ni configuración. No se agrega `DELETE`, paginación ni búsqueda; RN-PR-01 y RN-PR-02 se mantienen intactas.
- Sin cambios rupturistas: la API expuesta y las respuestas son idénticas.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `prestaciones`: se explicitan tres escenarios ya implicados por los requisitos `Nombre único`, `Edición de prestación` y `Acceso autenticado`. El comportamiento observable no cambia; solo se hace ejecutable y verificable lo que la spec ya exige.

## Impact

- Tests: `backend/src/test/java/ar/edu/turnosodonto/prestaciones/PrestacionIT.java` (tres métodos nuevos, con nombres "Ficticia", limpieza por id y sin borrar el seed).
- Specs: delta en `openspec/changes/c05-cobertura-prestaciones/specs/prestaciones/spec.md`; la sincronización con `openspec/specs/prestaciones/spec.md` se hará al archivar este change, no en esta propuesta.
- Sin cambios en `backend/src/main`, en `V3__prestaciones.sql`, en `CHANGES.md`, en changes archivados ni en `main`.
- Verificación prevista: `./mvnw verify` contra la base local `turnos_test`, sin SMTP real ni Testcontainers.
