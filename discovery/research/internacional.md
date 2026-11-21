# Plataformas odontológicas internacionales

**Fecha de consulta: 2026-11-21.** Alcance: Dentally, CareStack, tab32, Open Dental y Curve Dental. Investigación documental puntual mediante websearch para descubrimiento y webfetch para lectura de fuentes oficiales. No se creó cuenta, contrató servicio, contactó vendedores ni ejecutó ninguna funcionalidad. No se utilizaron snippets como evidencia funcional ni se hizo crawling masivo.

## Criterio de evidencia y límites

- **D = documentación funcional**: manuales, artículos de ayuda o documentación técnica que describen un flujo o comportamiento. D no significa probado ni garantía de disponibilidad en cualquier país/versión.
- **C = comercial/declarativo**: producto, precios, FAQ de venta, notas de prensa, casos y declaraciones de seguridad del proveedor. Las políticas legales se identifican como **C-legal**: documento oficial, no auditoría técnica ni prueba funcional.
- Cada identificador remite a una URL y una fecha en el registro de su producto. Las filas de capacidades citan esos identificadores; por tanto heredan su URL y fecha. Los campos **No evidenciado** significan que las fuentes consultadas no permiten afirmarlos; no que el producto carezca de ellos.
- Acceder por navegador desde cualquier país no equivale a comercialización, soporte, cobros o cumplimiento normativo en Argentina. Los claims HIPAA, SOC 2, ISO o FDA no prueban adecuación a Argentina. En particular, seguros estadounidenses/NHS no equivalen a obras sociales argentinas; invoice/statement no equivale a factura ARCA; SMS o un link compartible no equivale a WhatsApp Business Platform/API.
- No hay una auditoría de cumplimiento argentino en este informe. Antes de adoptar: validar contrato, tratamiento de datos sensibles, transferencias internacionales, consentimiento, exportación, retención, ubicación de datos y normativa aplicable con asesoramiento local. Certificados y reportes de auditoría no fueron inspeccionados.
- Reseñas independientes verificadas directamente: **No evidenciado para los cinco productos**. Se consignan testimonios oficiales como C, sin convertirlos en valoraciones independientes ni usar puntuaciones de agregadores reproducidas por terceros.

## Lectura comparada rápida

| Producto | Modalidad/mercado evidenciado | Argentina: conclusión limitada a las fuentes | Referencia útil para el proyecto |
|---|---|---|---|
| Dentally | SaaS; Reino Unido, Irlanda, Australia, Nueva Zelanda y Canadá en selector regional | Comercialización/localización argentina: No evidenciado; inspiración internacional | Portal con señas, retención temporal del turno, cancelación y nueva reserva |
| CareStack | SaaS; consultorios, especialistas y DSO; versiones USA/UK/AUS | Contratación operativa argentina: No evidenciado; inspiración internacional | Agenda por sillón/profesional, sobreturnos explícitos, colas de reprogramación |
| tab32 | SaaS Alpine para independientes; Summit para grupos; lanzamiento Alpine en EE. UU. | Disponibilidad argentina: No evidenciado; inspiración internacional | Automatización conversacional con aprobación y recuperación de huecos |
| Open Dental | Instalación/autohosting; Cloud oficial con tarifa USA | Compra directa internacional explícita; Argentina no nombrada ni localización demostrada | Agenda diaria/semanal y solapamiento configurable documentados en manual |
| Curve Dental | SaaS, independientes y grupos; adopción declarada USA/Canadá | Comercialización argentina: No evidenciado; acceso remoto mundial no la demuestra | Smart Fill, recare, comunicación integrada y permisos por sede |

Las oportunidades anteriores son interpretación comparativa, no decisiones de alcance aprobadas ni requisitos del proyecto.

---

## 1. Dentally

### 1.1 Identidad, problema y público

- **Empresa/país/URL:** el sitio británico identifica a **Henry Schein One UK LTD**, registro 02940919, domicilio en Gillingham, Kent, Reino Unido. Producto: <https://www.dentally.com/en-gb/>. No se extrapola esa entidad contractual a todas las regiones. [DE-C1]
- **Problema:** unificar operación clínica, agenda, comunicación y administración para disminuir tareas manuales; posicionamiento declarado, no ahorro medido aquí. [DE-C2, DE-C4]
- **Segmento/modalidad:** gestión odontológica cloud, consultorios nuevos y multisede; mercado privado y NHS/HSC según región. Hay paquetes Starter, Essentials y Pro por cantidad de surgeries y sitio, usuarios ilimitados. [DE-C1, DE-C2]
- **Argentina:** el selector público enumera UK, Australia, Canadá, Irlanda y Nueva Zelanda; los artículos D señalan UK/ROI, APAC y CA. Venta, soporte local, español argentino, ARS y clínicas argentinas: **No evidenciado**. Clasificación: inspiración internacional, no competidor local confirmado. [DE-C1, DE-D1]

### 1.2 Capacidades y casos de uso

