# Explore — C-07 `crear-turno-sin-solapamientos`

Fecha: 2026-11-23 · Responsable: Martín (líder) · Fase OPSX: explore (relevamiento previo a proponer).

## Problema

El odontólogo independiente arma su agenda a mano y eso produce turnos superpuestos ([discovery §1](../../../discovery/discovery.md)). La regla central del producto es que **un turno no puede superponerse con otro del mismo profesional ni del mismo sillón** (RN-AG-01/02), incluso si dos operaciones llegan al mismo tiempo. El informe competitivo no encontró ningún sistema que demuestre públicamente cómo evita la doble reserva concurrente ([informe §C.3](../../../discovery/informe-competitivo.md)): es nuestro diferencial verificable ([DD-03](../../../knowledge-base/09_decisiones_y_supuestos.md)).

## Estado del código (relevado en `main` @ 730722e)

| Pieza | Estado | Dónde |
|---|---|---|
| `btree_gist` habilitado | ✅ listo (C-01) | `V1__extensiones.sql` |
| Profesional y sillón únicos | ✅ listo (C-03) | `agenda/recursos/RecursosConsultorio` |
| Usuario inicial y profesional | ✅ listo (C-04) | `auth/UsuarioInicial` |
| Pacientes con baja lógica | ✅ listo (C-06) | `pacientes/Paciente`, `PacienteService.obtener` |
| Reloj inyectable | ✅ listo (C-01) | `shared/time/RelojConfig` |
| Errores de negocio → Problem Details | ✅ listo (C-01) | `shared/error/NegocioException` |
| Autenticación de `/api/**` | ✅ listo (C-04) | `shared/security/SecurityConfig` |
| **Prestaciones (`prestacion`, duración)** | ❌ **no existe** | C-05, responsable Zaira, sin rama todavía |
| Tabla `turno` y su dominio | ❌ es este change | — |

Migraciones aplicadas: V1, V2, V4. La V3 es de C-05 y la V5 queda reservada para este change (CHANGES.md). Flyway acepta fuera de orden (C-06).

## Reglas que aplican

- RN-AG-01..10 y RN-ES-01 ([knowledge-base/05](../../../knowledge-base/05_reglas_de_negocio.md)).
- RN-AG-06 / DD-12: no se aceptan turnos en el pasado → `TURNO_EN_PASADO`.
- RN-AG-03: intervalos semiabiertos `[inicio, fin)`: el borde exacto no es solapamiento.
- RN-AG-10: los cancelados no ocupan el horario. Las transiciones a cancelado llegan en C-09; para probarlo se inserta un turno cancelado directo en la base.
- Regla dura de AGENTS.md: nunca relajar el no-solapamiento ni agregar sobreturnos.

## Hallazgos y riesgos

1. **Dependencia bloqueante**: `turno.prestacion_id` referencia `prestacion` (C-05). La propuesta se puede aprobar ahora; **apply espera a que C-05 esté mergeado**. No se crea una tabla `prestacion` provisoria para no pisar el trabajo de Zaira.
2. **Concurrencia**: validar en el servicio no alcanza ante dos transacciones simultáneas (las dos leen "libre"). Las restricciones `EXCLUDE` de PostgreSQL resuelven la carrera; el servicio traduce `SQLSTATE 23P01` al mismo `TURNO_SOLAPADO`.
3. **Tests existentes**: `PacienteIT` hace `delete from paciente` en `@BeforeEach`; con la FK `turno → paciente` tendrá que borrar antes los turnos.
4. **Contrato para C-08..C-11**: este change fija la entidad `Turno`, sus estados y el formato de `TurnoResponse`, que reutilizan consultar, cancelar, reprogramar y asistencia.

## Por qué este change para el ciclo OPSX

Es el que recomienda la consigna, pertenece al MVP imprescindible de la sección D (agenda con control de conflictos), tiene reglas de negocio verificables (feliz, error de negocio y borde) y es una sola funcionalidad que se termina en una sesión.
