# Funcionalidades

Organizadas por épica e historia de usuario (US-NNN). Las reglas citadas están en [05](05_reglas_de_negocio.md).

## Épica 1: Acceso

### US-001 — Iniciar sesión
**Como** odontólogo **quiero** entrar con email y contraseña **para** que nadie más vea los datos de mis pacientes.

**Criterios de aceptación**:
- [ ] Con credenciales válidas recibo un token y accedo a la agenda.
- [ ] Con credenciales inválidas recibo un error genérico (sin decir qué dato falló).
- [ ] Sin token, cualquier ruta de la API responde 401.

**Reglas relacionadas**: RN-AU-01, RN-AU-02, RN-AU-03

## Épica 2: Prestaciones

### US-010 — Gestionar el catálogo de prestaciones
**Como** odontólogo **quiero** definir mis prestaciones con su duración **para** que el turno proponga la duración correcta.

**Criterios de aceptación**:
- [ ] Puedo crear, editar y desactivar prestaciones.
- [ ] No puedo crear dos prestaciones con el mismo nombre.
- [ ] No puedo guardar una duración fuera de 5–480 minutos.

**Reglas relacionadas**: RN-PR-01, RN-PR-02

## Épica 3: Pacientes

### US-020 — Registrar un paciente
**Como** odontólogo **quiero** dar de alta un paciente con sus datos de contacto y obra social **para** poder asignarle turnos.

**Criterios de aceptación**:
- [ ] El DNI es obligatorio, válido y único.
- [ ] Puedo indicar si el paciente acepta recordatorios por email.

**Reglas relacionadas**: RN-PA-01, RN-PA-02, RN-RE-02

### US-021 — Buscar y editar pacientes
**Como** odontólogo **quiero** buscar por apellido, nombre o DNI **para** encontrarlo rápido al dar un turno.

**Criterios de aceptación**:
- [ ] La búsqueda no distingue mayúsculas ni tildes.
- [ ] Puedo editar sus datos.

### US-022 — Dar de baja un paciente
**Criterios de aceptación**:
- [ ] La baja es lógica y conserva el historial de turnos.
- [ ] Se rechaza si tiene turnos programados futuros.

**Reglas relacionadas**: RN-PA-03, RN-PA-04

## Épica 4: Agenda y turnos

### US-030 — Crear un turno sin solapamientos
**Como** odontólogo **quiero** crear un turno eligiendo paciente, prestación y horario **para** que no se superponga con otro.

**Criterios de aceptación**:
- [ ] La duración se completa sola según la prestación y puedo editarla.
- [ ] Si el horario se superpone con otro turno activo del profesional o del sillón, se rechaza con `TURNO_SOLAPADO`.
- [ ] Un turno que empieza justo cuando termina otro se acepta.
- [ ] No puedo crear turnos en el pasado.
- [ ] Dos creaciones simultáneas en el mismo horario: solo una tiene éxito.

**Reglas relacionadas**: RN-AG-01 a RN-AG-09, RN-ES-01

> Candidato recomendado por la consigna para el primer ciclo OPSX.

### US-031 — Ver la agenda
**Como** odontólogo **quiero** ver mi agenda por día y por semana **para** organizar la jornada.

**Criterios de aceptación**:
- [ ] Vista diaria y semanal navegables.
- [ ] Cada turno muestra horario, paciente, prestación y estado.
- [ ] Los cancelados se distinguen visualmente y no ocupan el espacio.

### US-032 — Reprogramar un turno
**Criterios de aceptación**:
- [ ] Solo turnos programados con inicio futuro.
- [ ] El nuevo horario respeta las reglas de solapamiento (sin chocar consigo mismo).

**Reglas relacionadas**: RN-ES-03, RN-RE-05

### US-033 — Cancelar un turno
**Criterios de aceptación**:
- [ ] Con menos de 24 h (configurable) queda como cancelación tardía; si no, como cancelado.
- [ ] El horario queda libre en el momento.
- [ ] Puedo registrar un motivo.

**Reglas relacionadas**: RN-CA-01 a RN-CA-04

### US-034 — Registrar asistencia
**Criterios de aceptación**:
- [ ] A partir del inicio del turno puedo marcarlo atendido o ausente.
- [ ] Antes del inicio la acción se rechaza.

**Reglas relacionadas**: RN-ES-02, RN-ES-04

## Épica 5: Recordatorios

### US-040 — Recordatorio automático por email
**Como** paciente **quiero** recibir un email antes del turno **para** no olvidarlo.

**Criterios de aceptación**:
- [ ] Se envía una vez por turno, dentro de la ventana configurada.
- [ ] Solo si el paciente tiene email y aceptó recordatorios.
- [ ] El email no incluye datos clínicos.
- [ ] Puedo ver si el recordatorio de un turno se envió o falló.

**Reglas relacionadas**: RN-RE-01 a RN-RE-05

## Épica 6: Configuración

### US-050 — Configurar el consultorio
**Criterios de aceptación**:
- [ ] Puedo cambiar las horas de cancelación tardía y de anticipación del recordatorio.
- [ ] Los cambios aplican a operaciones futuras.
