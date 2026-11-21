# Actores y Roles

## Actores del sistema

| Actor | Descripción | Cómo interactúa |
|---|---|---|
| Odontólogo | Profesional independiente, dueño del consultorio. Único usuario del sistema en el MVP | Web app autenticada |
| Paciente | Persona atendida. No tiene cuenta | Recibe emails de recordatorio; cancela por teléfono o mensaje y el odontólogo lo registra |
| Planificador de recordatorios | Proceso automático del backend (`@Scheduled`) | Lee turnos próximos y envía emails |
| Proveedor SMTP | Sistema externo | Recibe los emails a enviar |

## RBAC — Matriz de permisos

Un único rol en el MVP: `ODONTOLOGO`. El modelo de roles existe desde el inicio para poder agregar `ASISTENTE` sin rediseño (ver [10](10_preguntas_abiertas.md)).

| Rol | Recurso | Permisos |
|---|---|---|
| ODONTOLOGO | Turnos | Crear, leer, reprogramar, cancelar, registrar asistencia |
| ODONTOLOGO | Pacientes | Crear, leer, actualizar, baja lógica |
| ODONTOLOGO | Prestaciones | Crear, leer, actualizar, activar/desactivar |
| ODONTOLOGO | Configuración | Leer, actualizar |
| ODONTOLOGO | Notificaciones | Leer |
| Sistema (planificador) | Turnos / Notificaciones | Leer turnos; crear y actualizar notificaciones |

No existe borrado físico de turnos ni de pacientes desde la API.

## Rutas públicas

- `POST /api/auth/login`
- Frontend: `/login`
- `GET /actuator/health` (solo estado, sin detalles)
