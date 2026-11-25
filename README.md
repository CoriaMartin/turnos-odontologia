# Agenda de Odontología

Agenda web para el **odontólogo independiente argentino**: turnos por prestación sin superposiciones (por profesional y por sillón, incluso ante solicitudes simultáneas), reprogramación, cancelación tardía, registro de asistencia y recordatorios por email con consentimiento del paciente.

Trabajo integrador de Desarrollo de Software, construido con **Spec-Driven Development** (OpenSpec, ciclo OPSX) y **Active Stack**.

| | |
|---|---|
| Backend | Java 21 · Spring Boot 3.3 · PostgreSQL · Flyway · JWT |
| Frontend | React 18 · TypeScript · Vite · TanStack Query |
| Tests | JUnit 5 + MockMvc contra PostgreSQL real · Vitest + Testing Library |

---

## Inicio rápido

Si ya tenés JDK 21, Node 20 y PostgreSQL instalados (detalle en las secciones siguientes):

```powershell
git clone https://github.com/CoriaMartin/turnos-odontologia.git
cd turnos-odontologia
# 1. Crear las bases turnos y turnos_test (ver "1. Bases de datos")
Copy-Item .env.example .env          # 2. Completar DB_PASSWORD, JWT_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD
cd backend;  ./mvnw verify;  cd ..   # 3. Tests del backend
cd frontend; npm ci; npm run verify; cd ..   # 4. Tests del frontend
```

> En PowerShell, si `npm` falla con "la ejecución de scripts está deshabilitada", usá `npm.cmd` en lugar de `npm` (por ejemplo `npm.cmd ci`), o habilitá los scripts para tu usuario una sola vez: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

---

## Requisitos

| Herramienta | Versión | Notas |
|---|---|---|
| JDK | 21 | `JAVA_HOME` debe apuntar al JDK 21: el build falla con otra versión |
| PostgreSQL | 15 o superior | Instalación local, sin Docker. Se probó con la 17: Flyway muestra un aviso de versión no probada que no afecta el funcionamiento |
| Node.js | 20 o superior | Trae `npm`; solo para el frontend |
| Git | cualquiera reciente | |
| Internet | — | Solo la primera vez: `./mvnw` descarga Maven y las dependencias, `npm ci` las del frontend |

No hace falta instalar Maven: el proyecto trae `backend/mvnw` (y `mvnw.cmd` en Windows).

Comprobá las versiones:

```powershell
& "$env:JAVA_HOME\bin\java.exe" -version   # debe decir 21
node -v                                    # v20 o superior
```

## 1. Bases de datos

Con el superusuario de PostgreSQL (te pide su contraseña). **Antes de correrlo, reemplazá `CAMBIAR_ESTA_CLAVE` por una clave tuya, sin tildes, sin ñ y sin espacios** (los caracteres especiales pueden impedir que el backend se conecte):

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE USER turnos WITH PASSWORD 'CAMBIAR_ESTA_CLAVE';" -c "CREATE DATABASE turnos OWNER turnos;" -c "CREATE DATABASE turnos_test OWNER turnos;"
```

En Linux/macOS: `psql -U postgres -c "..."` con los mismos comandos. Si tu PostgreSQL es otra versión, cambiá `17` en la ruta.

Si ya creaste el usuario con otra clave y querés cambiarla:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "ALTER USER turnos WITH PASSWORD 'CAMBIAR_ESTA_CLAVE';"
```

| Base | Para qué |
|---|---|
| `turnos` | La aplicación |
| `turnos_test` | Los tests. **Se borra y se recrea en cada corrida**: no guardes nada ahí |

Las tablas las crea Flyway solo (`backend/src/main/resources/db/migration`); no hay que correr SQL a mano.

## 2. Variables de entorno

Copiá el ejemplo y completalo:

```powershell
Copy-Item .env.example .env
```

El backend lee `.env` automáticamente (desde la raíz del repo o desde `backend/`). Las variables de entorno del sistema tienen prioridad sobre el archivo. **`.env` está en `.gitignore`: nunca lo subas.**

> **Para levantar el backend tenés que completar estas cuatro**: `DB_PASSWORD` (la clave del paso 1), `JWT_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`. `DB_URL` y `DB_USER` ya traen el valor correcto. Los tests solo necesitan `DB_PASSWORD`: si te olvidás de las otras, los tests pasan pero el backend no arranca.

