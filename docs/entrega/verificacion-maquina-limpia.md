# Verificación en máquina limpia (C-20)

Objetivo de la consigna: **el repositorio debe poder clonarse y correr los tests siguiendo únicamente el [README](../../README.md)** (IN-04). La verificación se hace en dos partes ([design de C-20](../../openspec/changes/readme-y-demo/design.md), D4).

## Parte 1 — Clon nuevo sin configuración (líder)

| Dato | Valor |
|---|---|
| Fecha | 2026-11-24 |
| Quién | Martín Coria (con asistencia de Claude Code) |
| Origen | `git clone` desde GitHub de la rama `martin/C-20-readme-y-demo` (`0901ce5`) en una carpeta temporal vacía |
| Entorno | Windows 11, JDK 21.0.13 (Temurin), Node 24, sin `.env` ni base de datos configurada en el clon |

| Paso del README | Comando | Resultado |
|---|---|---|
| 3. Tests del frontend | `npm ci` + `npm run verify` | ✅ tipos OK, **287 tests** (31 archivos) en verde, build OK |
| 3. Tests unitarios del backend | `./mvnw test` | ✅ **84 tests** en verde (no usan base de datos) |
| 3. Suite completa del backend | `./mvnw verify` en el repo de trabajo del líder | ✅ **302 tests** en verde (unitarios + integración contra `turnos_test`) |
| 6. Checklist de seguridad | `powershell -ExecutionPolicy Bypass -File scripts/verificar-entrega.ps1` | ✅ 5/5 OK, corrido por el líder en su terminal (2026-11-24). La primera corrida marcó 6 falsos positivos en documentación que enuncia la regla; se ajustó el chequeo 2 a configuración y código (commit `8821b17`) |

### Re-verificación con C-18 integrado (tarea 5.1)

