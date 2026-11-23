# CHANGES — Secuencia de Implementación

> Índice canónico de todos los changes del proyecto **Turnos Odontología**.
> Cada change es atómico: un agente puede implementarlo en una sesión (~4-6 horas).
> **Leer este archivo antes de empezar un item.**
>
> **Alcance**: cubre solo el MVP decidido en [discovery/discovery.md](discovery/discovery.md) y [knowledge-base/01](knowledge-base/01_vision_y_objetivos.md): un odontólogo, un sillón, turnos sin solapamiento, pacientes básicos, recordatorio por email.
> **Alineación con el informe (§D.4)**: el informe proponía como *hipótesis* un MVP para clínicas (profesional + recurso, ficha clínica mínima, autogestión del paciente, exportación). El Discovery lo acotó a propósito ([DD-01, DD-07, DD-08](knowledge-base/09_decisiones_y_supuestos.md), [IN-02](knowledge-base/10_preguntas_abiertas.md)). Se conserva del §D.4: agenda por profesional **y** recurso físico con control de conflictos, estados, cancelación y recordatorio trazable. Queda fuera del roadmap todo lo que el §D.4 marcó como "postergar" y lo que el Discovery dejó para después (reserva online, ficha clínica, WhatsApp, Mercado Pago, ARCA, lista de espera, multi-profesional).
> **Diseño visual**: el proyecto usa `system-and-mockups` ([design-system/README.md](design-system/README.md), revisión 1 aprobada). Los changes marcados **Maqueta: requerida** necesitan su maqueta HTML aprobada en `openspec/changes/<change>/mockups/` antes de `apply`.

---

## Cómo usar este documento

1. Identificar el item a implementar y verificar que sus dependencias figuran completas (`[x]`) en este roadmap.
2. Leer los docs de la knowledge-base indicados en "Leer antes" (y, si es visual, el [sistema de diseño](design-system/README.md)).
3. Acordar el alcance y los criterios de aceptación del item en `openspec/changes/<change>/` (proposal, specs con escenarios dado/cuando/entonces, design, tasks).
4. Implementar en la rama `<integrante>/C-NN-nombre`, correr los tests y registrar la evidencia; abrir PR hacia `main` para que lo revise el líder.
5. Marcar el checkbox `[x]` en este archivo al completar la verificación técnica y archivar el change.

Conservá los IDs de las fichas al editar o reordenar. Si el proyecto usa ClickUp,
este roadmap conserva el alcance y las dependencias. Consultá el responsable y el estado operativo
en ClickUp y el último dato confirmado en `.active-stack/roadmap-state.json`.

---

## Árbol de dependencias

```
C-01 backend-scaffolding
  └── C-03 core-models
        └── C-04 auth-jwt                         ← desbloquea todos los recursos protegidos
              ├── C-05 prestaciones-catalogo ─┐
              ├── C-06 pacientes-gestion ─────┤
              │                               └── C-07 crear-turno-sin-solapamientos   ← núcleo / 1er ciclo OPSX
              │                                     ├── C-08 consultar-agenda
              │                                     ├── C-09 cancelar-turno
              │                                     ├── C-10 reprogramar-turno
              │                                     │     └── C-13 recordatorios-email
              │                                     └── C-11 registrar-asistencia
              └── C-12 configuracion-consultorio

C-02 frontend-scaffolding                         ← paralelo con C-01
  └── C-14 ui-login                               ← + C-04
        ├── C-15 ui-prestaciones-pacientes        ← + C-05 + C-06
        ├── C-16 ui-agenda                        ← + C-08
        │     └── C-17 ui-gestion-turnos          ← + C-09 + C-10 + C-11 + C-15
        └── C-18 ui-configuracion-recordatorios   ← + C-12 + C-13

C-19 informe-discovery-entrega                    ← independiente (documentación)

C-20 readme-y-demo                                ← cierre: + C-17 + C-18 + C-19
```

### Paralelismo por fase

> Cada "gate" es un punto de sincronización. Los changes dentro de un grupo pueden ejecutarse en paralelo.