| Área | Evidencia y alcance |
|---|---|
| Agenda diaria/semanal | Calendario personalizable declarado; distinción explícita de vistas diaria/semanal en las páginas leídas: **No evidenciado**. No se infiere de una captura. [DE-C4] |
| Profesionales/sillones/duración | Portal configurable por profesional, sesiones, horarios, tipo y duración. La documentación técnica legacy tiene `practitioner_id`, `room_id`, inicio, fin y duración en minutos; room no prueba inventario físico completo de sillones. [DE-C3, DE-D3] |
| Bloqueos/sobreturnos/solapamientos | D legacy define citas también para almuerzo; `force_changes=true` permite omitir errores de doble reserva. Esto evidencia un override técnico legacy, **no** que el Portal autorice sobreturnos ni que NexGen se comporte igual. El Portal retiene el horario seleccionado mientras se finaliza la reserva. [DE-D1, DE-D3] |
| Reserva/link/redes | Portal por enlace directo sin exigir web; distribución por email/SMS, sitio o QR declarada. Compartir ese enlace en redes es posible como canal de distribución, pero una integración nativa de reservas Instagram/Facebook: **No evidenciado**. [DE-C3] |
| Confirmación/seña | Paciente existente ingresa nombre/fecha de nacimiento y OTP por SMS, elige tipo y profesional, paga depósito si corresponde y recibe confirmación por SMS. SMS de 2FA puede costar extra. No se muestran slots con menos de una hora de antelación; el artículo dice que ese mínimo no es ajustable. [DE-D1] |
| Cancelar/reprogramar | Opción habilitable por la clínica; requiere cuenta Portal, impide cancelar con menos de 48 h, registra `Cancelled online` y ofrece `Rebook now` hacia el flujo habitual. Es cancelación más nueva reserva, no una transacción atómica de traslado demostrada. [DE-D2] |
| Espera | Smart short notice identifica huecos para contactar pacientes; página comercial, no algoritmo ni prioridades verificadas. Lista de espera autónoma del paciente: **No evidenciado**. [DE-C4] |
| Chatbot/WhatsApp | Chatbot de reserva, recordatorios por WhatsApp, WhatsApp API y click-to-chat integrado: **No evidenciado**. Dentally Chat es comunicación interna, no evidencia de chatbot para pacientes. [DE-C1, DE-C4] |
| Automatizaciones | SMS/email de recordatorios y recalls, tareas, notas clínicas AI y reporting; las cuotas de AI dependen del paquete y hay restricciones regionales. No se probaron disparadores ni entrega. [DE-C1, DE-C4, DE-C5] |
| Ficha/anamnesis | Historial médico y formularios autocompletados desde Portal o tablet; datos de paciente y campos personalizados en D técnica. Validación de anamnesis según normativa argentina: **No evidenciado**. [DE-C3, DE-D3] |
| Odontograma/periodontograma/imágenes | Charting con dentición mixta y raíces, exámenes periodontales comparables y Dentally Vision/AI declarados. Es C de producto, no lectura de manual de todas esas herramientas. [DE-C2, DE-C5] |
| Presupuestos/planes | Planes y plantillas clínicas; índice de ayuda enlaza firma digital de estimaciones y documentación técnica modela plan/ítems/facturas. Flujo de firma completo no ejecutado ni leído en detalle. [DE-C5, DE-D3, DE-D4] |
| Caja/cobros/facturas/señas | Cuentas familiares/individuales, claims y depósitos; D de reserva documenta seña y saldo pendiente. API legacy describe invoices, montos, vencimientos y pagos. Apertura/cierre de caja efectivo: **No evidenciado**. Factura fiscal argentina: **No evidenciado**. [DE-C4, DE-D1, DE-D3] |
| MP/obras sociales/liquidaciones | Mercado Pago y obras sociales argentinas: **No evidenciado**. NHS sí declarado. Monthly Accounts report se presenta como ayuda para pagar a profesionales/associates; cálculo de liquidación argentina o comisiones configurables: **No evidenciado**. [DE-C1, DE-C2] |
| Reportes | Pacientes, recalls, cuentas mensuales, tratamientos pendientes e ingresos/actividad; MPC para análisis avanzado declarado. [DE-C2, DE-C4] |
| Integraciones | Developer Hub público; avisa que v1 es legacy y recomienda NexGen. Marketplace y Dojo/Worldpay declarados; Vision para imágenes. Google Calendar, ARCA y WhatsApp API: **No evidenciado**. Firma online en índice de ayuda; no equivale a firma digital argentina. [DE-D3, DE-D4, DE-C2] |
| Sedes/roles/auditoría/exportación | Multisede y usuarios ilimitados según oferta; política declara cinco roles, 2FA habilitable, restricciones IP y audit log de accesos/cambios. Titularidad del dato declarada. Exportación integral con formato/plazo/costo: **No evidenciado**; disponibilidad de API no la reemplaza. [DE-C1, DE-C6] |
| Soporte/adopción | Chat en Starter, chat/teléfono en otros planes, responsable dedicado en Pro. Migración y capacitación guiadas declaradas. SLA/horario español Argentina: **No evidenciado**. [DE-C1, DE-C2] |

### 1.3 Precio, negocio, seguridad y evaluación

- **Modelo/precio C:** página UK, mensual, GBP, **sin VAT**. Para el ejemplo seleccionado de **3 surgeries**: Starter **£285/mes**, Essentials **£410/mes**, Pro **£551/mes**. La extracción también lista tarifas por 1–8 surgeries; no se suman ni se confunden con usuarios. Más sedes/surgeries alteran la propuesta. No son precios Argentina. [DE-C1]
- **Extras/condiciones:** verificar Portal/Vision y cuotas AI en presupuesto; el artículo D advierte cargos SMS OTP. La tabla extraída tiene iconos check/uncheck que comparten rutas ambiguas: no se asignan inclusiones dudosas por plan únicamente por el nombre del SVG. Implementación, migración, permanencia y comisiones de cobro: **No evidenciado en monto**. [DE-C1, DE-D1]
- **Seguridad/privacidad C-legal:** política consultada, última actualización indicada **2020-06-23**, declara AWS UE, TLS, backups/replicación, contraseñas bcrypt, roles, 2FA opcional, log y control de acceso de soporte. La antigüedad exige reconfirmación contractual; las certificaciones listadas de AWS no se atribuyen automáticamente a Dentally. Cumplimiento argentino: **No evidenciado**. [DE-C6]
- **Adopción/reseñas:** testimonios con nombres/clínicas (Abbey House Dental, South Devon Dental) en sitio oficial, clasificados C; no usuarios independientes validados ni adopción argentina. [DE-C2, DE-C3]
- **Fortalezas públicas:** documentación concreta de la reserva con seña y de cancelación; portal sin web propia; agenda conectada a ficha y cuentas; ecosistema técnico público. [DE-D1–DE-D3, DE-C3]
- **Limitaciones públicas:** cancelación online con corte de 48 h, reserva mínima una hora no modificable en D consultada; Kiosk optimizado para una sola sala de espera; costos por mensajes y módulos; limitaciones regionales; documentación API leída es legacy. [DE-D1–DE-D3, DE-C1, DE-C3]

### 1.4 Fuentes oficiales

Todas las siguientes se leyeron por webfetch el **2026-11-21**.

| ID/tipo | URL | Evidencia principal |
|---|---|---|
| DE-C1 / C | https://www.dentally.com/en-gb/pricing | Entidad UK, regiones, precio por surgeries, planes, soporte y cuotas AI |
| DE-C2 / C | https://www.dentally.com/en-gb/dental-software-features | Plataforma, reportes, onboarding, partners, dependencia de conectividad |
| DE-C3 / C | https://www.dentally.com/en-gb/product/dentally-portal | Link, formularios, sesiones/duración, Kiosk y testimonios |
| DE-C4 / C | https://www.dentally.com/en-gb/dental-software-features/practice-admin | Short notice, comunicación, cuentas y agenda |
| DE-C5 / C | https://www.dentally.com/en-gb/dental-software-features/clinical | Charting, perio, plantillas, notas AI e imágenes |
| DE-C6 / C-legal | https://www.dentally.com/en-gb/security-policy | Seguridad, privacidad y titularidad; actualización declarada 2020-06-23 |
| DE-D1 / D | https://help.dentally.com/en/articles/3668861-how-to-use-online-booking-as-an-existing-patient | Reserva, OTP, antelación, bloqueo temporal y depósito; artículo 2026-08-24 |
| DE-D2 / D | https://help.dentally.com/en/articles/3668498-how-patients-can-cancel-an-appointment-online-via-portal | Cancelación, 48 h y rebook; artículo 2026-08-24 |
| DE-D3 / D | https://developer.dentally.co/ | Modelo de datos, conflictos/override y API legacy; remisión a NexGen |
| DE-D4 / D, índice | https://help.dentally.com/en/collections/2055711-dentally-portal | Rutas a ayuda de firma, pagos, permisos y reservas; índice no sustituye lectura de cada flujo |

