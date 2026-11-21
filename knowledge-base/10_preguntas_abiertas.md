# Preguntas Abiertas

## Inconsistencias detectadas

### IN-01 — Ubicación de los entregables del discovery
**Consigna dice**: `docs/discovery/informe-discovery.md`, su PDF y una sección "Verificación de fuentes".
**Repositorio tiene**: `discovery/informe-competitivo.md` y `discovery/discovery.md`, sin verificación de fuentes manual.
**Impacto**: entrega incompleta respecto de la consigna.
**Resolución propuesta**: copiar o mover a `docs/discovery/`, generar el PDF y que el equipo complete la verificación de al menos 5 fuentes.

### IN-02 — MVP del informe frente al MVP decidido
**Informe §D.4 dice**: agenda por profesional y recurso físico, ficha clínica mínima, autogestión del paciente y salida completa de datos como imprescindibles candidatos.
**Discovery decidió**: odontólogo independiente, un sillón, sin ficha clínica, sin autogestión del paciente, sin exportación en el MVP.
**Impacto**: la consigna pide que el roadmap esté alineado con la sección D; un revisor puede ver la diferencia como desalineación.
**Resolución propuesta**: dejar explícito en el informe final que el §D.4 era una hipótesis y que el discovery lo acotó ([DD-01](09_decisiones_y_supuestos.md), DD-07, DD-08).

### IN-03 — Tamaño del grupo
**Consigna dice**: grupos de hasta 3 integrantes.
**Equipo**: 4 integrantes, autorizado por la cátedra.
**Resolución propuesta**: mencionar la autorización en la reflexión escrita.

### IN-04 — Tests sin Docker
**Consigna dice**: el repositorio debe poder clonarse y correr los tests siguiendo solo el README.
**Decisión**: PostgreSQL local sin Docker.
**Impacto**: los tests de integración fallan en una máquina sin PostgreSQL configurado.
**Resolución propuesta**: README con pasos exactos para crear `turnos_test`; separar tests unitarios (sin base) de integración con un perfil Maven.

### IN-05 — SMTP real y repositorio sin secretos
**Impacto**: riesgo de credenciales en commits o de emails reales desde tests.
**Resolución propuesta**: `.env` ignorado, `MAIL_ENABLED=false` por defecto, doble de prueba obligatorio.

## Preguntas abiertas (priorizadas)

| Prioridad | Pregunta | Bloquea | Decisor |
|---|---|---|---|
| Alta | ¿Se permiten turnos en el pasado (carga retroactiva)? Supuesto actual: no ([SU-01](09_decisiones_y_supuestos.md)) | Change "crear turno" | Equipo |
| Alta | ¿Qué proveedor SMTP y remitente se usan (Gmail con clave de app o Brevo)? | Change de recordatorios | Equipo |
| Alta | ¿El recordatorio requiere consentimiento explícito del paciente? ([SU-03](09_decisiones_y_supuestos.md)) | Change de recordatorios | Cátedra / asesoría |
| Media | ¿Datos mínimos del paciente: DNI obligatorio, email y teléfono opcionales? | Change de pacientes | Equipo |
| Media | ¿El recordatorio sale 24 h antes por defecto? | Change de recordatorios | Equipo |
| Media | ¿Hace falta horario de atención y bloqueos (vacaciones, feriados) en una versión cercana? | Roadmap post-MVP | Equipo |
| Media | ¿Cuándo se agrega el rol asistente y multi-profesional? | Roadmap post-MVP | Equipo |
| Baja | ¿Se despliega en algún entorno público para la defensa o solo local? | Defensa | Equipo |
| Baja | ¿La obra social debe ser un catálogo en lugar de texto libre? | Integración con coberturas | Equipo |

## Puntos "No evidenciado" del Discovery

Quedaron sin respaldo público en la investigación ([informe-competitivo.md](../discovery/informe-competitivo.md)) y condicionan decisiones futuras:

| Tema | Qué no se pudo comprobar | Implicancia para el proyecto |
|---|---|---|
| ARCA | Ningún sistema de los 16 evidenció facturación electrónica ARCA | Posible diferenciador; fuera del MVP hasta validar demanda |
| WhatsApp API de Meta | Varios productos no documentan si usan API oficial ni sus costos | Si se agrega WhatsApp, cotizar costos por conversación antes |
| Concurrencia real | Ningún producto demostró cómo evita doble reserva simultánea | Nuestro diferencial verificable (DD-03) |
| Lista de espera | No evidenciada en varias fichas locales | Change posterior candidato |
| Exportación con adjuntos | Formato, costo y plazo No evidenciado en la mayoría | Exportación completa queda para después del MVP |
| Precios y adopción | Muchos precios por cotización; reseñas de Capterra bloqueadas (HTTP 403) | No usar como base de decisiones de precio |
| Cumplimiento argentino | Ningún proveedor acreditó cumplimiento verificable de Leyes 26.529/25.326 | Ver [11](11_cumplimiento_y_datos_sensibles.md) |