```
GATE 0: ninguna                                  ← FORK
  → C-01 backend-scaffolding           [Agente A]
  → C-19 informe-discovery-entrega     [Agente B]
  → C-02 frontend-scaffolding          [Agente C]

GATE 1: C-01 ✓
  → C-03 core-models                   [Agente A]

GATE 2: C-03 ✓
  → C-04 auth-jwt                      [Agente A]

GATE 3: C-04 ✓                                   ← FORK (4 paralelos)
  → C-06 pacientes-gestion             [Agente A]
  → C-05 prestaciones-catalogo         [Agente B]
  → C-12 configuracion-consultorio     [Agente B]
  → C-14 ui-login                      [Agente C — si C-02 ✓]

GATE 4: C-05 + C-06 ✓
  → C-07 crear-turno-sin-solapamientos [Agente A]
  → C-15 ui-prestaciones-pacientes     [Agente C — si C-14 ✓]

GATE 5: C-07 ✓                                   ← FORK (4 paralelos)
  → C-08 consultar-agenda              [Agente A]
  → C-10 reprogramar-turno             [Agente A]
  → C-09 cancelar-turno                [Agente B]
  → C-11 registrar-asistencia          [Agente B]

GATE 6: C-08 ✓ / C-10 ✓
  → C-16 ui-agenda                     [Agente C — si C-14 ✓]
  → C-13 recordatorios-email           [Agente B — si C-10 ✓]

GATE 7: C-09 + C-10 + C-11 + C-15 + C-16 ✓ / C-12 + C-13 + C-14 ✓
  → C-17 ui-gestion-turnos             [Agente C]
  → C-18 ui-configuracion-recordatorios [Agente B]

GATE 8: C-17 + C-18 + C-19 ✓
  → C-20 readme-y-demo                 [Agente A]
```

### Camino crítico (9 changes — mínimo irreducible)

```
C-01 → C-03 → C-04 → C-06 → C-07 → C-08 → C-16 → C-17 → C-20
```

C-14 (ui-login) corre en paralelo y debe estar listo antes de C-16. C-13 → C-18 es la segunda rama más larga; si se atrasa, pasa a ser crítica.

### Plan óptimo con 3 agentes

| Paso | Agente A (Backend Core) | Agente B (Backend Aux) | Agente C (Frontend) |
|---|---|---|---|
| 1 | C-01 backend-scaffolding | C-19 informe-discovery-entrega | C-02 frontend-scaffolding |
| 2 | C-03 core-models | C-19 (verificación de fuentes) | maquetas de C-14 y C-15 |
| 3 | C-04 auth-jwt | — | maqueta de C-16 |
| 4 | C-06 pacientes-gestion | C-05 prestaciones-catalogo | C-14 ui-login |
| 5 | C-07 crear-turno-sin-solapamientos | C-12 configuracion-consultorio | C-15 ui-prestaciones-pacientes |
| 6 | C-08 consultar-agenda | C-09 cancelar-turno | maquetas de C-17 y C-18 |
| 7 | C-10 reprogramar-turno | C-11 registrar-asistencia | C-16 ui-agenda |
| 8 | — | C-13 recordatorios-email | C-17 ui-gestion-turnos |
| 9 | — | C-18 ui-configuracion-recordatorios | — |
| 10 | C-20 readme-y-demo | — | — |

### Plan del equipo (4 integrantes) — vigente

> Reemplaza en la práctica al plan de 3 agentes de arriba. Termina en **9 tandas**, el mínimo posible: el camino crítico tiene 9 changes encadenados. Cada tanda es una sesión de trabajo por persona (~4-6 h). Ninguna dependencia de este documento se modifica.
> Las esperas del camino crítico se aprovechan con trabajo que no necesita código previo: propuestas OPSX (`openspec/changes/<change>/`) y maquetas. C-08 lo hace quien después construye C-16, que es quien consume ese endpoint.

