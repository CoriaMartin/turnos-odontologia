# Design

## Context

Ver proposal.md. Estado relevado en `main` @ 1aca1b8: README con secciones de C-01, C-04, C-06 y C-02; perfil `dev` con `PacientesDeEjemplo` (5 pacientes, DNIs `0000000N`); `MAIL_ENABLED` con valor por defecto `false` en `EnviadorEmailSmtp` (C-13, DD-13); `.gitignore` ya excluye `.env`, `.env.*` salvo los `.env.example`; frontend con `npm run verify` (tipos + tests + build). Reglas a respetar: RN-DS-01/02/03 y las reglas duras de [AGENTS.md](../../../AGENTS.md).

## Goals / Non-Goals

**Goals:**
- Que alguien que nunca vio el repo lo clone, configure y vea todos los tests en verde leyendo solo el README.
- Que la demo muestre la agenda con contenido sin cargar datos a mano.
- Que la ausencia de secretos se pueda comprobar con un comando, no solo "confiando".

**Non-Goals:**
- Automatizar la creación de bases o del `.env` (requieren la contraseña de cada uno).
- Despliegue, CI, Docker.

## Decisions

### D1 — README como guía lineal de punta a punta
Orden: qué es → requisitos → **inicio rápido** (los 6 comandos mínimos) → bases → variables (tabla completa de `.env.example`, con cuáles son obligatorias) → **todos los tests** (backend y frontend, qué necesita cada uno) → levantar la app → demo (`dev`) → checklist de seguridad → problemas frecuentes → documentación de la entrega → cómo trabaja el equipo → estructura. Comandos en PowerShell (el equipo trabaja en Windows) con la variante Linux/macOS cuando difiere.
- *Alternativa*: README corto que derive a documentos separados. Descarta: la consigna pide seguir "únicamente el README".

### D2 — Turnos de ejemplo con las reglas reales
`TurnosDeEjemplo` (`ApplicationRunner`, `@Profile("dev")`, `@Order` después de `PacientesDeEjemplo`): si no hay turnos, crea 6 turnos `PROGRAMADO` en el **próximo día hábil** a partir de hoy (9:00 a 12:30, distintas prestaciones y pacientes ficticios), **llamando a `TurnoService.crear`**. Así respetan no solapamiento, pasado y prestaciones activas, y no hay SQL paralelo que se desactualice. Si algo falla (por ejemplo, falta el profesional) solo se loguea una advertencia: la demo no debe impedir que la app arranque.
- *Alternativa*: script SQL de demo. Descarta: duplicaría reglas y podría crear turnos inválidos.
- Datos: solo los pacientes ficticios de `PacientesDeEjemplo` (RN-DS-01).

### D3 — Checklist de seguridad como script PowerShell
`scripts/verificar-entrega.ps1` sobre `git ls-files` (solo lo versionado):
1. Ningún archivo `.env` versionado salvo `*.env.example`.
2. Ninguna línea `MAIL_ENABLED=true` / `MAIL_ENABLED: true` en archivos de configuración o código (`yml`, `properties`, `json`, `xml`, `java`, `ts`, `js`, `.env.example`). *Ajuste de apply*: la primera versión revisaba todo y marcaba como falla la documentación que enuncia la regla (AGENTS.md, README, el propio change).
- Los mensajes del script van en ASCII: Windows PowerShell 5.1 lee los `.ps1` sin BOM como ANSI y mostraba mal los acentos.
3. En los `.env.example`, las claves sensibles (`DB_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD`, `MAIL_USERNAME`, `MAIL_PASSWORD`) sin valor.
4. Sin patrones de credenciales con valor en código y configuración (`password=…`, `secret=…` fuera de los tests con valores ficticios documentados).
5. `.gitignore` incluye `.env`, `backend/target/`, `frontend/node_modules/`.
Sale con código 0 y una línea "OK" por chequeo, o 1 con el archivo y la línea en falta. No imprime valores encontrados, solo dónde están.
- Los valores ficticios de `application-test.yml` y de los tests se listan como excepción explícita en el script (son públicos a propósito y no dan acceso a nada).

### D4 — Verificación en máquina limpia en dos partes
- **Automatizable (líder)**: `git clone` del repo en una carpeta temporal y, sin tocar nada fuera de esa carpeta: `npm ci` + `npm run verify` del frontend y `./mvnw test` del backend (unitarios, sin base). También se corre `scripts/verificar-entrega.ps1` en el clon.
- **Manual (un integrante en su máquina)**: seguir el README desde "Crear las bases" hasta `./mvnw verify` completo y levantar la app con la demo. Los tests de integración necesitan su PostgreSQL y su `.env`, que el agente no puede ni debe crear con contraseñas ajenas.
- Ambos resultados (fecha, comandos, totales de tests, quién) se registran en `docs/entrega/verificacion-maquina-limpia.md`. Si algo del README falla, se corrige el README y se repite.

### D5 — `.mailmap`
Una línea por identidad alternativa hacia el nombre canónico de cada integrante. `git shortlog -sne` muestra entonces cuatro personas. No reescribe el historial.

## Risks / Trade-offs

- [La verificación de integración depende de que un integrante la corra] → se pide explícitamente en el PR y queda como tarea abierta hasta tener su resultado.
- [El script de secretos puede dar falsos positivos] → excepciones explícitas y documentadas en el propio script; preferible a falsos negativos.
- [C-18 todavía no está] → la tarea final de README/demo/verificación espera su merge; el resto avanza.

## Migration Plan

Sin migraciones. Rollback: revertir el PR.