| Variable | Obligatoria | Qué es |
|---|---|---|
| `DB_URL` | Sí | `jdbc:postgresql://localhost:5432/turnos` |
| `DB_USER` / `DB_PASSWORD` | Sí | Usuario `turnos` y la clave que elegiste en el paso 1 |
| `TEST_DB_URL` | No | Base de los tests; por defecto `jdbc:postgresql://localhost:5432/turnos_test` |
| `JWT_SECRET` | Sí | Clave para firmar los tokens, de **al menos 32 bytes**. Si falta o es corta, el backend no arranca |
| `JWT_EXP_MINUTES` | No | Duración del token (por defecto 480) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Sí, la primera vez | Usuario odontólogo que se crea en el **primer** arranque. Después no se modifica |
| `MAIL_ENABLED` | No | Dejalo en `false`: el MVP no envía emails reales ([DD-13](knowledge-base/09_decisiones_y_supuestos.md)) |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` | No | Solo si algún día se activa un proveedor SMTP |
| `FRONTEND_ORIGIN` | No | Único origen aceptado por CORS (por defecto `http://localhost:5173`) |

Para generar un `JWT_SECRET` aleatorio **y guardarlo directamente en tu `.env`** (desde la raíz del repo, en PowerShell):

```powershell
$b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); $s = [Convert]::ToBase64String($b); (Get-Content .env) -replace '^JWT_SECRET=.*', "JWT_SECRET=$s" | Set-Content .env
```

Si preferís hacerlo a mano, generá la clave con cualquier generador y pegala en la línea `JWT_SECRET=` del `.env`.

El frontend tiene su propio ejemplo, `frontend/.env.example`, con `VITE_API_URL` (por defecto `http://localhost:8080/api`). Es opcional: si no creás `frontend/.env`, usa ese valor.

## 3. Correr todos los tests

### Backend

```powershell
cd backend
./mvnw verify
```

- **Unitarios** (`*Test`): reglas de dominio, sin base de datos.
- **Integración** (`*IT`): API completa contra `turnos_test`, incluida la prueba de **dos turnos simultáneos en el mismo horario** (`TurnoConcurrenciaIT`).
- Usan credenciales y secretos **ficticios** propios (`backend/src/test/resources/application-test.yml`): del `.env` solo toman `DB_USER` y `DB_PASSWORD`.
- Nunca envían emails reales: el envío se reemplaza por un doble.

### Frontend

```powershell
cd frontend
npm ci
npm run verify
```

`npm run verify` corre tipos (`tsc`), tests (Vitest + Testing Library) y build. No necesita el backend.

| Comando (dentro de `frontend/`) | Qué hace |
|---|---|
| `npm test` | Solo los tests |
| `npm run typecheck` | Solo los tipos |
| `npm run build` | Versión de producción en `frontend/dist/` |

## 4. Levantar la aplicación

En una terminal, el backend:

```powershell
cd backend
./mvnw spring-boot:run
```

Comprobá <http://localhost:8080/actuator/health> → `{"status":"UP"}`. En el primer arranque se crea el usuario de `ADMIN_EMAIL` con su profesional "Odontólogo Titular".