| Integrante | Rol | Changes |
|---|---|---|
| **Líder** | Backend central, ciclo OPSX, revisión de PRs, merges y aprobación de maquetas | C-01, C-03, C-04, C-06, **C-07**, C-10, C-20 |
| **Zaira** | Backend auxiliar y documentación | C-19, C-05, C-12, C-09, C-13 |
| **Agus** | Frontend principal | C-02, C-14, C-08, C-16, C-17 |
| **Ludmi** | Diseño y frontend secundario | maquetas de C-14 a C-18, C-11, C-15, C-18 |

| Tanda | Líder | Zaira | Agus | Ludmi |
|---|---|---|---|---|
| 1 | C-01 | C-19 (informe) | C-02 (con su maqueta) | maquetas C-14, C-15 |
| 2 | C-03 | C-19 (verificación de fuentes) | propuesta C-14 | maqueta C-16 |
| 3 | C-04 + propuesta C-07 | propuestas C-05, C-12 | propuestas C-08, C-16 | maquetas C-17, C-18 |
| 4 | C-06 | C-05 | C-14 | propuestas C-11, C-15 |
| 5 | **C-07** | C-12 | prepara C-16 | C-15 |
| 6 | C-10 | C-09 | C-08 | C-11 |
| 7 | revisión de PRs | C-13 | C-16 | propuesta C-18 |
| 8 | revisión de PRs | pruebas de punta a punta | C-17 | C-18 |
| 9 | C-20 | — | — | — |

**Reglas de colaboración**

- `main` protegida: solo entra por PR con aprobación del líder; nadie hace push directo.
- Una rama por change con el integrante como prefijo: `<integrante>/C-NN-nombre` (ej. `martin/C-07-crear-turno-sin-solapamientos`, `zaira/C-05-prestaciones-catalogo`).
- Antes de abrir el PR, actualizar la rama desde `main` y correr los tests.
- Migraciones Flyway con el número asignado en cada ficha (C-03 V2, C-05 V3, C-06 V4, C-07 V5, C-13 V6). No cambiarlo: C-05 y C-06 corren en la misma tanda.
- Archivos compartidos (configuración de seguridad, manejador global de errores, `application.yml`, router del frontend) los crean C-01 y C-02; el resto solo agrega.
- Los changes se archivan en el orden en que se mergean, porque archivar modifica `openspec/specs/`.
- Antes de la tanda 3: decidir turnos en el pasado (bloquea C-07). Antes de la tanda 7: proveedor SMTP y consentimiento (bloquea C-13).

---

## FASE 0 — Fundación técnica

> C-01, C-02 y C-19 no dependen de nada y arrancan en paralelo.

### [C-01] `backend-scaffolding`
- **Estado**: `[x]` completado (2026-11-23, change archivado `openspec/changes/archive/2026-11-23-backend-scaffolding`)
- **Responsable**: Líder · tanda 1
- **Scope**:
  - Proyecto `backend/` Maven con wrapper, Java 21, Spring Boot 3.3 (Web, Data JPA, Validation, Security, Mail, Actuator), Flyway, driver PostgreSQL.
  - Paquete base `ar.edu.turnosodonto` con módulos vacíos `agenda`, `pacientes`, `prestaciones`, `auth`, `notificaciones`, `configuracion`, `shared`.
  - `application.yml` leyendo `DB_URL`, `DB_USER`, `DB_PASSWORD`; perfil `test` con `TEST_DB_URL` (base `turnos_test`).
  - `shared`: bean `java.time.Clock` (zona `America/Argentina/Buenos_Aires`), `@RestControllerAdvice` con Problem Details y campo `codigo`.
  - Migración `V1__extensiones.sql`: `CREATE EXTENSION IF NOT EXISTS btree_gist`.
  - Seguridad temporal: todo permitido salvo lo que agregue C-04; `/actuator/health` público.
  - `.env.example` sin valores sensibles, `.gitignore` con `.env`; README con creación de bases `turnos` y `turnos_test`.
  - Tests: contexto arranca contra `turnos_test`; health responde 200.
