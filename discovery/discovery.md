# Discovery — Turnos Odontología

**Fecha**: 2026-11-21
**Variante**: entrevista (checklist de 11 puntos), apoyada en la investigación competitiva existente.
**Fuentes investigadas**: 16 sistemas documentados en [informe-competitivo.md](informe-competitivo.md) y fichas en [research/](research/). No se corrió `web-scraper` en esta fase: la investigación ya estaba hecha y se reutilizó sin rehacerla.

## 1. Problema que resuelve

El odontólogo independiente en Argentina gestiona su agenda a mano (papel, WhatsApp o planilla). Eso produce turnos superpuestos, ausencias sin aviso y tiempo clínico perdido en coordinar, en lugar de atender.

## 2. Usuarios / roles

- **Odontólogo** (único usuario del sistema en el MVP): carga, reprograma y cancela turnos; administra pacientes y el catálogo de prestaciones.
- **Paciente** (no usa el sistema en el MVP): recibe recordatorios por email y cancela llamando o escribiendo al consultorio.

## 3. Casos de uso

1. Como odontólogo, quiero crear un turno eligiendo paciente y prestación, sin que se superponga con otro, para evitar dobles reservas.
2. Como odontólogo, quiero ver mi agenda del día y de la semana para organizar la jornada.
3. Como odontólogo, quiero reprogramar o cancelar un turno para que el horario quede libre.
4. Como odontólogo, quiero dar de alta y buscar pacientes con sus datos de contacto y obra social.
5. Como paciente, quiero recibir un recordatorio por email antes del turno para no olvidarlo.

## 4. Competidores / soluciones existentes

La comparación completa (16 productos, matriz ponderada y guion de demo) está en [informe-competitivo.md](informe-competitivo.md).

| Rol en este proyecto | Productos | Motivo |
|---|---|---|
| Demos prioritarias | Bilog, DentalSoft, Odonthia, Dentalink, OdontoSoft Millennium | Pertinencia argentina y contraste útil (informe §D.1) |
| Referencias UX | Dentally, CareStack, Codental | Reserva/cancelación, agenda por recurso, avisos explícitos (informe §D.3) |
| Competencia informal | Papel, WhatsApp, planillas | Lo que usa hoy el odontólogo independiente |

**Notas**: la muestra apunta mayormente a clínicas; el segmento independiente queda servido por planes de entrada (ej. Odonthia gratuito). La invariante de no solapamiento con prueba de concurrencia no quedó demostrada en ningún producto (informe §C.3), por lo que una agenda con reglas explícitas y testeadas es un diferencial verificable.

## 5. Funcionalidades necesarias (MVP)

- Agenda con vista diaria y semanal.
- Alta, reprogramación y cancelación de turnos, con estados: programado, atendido, ausente, cancelado y cancelación tardía.
- Catálogo de prestaciones con duración predeterminada.
- Alta y búsqueda de pacientes con datos básicos (contacto y obra social).
- Recordatorio automático por email antes del turno.

## 6. Funcionalidades opcionales (posteriores al MVP)

- Reserva o solicitud online por parte del paciente.
- Ficha clínica, evoluciones y odontograma.
- Recordatorios y confirmación por WhatsApp Business API.
- Mercado Pago y señas; facturación ARCA; obras sociales, copagos y liquidaciones.
- Lista de espera y recuperación de huecos por cancelaciones.
- Varios profesionales y sillones; asistente con permisos propios; sobreturnos autorizados.
- Exportación completa con adjuntos.

## 7. Reglas de negocio

- Un turno no puede superponerse con otro del mismo profesional ni del mismo sillón. Los sobreturnos están prohibidos en el MVP.
- Los intervalos se tratan como semiabiertos: un turno que empieza exactamente cuando termina otro no se solapa.
- La duración del turno la propone la prestación elegida y puede editarse al crear el turno.
- Cancelar con menos de 24 h de anticipación (valor configurable) registra "cancelación tardía". En todos los casos el horario se libera.
- No hay restricción por horario de atención ni bloqueos en el MVP: se puede dar cualquier horario que no se solape.

## 8. Integraciones

- Servicio de email (SMTP o proveedor transaccional) para recordatorios automáticos. Es la única integración externa del MVP.
- WhatsApp API, Mercado Pago, ARCA y calendarios externos quedan fuera del MVP.

## 9. Restricciones

- Trabajo integrador académico de 4 integrantes, autorizado por la cátedra. El líder conduce la fundación y el ciclo OPSX; cada integrante trabaja en su rama con commits propios.
- El primer change debe tener reglas verificables y tests automatizados por escenario. No requiere interfaz gráfica.
- Sin datos reales de pacientes ni secretos en el repositorio.
- Marco normativo: Ley 26.529 (historia clínica) y Ley 25.326 (datos de salud como datos sensibles).
- Modelo del MVP: un único profesional y un único sillón. Ambos se modelan como recursos explícitos para poder especificar la regla de no solapamiento y extenderla después.

## 10. Riesgos

- **Supuesto sin probar**: que el odontólogo independiente adopte una herramienta y abandone WhatsApp o el papel. No se validó con usuarios.
- **Supuesto sin probar**: que el email llegue y se lea. En Argentina el canal dominante es WhatsApp.
- **Riesgo de diseño**: el modelo de un profesional y un sillón puede volverse deuda técnica si el producto escala a clínicas.
- **Riesgo técnico**: aun con un solo usuario, la regla de no solapamiento debe garantizarse ante operaciones simultáneas (por ejemplo, dos pestañas).

## 11. Preguntas abiertas

- ¿Se permiten turnos en el pasado? Supuesto actual: no.
- ¿Desde qué cuenta y remitente se envían los emails? ¿Con cuánta anticipación sale el recordatorio? Supuesto actual: 24 h.
- ¿Qué datos mínimos se piden al paciente (DNI, obra social, teléfono, email)?
- ¿El recordatorio por email requiere consentimiento explícito del paciente según la Ley 25.326?
- Puntos "No evidenciado" del informe: integración ARCA, API de Meta y sus costos, exportación con adjuntos y concurrencia real en los competidores.
- Ubicación de los entregables: la consigna pide `docs/discovery/informe-discovery.md`, su PDF y una sección de "Verificación de fuentes"; hoy los artefactos están en `discovery/`.