---

## 2. CareStack

### 2.1 Identidad, problema y público

- **Empresa/país/URL:** copyright **Good Methods Global Inc.**, marca CareStack; sede estadounidense en Celebration, Florida, presencia importante en India. Fundada en 2015 según página corporativa. URL: <https://carestack.com/>. [CS-C1]
- **Problema:** concentrar operación clínica, front office, relación con pacientes y ciclo de ingresos; públicos: consultorio individual, startup, especialidades, odontología móvil y grupos/DSO. SaaS cloud; selector USA/UK/AUS. [CS-C1, CS-C2]
- **Argentina:** contratación, soporte local, ARS y localización fiscal/aseguradora: **No evidenciado**. La existencia de API y acceso cloud no demuestra venta operativa en Argentina. Clasificación: inspiración internacional. [CS-C1, CS-C2, CS-D6]

### 2.2 Capacidades y casos de uso

| Área | Evidencia y alcance |
|---|---|
| Agenda diaria/semanal/profesional/sillón | D describe Day/Week, filtros por profesional u operatory/sede, columnas, disponibilidad, horario extendido, producción y vista compacta. Permite hasta tres descansos por profesional en el flujo descrito. [CS-D1] |
| Duración/bloqueos/sobreturnos | D admite múltiples citas y bloqueos en un mismo slot. El usuario arrastra el tramo y completa datos; duración predeterminada por tratamiento, granularidad y mínimos exactos: **No evidenciado** en las fuentes leídas. [CS-D2] |
| Solapamiento/antiduplicados | D distingue sobreturno manual de disponibilidad online: un slot con citas/bloqueos no aparece vacante en Find Slot/Portal. Advierte que con varias citas se registra el timeline de una cita en orden aleatorio; no ocultar esta limitación operativa. [CS-D2] |
| Reserva/link/redes | Portal puede ofrecer solicitud asistida o reserva directa separadamente para nuevos/existentes; URL única de todas las sedes o de una sede. D explica CTA web, bio Facebook y anuncios/captions en redes: es enlace, no integración transaccional nativa de cada red. [CS-D3, CS-D4] |
| Confirmación/cancelación/reprogramación | D de Portal permite seña para confirmar y crédito no aplicado en cuenta. D de personal permite cambiar estado, cancelar por paciente/práctica, registrar short notice/no show/motivo y elegir cola, Find New Time o Reschedule Now. Autocancelación/autorreprogramación del paciente en Portal: **No evidenciado** en los artículos leídos. [CS-D3, CS-D5] |
| Espera | Short Call List en C; Reschedule Queue en D conserva detalles de cancelados/no show. No son necesariamente la misma lista. Priorización automática de lista de espera del paciente: **No evidenciado**. [CS-C2, CS-D5] |
| Chatbot/WhatsApp | SMS bidireccional, MMS y email declarados. Chatbot nativo de reserva y WhatsApp API o link integrado: **No evidenciado**; integraciones AI/telefonía listadas no prueban ese canal. [CS-C2, CS-D6] |
| Automatizaciones | ERA posting, verificación de cobertura, planes con débito automático, campañas y solicitudes de reseñas; plan Intelligence añade notas AI, perio por voz y análisis de imágenes Overjet. Alcance por región/contrato debe confirmarse. [CS-C2] |
| Ficha/anamnesis | D técnica enumera perfil, condiciones, alergias, medicación y alertas; formularios/portal y consentimientos en C. [CS-D6, CS-C2] |
| Odontograma/perio/imágenes | Charting, Tx/perio charting, imágenes integradas, casos de laboratorio/orto/cirugía/perio en C. Índice D confirma secciones, no sustituye prueba de charting. [CS-C2, CS-D7] |
| Presupuestos/planes | Tx planning, presentación del caso y beneficios estimados; consentimientos personalizados. Validez de firma argentina: **No evidenciado**. [CS-C2] |
| Caja/cobros/facturas/señas | CS Pay, pay-by-text/email, estados electrónicos, QR de pago, tarjetas y planes con auto-débito declarados. D documenta depósito por sede/motivo y crédito no aplicado; cancelación con depósito puede iniciar devolución. Cierre mensual en C; caja efectivo/apertura arqueo: **No evidenciado**. [CS-C2, CS-D3, CS-D5] |
| MP/obras sociales/liquidaciones/reportes | Mercado Pago, ARCA y obras sociales argentinas: **No evidenciado**. Claims/eligibility/ERA corresponden a otro ecosistema. Provider Payroll aparece en navegación y Payroll en índice D: liquidaciones/comisiones exactas **No evidenciado**, no asumir implementación local. Scorecards, objetivos, análisis por sede/profesional, descargas programadas y audit trails en C. [CS-C2, CS-D7] |
| Integraciones/API/Calendar | Portal técnico declara REST API, webhooks y extracciones programadas; endpoints públicos ilustrativos de citas/cancelación/pacientes/sedes. Referencia completa requiere login. Partners radiología DEXIS, Carestream, Romexis, etc.; Overjet y telefonía/marketing. Google Integration y Google Analytics aparecen como artículos en índice, **no prueba de sincronización Google Calendar**. [CS-D6, CS-D8] |
| Operación/sedes/roles/auditoría/exportación | D Portal respeta acceso por sede; D/índice incluye gestión de usuarios. C seguridad declara permisos por función, audit trail, backup y recuperación. Extracciones programadas en portal técnico; exportación integral al cancelar, costos y SLA: **No evidenciado**. [CS-D3, CS-D6, CS-C3] |
| Soporte | Centro público User Resource Center y envío de solicitud; dirección support@carestack.com; migración y entrenamiento sujetos a complejidad/cotización. Horarios/SLA Argentina y español: **No evidenciado**. [CS-D7, CS-C2] |

### 2.3 Precio, negocio, seguridad y evaluación