- **Dependencias**: ninguna
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/02_descripcion_general.md` §Stack tecnológico
  - `knowledge-base/08_arquitectura_propuesta.md` §Estructura de directorios, §Variables de entorno, §Estrategia de tests
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-02, §DD-06

### [C-02] `frontend-scaffolding`
- **Estado**: `[ ]` pendiente
- **Responsable**: Agus · tanda 1
- **Scope**:
  - Proyecto `frontend/` con Vite + React 18 + TypeScript estricto, React Router, TanStack Query, Vitest + Testing Library.
  - Import único de `design-system/tokens.css` (copiado o referenciado) en `main.tsx`; constante de marca equivalente a `brand.js`.
  - Cliente HTTP en `shared/api` con `VITE_API_URL`, manejo de Problem Details y header `Authorization`.
  - Layout base: barra superior con logo y nombre, área de contenido, página 404.
  - Tests: render del layout; el cliente traduce un Problem Details a error tipado.
- **Dependencias**: ninguna
- **Governance**: BAJO
- **Maqueta**: requerida (layout base)
- **Leer antes**:
  - `knowledge-base/08_arquitectura_propuesta.md` §Estructura de directorios, §Seguridad
  - `knowledge-base/02_descripcion_general.md` §API REST
  - `design-system/README.md`, `design-system/components.html`

### [C-19] `informe-discovery-entrega`
- **Estado**: `[ ]` pendiente
- **Responsable**: Zaira · tanda 1
- **Scope**:
  - Crear `docs/discovery/informe-discovery.md` a partir de `discovery/informe-competitivo.md` con portada, resumen ejecutivo y secciones A–D según la consigna.
  - Agregar la sección "Verificación de fuentes": al menos 5 fuentes **comprobadas manualmente por el equipo** (una por tipo: sitio oficial, precios, centro de ayuda, etc.), qué afirmaba el informe, qué se encontró y qué se corrigió.
  - Agregar en §D la justificación del MVP acotado (IN-02).
  - Copiar el checklist de 11 puntos (`discovery/discovery.md`) a `docs/discovery/`.
  - Exportar `docs/discovery/informe-discovery.pdf`.
- **Dependencias**: ninguna
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/10_preguntas_abiertas.md` §IN-01, §IN-02
  - `discovery/informe-competitivo.md`
  - `discovery/discovery.md`

---

## FASE 1 — Dominio core y acceso

### [C-03] `core-models`
- **Estado**: `[ ]` pendiente
- **Responsable**: Líder · tanda 2
- **Scope**:
  - Migración `V2__core.sql`: tablas `usuario`, `profesional`, `sillon`, `configuracion` (fila única con `CHECK`) con columnas de auditoría `creado_en`, `actualizado_en`.
  - Entidades JPA y repositorios: `Usuario`, `Profesional`, `Sillon`, `Configuracion`.
  - Seed: 1 sillón "Sillón 1" y fila de configuración por defecto (24 h / 24 h / zona horaria).
  - Servicio `RecursosConsultorio` que expone el profesional y el sillón únicos (punto de extensión para multi-recurso).
  - Tests: migración aplica en `turnos_test`; restricciones de `configuracion` rechazan valores negativos.
- **Dependencias**: `C-01`
- **Governance**: CRITICO
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §usuario, §profesional, §sillon, §configuracion, §Seed data inicial
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-01
  - `knowledge-base/05_reglas_de_negocio.md` §RN-AG-02

### [C-04] `auth-jwt`
- **Estado**: `[ ]` pendiente
- **Responsable**: Líder · tanda 3
- **Scope**:
  - Bootstrap al arrancar: si no hay usuario, crea `usuario` + `profesional` desde `ADMIN_EMAIL` / `ADMIN_PASSWORD` (BCrypt). Falla si faltan las variables.
  - `POST /api/auth/login` → JWT HS256 con `JWT_SECRET` y `JWT_EXP_MINUTES`; error genérico 401 ante credenciales inválidas.
  - Bloqueo 15 min tras 5 intentos fallidos consecutivos → 429.
  - Filtro JWT de Spring Security: todo `/api/**` requiere rol `ODONTOLOGO` salvo login; CORS desde `FRONTEND_ORIGIN`.
  - Logs sin contraseñas ni tokens.
  - Tests: login ok, credenciales inválidas, token vencido, ruta protegida sin token → 401, bloqueo por intentos.
