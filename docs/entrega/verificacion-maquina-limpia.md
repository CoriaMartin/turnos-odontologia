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

Observaciones:
- `npm ci` muestra un aviso de npm sobre *install scripts* de dependencias; no afecta el build ni los tests.
- Lo que el agente no hizo, a propósito: crear bases ni `.env` en el clon, porque requieren las contraseñas de cada integrante.

## Parte 2 — README completo en otra máquina (un integrante)

Seguir el README **desde cero**, sin ayuda ni archivos previos, en una máquina distinta a la del líder, y anotar el resultado:

| Paso | Qué verificar | Resultado |
|---|---|---|
| Requisitos | JDK 21, Node 20+, PostgreSQL instalados según la tabla | ⏳ |
| 1. Bases | `turnos` y `turnos_test` creadas con el comando del README | ⏳ |
| 2. Variables | `.env` creado desde `.env.example` con `DB_*`, `JWT_SECRET`, `ADMIN_*` | ⏳ |
| 3. Tests | `./mvnw verify` y `npm run verify` en verde (anotar totales) | ⏳ |
| 4. App | Backend en `/actuator/health` = UP; login en `http://localhost:5173` | ⏳ |
| 5. Demo | Con perfil `dev`: 5 pacientes ficticios y 6 turnos en la agenda | ⏳ |
| Pasos que faltaban o confundían en el README | | ⏳ |

| Dato | Valor |
|---|---|
| Fecha | |
| Quién | |
| Sistema operativo y versiones | |