- **Precio C USA:** Essentials desde **$829/mes**, Intelligence desde **$1.299/mes**. Página USA con símbolo `$`; se registra como referencia del mercado estadounidense, no ARS. Base depende de sedes, sillones y proveedores; no se presume que todo consultorio pague el mínimo ni se afirma unidad exacta del precio inicial. Usuarios no necesariamente requieren licencia individual. [CS-C2]
- **Extras:** posible fee de implementación por migración/capacitación; VoiceStack, CareRevenue y ACE DSN como adicionales sin monto; terceros pueden trasladar cargos de integración. [CS-C2]
- **API separada, C en portal técnico:** precios USA, mínimo **$100/mes**; práctica **$60/sede/mes** con 10.000 llamadas/sede/mes y **$0,004** por excedente; registro de práctica bonificado. Programa vendor añade **$5.000** de alta una vez y mismo mínimo/cargos. No mezclar estos montos con suscripción PMS. [CS-D6]
- **Seguridad:** C declara HIPAA/Business Associate, permisos por función, trazabilidad, comunicaciones cifradas, backups y formación de empleados; no se auditó. Página `/privacy-policy` devolvió 404 y enlaces de pie se extrajeron como `#`; política integral de privacidad accesible en esa ruta: **No evidenciado**. Cumplimiento argentino y residencia contractual de datos: **No evidenciado**. [CS-C3, CS-B1]
- **Adopción:** corporativa muestra **3.000+ prácticas** y conserva un párrafo de **1.500 prácticas USA**; son claims heterogéneos del proveedor, sin reconciliación ni conteo independiente. Reseñas externas verificadas: **No evidenciado**. [CS-C1]
- **Fortalezas públicas:** documentación detallada de agenda y sobreturnos, diferenciación de reserva directa/solicitud, operación por sedes y circuito de señas/devolución. [CS-D1–CS-D5]
- **Limitaciones públicas:** semántica aleatoria del timeline en solapamientos según manual; costos adicionales/API; referencia API completa con login; disponibilidad Argentina y soporte local no demostrados. [CS-D2, CS-D6]

### 2.4 Fuentes oficiales

Todas consultadas por webfetch el **2026-11-21**.

| ID/tipo | URL | Evidencia principal |
|---|---|---|
| CS-C1 / C | https://carestack.com/company | Empresa, país, segmentos, fundación y adopción |
| CS-C2 / C | https://carestack.com/pricing | Precios, módulos, addons, integraciones y fee de implementación |
| CS-C3 / C | https://carestack.com/dental-software/features/hipaa-compliant | Declaraciones de privacidad/seguridad HIPAA |
| CS-D1 / D | https://carestack.zendesk.com/hc/en-us/articles/25996244132884-A-Detailed-Overview-of-the-Scheduler | Agenda Day/Week, recursos, filtros y descansos; actualización 2026-06-29 |
| CS-D2 / D | https://carestack.zendesk.com/hc/en-us/articles/31695575377044-Double-Booking-of-Appointments-or-Block-Slots | Sobreturnos, bloqueos y efectos en timeline/Portal; actualización 2026-05-05 |
| CS-D3 / D | https://carestack.zendesk.com/hc/en-us/articles/26111222881428-Manage-Online-Appointment-Portal | Reserva/solicitud, sedes, motivos, señas; actualización 2026-08-07 |
| CS-D4 / D | https://carestack.zendesk.com/hc/en-us/articles/23856059194004-Embed-or-Share-Your-Online-Appointment-Portal | Link web/redes, cuenta/sede; actualización 2026-06-09 |
| CS-D5 / D | https://carestack.zendesk.com/hc/en-us/articles/29569741719188-Cancel-Reschedule-Appointments-or-Change-Appointment-Status | Cancelaciones, devolución y cola/reprogramación; actualización 2026-08-07 |
| CS-D6 / D, con sección C de precios | https://developer.carestack.com/ | Catálogo API, integración, partners, costos USA; referencia completa tras login |
| CS-D7 / D, índice | https://carestack.zendesk.com/hc/en-us/categories/25032601787412-CareStack-User-Guide | Entrada a ayuda, clinical/RCM/payroll/seguridad y soporte |
| CS-D8 / D, índice | https://carestack.zendesk.com/hc/en-us/sections/52312496726932-Online-Appointment-Portal | Índice de ayuda de reservas e integraciones Google; no equivale a Calendar |
| CS-B1 / bloqueo | https://carestack.com/privacy-policy | HTTP 404; no usado como evidencia de contenido |

---

## 3. tab32 — Alpine y Summit

### 3.1 Identidad, problema y público

- **Empresa/país/URL:** comunicado identifica **tab32 (Integrated Charts, Inc.)**, sede Roseville, California, EE. UU.; footer dice **tab32, Inc., Sacramento, California**. Se conserva discrepancia, sin inventar relación societaria. URL: <https://tab32.com/>. [TA-C1, TA-C4]
- **Problema:** PMS cloud unificado y seguimiento de pacientes/cobranza que no se limite a enviar recordatorios, sino que proponga/complete tareas; claim comercial. [TA-C1]
- **Segmento/modalidad:** Alpine para consultorio independiente/pequeño, Summit para grupos/DSO, browser/cloud en Google Cloud declarado. Lanzamiento Alpine orientado a EE. UU.; Summit con cotización. [TA-C3, TA-C4]
- **Argentina:** venta, soporte, contratación y localización argentina: **No evidenciado**. No se equipara acceso web a disponibilidad efectiva. Clasificación: inspiración, especialmente para recuperación de huecos. [TA-C3, TA-C4]

### 3.2 Capacidades y casos de uso

**D funcional recuperada:** No evidenciado en esta muestra; páginas de plataforma, producto y lanzamiento son **C**, aunque incluyan capturas y ejemplos de flujos. No elevar esos ejemplos a pruebas.