| Dato | Valor |
|---|---|
| Fecha | 2026-11-24 |
| Base | `main` con C-18 (PR #26) integrado en la rama de C-20 (`ffda1df`) |

| Comando | Resultado |
|---|---|
| `./mvnw verify` | ✅ **302 tests** en verde |
| `npm ci` + `npm run verify` | ✅ tipos OK, **321 tests** (33 archivos) en verde, build OK |
| Revisión de secretos en los archivos nuevos de C-18 | ✅ sin `.env` ni `MAIL_ENABLED=true`; solo un token ficticio de prueba en un test (`token-nuevo`) |

Observaciones:
- `npm ci` muestra un aviso de npm sobre *install scripts* de dependencias; no afecta el build ni los tests.
- Lo que el agente no hizo, a propósito: crear bases ni `.env` en el clon, porque requieren las contraseñas de cada integrante.

## Parte 2 — README completo en otra máquina (un integrante)

Seguir el README **desde cero**, sin ayuda ni archivos previos, en una máquina distinta a la del líder, y anotar el resultado:

| Paso | Qué verificar | Resultado |
|---|---|---|
| Requisitos | JDK 21, Node 20+, PostgreSQL instalados según la tabla | OK: JDK 21.0.13.1 (Temurin), Node 24.20.0, PostgreSQL 17.12. Ya estaban instalados de antes en esta máquina. |
| 1. Bases | `turnos` y `turnos_test` creadas con el comando del README | OK, con observación. Para empezar de cero se borraron antes el usuario y las bases existentes. El comando del README dio CREATE ROLE y dos CREATE DATABASE, pero se copió con la clave de ejemplo `'elegí-una-clave'` (con tilde) y los tests no conectaban; se cambió con `ALTER USER turnos WITH PASSWORD '...'` (sin tildes). |
| 2. Variables | `.env` creado desde `.env.example` con `DB_*`, `JWT_SECRET`, `ADMIN_*` | OK, con observaciones. `.env` creado con `Copy-Item .env.example .env`. `DB_URL` y `DB_USER` por defecto; se completó `DB_PASSWORD`. `JWT_SECRET` y `ADMIN_PASSWORD` quedaron vacíos en el primer intento: el backend no arrancó ("Falta la variable JWT_SECRET" y después "Falta la variable ADMIN_PASSWORD"). `JWT_SECRET` se cargó con un comando que lo escribe directo en el `.env`. |
| 3. Tests | `./mvnw verify` y `npm run verify` en verde (anotar totales) | OK. Backend: BUILD SUCCESS, 84 tests unitarios y 218 de integración (el primer intento falló por la clave del paso 1). Frontend: `npm.cmd install` y `npm.cmd run verify`: 321 tests passed, typecheck y build OK. |
| 4. App | Backend en `/actuator/health` = UP; login en `http://localhost:5173` | OK. `./mvnw spring-boot:run` → `/actuator/health` respondió UP. `npm.cmd run dev` en una segunda terminal → login con `ADMIN_EMAIL`/`ADMIN_PASSWORD` correcto; la agenda se mostró vacía (esperado sin perfil `dev`). |
| 5. Demo | Con perfil `dev`: 5 pacientes ficticios y 6 turnos en la agenda | OK. Con `-Dspring-boot.run.profiles=dev` se ven los 5 pacientes ficticios y los 6 turnos, todos el mismo día en distintos horarios. |
| Pasos que faltaban o confundían en el README | | 1. La clave de ejemplo `'elegí-una-clave'` es fácil de copiar sin cambiar y tiene tilde, que puede romper la conexión. Sugerencia: usar `'CAMBIAR_ESTA_CLAVE'` y aclarar que no lleve tildes ni ñ.<br>2. El comando para obtener un token está en la sección 2, antes de levantar el backend (sección 4), así que siguiendo el orden falla con "No es posible conectar". Además no aclara que `<ADMIN_EMAIL>` y `<ADMIN_PASSWORD>` se reemplazan sin los `<>`. Sugerencia: moverlo después de "Levantar el backend" y aclarar los marcadores.<br>3. El comando para generar `JWT_SECRET` solo muestra la clave; no dice que hay que pegarla en el `.env`. Si no se pega, los tests pasan igual pero el backend no arranca. Sugerencia: aclararlo o dar un comando que la escriba en el `.env`.<br>4. Sería útil listar en un solo lugar las variables obligatorias para levantar el backend (`DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).<br>5. En Windows con PowerShell, `npm` falla por la política de ejecución ("la ejecución de scripts está deshabilitada"). Se usó `npm.cmd`. Sugerencia: aclararlo o indicar `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.<br>6. Con PostgreSQL 17, Flyway muestra el aviso "PostgreSQL 17.12 is newer than this version of Flyway… latest supported is 16". No impide el funcionamiento, pero el README pide "15 o superior". |

| Dato | Valor |
|---|---|
| Fecha | 2026-11-24/25 |
| Quién | Agus |
| Sistema operativo y versiones | Windows 11 (NT 10.0.22631), OpenJDK 21.0.13.1 (Temurin), Node 24.20.0, PostgreSQL 17.12 |

## Correcciones al README a partir de la Parte 2

Las seis observaciones de Agus se incorporaron al README el 2026-11-25:

| Observación | Corrección en el README |
|---|---|
| Clave de ejemplo con tilde, fácil de copiar sin cambiar | Ahora es `CAMBIAR_ESTA_CLAVE`, con la aclaración de usar una clave sin tildes, ñ ni espacios, y el comando `ALTER USER` para corregirla |
| Comando del token antes de levantar el backend y marcadores ambiguos | Movido a "4. Levantar la aplicación", como paso opcional con el backend ya levantado, y con `tu-email`/`tu-clave` explicados |
| El `JWT_SECRET` generado no se guardaba en el `.env` | El comando ahora lo escribe directamente en la línea `JWT_SECRET=` del `.env` |
| Variables obligatorias dispersas | Recuadro con las cuatro que hay que completar para levantar el backend (y aclaración de que los tests solo necesitan `DB_PASSWORD`) |
| `npm` bloqueado por la política de ejecución de PowerShell | Nota tras el inicio rápido y fila en "Problemas frecuentes": `npm.cmd` o `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Aviso de Flyway con PostgreSQL 17 | Aclarado en la tabla de requisitos (además de "Problemas frecuentes") |

Re-verificación final tras integrar `main` (con C-18, C-19 y C-13 corregidos): `./mvnw verify` **302 tests** y `npm run verify` **321 tests**, en verde.

