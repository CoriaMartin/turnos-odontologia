<!-- active-stack:agent-instruction -->
# Turnos Odontología — Instrucciones para Agentes

> Este archivo (y su copia `CLAUDE.md`) es lo PRIMERO que todo agente lee al entrar al repo.
> Generado a partir de `knowledge-base/` y `CHANGES.md`. No editar a mano sin re-sincronizar ambos archivos.

Agenda web para el odontólogo independiente argentino: un usuario, un sillón, turnos por prestación sin solapamientos, cancelación tardía y recordatorios por email.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | Java, Spring Boot (Web, Data JPA, Validation, Security, Mail), Maven, Flyway | Java 21, Boot 3.3 |
| Base de datos | PostgreSQL + `btree_gist` | 15 |
| Autenticación | Spring Security + JWT (jjwt), BCrypt | — |
| Tests backend | JUnit 5, AssertJ, Mockito, Spring Boot Test, MockMvc | — |
| Frontend | React, TypeScript, Vite, React Router, TanStack Query | React 18, TS 5, Vite 5 |
| Tests frontend | Vitest, Testing Library | — |
| Email | Adaptador SMTP vía `JavaMailSender`, apagado en el MVP (`MAIL_ENABLED=false`, DD-13) | — |
| Entorno | Instalación local, sin Docker | Node 20 |

Detalle completo: [knowledge-base/02_descripcion_general.md](knowledge-base/02_descripcion_general.md)

---

## Base de Conocimiento

La fuente de verdad del dominio vive en `knowledge-base/`. **Leé el archivo relevante ANTES de implementar.**

| Archivo | Cuándo leerlo |
|---------|---------------|
| [01_vision_y_objetivos.md](knowledge-base/01_vision_y_objetivos.md) | Propósito, alcance del MVP y fuera de alcance |
| [03_actores_y_roles.md](knowledge-base/03_actores_y_roles.md) | Auth, rol `ODONTOLOGO`, rutas públicas |
| [04_modelo_de_datos.md](knowledge-base/04_modelo_de_datos.md) | Entidades, restricciones de exclusión, seed |
| [05_reglas_de_negocio.md](knowledge-base/05_reglas_de_negocio.md) | Reglas `RN-XX` (agenda, estados, cancelación, recordatorios) |
| [06_funcionalidades.md](knowledge-base/06_funcionalidades.md) | Historias de usuario por épica |
| [07_flujos_principales.md](knowledge-base/07_flujos_principales.md) | Flujos E2E y casos de error |
| [08_arquitectura_propuesta.md](knowledge-base/08_arquitectura_propuesta.md) | Patrones, estructura, tests, variables de entorno |
| [09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) | Decisiones `DD-XX` y supuestos `SU-XX` |
| [10_preguntas_abiertas.md](knowledge-base/10_preguntas_abiertas.md) | ⚠️ Inconsistencias a resolver ANTES de codear |
| [11_cumplimiento_y_datos_sensibles.md](knowledge-base/11_cumplimiento_y_datos_sensibles.md) | Leyes 25.326 y 26.529 |

> ⚠️ Resolver las preguntas de prioridad **Alta** de `10_preguntas_abiertas.md` antes de arrancar el change que bloquean. Hoy no queda ninguna abierta: turnos en el pasado no se permiten ([DD-12](knowledge-base/09_decisiones_y_supuestos.md)); el MVP no usa proveedor de email real ([DD-13](knowledge-base/09_decisiones_y_supuestos.md)); los recordatorios exigen consentimiento ([DD-14](knowledge-base/09_decisiones_y_supuestos.md)).

Diseño visual: [design-system/README.md](design-system/README.md) (revisión 2 aprobada, política `system-and-mockups`).

---

## Skills Disponibles