| Área | Evidencia y alcance |
|---|---|
| Agenda diaria/semanal/profesionales/sillones | C muestra scheduler diario con columnas operatory y estado de sillón/check-in. Distingue días, columnas, horarios y bloqueos configurados para el agente. Vista semanal explícita: **No evidenciado**. [TA-C1, TA-C2] |
| Duración/bloqueos/sobreturnos/solapamiento | Bloqueos de agenda declarados; agente ofrece huecos reales y promete no reservar encima de otra cita. Duraciones por prestación, política de sobreturno manual y validación concurrente en backend: **No evidenciado**. No inferir esas garantías desde copy. [TA-C1, TA-C2] |
| Reserva/link/redes/chatbot | Online booking declarado; URL pública por clínica, integración nativa de redes y chatbot web: **No evidenciado**. C describe agente conversacional por texto que interpreta respuesta, propone horarios y escribe reserva; no demuestra WhatsApp. [TA-C1, TA-C3] |
| Confirmar/cancelar/reprogramar/espera | C declara confirmación por SMS/respuesta automática, rebooking ante no show/cancelación y backfill de waitlist. `Move a day` propone traslados para aprobación y lista no ubicados. Autocancelación del paciente mediante portal y reglas/corte horario: **No evidenciado**. [TA-C1, TA-C2] |
| WhatsApp | WhatsApp API y link WhatsApp: **No evidenciado**. El canal descrito es SMS/texto y llamadas. [TA-C1–TA-C3] |
| Automatizaciones | Recordatorios, recalls, reactivación, tratamiento pendiente, beneficios fin de año, seguimiento postop, huddle diario, eligibility, claim remarks, ERA/EOB posting y apelaciones. Agentes empiezan con aprobación y permisos revocables; el número/paquete debe aclararse. [TA-C1, TA-C2, TA-C4] |
| Ficha/anamnesis | Registro de paciente, formularios, familia y tarjeta guardada declarados. Ejemplo de agente que pide actualizar medical history antiguo; campos y flujo de anamnesis estructurada/validación clínica: **No evidenciado**. [TA-C1, TA-C3] |
| Odontograma/perio/imágenes | Odontograma, notas SOAP/higiene/restauración/cirugía, perio por voz con profundidades/sangrado/supuración/movilidad/furca, imágenes desde sensores/pano/cámara/web TWAIN; todo C. La IA de radiología aparece como addon en home pero como integrada en plataforma: inclusión requiere confirmación. [TA-C1, TA-C3] |
| Presupuestos/planes | Treatment planning declarado; firma de notas por profesional y e-signatures en patient experience. Presupuesto desglosado, vigencia y firma de presupuesto específica: **No evidenciado**. [TA-C1, TA-C3] |
| Caja/cobros/facturas/señas | Ledger, claims, estados electrónicos, ePayment, balances, propuesta de cargo/reintegro con aprobación; stripe en partners. Caja físico/arqueo, factura fiscal y señas de reserva: **No evidenciado**. [TA-C1, TA-C3] |
| MP/obras sociales/liquidaciones/reportes | Mercado Pago, ARCA, obras sociales argentinas y liquidación de honorarios: **No evidenciado**. Producción, collection, recall, aging, KPI por sede/proveedor y cuentas por cobrar declarados; eligibility/claims no demuestran cobertura argentina. [TA-C1, TA-C3] |
| Integraciones | Stripe, Pearl, Overjet, DentalXChange, DrFirst, AutoRemind y plataformas de BI declaradas. Summit: BigQuery/Looker Studio y dashboards multisede. Google Calendar, API pública documentada, WhatsApp API y ARCA: **No evidenciado**; data warehouse no equivale API transaccional. [TA-C3] |
| Sedes/roles/auditoría/exportación | Summit multisede, workflows por sede y success manager; roles, audit trail y SSO Azure/Google declarados. C promete una exportación integral gratis al salir (pacientes, charts, imágenes, ledger) y cancelación en Settings al fin del período. No se verificó integridad ni formato. [TA-C1–TA-C3] |
| Soporte/adopción | Prueba 14 días y sample practice autoservicio; migración guiada cotizada antes de empezar; Summit success manager. Teléfono/horarios/SLA soporte Argentina: **No evidenciado**. [TA-C1–TA-C4] |

### 3.3 Precio, negocio, seguridad y evaluación

- **Precio C:** Alpine desde **US$95/mes/sede** según comunicado, usuarios/profesionales ilimitados en pricing; mes a mes y sin setup declarados. Claims **US$0,25**; attachments **US$0,50/claim**; eligibility **US$0,75/check**. [TA-C2, TA-C4]
- **IA y comunicaciones extras:** voice notes **US$0,20/min**, AI assistant **US$0,02 entrada / US$0,10 salida por 1.000 tokens**, auto-posting **1,25% del claim pagado**; agente **US$25/mes**; paquete catorce **US$325/mes**, Everything **US$349/mes**; textos **US$0,05/mensaje** y llamadas **US$0,05/min** consumen saldo prepago con recarga automática. Precios no constituyen oferta argentina. [TA-C2]
- **Inconsistencias a resolver antes de compra:** pricing/home piden email y tarjeta para prueba, comunicado dice sin datos de pago; pricing dice catorce agentes recurrentes mientras comunicado promociona diecisiete; plataforma dice Alpine 1–3 proveedores y pricing ilimitados; plataforma dice AI built in/not add-ons frente a precios por uso y radiología addon de home. No se armonizan por suposición. [TA-C1–TA-C4]
- **Migración:** cotización y pago anticipados, suscripción desde go-live según home. El resultado de búsqueda mostraba detalles de costo de migración, pero no quedaron expuestos en el cuerpo extraído por fetch de FAQ: **montos de migración No evidenciado por lectura directa**; no se usan snippets. [TA-C1, TA-C2]
- **Privacidad/seguridad:** C declara HIPAA, SOC 2/Type II, BAA incluido, cifrado en tránsito/reposo, GCP, roles, auditoría y SSO. No se accedió al contrato BAA ni al informe SOC. `/privacy-policy/` devolvió 404 pese a estar enlazado en footer. Cumplimiento argentino: **No evidenciado**. [TA-C1, TA-C3, TA-B1]
- **Adopción/reseñas:** comunicado dice **1.500+ clínicas**, **3.000+ proveedores**, **US$455 millones/año** cobrados; claims propios no auditados, no se atribuyen a Alpine recién lanzado ni a Argentina. Reseñas independientes: **No evidenciado**. [TA-C4]
- **Fortalezas públicas:** visibilidad de cargos por uso, exportación/cancelación declaradas y aprobación gradual por tarea; inspiración para automatización supervisada. [TA-C1, TA-C2]
- **Limitaciones públicas:** discrepancias comerciales anteriores, muchos resultados sustentados sólo por C, costo final sensible al uso y adopción/soporte local no demostrado. El claim “never books over” no es una prueba de manejo de carreras de reserva. [TA-C1–TA-C4]

### 3.4 Fuentes oficiales

Todas leídas por webfetch el **2026-11-21**.

| ID/tipo | URL | Evidencia principal |
|---|---|---|
| TA-C1 / C | https://tab32.com/ | Funciones, agente/aprobación, exportación y prueba |
| TA-C2 / C | https://tab32.com/pricing/ | Base, consumo, paquetes de agentes y condiciones |
| TA-C3 / C | https://tab32.com/platform/ | Alpine/Summit, partners, roles, cloud y BI; indica actualización 2026-05-19 |
| TA-C4 / C | https://tab32.com/tab32-launches-alpine-bringing-agentic-ai-to-independent-dental-practices/ | Comunicado 2026-11-09, entidad/sede, mercado USA y adopción |
| TA-B1 / bloqueo | https://tab32.com/privacy-policy/ | HTTP 404; no contenido de política verificado |

---

## 4. Open Dental

### 4.1 Identidad, problema y público

- **Empresa/país/URL:** **Open Dental Software, Inc.**, sede en Estados Unidos declarada en página internacional y entidad nombrada en HIPAA. URL: <https://www.opendental.com/>. Ciudad/sede exacta en las páginas leídas: **No evidenciado**. [OD-C2, OD-D7]
- **Problema/segmento:** gestión clínica/administrativa odontológica mediante software, actualizaciones y soporte; oferta individual, enterprise, escuelas y múltiples sedes. Instalación/autohosting local o remoto; Open Dental Cloud tarifado para USA por separado. [OD-C1]
- **Argentina:** existe **oferta explícita de compra directa para clientes fuera de EE. UU.** y tarifa Other Countries. Argentina nombrada, clientes instalados, disponibilidad específica de cada eService, soporte español oficial o adaptación fiscal: **No evidenciado**. Es candidato internacional potencial a consultar, no adopción/localización argentina confirmada. Soporte oficial limitado a inglés; contactos de español Perú/Uruguay son terceros no avalados como partnership. [OD-C2]

