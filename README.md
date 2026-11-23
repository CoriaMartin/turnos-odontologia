# Turnos Odontología

Agenda web para el odontólogo independiente argentino: turnos por prestación sin solapamientos, cancelación tardía y recordatorios por email. Trabajo integrador desarrollado con Spec-Driven Development (OpenSpec) y Active Stack.

- Dominio y decisiones: [knowledge-base/](knowledge-base/README.md)
- Plan de implementación y reparto del equipo: [CHANGES.md](CHANGES.md)
- Reglas para agentes y colaboradores: [AGENTS.md](AGENTS.md)

## Requisitos

| Herramienta | Versión | Notas |
|---|---|---|
| JDK | 21 | `JAVA_HOME` debe apuntar al JDK 21 (el build falla con otra versión) |
| PostgreSQL | 15 o superior | Instalación local, sin Docker |
| Internet | — | Solo el primer build: el wrapper descarga Maven y las dependencias |

No hace falta instalar Maven: el proyecto trae `backend/mvnw`.

## 1. Crear las bases de datos

Con el superusuario de PostgreSQL (te pide su contraseña). Elegí una clave para el usuario `turnos`:

```powershell
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE USER turnos WITH PASSWORD 'elegí-una-clave';" -c "CREATE DATABASE turnos OWNER turnos;" -c "CREATE DATABASE turnos_test OWNER turnos;"
```

En Linux/macOS: `psql -U postgres -c "..."` con los mismos comandos.

- `turnos`: base de la aplicación.
- `turnos_test`: base de los tests. **Se borra y recrea en cada corrida de tests**; no guardes nada ahí.

## 2. Configurar variables de entorno

Copiá el ejemplo y completá `DB_PASSWORD` con la clave del paso anterior:

```powershell
Copy-Item .env.example .env
```

El backend lee `.env` automáticamente (desde la raíz del repo o desde `backend/`). `.env` está en `.gitignore`: **nunca lo subas**. Las variables de entorno del sistema tienen prioridad sobre el archivo.

## 3. Correr los tests

```powershell
cd backend
./mvnw verify
```

- Tests unitarios (`*Test`): no usan base de datos.
- Tests de integración (`*IT`): corren contra `turnos_test`.

Si fallan con un error de conexión, revisá que PostgreSQL esté corriendo, que exista `turnos_test` y que `DB_USER`/`DB_PASSWORD` sean correctos.

## 4. Levantar el backend

```powershell
cd backend
./mvnw spring-boot:run
```

Verificá que esté operativo en <http://localhost:8080/actuator/health> (debe responder `{"status":"UP"}`).

## Estructura

```
backend/        API Spring Boot (Java 21, Maven, Flyway, PostgreSQL)
design-system/  Sistema de diseño aprobado (tokens, componentes)
discovery/      Investigación de mercado y checklist de Discovery
knowledge-base/ Base de conocimiento del proyecto
openspec/       Specs vigentes y changes (ciclo OPSX)
```
