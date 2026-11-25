# Proposal

## Why

La consigna exige que **el repositorio se pueda clonar y correr los tests siguiendo únicamente el `README.md`**, sin secretos versionados y con un historial que muestre la participación de cada integrante. El README creció de a pedazos (C-01, C-04, C-06, C-02) y hoy no cubre todo: faltan las variables de email, cómo correr **todos** los tests (backend y frontend) en un solo lugar, cómo cargar una demo completa y cómo comprobar que la entrega no expone secretos. C-20 es el último eslabón del camino crítico ([CHANGES.md](../../../CHANGES.md)) y deja el proyecto listo para entregar y defender.

## What Changes

- **README final** reescrito como guía de punta a punta: requisitos, bases, variables (todas, con ejemplo), **todos los tests** (backend `./mvnw verify` y frontend `npm run verify`), levantar backend y frontend, demo, solución de problemas frecuentes, mapa de la documentación de la entrega (discovery, KB, roadmap, specs, changes archivados, sistema de diseño) y cómo trabaja el equipo (ramas, PR, OPSX).
- **Demo completa con un comando**: el perfil `dev` hoy solo carga pacientes ficticios; se suman **turnos ficticios** de los próximos días (creados con las mismas reglas de agenda) para que la agenda tenga contenido en la demo y el video.
- **Checklist de seguridad ejecutable**: script `scripts/verificar-entrega.ps1` que revisa que no haya archivos `.env` versionados, ni `MAIL_ENABLED=true`, ni credenciales con valor en los archivos versionados, y que `.gitignore` cubra lo necesario. El README explica cómo correrlo.
- **Verificación en máquina limpia** (IN-04): clon nuevo del repo siguiendo solo el README. Lo automatizable (frontend completo y tests unitarios de backend) lo corre el líder; los tests de integración los corre **un integrante en su propia máquina**, porque necesitan su base y su `.env`. El resultado queda registrado en `docs/entrega/verificacion-maquina-limpia.md`.
- **`.mailmap`**: unifica los dos nombres con los que aparece cada integrante en git (terminal y web de GitHub), para que el historial muestre cuatro personas.

Fuera de alcance: la reflexión escrita y el video de defensa (no viven en el código), cambios funcionales del backend o del frontend, CI.

**Dependencia**: C-18 (Ludmi). Se avanza con todo lo demás; al entrar C-18 se completa su parte en el README y la demo, se repite la verificación y recién ahí se archiva.

## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- Ninguna. El change no modifica comportamiento del sistema: los turnos de ejemplo usan las reglas ya especificadas en `turnos`, solo con el perfil `dev`. Por eso declara `skip_specs: true`.

## Impact

- `README.md`, `scripts/verificar-entrega.ps1`, `docs/entrega/verificacion-maquina-limpia.md`, `.mailmap`.
- Backend: un `ApplicationRunner` nuevo solo para el perfil `dev` (`TurnosDeEjemplo`) y su test.
- Sin migraciones ni dependencias nuevas.