### 4.2 Capacidades y casos de uso

| Área | Evidencia y alcance |
|---|---|
| Agenda diaria/semanal | D explícita Day/Week, semana configurable; vista diaria por Operatories y filtros/vistas por profesional/sede. Se pueden mover citas por drag-and-drop o Pinboard. [OD-D1] |
| Profesionales/sillones/duración | Operatory con proveedor por defecto, horarios por profesional, proveedor secundario de higiene opcional; incrementos temporales, barras de duración y permiso para resize; no se confunde profesional con recurso físico. [OD-D1] |
| Bloqueos/sobreturnos/solapamiento | Blockouts desde clic derecho; preferencia `Appointments allow overlap` permite varias citas simultáneas en mismo operatory, ordenadas por creación. Es sobreturno configurable documentado, no prevención absoluta de conflicto. [OD-D1] |
| Reserva/link/redes | Web Sched nuevos/existentes desde web; Recall por link; citas agregadas automáticamente y alertas al staff. Se puede embeber PatientViewer; Open Dental dice no gestionar/desarrollar la web personalizada. Reserva nativa desde redes: **No evidenciado**. [OD-D2] |
| Confirmación/cancelación/reprogramación | D permite estados y confirmación con permiso; Break/Unsched, reprogramación por Pinboard/drag-and-drop. eConfirmations como servicio pago. Autocancelación/reprogramación libre del paciente por Portal: **No evidenciado** en páginas consultadas. [OD-D1, OD-C1] |
| Espera | ASAP List y Web Sched ASAP: email/SMS con link único para aceptar/rechazar un hueco; crea bloqueo temporal al notificar y guarda historia. Diferenciar sala de espera de pacientes que llegaron de lista ASAP para adelantar citas. [OD-D1, OD-D2] |
| Chatbot/WhatsApp | Integrated Texting es SMS, no WhatsApp. Chatbot de reserva, WhatsApp API y link WhatsApp: **No evidenciado**. [OD-C1, OD-D2] |
| Automatizaciones | Recall manual/automático, avisos de Web Sched, eReminders, eConfirmations, agradecimientos; necesidad de soporte activo y extras según servicio. No se probó scheduler ni envío real. [OD-C1, OD-D2] |
| Ficha/anamnesis | D Chart reúne información médica y notas, Medical Chart y datos del paciente; índice tiene problemas, medicación, alergias e historia médica en Sheets. Formulario/anamnesis argentina validada: **No evidenciado**. [OD-D3, OD-D8] |
| Odontograma/perio/imágenes | D Graphical Tooth Chart muestra restauraciones planificadas/realizadas e historial temporal, dentición, dibujo; botón Perio Chart, imágenes por categorías, radiografías/fotos. No todas las funciones requieren software externo: el manual contiene Imaging Module y compatibilidad de sensores. [OD-D3, OD-D8] |
| Presupuestos/planes | D planes activos/inactivos/guardados, prioridades, costos, descuentos, estimación seguro/paciente, impresión/email y firma electrónica. Límite: un activo por paciente; varios inactivos. No demuestra firma digital con validez argentina. [OD-D4] |
| Caja/cobros/facturas/señas | D Account: payments, refunds, ajustes, receipt/invoice/statement, cuotas/planes y prepayment/unearned balance. Índice incluye contabilidad y deposit slip; arqueo/caja argentina: **No evidenciado**. Prepayment no implica seña automática en reserva Web Sched. [OD-D5, OD-D8] |
| MP/obras sociales/liquidaciones/reportes | Mercado Pago, ARCA, obras sociales y liquidación de honorarios argentina: **No evidenciado**. Hay seguros/claims/beneficios/ERA norteamericanos, reportes y producción diaria por proveedor. No equiparar paysplits a liquidación profesional completa. [OD-D1, OD-D4, OD-D5, OD-D8] |
| Integraciones | Índice oficial documenta API Setup, bridges DEXIS/Carestream/Planmeca y muchos más, pagos PayConnect/XCharge/PaySimple/Edge Express, QuickBooks, firma y marketing. Sólo se constata catálogo: compatibilidad exacta por versión/dispositivo no probada. Google Calendar, WhatsApp API y ARCA: **No evidenciado**. [OD-D8] |
| Sedes/roles/auditoría/exportación | Clinics cambia vistas; permisos por usuario/grupo e historial según áreas en manual. D Chart avisa que notas libres del odontograma **no** tienen historia; D Account dice notas Family Financial **no** van al Audit Trail. Backup y acceso a datos propios no prueban una exportación clínica completa estándar: formatos/plazos/costos de salida **No evidenciado**. [OD-D1, OD-D3, OD-D5, OD-D7, OD-D8] |
| Soporte/adopción | Teléfono/chat/email incluidos en soporte, inglés oficial; entrenamiento online/onsite y conversión pagos, webinars gratuitos. En autohosting el cliente gestiona infraestructura/backups/seguridad; no asumir operación cero mantenimiento. [OD-C1, OD-C2, OD-D7] |

### 4.3 Precio, negocio, seguridad y evaluación

- **USD/mes/sede, C oficial:** USA **US$199** por 12 meses iniciales; tarifa reducida actual **US$149** tras 12 meses consecutivos (la efectiva será la publicada al llegar al mes 13). **Other Countries US$89/mes/sede**, contrato 12 meses, hasta tres providers por oficina; excedentes **US$20/mes/provider**, sin contar higienistas. Elegibilidad de Argentina para tarifa de países en desarrollo gratuita: **No evidenciado; no asumir**. [OD-C1]
- **Extras:** eServices Bundle **US$165/mes/sede**; Web Sched Recall **US$75**, nuevos+existentes **US$75**, ASAP **US$20** o incluido con Recall; eConfirmations **US$25** o **US$40** con Landline Texting; texting con costo de acceso y consumo regional. Open Dental Cloud, conversión, imágenes, formación/consultas específicas y servicios de terceros pueden sumar. Capacitación online **US$80/h**; impuestos no incluidos. [OD-C1]
- **Condiciones/adopción:** contrato inicial y luego mes a mes; cancelación por llamada; garantía de 90 días con requisitos y exclusiones. Demos de Web Sched enlazadas pero **no ejecutadas**. No se obtuvo cifra de prácticas instaladas con método verificable en esta muestra. Referencias comerciales disponibles a pedido, no reseñas independientes. [OD-C1, OD-D2]
- **Privacidad/seguridad D:** página HIPAA explícitamente pone responsabilidad de cumplimiento en cada consultorio, exige atender backup, antivirus, permisos y cifrado reposo/tránsito; BAA publicado actualizado febrero 2026. Reconoce que otras jurisdicciones tienen otras leyes. Esto no certifica por sí mismo una instalación ni cumplimiento argentino. [OD-D7]
- **Fortalezas públicas:** manual profundo y explícito de modelos/casos límite, agenda diaria/semanal, recursos y sobreturnos; alternativa de control de infraestructura y venta internacional publicada. [OD-D1, OD-C2]
- **Limitaciones públicas:** varios eServices con cargos, soporte inglés, Cloud oficial precio USA, trabajo técnico al autohospedar; exclusiones de auditoría concretas en notas libres; “software open” no significa costos totales cero. [OD-C1, OD-C2, OD-D3, OD-D5, OD-D7]

