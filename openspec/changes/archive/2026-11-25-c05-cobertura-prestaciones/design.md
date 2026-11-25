## Context

C-05 está archivado y `openspec/specs/prestaciones/spec.md` ya exige los tres comportamientos investigados. El código los implementa: `DatosPrestacion.normalizados` recorta el nombre, el servicio consulta duplicados sin filtrar por `activa` y el índice `prestacion_nombre_lower_uk` tampoco distingue estado, y `SecurityConfig` exige el rol `ODONTOLOGO` para todo `/api/**`. La única ausencia es evidencia ejecutable y su explicitación como escenarios. Ver `proposal.md` para la motivación y el delta `specs/prestaciones/spec.md` para los escenarios.

## Goals / Non-Goals

**Goals:**
- Dar un test por cada escenario nuevo y dejar trazabilidad directa scenario → método de test.
- Mantener el texto normativo de los requisitos existentes literal; agregar solo escenarios.
- Proteger el seed compartido de `turnos_test` y el perfil de entrega.

**Non-Goals:**
- Modificar producción: controlador, servicio, entidad, DTOs, migración V3 ni configuración de seguridad.
- Resolver la ambigüedad del límite de 100 caracteres antes/después del `trim`: no está entre los tres escenarios aprobados.
- Sincronizar specs, archivar, actualizar `CHANGES.md` ni abrir PR en este change.

## Decisions

- **D1 — Change de pruebas, no de código.** No hay defecto observado: las tres sospechas se verificaron por lectura de código y spec. Alternativa descartada: cambiar el servicio o la seguridad, lo que alteraría un comportamiento ya correcto.
- **D2 — Extender `PrestacionIT` en lugar de crear otra clase.** Reutiliza `preparar()` (login real y token), `ejecutar()`, `alta()`, `crear()`, `patchActiva()`, `json()` y el `idDe()`; evita duplicar andamiaje de `@SpringBootTest` + MockMvc con perfil `test`.
- **D3 — Delta con `MODIFIED Requirements` y bloques completos.** Se copia cada requisito vigente tal cual y se agrega un escenario. Alternativa descartada: `ADDED Requirements` con requisitos nuevos, que duplicaría normas ya existentes. Al archivar, el reemplazo conserva la semántica y agrega solo el escenario.
- **D4 — Aislamiento de datos.** Los nombres llevan sufijo `Ficticia`; cada alta registra su id en `idsCreados` y `@AfterEach` borra solo esos ids. Nunca `delete from prestacion` global: el seed de V3 lo consumen C-07 y C-15. Sin SMTP real.
- **D5 — Trazabilidad de los tres tests.**

| Escenario del delta | Test en `PrestacionIT` | Aserción clave |
|---|---|---|
| Alta con nombre de prestación desactivada | `altaConNombreDePrestacionDesactivada` | mismo nombre exacto; solo cambia `activa`; 409 y `$.codigo == NOMBRE_DUPLICADO` |
| Edición con nombre con espacios | `edicionConNombreConEspacios` | 200, `$.nombre` recortado y `GET /{id}` coherente |
| Sin token al consultar por id | `sinTokenAlObtener` | id de una prestación creada por el test, sin seed; 401 y `$.codigo == NO_AUTENTICADO` |

- **D6 — Verificación.** `./mvnw verify` contra PostgreSQL local `turnos_test` (sin H2 ni Testcontainers), respetando la regla de un test por escenario de la spec.

## Risks / Trade-offs

- [Un test limpie el catálogo compartido] → limpieza exclusiva por ids creados; el sufijo "Ficticia" evita colisiones con el seed.
- [El reemplazo de `MODIFIED` pierda detalle al sincronizar] → los bloques se copiaron literalmente de la spec vigente; revisar el diff en el momento del sync (fuera de este change).
- [GET sin token devuelva un código distinto al esperado] → el test fija el contrato 401 `NO_AUTENTICADO` ya documentado en C-04; si fallara, se trataría como regresión en un change separado, no como arreglo silencioso aquí.
- [La resolución del límite de 100 caracteres cambie la semántica] → queda explícitamente fuera de alcance; cualquier decisión requiere un change propio.

## Migration Plan

Sin migraciones ni cambio de esquema. Al archivar este change, OpenSpec sincronizará el delta con `openspec/specs/prestaciones/spec.md`. Rollback: revertir los commits del change; no hay datos ni infraestructura que restaurar.