Opcional, para probar la API sin el frontend (con el backend ya levantado): pedí un token reemplazando `tu-email` y `tu-clave` por los valores de `ADMIN_EMAIL` y `ADMIN_PASSWORD` de tu `.env`:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/auth/login -ContentType application/json -Body '{"email":"tu-email","password":"tu-clave"}'
```

Todas las rutas `/api/**`, salvo el login, exigen el encabezado `Authorization: Bearer <token>`.

En otra terminal, el frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Abrí <http://localhost:5173> e ingresá con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

| Pantalla | Qué permite |
|---|---|
| Login | Ingreso con email y contraseña; bloqueo de 15 minutos tras 5 intentos fallidos |
| Agenda | Vista diaria y semanal; crear, reprogramar y cancelar turnos; registrar atendido o ausente; en el detalle de cada turno, el estado de su recordatorio |
| Pacientes | Alta, búsqueda sin tildes, edición y baja (no se puede dar de baja con turnos futuros) |
| Prestaciones | Catálogo con duración; activar y desactivar |
| Configuración | Horas de cancelación tardía y de anticipación del recordatorio |

## 5. Demo con datos de ejemplo (perfil `dev`)

Para la demo o el video, levantá el backend con el perfil `dev`:

```powershell
cd backend
./mvnw spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Si la base está vacía, carga automáticamente:

- **5 pacientes ficticios** ("Paciente Ficticio Uno" … "Cinco", DNIs `0000000N`, emails `@example.com`).
- **6 turnos ficticios** el próximo día hábil desde las 9:00, creados con las mismas reglas de agenda que la API.

Para empezar de nuevo, borrá los datos de la base `turnos` (o recreala) y volvé a arrancar con `dev`.

**Nunca cargues datos reales de pacientes** en el repositorio, los seeds, los tests ni las capturas.

## 6. Checklist de seguridad de la entrega

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verificar-entrega.ps1
```

Revisa solo lo versionado y sale con error si encuentra un problema (muestra archivo y línea, nunca el valor):

1. No hay archivos `.env` versionados (solo los `.env.example`).
2. Ningún archivo de configuración o código tiene `MAIL_ENABLED=true` (la documentación puede mencionar la regla).
3. Las claves sensibles de los `.env.example` están vacías.
4. Ningún archivo de configuración tiene contraseñas, secretos o tokens con valor (los ficticios de los tests están documentados como excepción).
5. `.gitignore` excluye `.env`, `backend/target/` y `frontend/node_modules/`.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| El build falla con "requiere JDK 21" | `JAVA_HOME` apunta a otro JDK. Configurá la variable de usuario `JAVA_HOME` al JDK 21 y abrí una terminal nueva |
| `java -version` dice 17 aunque instalaste 21 | El `PATH` del sistema tiene primero el 17. Para el proyecto alcanza con `JAVA_HOME` |
| `psql` no se reconoce | No está en el `PATH`: usá la ruta completa, como en el paso 1 |
| Los tests fallan con error de conexión | PostgreSQL apagado, falta `turnos_test` o `DB_USER`/`DB_PASSWORD` incorrectos en `.env` |
| "Falta la variable JWT_SECRET" al arrancar | Completá `JWT_SECRET` en `.env` (32 bytes o más) |
| "Falta la variable ADMIN_PASSWORD" al arrancar | Primera vez con la base vacía: completá `ADMIN_EMAIL` y `ADMIN_PASSWORD` |
| El frontend no puede llamar a la API (CORS) | El frontend no corre en `FRONTEND_ORIGIN`. Usá `npm run dev` (puerto 5173) o ajustá la variable |
| Aviso de Flyway "PostgreSQL 17 is newer than this version" | Solo es una advertencia: funciona con PostgreSQL 17 |
| PowerShell no deja correr el script de seguridad | Usá el comando completo con `-ExecutionPolicy Bypass` |
| `npm` falla con "la ejecución de scripts está deshabilitada" | Usá `npm.cmd` (por ejemplo `npm.cmd run verify`) o `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Los tests no conectan aunque la base existe | La clave de `turnos` tiene tildes, ñ o espacios, o no coincide con `DB_PASSWORD`. Cambiala con `ALTER USER` (paso 1) |

## Documentación de la entrega

| Qué | Dónde |
|---|---|
| Informe de Discovery (A–D, verificación de fuentes) y su PDF | [docs/discovery/](docs/discovery/informe-discovery.md) |
| Checklist de Discovery (11 puntos) e investigación por región | [docs/discovery/discovery.md](docs/discovery/discovery.md), [discovery/](discovery/) |
| Base de conocimiento (10 archivos + cumplimiento) | [knowledge-base/](knowledge-base/README.md) |
| Decisiones del equipo (DD-01 a DD-14) | [knowledge-base/09_decisiones_y_supuestos.md](knowledge-base/09_decisiones_y_supuestos.md) |
| Roadmap, reparto y estado de cada change | [CHANGES.md](CHANGES.md) |
| Specs vigentes | [openspec/specs/](openspec/specs/) |
| Changes archivados (explore, proposal, design, tasks, specs) | [openspec/changes/archive/](openspec/changes/archive/) |
| Ciclo OPSX de la consigna (crear turno sin solapamientos) | [openspec/changes/archive/2026-11-23-crear-turno-sin-solapamientos/](openspec/changes/archive/2026-11-23-crear-turno-sin-solapamientos/) |
| Sistema de diseño y maquetas | [design-system/](design-system/README.md) y `mockups/` de cada change visual |
| Reglas para agentes | [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) |
| Registro de skills | [.atl/skill-registry.md](.atl/skill-registry.md) |
| Estado de la fundación | [.active-orchestrator-state.json](.active-orchestrator-state.json) |
| Verificación en máquina limpia | [docs/entrega/verificacion-maquina-limpia.md](docs/entrega/verificacion-maquina-limpia.md) |

### Dónde está cada elemento de la consigna

La consigna pide carpetas `src/` y `tests/` en la raíz. Este proyecto está separado en `backend/` y `frontend/`, y cada parte usa la convención de su herramienta (Maven y Vite), así que esas carpetas tienen otro nombre:

| Elemento de la consigna | Dónde está en este repositorio |
|---|---|
| `AGENTS.md`, `CLAUDE.md`, `CHANGES.md` | Raíz del repositorio |
| `.active-orchestrator-state.json`, `.atl/skill-registry.md` | Raíz del repositorio |
| `docs/discovery/informe-discovery.md` y `.pdf` | [docs/discovery/](docs/discovery/) |
| `knowledge-base/` (10 archivos canónicos) | [knowledge-base/](knowledge-base/), archivos `01` a `10` (el `11` es el anexo de cumplimiento) |
| `openspec/specs/` | [openspec/specs/](openspec/specs/) |
| `openspec/changes/archive/AAAA-MM-DD-crear-turno-sin-solapamientos/` | [2026-11-23-crear-turno-sin-solapamientos/](openspec/changes/archive/2026-11-23-crear-turno-sin-solapamientos/): `explore.md`, `proposal.md`, `design.md`, `tasks.md` y `specs/turnos/spec.md` |
| `src/` (implementación) | Backend en [backend/src/main/](backend/src/main/) y frontend en [frontend/src/](frontend/src/) |
| `src/` del change de la consigna | [agenda/turnos/](backend/src/main/java/ar/edu/turnosodonto/agenda/turnos/) (`TurnoService`, `ConsultaConflictos`, `BloqueoAgenda`), [agenda/dominio/](backend/src/main/java/ar/edu/turnosodonto/agenda/dominio/) (`Intervalo`, `ReglasAgenda`) y la migración [V5__turnos.sql](backend/src/main/resources/db/migration/V5__turnos.sql) con las restricciones `EXCLUDE` |
| `tests/` | Backend en [backend/src/test/](backend/src/test/) y frontend en los `*.test.ts(x)` junto a cada componente de `frontend/src/` |
| `tests/` del change de la consigna | En [agenda/](backend/src/test/java/ar/edu/turnosodonto/agenda/): `turnos/TurnoIT` (un test por escenario de la spec), `turnos/TurnoConcurrenciaIT` (dos turnos simultáneos), `turnos/TurnoRestriccionesIT` (restricciones de la base), `dominio/IntervaloTest` y `dominio/ReglasAgendaTest` |
| `README.md` | Este archivo |

## Cómo trabajamos

| Integrante | Rol |
|---|---|
| Martín Coria (líder) | Fundación, backend central, ciclo OPSX, revisión e integración de PRs |
| Agustina Chiara | Frontend principal y changes de agenda |
| Zaira Tarifa | Backend auxiliar, recordatorios y documentación de Discovery |
| Ludmila Pérez | Diseño (maquetas), pantallas y registro de asistencia |

- Cada change del [roadmap](CHANGES.md) se trabaja en su rama `<integrante>/C-NN-nombre` y entra a `main` por pull request.
- Cada change sigue el ciclo OPSX: propuesta con escenarios dado/cuando/entonces → implementación contra la spec → un test por escenario → archivo y `[x]` en el roadmap.
- Los cambios visuales llevan una maqueta aprobada antes de implementarse.

## Estructura

```
backend/         API Spring Boot (Java 21, Maven, Flyway, PostgreSQL)
frontend/        Web app React + TypeScript (Vite, React Router, TanStack Query)
design-system/   Sistema de diseño aprobado (tokens, componentes, logo)
docs/            Entregables: informe de Discovery y verificación de la entrega
discovery/       Investigación de mercado de origen
knowledge-base/  Base de conocimiento del proyecto
openspec/        Specs vigentes y changes (ciclo OPSX)
scripts/         Checklist de seguridad de la entrega
```