### 4.4 Fuentes oficiales

Todas leídas por webfetch el **2026-11-21**. Páginas `/manual/` muestran manual v24.4 y selector de versiones; no se afirma que sean todas la versión vigente instalada en 2026.

| ID/tipo | URL | Evidencia principal |
|---|---|---|
| OD-C1 / C | https://www.opendental.com/site/fees.html | Tarifas, países, extras, entrenamiento, contratos y cancelación |
| OD-C2 / C | https://www.opendental.com/site/countries.html | Compra internacional y limitación de idioma/soporte |
| OD-D1 / D | https://www.opendental.com/manual/appointments.html | Agenda, recursos, duración, solapamiento, estados y listas |
| OD-D2 / D | https://www.opendental.com/site/websched.html | Descripción funcional de Web Sched/ASAP, requisitos y links de demos |
| OD-D3 / D | https://www.opendental.com/manual/chart.html | Ficha, odontograma, notas, imágenes y límites de historia |
| OD-D4 / D | https://www.opendental.com/manual/treatmentplan.html | Planes, presupuestos, firma y limitaciones |
| OD-D5 / D | https://www.opendental.com/manual/account.html | Cobros, anticipos, invoices y notas fuera de auditoría |
| OD-D7 / D, política técnica | https://www.opendental.com/site/hipaa.html | Responsabilidad del consultorio, BAA y seguridad |
| OD-D8 / D, índice | https://www.opendental.com/manual/manual.html | Módulos clínicos, contables, seguridad, bridges y API; no prueba de cada integración |

Bloqueos de navegación: `/manual/websched.html` y `/manual/securitylog.html` dieron 404; Web Sched se encontró en la ruta oficial `/site/websched.html`. No se usa el 404 como prueba de ausencia funcional.

---

## 5. Curve Dental

### 5.1 Identidad, problema y público

- **Empresa/país/URL:** **CD Newco, LLC d/b/a Curve Dental**, domicilio Alpharetta, Georgia, EE. UU.; página corporativa declara oficinas también en Provo, Calgary y Aberdeen. Fundada en 2004. URL <https://www.curvedental.com/>. [CU-C1, CU-C7]
- **Problema:** PMS, clínica, imágenes, agenda, billing y engagement en plataforma común; segmento consultorio independiente, startup y grupos/multisede. Browser SaaS, PC/Mac, conectividad necesaria y actualizaciones continuas. [CU-C1–CU-C3]
- **Argentina:** página About circunscribe adopción USA/Canadá. FAQ dice acceso remoto desde cualquier parte; eso **no** evidencia contratación o servicios de pago/seguro en Argentina. Comercialización/localización/soporte Argentina: **No evidenciado**. Clasificación: inspiración internacional. [CU-C1, CU-C2]

### 5.2 Capacidades y casos de uso

**D funcional recuperada:** No evidenciado en esta muestra. FAQ menciona Curve Community con artículos/videos, pero las páginas de funciones leídas son **C**. No llamar manual a sus claims de producto.

| Área | Evidencia y alcance |
|---|---|
| Agenda diaria/semanal/profesionales/sillones | C agenda maestra con vistas personalizadas por operatory/provider, Sidekick y acceso móvil; vista diaria/semanal explícita como modos separados: **No evidenciado** en el texto leído. [CU-C4] |
| Duración/bloqueos/sobreturnos/solapamientos | Incrementos configurables, duraciones preseleccionadas para recare, drag-and-drop y bloqueos de fecha/hora. Sobreturnos autorizados, comprobación de simultaneidad y política de conflictos: **No evidenciado**. [CU-C4] |
| Reserva/link/redes | Self-scheduling con escritura instantánea declarada; habilitación por nuevos/existentes y tipos de cita. Partner Zocdoc sincroniza disponibilidad/reservas. URL pública por clínica/redes y reserva nativa Instagram: **No evidenciado**. [CU-C4, CU-C5, CU-C8] |
| Confirmar/cancelar/reprogramar | Recordatorios SMS/email y mensajería bidireccional; manejo staff de cambios por drag-and-drop. Acción de paciente de confirmar, autocancelar o autorreprogramar con reglas/ventanas: **No evidenciado** en las páginas leídas; no inferirla del objetivo de reducir cancelaciones. [CU-C4, CU-C5] |
| Espera | Smart Fill identifica pacientes de short-notice, recare pendiente o tratamiento filtrado por CDT y permite mensaje grupal. No es prueba de asignación automática del hueco ni de lista de espera autogestionada por paciente. [CU-C4] |
| Chatbot/WhatsApp | Curve Chat es chat interno entre usuarios/sedes. Partner Review Wave anuncia AI answering/webchat; alcance de chatbot nativo para reservas: **No evidenciado**. WhatsApp API, click-to-chat y recordatorios WhatsApp: **No evidenciado**. [CU-C5, CU-C8] |
| Automatizaciones | Campañas recordatorio/recare, solicitudes de review, comunicaciones grupales, membership enrollment/billing/posting, eligibility AI y documentación clínica por voz. No ejecución medida. [CU-C3, CU-C5, CU-C9] |
| Ficha/anamnesis | Datos y registros de paciente, health history accesible desde agenda; Smart Forms personalizables y portal de formularios. Anamnesis estructurada completa, versionado y consentimiento local: **No evidenciado** en detalle. [CU-C1, CU-C4, CU-C9] |
| Odontograma/perio/imágenes | Restorative charting, gráficos perio anatómicos, imágenes nativas direct-to-cloud y Care+ notas/charting/perio declarados. Es C, no revisión de exactitud clínica ni validación regulatoria argentina. [CU-C3, CU-C9] |
| Presupuestos/planes/firma | Planes personalizables con datos de seguro en tiempo real y eSignature; GRO incluye testimonio de envío de plan por texto para firmar, que no se toma como prueba independiente. Importes/vigencia/plantillas de presupuesto: **No evidenciado** en detalle. [CU-C5, CU-C9] |
| Caja/cobros/facturas/señas | Patient/insurance billing, pagos online, Curve Pay, conciliación y depósitos bancarios next-day declarados. “Deposits” bancarios **no prueba seña de reserva**. Caja/arqueo efectivo, factura ARCA y señas: **No evidenciado**. [CU-C3, CU-C9] |
| MP/obras sociales/liquidaciones/reportes | Mercado Pago, obras sociales argentinas y liquidaciones profesionales: **No evidenciado**. eClaims/ERA/eligibility son oferta de otro mercado. Reports estándar/custom y business analytics/huddle declarados. [CU-C3, CU-C9] |
| Integraciones | Partners: Stripe/Curve Pay, GPI, CareCredit, Affirm/Klarna; Pearl/Bola AI, DrFirst, DentalXChange/Vyne, marketing/reputación y Zocdoc. Google Calendar, API pública de propósito general y ARCA: **No evidenciado**; no confundir Zocdoc calendar integration con Google Calendar. [CU-C8] |
| Sedes/roles/auditoría/exportación | FAQ: centralización DSO, permisos por función/sede y base separada por cliente; C política de datos permite exportar copia legible compatible con Excel. Auditoría funcional granular de cambios del usuario: **No evidenciado**; auditoría física de datacenter no equivale a ese log. Cobertura exacta de exportación de imágenes/firmas e historial: **No evidenciado**. [CU-C2, CU-C6] |
| Soporte/adopción | C pricing anuncia 24/7/365 teléfono/email/infobase/emergencia; FAQ seis sesiones de capacitación de 90 min, comunidad, webinars y conversión desde más de 90 sistemas, 4.000+ conversiones declaradas. Horarios/SLA comercial aplicable a Argentina: **No evidenciado**. [CU-C2, CU-C3] |