- **Dependencias**: `C-03`
- **Governance**: CRITICO
- **Leer antes**:
  - `knowledge-base/03_actores_y_roles.md`
  - `knowledge-base/05_reglas_de_negocio.md` §RN-AU, §RN-DS
  - `knowledge-base/07_flujos_principales.md` §Flujo 1
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad
  - `knowledge-base/11_cumplimiento_y_datos_sensibles.md`

---

## FASE 2 — Catálogos y pacientes

> C-05, C-06 y C-12 son independientes entre sí tras C-04.

### [C-05] `prestaciones-catalogo`
- **Estado**: `[ ]` pendiente
- **Responsable**: Zaira · tanda 4
- **Scope**:
  - Migración `V3__prestaciones.sql`: tabla `prestacion` con `CHECK (duracion_minutos BETWEEN 5 AND 480)` y nombre único; seed de 5 prestaciones de ejemplo.
  - Endpoints: `GET /api/prestaciones`, `POST`, `PUT /{id}`, `PATCH /{id}/activa`.
  - Tests: nombre duplicado → 409; duración fuera de rango → 422; desactivar no borra.
- **Dependencias**: `C-04`
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §prestacion
  - `knowledge-base/05_reglas_de_negocio.md` §RN-PR
  - `knowledge-base/06_funcionalidades.md` §US-010

### [C-06] `pacientes-gestion`
- **Estado**: `[ ]` pendiente
- **Responsable**: Líder · tanda 4
- **Scope**:
  - Migración `V4__pacientes.sql`: tabla `paciente` (DNI único, `acepta_recordatorios`, `activo`), índices para búsqueda; extensión `unaccent`.
  - Endpoints: `GET /api/pacientes?q=` (apellido, nombre o DNI, sin distinguir mayúsculas ni tildes), `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` (baja lógica).
  - Validaciones RN-PA-01 y RN-PA-02. La guarda RN-PA-04 (turnos futuros) se agrega en C-09.
  - Seed de pacientes **ficticios** solo en el perfil `dev`.
  - Tests: DNI inválido o duplicado, búsqueda con tildes, baja lógica conserva el registro, logs sin datos personales.
- **Dependencias**: `C-04`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §paciente
  - `knowledge-base/05_reglas_de_negocio.md` §RN-PA, §RN-DS
  - `knowledge-base/06_funcionalidades.md` §Épica 3
  - `knowledge-base/11_cumplimiento_y_datos_sensibles.md`

### [C-12] `configuracion-consultorio`
- **Estado**: `[ ]` pendiente
- **Responsable**: Zaira · tanda 5
- **Scope**:
  - Endpoints `GET /api/configuracion` y `PUT /api/configuracion` (horas de cancelación tardía y de anticipación del recordatorio).
  - Validación: cancelación ≥ 0, recordatorio > 0.
  - Tests: actualización válida e inválida; los cambios no alteran turnos existentes.