| Agente | Rol | Skills que carga |
|--------|-----|------------------|
| **Backend Core** | Spring Boot, dominio de agenda, JPA, Flyway | `java-springboot`, `springboot-patterns`, `java-coding-standards`, `postgresql-table-design`, `springboot-tdd` |
| **Backend Aux** | Seguridad, recordatorios, configuración | `springboot-security`, `springboot-tdd`, `postgresql-optimization`, `tdd` |
| **Frontend** | React + TS + TanStack Query | `vercel-react-best-practices`, `react-testing`, `typescript-pro`, `accessibility`, `emil-design-eng` |
| **Calidad** | Revisión y depuración | `code-review`, `systematic-debugging`, `diagnosing-bugs` |
| **Ciclo OPSX** | Explore → propose → apply → archive | `openspec-explore`, `openspec-propose`, `openspec-apply-change`, `openspec-update-change`, `openspec-archive-change`, `openspec-sync-specs` |
| **Orquestación** | Contexto, diseño e instrucciones | `active-delivery`, `design-system`, `kb-creator`, `roadmap-generator`, `agent-instruction`, `skill-registry` |

Cargá la skill correspondiente al contexto ANTES de escribir código.

> Los compact rules de cada skill los resuelve el orquestador desde [.atl/skill-registry.md](.atl/skill-registry.md) (generado por `skill-registry`; en este proyecto **sí se versiona** porque la consigna lo exige). Esta tabla solo mapea skill→rol.

---

## Roadmap de Changes

El plan de implementación completo está en [CHANGES.md](CHANGES.md). Resumen:

- **Total**: 20 changes en 7 fases.
- **Camino crítico** (9): `C-01 → C-03 → C-04 → C-06 → C-07 → C-08 → C-16 → C-17 → C-20`.
- **Primeros items elegibles** (en paralelo): `C-01` backend-scaffolding, `C-02` frontend-scaffolding, `C-19` informe-discovery-entrega.
- **Primer ciclo OPSX recomendado**: `C-07` crear-turno-sin-solapamientos.

**Antes de iniciar un item**: leé [CHANGES.md](CHANGES.md), identificá las dependencias del change y los archivos de "Leer antes".

---

## Reglas Duras (específicas del proyecto)

> Reglas **globales** ya definidas en el archivo global de instrucciones del cliente activo (orquestador OPSX/`openspec`, governance por dominio, Engram, etapa de diseño y maquetas): el proyecto las **hereda**, no se repiten acá. Acá viven solo las reglas **específicas de este proyecto**, confirmadas con el usuario el 2026-11-21. Son contrato; romperlas es un defecto.

**Dominio**
- NUNCA desactivar o relajar la regla de no solapamiento (restricciones `EXCLUDE` por profesional y por sillón, validación en `TurnoService`) ni agregar sobreturnos → cualquier excepción se propone como change OPSX nuevo y se aprueba antes de implementarse.

**Backend**
- NUNCA exponer entidades JPA en la API → usar records DTO; los errores salen como `ProblemDetail` con un `codigo` de negocio (`TURNO_SOLAPADO`, `TURNO_EN_PASADO`, `TRANSICION_INVALIDA`, …).
- NUNCA enviar emails reales desde los tests ni versionar `MAIL_ENABLED=true` → los tests usan un doble de `EnviadorEmail`.
- NUNCA cerrar un change sin un test por cada escenario de su spec → los tests de integración corren contra la base PostgreSQL local `turnos_test` (sin H2 ni Testcontainers) y `./mvnw verify` debe quedar en verde.

**Frontend**
- NUNCA usar colores, medidas, sombras o tipografías sueltas → usar las variables `var(--…)` de `design-system/tokens.css`.
- NUNCA mostrar códigos técnicos al usuario → textos en español rioplatense con "vos", que digan qué pasó y qué hacer, según `design-system/brand.md`.

**Roadmap**
- NUNCA archivar un change sin actualizar el roadmap → marcar `[x]` en `CHANGES.md` en el mismo PR que cierra el change.

---

## Flujo de Trabajo

```
1. Leer la KB relevante (knowledge-base/)        → entender el dominio
2. Identificar el change en CHANGES.md           → respetar dependencias
3. Acordar alcance y criterios de aceptación     → openspec/changes/<change>/ (+ maqueta si es visual)
4. Implementar y verificar respetando las reglas del proyecto
5. Registrar la evidencia, archivar y marcar [x] en CHANGES.md
```

Aplicar TODAS las reglas duras en cada paso. Ante conflicto entre la KB y este archivo, las reglas duras prevalecen.
<!-- /active-stack:agent-instruction -->