### 5.3 Precio, negocio, seguridad y evaluación

- **Precio C:** cotización personalizada; monto, moneda y periodicidad contractual concreta **No evidenciado** en pricing leído. Distingue cargos/licencias e implementación con condiciones especiales para startups pero sin valores. No adoptar precios de reseñas como oficiales. [CU-C3]
- **Inclusiones/extras:** pricing lista front office, clínica, eClaims/ERA/eligibility, soporte, analytics, GRO e imágenes; eso no cuantifica comisiones de processing, conversión, módulos AI/móvil, impuestos ni plazo mínimo. Solicitar cotización escrita; extras en monto **No evidenciado**. [CU-C3]
- **Seguridad C/C-legal:** FAQ declara AWS, backups continuos, pruebas de intrusión y auditorías externas; ISO 27001 allí referida a AWS, no asumir certificación de Curve. Política de datos declara cifrado, aislamiento de DB, réplicas y snapshots; advierte que cache del navegador puede contener PHI y el cliente debe proteger dispositivo. [CU-C2, CU-C6]
- **Privacidad:** política efectiva **2020-01-23** aplica al sitio/marketing y **excluye explícitamente** información tratada por cuenta de clientes, regida por contratos; no usarla como contrato clínico. Describe posibles transferencias a EE. UU./otros países. BAA clínico, residencia contractual precisa y cumplimiento argentino: **No evidenciado**. [CU-C7]
- **Adopción/reseñas:** About declara **100.000+ profesionales activos**, **6.000+ sedes USA/Canadá**. Pricing/GRO tienen testimonios nominales; son C, no reseñas independientes verificadas ni ahorro generalizable. [CU-C1, CU-C3, CU-C5]
- **Fortalezas públicas:** PMS más imágenes/engagement, Smart Fill segmentado, recursos y permisos multisede, exportación declarada y onboarding especificado. [CU-C2–CU-C6]
- **Limitaciones públicas:** precio total no publicado, predominio C sin manual funcional recuperado, dependencia de internet, cache local sensible y política web no cubre datos clínicos; contratación/localización argentina sin evidencia. [CU-C2, CU-C3, CU-C6, CU-C7]

### 5.4 Fuentes oficiales

Todas leídas por webfetch el **2026-11-21**.

| ID/tipo | URL | Evidencia principal |
|---|---|---|
| CU-C1 / C | https://www.curvedental.com/about | Fundación, oficinas, mercado y adopción |
| CU-C2 / C | https://www.curvedental.com/faq | Cloud, capacitación, sedes, roles, AWS y conversión |
| CU-C3 / C | https://www.curvedental.com/pricing | Cotización, inclusiones declaradas, soporte y testimonios |
| CU-C4 / C | https://www.curvedental.com/dental-scheduling-software | Agenda, recursos, duración, bloqueos, Smart Fill y reservas |
| CU-C5 / C | https://www.curvedental.com/dental-patient-engagement-software | SMS/email, recare, campañas, pagos y chat interno |
| CU-C6 / C-legal | https://www.curvedental.com/data-policy | Seguridad de datos, cache, copias y exportación |
| CU-C7 / C-legal | https://www.curvedental.com/privacypolicy | Entidad, alcance web/marketing, exclusión datos de clientes, transferencias |
| CU-C8 / C | https://www.curvedental.com/partner-list | Partners concretos de pagos, IA, seguros, marketing y Zocdoc |
| CU-C9 / C | https://www.curvedental.com/feature-overview | Clínica, reportes, formularios, planes/firma y Curve Pay |

---

## Preguntas pendientes para una validación posterior

1. Confirmar con cada proveedor si vende, factura y da soporte a una clínica argentina, con contrato y lista de funciones/regiones; Open Dental publica canal internacional, no certificación argentina.
2. Exigir demostración de agenda diaria/semanal, profesional versus sillón, duración por prestación, permisos de sobreturno y concurrencia real de dos reservas por el mismo slot.
3. Separar recordatorio de confirmación, cancelación, reprogramación y lista de espera; distinguir automatización real de mensaje que requiere intervención humana.
4. Si se necesita WhatsApp, pedir evidencia de Business Platform/API, proveedor, opt-in, templates, costos y delivery; un link compartible y SMS no son equivalentes.
5. Verificar Mercado Pago, señas y devoluciones, ARCA, obras sociales/nomencladores y liquidaciones de honorarios argentinas mediante documentación o demo específica; **No evidenciado en esta investigación**.
6. Pedir exportación de prueba con ficha, anamnesis versionada, odontograma, perio, imágenes, consentimientos, cobros y auditoría; validar formatos, integridad, costo y retención tras baja.
7. Obtener condiciones actuales de seguridad/datos clínicos y evidencia de auditoría, no sólo política web/claims. HIPAA no acredita adecuación argentina.
8. Verificar reseñas independientes directamente y con fecha/contexto, sin extrapolar testimonios oficiales ni ratings reproducidos por blogs.

## Bloqueos y alcance del entregable

- tab32 privacidad y CareStack privacidad devolvieron 404 en las rutas registradas; se mantuvieron como bloqueos, sin evasión ni inferencia de contenido.
- Curva de aprendizaje, satisfacción, desempeño, tasa real de no-show, eficacia AI y exactitud de integraciones **no evaluadas en ejecución**.
- Algunos índices de ayuda se usaron sólo para localizar categorías; una entrada de índice no demuestra el comportamiento completo del flujo.
- Sólo se creó esta ficha en `discovery/research/internacional.md`. No se creó `discovery/discovery.md` ni se modificó estado de aprobación/fundación.