- **Dependencias**: `C-04`
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/04_modelo_de_datos.md` §configuracion
  - `knowledge-base/06_funcionalidades.md` §US-050
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CA-01, §RN-RE-01

---

## FASE 3 — Agenda (núcleo del producto)

> C-07 es el candidato recomendado para el **primer ciclo OPSX** de la consigna: una sola funcionalidad, reglas verificables y escenarios feliz / error / borde naturales. No tiene UI, así que no requiere maqueta. Tras C-07, C-08 a C-11 se pueden repartir en paralelo.

### [C-07] `crear-turno-sin-solapamientos`
- **Estado**: `[ ]` pendiente
- **Responsable**: Líder · tanda 5
- **Scope**:
  - Migración `V5__turnos.sql`: tabla `turno` con `CHECK (fin > inicio)`, `version`, estados, y dos restricciones `EXCLUDE USING gist` (por `profesional_id` y por `sillon_id`) sobre `tstzrange(inicio, fin, '[)')` para estados activos.
  - Dominio puro: `Intervalo` semiabierto con `seSuperponeCon`, `Turno` en estado `PROGRAMADO`, cálculo de `fin` desde la duración.
  - `TurnoService.crear`: valida paciente y prestación activos, inicio futuro (con `Clock`), duración 5–480, solapamiento por profesional y sillón; traduce `SQLSTATE 23P01` a `TURNO_SOLAPADO`.
  - Endpoints: `POST /api/turnos` (201), `GET /api/turnos/{id}`.
  - Errores: 409 `TURNO_SOLAPADO` (incluye el turno en conflicto), 422 `TURNO_EN_PASADO`, 422 paciente o prestación inactivos.
  - Tests (uno por escenario del spec): creación feliz; solape total y parcial → 409; turno que empieza justo al terminar otro → 201; turno cancelado no bloquea; inicio en el pasado → 422; dos creaciones concurrentes en el mismo horario → exactamente una 201.
- **Dependencias**: `C-05`, `C-06`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-AG, §RN-ES-01
  - `knowledge-base/04_modelo_de_datos.md` §turno
  - `knowledge-base/07_flujos_principales.md` §Flujo 2
  - `knowledge-base/06_funcionalidades.md` §US-030
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-03, §DD-09, §SU-01

### [C-08] `consultar-agenda`
- **Estado**: `[ ]` pendiente
- **Responsable**: Agus · tanda 6
- **Scope**:
  - `GET /api/turnos?desde=&hasta=` con rango obligatorio (máx. 31 días), ordenado por inicio, incluye resumen de paciente y prestación.
  - Opción de excluir cancelados.
  - Tests: rango vacío, límites del rango, cancelados incluidos/excluidos, rango inválido → 422.
- **Dependencias**: `C-07`
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-031
  - `knowledge-base/02_descripcion_general.md` §API REST
  - `knowledge-base/04_modelo_de_datos.md` §turno

### [C-09] `cancelar-turno`
- **Estado**: `[ ]` pendiente
- **Responsable**: Zaira · tanda 6
- **Scope**:
  - `POST /api/turnos/{id}/cancelacion` con motivo opcional (≤ 255).
  - `CANCELADO` o `CANCELADO_TARDIO` según `horas_cancelacion_tardia` (exactamente en el límite = `CANCELADO`); registra `cancelado_en`; libera el horario.
  - Solo desde `PROGRAMADO` con inicio futuro; otro caso → 409 `TRANSICION_INVALIDA`.
  - Guarda RN-PA-04 en `DELETE /api/pacientes/{id}`: rechaza la baja si hay turnos programados futuros.
  - Tests: cancelación anticipada, tardía, en el límite exacto, de turno ya cancelado, liberación del horario (se puede crear otro turno en ese intervalo), baja de paciente bloqueada.
- **Dependencias**: `C-07`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-CA, §RN-ES, §RN-PA-04
  - `knowledge-base/07_flujos_principales.md` §Flujo 4
  - `knowledge-base/06_funcionalidades.md` §US-033

### [C-10] `reprogramar-turno`
- **Estado**: `[ ]` pendiente
- **Responsable**: Líder · tanda 6
- **Scope**:
  - `PUT /api/turnos/{id}/reprogramacion` con nuevo inicio y duración opcional.
  - Solo `PROGRAMADO` con inicio original futuro; revalida RN-AG-01 a RN-AG-06 excluyendo el propio turno; bloqueo optimista con `version`.
  - Publica un evento de dominio `TurnoReprogramado` (lo consume C-13 para reiniciar el recordatorio).
  - Tests: reprogramación feliz, a horario que solapa con otro → 409, mover dentro de su propio intervalo, estado no válido → 409, edición concurrente → 409.
- **Dependencias**: `C-07`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-ES-03, §RN-AG
  - `knowledge-base/07_flujos_principales.md` §Flujo 3
  - `knowledge-base/06_funcionalidades.md` §US-032

### [C-11] `registrar-asistencia`
- **Estado**: `[ ]` pendiente
- **Responsable**: Ludmi · tanda 6
- **Scope**:
  - `POST /api/turnos/{id}/asistencia` con `ATENDIDO` o `AUSENTE`.
  - Solo desde `PROGRAMADO` y con hora actual ≥ inicio; estados finales.
  - Tests: marcar a tiempo, antes del inicio → 409, sobre turno cancelado → 409, doble marcado → 409.
- **Dependencias**: `C-07`
- **Governance**: MEDIO
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-ES
  - `knowledge-base/07_flujos_principales.md` §Flujo 5
  - `knowledge-base/06_funcionalidades.md` §US-034

---

## FASE 4 — Recordatorios

### [C-13] `recordatorios-email`
- **Estado**: `[ ]` pendiente
- **Responsable**: Zaira · tanda 7
- **Scope**:
  - Migración `V6__notificaciones.sql`: tabla `notificacion` con único `(turno_id, tipo)`.
  - Puerto `EnviadorEmail` con adaptador SMTP (`MAIL_*`) y `MAIL_ENABLED=false` por defecto; doble en memoria para tests.
  - `@Scheduled` cada 15 min: turnos `PROGRAMADO` dentro de la ventana configurada, paciente con email y `acepta_recordatorios`, máximo un envío y hasta 3 intentos; relee el estado antes de enviar.
  - Plantilla de email sin datos clínicos ni prestación (fecha, hora, consultorio, contacto).
  - Reinicio de la marca al recibir `TurnoReprogramado` (RN-RE-05).
  - `GET /api/turnos/{id}/notificaciones`.
  - Tests (con `Clock` fijo y doble de email; **nunca SMTP real**): dentro y fuera de ventana, sin consentimiento, sin email, fallo y reintento, turno cancelado entre consulta y envío, reprogramación.
- **Dependencias**: `C-07`, `C-10`
- **Governance**: ALTO
- **Leer antes**:
  - `knowledge-base/05_reglas_de_negocio.md` §RN-RE
  - `knowledge-base/07_flujos_principales.md` §Flujo 6
  - `knowledge-base/04_modelo_de_datos.md` §notificacion
  - `knowledge-base/09_decisiones_y_supuestos.md` §DD-05, §SU-02, §SU-03
  - `knowledge-base/11_cumplimiento_y_datos_sensibles.md`

---

## FASE 5 — Frontend

> Cada change de esta fase requiere maqueta aprobada antes de `apply` (política `system-and-mockups`). Las maquetas pueden adelantarse mientras el backend avanza.

### [C-14] `ui-login`
- **Estado**: `[ ]` pendiente
- **Responsable**: Agus · tanda 4
- **Scope**:
  - Página `/login` con email y contraseña; guarda el token en memoria (no `localStorage`); redirige a la agenda.
  - Rutas protegidas: sin token o ante 401 vuelve a `/login`; cierre de sesión.
  - Mensajes de error genéricos y de bloqueo (429) con el tono de `design-system/brand.md`.
  - Tests: login ok, error, redirección por 401.
- **Dependencias**: `C-02`, `C-04`
- **Governance**: ALTO
- **Maqueta**: requerida
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujo 1
  - `knowledge-base/03_actores_y_roles.md` §Rutas públicas
  - `knowledge-base/08_arquitectura_propuesta.md` §Seguridad
  - `design-system/components.html` §Inicio de sesión

### [C-15] `ui-prestaciones-pacientes`
- **Estado**: `[ ]` pendiente
- **Responsable**: Ludmi · tanda 5
- **Scope**:
  - Pantalla de prestaciones: listado, alta, edición, activar/desactivar.
  - Pantalla de pacientes: búsqueda, alta, edición, baja con confirmación; casilla de consentimiento para recordatorios.
  - Errores de validación del backend mostrados por campo.
  - Tests: formularios con validación, búsqueda, estado vacío.
- **Dependencias**: `C-14`, `C-05`, `C-06`
- **Governance**: BAJO
- **Maqueta**: requerida
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §Épica 2, §Épica 3
  - `knowledge-base/05_reglas_de_negocio.md` §RN-PA, §RN-PR
  - `design-system/components.html` §Pacientes

### [C-16] `ui-agenda`
- **Estado**: `[ ]` pendiente
- **Responsable**: Agus · tanda 7
- **Scope**:
  - Vista diaria (línea de tiempo, slot de 30 min) y semanal con navegación entre fechas; línea de hora actual.
  - Cada turno muestra horario, paciente, prestación y badge de estado; cancelados con tratamiento visual propio.
  - Responsive: en móvil, vista diaria por defecto.
  - Tests: render de estados, navegación, rango pedido a la API.
- **Dependencias**: `C-14`, `C-08`
- **Governance**: MEDIO
- **Maqueta**: requerida
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-031
  - `knowledge-base/05_reglas_de_negocio.md` §RN-ES
  - `design-system/components.html` §Agenda diaria
  - `discovery/informe-competitivo.md` §D.3

### [C-17] `ui-gestion-turnos`
- **Estado**: `[ ]` pendiente
- **Responsable**: Agus · tanda 8
- **Scope**:
  - Diálogo "Nuevo turno": búsqueda de paciente, prestación con duración sugerida y editable, día y hora; muestra la hora de fin.
  - Acciones sobre un turno: reprogramar, cancelar (aviso previo de cancelación tardía), marcar atendido o ausente.
  - Mensajes legibles para `TURNO_SOLAPADO`, `TURNO_EN_PASADO`, `TRANSICION_INVALIDA`; refresco de la agenda tras cada acción.
  - Tests: flujo de creación feliz, error de solapamiento mostrado, aviso de cancelación tardía.
- **Dependencias**: `C-16`, `C-15`, `C-09`, `C-10`, `C-11`
- **Governance**: MEDIO
- **Maqueta**: requerida
- **Leer antes**:
  - `knowledge-base/07_flujos_principales.md` §Flujos 2–5
  - `knowledge-base/05_reglas_de_negocio.md` §RN-AG, §RN-CA
  - `design-system/brand.md` §Tono de los textos
  - `design-system/components.html` §Formulario: nuevo turno, §Mensajes

### [C-18] `ui-configuracion-recordatorios`
- **Estado**: `[ ]` pendiente
- **Responsable**: Ludmi · tanda 8
- **Scope**:
  - Pantalla de configuración (horas de cancelación tardía y de recordatorio).
  - En el detalle del turno: estado del recordatorio (enviado, fallido, pendiente, no aplica por falta de email o consentimiento).
  - Tests: guardar configuración, mostrar estados de notificación.
- **Dependencias**: `C-14`, `C-12`, `C-13`
- **Governance**: BAJO
- **Maqueta**: requerida
- **Leer antes**:
  - `knowledge-base/06_funcionalidades.md` §US-040, §US-050
  - `knowledge-base/05_reglas_de_negocio.md` §RN-RE
  - `design-system/components.html`

---

## FASE 6 — Entrega

### [C-20] `readme-y-demo`
- **Estado**: `[ ]` pendiente
- **Responsable**: Líder · tanda 9
- **Scope**:
  - `README.md` raíz: requisitos (Java 21, Node 20, PostgreSQL 15), creación de `turnos` y `turnos_test`, variables de entorno, cómo correr backend, frontend y **todos los tests** desde cero.
  - Datos de demo ficticios cargables con un comando (perfil `dev`).
  - Verificación en máquina limpia: clonar y seguir solo el README (IN-04).
  - Checklist de seguridad: sin secretos versionados, `MAIL_ENABLED=false` por defecto.
- **Dependencias**: `C-17`, `C-18`, `C-19`
- **Governance**: BAJO
- **Leer antes**:
  - `knowledge-base/08_arquitectura_propuesta.md` §Variables de entorno, §Estrategia de tests
  - `knowledge-base/10_preguntas_abiertas.md` §IN-04, §IN-05
  - `knowledge-base/05_reglas_de_negocio.md` §RN-DS
