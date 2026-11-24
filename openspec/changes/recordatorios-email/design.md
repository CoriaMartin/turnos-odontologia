## Context

C-13 implementa RN-RE-01 a RN-RE-05, Flujo 6,
DD-05, DD-13 y DD-14.

Se reutilizan TurnoRepository, ConfiguracionService,
Paciente, Clock y el evento TurnoReprogramado.

## Goals / Non-Goals

**Goals**

- Envio controlado y trazable.
- Consentimiento explicito.
- Prevencion de duplicados.
- Reintentos limitados.
- Compatibilidad con C-18.
- Pruebas deterministas sin SMTP real.

**Non-Goals**

- Elegir un proveedor SMTP.
- Enviar correos reales durante el MVP.
- Cambiar las reglas de solapamiento.
- Implementar interfaces de usuario.

## Decisions

### Persistencia

Crear notificacion mediante V6, respetando el modelo
de datos y la restriccion UNIQUE(turno_id, tipo).

Estados persistidos: ENVIADA y FALLIDA.
Registrar intentos, destinatario, fecha de envio y
error sanitizado, sin datos clinicos ni secretos.

### Seleccion y procesamiento

Una tarea programada cada 15 minutos obtiene candidatos
segun el Clock y la anticipacion configurada.

Procesar cada turno en una transaccion independiente,
releerlo y utilizar bloqueo de fila para serializar
el procesamiento concurrente.

Revalidar estado, horario, email, consentimiento
y cantidad de intentos antes del envio.

### Transporte

EnviadorEmail define el puerto.
El adaptador SMTP utiliza JavaMailSender y variables
MAIL_*.

Con MAIL_ENABLED=false no se realizan envios ni
se registran exitos ficticios.

Los tests utilizan un doble en memoria. MAIL_CONTACTO configura el contacto de la plantilla, con MAIL_FROM como valor alternativo.

### Privacidad

El cuerpo contiene solamente fecha, hora, consultorio
y contacto. No incluye prestacion ni datos clinicos.

Los logs y errores no exponen datos personales,
credenciales ni contenido del mensaje.

### Reprogramacion

Escuchar TurnoReprogramado mediante
TransactionalEventListener BEFORE_COMMIT.

El reinicio de la notificacion se realiza dentro de
la misma transaccion de reprogramacion. Esto permite
que ambos cambios sean atomicos y evita eliminar una
notificacion correspondiente al nuevo horario.
Si la transaccion falla, el reinicio se revierte.

### API

GET /api/turnos/{id}/notificaciones requiere JWT.
Utiliza DTOs y devuelve 404 para un turno inexistente.

El contrato debe permitir a C-18 distinguir pendiente,
enviado, fallido, sin email y sin consentimiento.

El DTO NotificacionResponse contiene turnoId, estado,
intentos y enviadaEn.

Estados de respuesta: PENDIENTE, ENVIADA, FALLIDA,
NO_APLICA y NO_CONSENTIDO.

FALLIDA representa el agotamiento de tres intentos
totales. Los fallos recuperables se muestran como
PENDIENTE.

La confirmacion del contrato con C-18 queda pendiente.

## Risks / Trade-offs

- SMTP no garantiza exactamente una entrega ante una
  caida entre la aceptacion del mensaje y el commit.
- El bloqueo durante el envio requiere timeouts acotados.
- El listener debe evitar carreras con la reprogramacion.
- No se deben almacenar errores SMTP sin sanitizar.
- El scheduler debe permanecer controlado en los tests.