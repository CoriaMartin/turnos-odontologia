# Informe de Discovery

## Turnos Odontología

**Trabajo integrador académico**

**Proyecto:** Sistema de gestión de turnos odontológicos.

**Equipo:** 4 integrantes, autorizado por la cátedra.

**Fecha de investigación:** 21 de noviembre de 2026.

**Fecha de verificación manual:** 24 de noviembre de 2026.

**Entregable:** C-19 - Informe Discovery y entrega.

<div style="page-break-after: always;"></div>

# Informe competitivo de sistemas odontológicos

**Fecha de corte y consulta documental: 21 de noviembre de 2026.**

## Resumen ejecutivo y alcance

Se consolidan **16 productos**: seis de la ficha argentina/regional, cinco latinoamericanos adicionales y cinco internacionales. Es una muestra intencional, no un censo ni una estimación de participación de mercado. El orden prioriza pertinencia para una clínica argentina; la matriz mide **cobertura documental**, no desempeño, satisfacción, seguridad efectiva ni calidad clínica.

Se recomienda solicitar, sujeto a disponibilidad comercial, cinco demostraciones: **Bilog, DentalSoft, Odonthia, Dentalink y OdontoSoft Millennium**. Las tres referencias documentales de UX son **Dentally** (reserva y cancelación), **CareStack** (agenda y recuperación de citas) y **Codental** (profesionales y sillones). No se ensayó su usabilidad.

El análisis competitivo permitió identificar hipótesis iniciales de funcionalidades y oportunidades de diferenciación. Posteriormente, el equipo definió un MVP acotado a un consultorio odontológico con un profesional y un sillón, centrado en la gestión interna de turnos, agenda diaria y semanal, pacientes, prestaciones, configuración del consultorio y recordatorios por email.

La autogestión de pacientes, la historia clínica, la exportación integral de datos y las integraciones adicionales quedan fuera del alcance inicial.

**El alcance definitivo del MVP y su justificación se documentan en la sección D.5.** Las hipótesis originales del análisis competitivo se conservan como antecedentes y oportunidades futuras.

### Método y lectura de referencias

- Base metodológica y rúbrica: [metodología y normativa](../../discovery/research/metodologia-y-normativa.md). Fichas completas: [Argentina y referentes chilenos](../../discovery/research/argentina.md), [Latinoamérica](../../discovery/research/latinoamerica.md), [internacionales](../../discovery/research/internacional.md).
- **D:** documentación funcional; acredita un comportamiento descrito, no ejecutado. **C:** afirmación comercial. Una política o contrato acredita una declaración legal, no implementación ni cumplimiento. En la ficha internacional se rotulan C-legal; en las otras, D-legal: aquí ambas se consideran **evidencia legal declarativa**, no manual funcional.
- **R:** evidencia externa atribuible. En las fichas regionales también identifica registros de tiendas; una descarga o calificación de app no equivale a una reseña narrativa verificada ni a un usuario activo.
- **No evidenciado:** faltó respaldo suficiente en lo leído; no significa ausencia. Una ausencia explícita se identifica separadamente. No se usa marketing como función probada ni se contabilizan anuncios «próximamente» como disponibilidad actual.
- Cada fila remite a su ficha y a identificadores de fuente. Los ID se resuelven en la bibliografía final o, para fuentes complementarias, en el registro completo de la ficha enlazada; todos tienen consulta 2026-11-21. Los límites forman parte de la comparación.
- No hubo cuentas, contratación, demos, ejecución, auditorías ni contacto comercial. No se convierte moneda; cotización no es precio cero. Nube, HIPAA, LGPD o infraestructura AWS no acreditan cumplimiento argentino.

## A. Comparación de los 16 productos

### A.1 Identidad, segmento, modalidad y relevancia argentina

Orden editorial: vínculo argentino explícito; recepción comercial regional o cercanía lingüística; referencias regionales con reglas útiles; compra internacional publicada; inspiración internacional. Dentro de cada grupo no se pretende medir cuota ni calidad. Dentis365 antecede a Brasil por idioma documentado, no por disponibilidad argentina comprobada.

| N.º | Producto / ficha completa | Empresa y país | Segmento y modalidad | Pertinencia y límite argentino / fuentes | URL oficial |
|---:|---|---|---|---|---|
| 1 | [Bilog](../../discovery/research/argentina.md#4-bilog) | Empresa orientada a Argentina; razón social No evidenciado | Consultorios, clínicas y gerenciadoras; web, mobile y escritorio mencionados, sin paridad acreditada | Obras sociales y soporte local declarados; ARCA No evidenciado. BI1–BI3, BI6 | <https://www.bilog.com.ar/> |
| 2 | [DentalSoft](../../discovery/research/argentina.md#5-dentalsoft) | Equipo argentino, La Plata/Rosario; razón social No evidenciado | Consultorios y clínicas; SaaS navegador | Mercado Pago de pacientes y API Meta declarados; ARCA No evidenciado. DS1–DS6 | <https://dentalsoft.com.ar/> |
| 3 | [Odonthia](../../discovery/research/argentina.md#6-odonthia) | Genera Impacto; responsable Manuel Sabio, Argentina | Consultorios/equipos; SaaS, gestión gratuita y extras pagos | Reglas operativas locales documentadas; no emite comprobantes fiscales. OD1–OD7 | <https://odonthia.com/> |
| 4 | [OdontoSoft Millennium](../../discovery/research/argentina.md#3-odontosoft-millennium--gb-systems) | GB Systems fundada en Buenos Aires; también LLC en EE. UU. | Consultorios/clínicas; Windows local/red, compra o suscripción; web opcional | Obras sociales/prepagas expresas; soporte tecnológico actual y ARCA No evidenciado. OS1–OS4 | <https://gbsystems.com/os/producto.htm> |
| 5 | [Dentalink](../../discovery/research/argentina.md#1-dentalink) | Engenis SpA / Healthatom, Chile | Independientes, clínicas y multicentro; SaaS | Argentina en formulario de cotización; no prueba adaptación fiscal ni clientes locales. DL1–DL4 | <https://www.softwaredentalink.com/> |
| 6 | [Dentidesk](../../discovery/research/argentina.md#2-dentidesk) | Servicios Tecnológicos e Informáticos Dentales Dentidesk Chile SpA, Chile | Clínicas, instituciones y universidades; SaaS multisucursal | Operación argentina No evidenciado; términos y fiscalidad de otros países. DD1–DD3 | <https://www.dentidesk.com/> |
| 7 | [Dentis365](../../discovery/research/latinoamerica.md#5-dentis365-méxico-identidad-confirmada) | Soluciones en Software y Procesos S.A. de C.V., México | Consultorios/clínicas y sucursales; web/app | Operación argentina No evidenciado; idioma español no la acredita. DE1–DE3 | <https://www.dentis.com.mx> |
| 8 | [Simples Dental](../../discovery/research/latinoamerica.md#1-simples-dental) | Simples Dental Software SA, Brasil | Consultorios, clínicas y redes; online/apps | Contrato brasileño; Argentina No evidenciado. SD1–SD4 | <https://www.simplesdental.com/planos-e-precos> |
| 9 | [Codental](../../discovery/research/latinoamerica.md#4-codental-brasil) | Codental Serviços Web Ltda, Brasil | Consultorios/clínicas; navegador/apps, planes por agendas | Argentina No evidenciado; referencia de sillones y Calendar. CO1–CO4 | <https://www.codental.com.br/preco> |
| 10 | [Clinicorp](../../discovery/research/latinoamerica.md#2-clinicorp) | Clinicorp Serviços S.A., Brasil | Consultorios, clínicas, redes/franquicias y estética; nube/app | Orientación brasileña explícita; Argentina No evidenciado. CL1, CL4–CL6 | <https://www.clinicorp.com/planos> |
| 11 | [Dental Office](../../discovery/research/latinoamerica.md#3-dental-office-brasil) | Dental Office S.A., Brasil | Consultorios/clínicas; navegador/app; Compacto solo app; oferta educativa separada | Argentina No evidenciado; página de agenda devolvió Capim y se excluyó. DO1–DO5 | <https://www.dentaloffice.com.br/planos/> |
| 12 | [Open Dental](../../discovery/research/internacional.md#4-open-dental) | Open Dental Software, Inc., EE. UU. | Consultorios, enterprise, escuelas/multisede; instalación/autohosting y Cloud USA separado | Compra internacional publicada; Argentina y eServices locales No evidenciado; soporte oficial inglés. OD-C1–OD-C2 | <https://www.opendental.com/> |
| 13 | [Dentally](../../discovery/research/internacional.md#1-dentally) | Entidad UK: Henry Schein One UK LTD, Reino Unido | Consultorios y multisede; SaaS por surgeries/sitio | Regiones UK/Irlanda/APAC/Canadá; Argentina No evidenciado. DE-C1–DE-C3 | <https://www.dentally.com/en-gb/> |
| 14 | [CareStack](../../discovery/research/internacional.md#2-carestack) | Good Methods Global Inc., EE. UU.; presencia en India | Independientes, especialistas y DSO; SaaS USA/UK/AUS | Contratación y localización argentina No evidenciado. CS-C1–CS-C2 | <https://carestack.com/> |
| 15 | [tab32](../../discovery/research/internacional.md#3-tab32--alpine-y-summit) | Integrated Charts, Inc. en comunicado / tab32, Inc. en pie; relación societaria No evidenciado; EE. UU. | Alpine independientes y Summit grupos/DSO; SaaS | Lanzamiento Alpine USA; Argentina No evidenciado. TA-C1–TA-C4 | <https://tab32.com/> |
| 16 | [Curve Dental](../../discovery/research/internacional.md#5-curve-dental) | CD Newco, LLC d/b/a Curve Dental, EE. UU. | Independientes, startups y grupos; SaaS PC/Mac | Adopción declarada USA/Canadá; acceso remoto no prueba contratación argentina. CU-C1–CU-C3, CU-C7 | <https://www.curvedental.com/> |

### A.2 Agenda digital, automatización y experiencia del paciente

Toda capacidad es documental o comercial según el ID, nunca una prueba ejecutada. «Espera» distingue pacientes presentes de lista para recuperar cupos.

| Producto / ficha | Agenda y recursos | Reserva, automatización y paciente | Límite decisivo / fuentes |
|---|---|---|---|
| [Bilog](../../discovery/research/argentina.md#4-bilog) | Día/semana/profesional/sucursales, duración móvil y sobreturnos C | Reserva/cancelación online; WhatsApp masivo iniciado manualmente; respuestas actualizan agenda | API Meta, sillón limitado y lista de espera No evidenciado. BI1, BI3–BI4 |
| [DentalSoft](../../discovery/research/argentina.md#5-dentalsoft) | Día/semana/mes, bloqueos y conflicto de profesional con excepción C | Pro reserva online, recordatorios Meta, link confirma/cancela; Gestión manual | Sillones y autorreprogramación No evidenciado; IA conversacional solo C. DS1–DS2, DS4 |
| [Odonthia](../../discovery/research/argentina.md#6-odonthia) | Día/semana/mes; capacidad de sillones, bloques y excepción D | Link/QR; solicitud requiere aprobación y ocupa cupo; WhatsApp manual o Meta/créditos, emails | Horizonte 30 días; link no reprograma; víspera fija sin link ni cambio automático por respuesta. OD3–OD5 |
| [OdontoSoft Millennium](../../discovery/research/argentina.md#3-odontosoft-millennium--gb-systems) | Día/dos días/semana por doctor; duración C | Email/SMS y campañas; reserva online y WhatsApp No evidenciado | Reglas de sillones, conflictos y autoservicio No evidenciado. OS2 |
| [Dentalink](../../discovery/research/argentina.md#1-dentalink) | Día/semana, sillones, sobreturnos y reprogramación masiva C | Ayuda de link online D parcial; confirmaciones WhatsApp/email e IA de atención C | API Meta, lista de cupos y concurrencia No evidenciado; sala de espera no equivale a lista. DL1–DL3, DL6–DL7 |
| [Dentidesk](../../discovery/research/argentina.md#2-dentidesk) | Franjas, intervalos y feriados; estados C | Link web; email confirma/anula; WhatsApp abre sesión del operador | Automático WhatsApp anunciado futuro; sillones y lista No evidenciado. DD1–DD3 |
| [Dentis365](../../discovery/research/latinoamerica.md#5-dentis365-méxico-identidad-confirmada) | Agenda multiprofesional C; vistas y recursos No evidenciado | Reserva online y asistente WhatsApp confirma/reprograma/cancela C | API Meta, reglas de conflicto y costos posteriores de mensajes No evidenciado. DE1, DE3 |
| [Simples Dental](../../discovery/research/latinoamerica.md#1-simples-dental) | Semana/sillones/bloqueos y encaixes C | Reserva, app paciente, confirmación WhatsApp/SMS con saldo D; reactivación C | API Meta y autocancelación No evidenciado; secretaria IA en pre-lanzamiento. SD1–SD4 |
| [Codental](../../discovery/research/latinoamerica.md#4-codental-brasil) | Día/semana/sillón/duración; alerta eludible y cotejo solo de inicio D | Link, confirmación manual o con créditos; API Meta declarada C | No exclusión estricta de intervalos; autorreprogramación y lista de anticipación No evidenciado. CO1, CO3–CO5 |
| [Clinicorp](../../discovery/research/latinoamerica.md#2-clinicorp) | Día/semana/mes y duración por atención en blog C | Reserva, confirmaciones, CRM/CRC y agentes WhatsApp C | Sillones, regla transaccional y API Meta No evidenciado. CL1–CL3 |
| [Dental Office](../../discovery/research/latinoamerica.md#3-dental-office-brasil) | Agenda C; vistas/sillones/reglas No evidenciado | Reserva del paciente, lista de espera, WhatsApp Web o automático por créditos C | Detalles de agenda no atribuibles por contenido Capim; API Meta No evidenciado. DO1, DO4–DO5 |
| [Open Dental](../../discovery/research/internacional.md#4-open-dental) | Día/semana, operatories, duración y overlap configurable D | Web Sched, Recall y ASAP con aceptación de hueco/bloqueo temporal; SMS, no WhatsApp | eServices con extras; disponibilidad regional por confirmar. OD-D1–OD-D2, OD-C1 |
| [Dentally](../../discovery/research/internacional.md#1-dentally) | Profesional/sesión/duración; retención de cupo D; override API legacy D | Portal con OTP, seña, cancelación y nueva reserva D | Cancelación hasta 48 h antes; mínimo reserva 1 h no ajustable; WhatsApp No evidenciado. DE-D1–DE-D3 |
| [CareStack](../../discovery/research/internacional.md#2-carestack) | Día/semana por sillón/profesional; sobreturno manual D | Portal solicitud o directo, seña, cola de reprogramación del personal D; SMS C | Timeline aleatorio de una cita al superponer; autoservicio cancelación y WhatsApp No evidenciado. CS-D1–CS-D5 |
| [tab32](../../discovery/research/internacional.md#3-tab32--alpine-y-summit) | Agenda por operatory y bloqueos C | Agentes SMS, confirmación, rebooking y backfill; propuestas con aprobación C | Sin manual funcional recuperado; WhatsApp y garantía de concurrencia No evidenciado. TA-C1–TA-C3 |
| [Curve Dental](../../discovery/research/internacional.md#5-curve-dental) | Operatory/provider, duración, bloques y drag-and-drop C | Self-scheduling, recare, Smart Fill segmentado y SMS/email C | Autocancelación, asignación automática de hueco y WhatsApp No evidenciado. CU-C4–CU-C5 |

### A.3 Clínica, administración e integraciones

| Producto / ficha | Clínica | Administración y cobros | Integraciones/localización y límites / fuentes |
|---|---|---|---|
| [Bilog](../../discovery/research/argentina.md#4-bilog) | Historia, anamnesis, odontograma, adjuntos y presupuestos C; perio No evidenciado | Caja/cierres, coberturas, liquidaciones C | Firma electrónica, no digital certificada; MP pacientes y ARCA No evidenciado. BI1, BI4–BI6 |
| [DentalSoft](../../discovery/research/argentina.md#5-dentalsoft) | Antecedentes, historia, odontograma histórico, planes e imágenes C; perio No evidenciado | Caja, cierres, comisiones y obras sociales; MP/seña Pro C | Pago aprobado crea turno; reintegro no revierte caja solo; Calendar salida unidireccional; ARCA No evidenciado. DS1–DS3 |
| [Odonthia](../../discovery/research/argentina.md#6-odonthia) | Antecedentes, odontograma, evolución versionada, planes y firma electrónica; perio solo índice | Caja/cuenta, seña manual, coberturas/copagos y comisión por persona D | No factura fiscal; MP/dLocal pagan suscripción, no pacientes; iCal no instantáneo; MCP sin historia/adjuntos. OD3–OD9 |
| [OdontoSoft Millennium](../../discovery/research/argentina.md#3-odontosoft-millennium--gb-systems) | Anamnesis, odontograma histórico, periodontal gráfico, especialidades e imágenes C | Cuenta paciente/empresa, obras sociales/prepagas, pagos y liquidaciones C | CSV agenda manual, web opcional; MP, WhatsApp y ARCA No evidenciado. OS2–OS3 |
| [Dentalink](../../discovery/research/argentina.md#1-dentalink) | Historia, odonto/perio, imágenes, planes, consentimientos C | Caja, cuotas; inventario, convenios y liquidaciones desde Pro C | API y firma adicionales; MP/ARCA y coberturas argentinas No evidenciado; Copilot «próximamente» en planes. DL1–DL3 |
| [Dentidesk](../../discovery/research/argentina.md#2-dentidesk) | Anamnesis, odontograma, fichas especializadas, planes y archivos C; perio gráfico No evidenciado | Ingresos/egresos, convenios y producción profesional C | SII Chile/Alegra DGII RD no ARCA; firma anunciada sin método certificado. DD1–DD3 |
| [Dentis365](../../discovery/research/latinoamerica.md#5-dentis365-méxico-identidad-confirmada) | Historia, odonto/perio por voz, presupuestos, imágenes y laboratorio C | Cobros/saldos/ingresos/gastos C; liquidaciones profesionales No evidenciado | WhatsApp/email/videoconsulta C; ARCA, MP y firma No evidenciado; IA radiológica/resumen futuros. DE1–DE3 |
| [Simples Dental](../../discovery/research/latinoamerica.md#1-simples-dental) | Anamnesis, archivos, firmas y planes D; odontograma C; perio No evidenciado | Cajas, débitos y Simples Pay/Asaas D; comisiones y reportes | Boleto/Pix/tarjeta y nota fiscal extra no localización argentina; Alexa y extensión Web C. SD1–SD4 |
| [Codental](../../discovery/research/latinoamerica.md#4-codental-brasil) | Anamnesis previa del paciente, odonto, archivos, presupuestos y firmas C; perio No evidenciado | Caja, cuotas, comisiones, Asaas y nota fiscal C/legal | Calendar en ambos sentidos descrito; datos enviados deben revisarse; MP/ARCA No evidenciado. CO1–CO4, CO6–CO8 |
| [Clinicorp](../../discovery/research/latinoamerica.md#2-clinicorp) | Historia, anamnesis, odonto, fotos y presupuestos C; perio No evidenciado | Flujo de caja, Clinipay/Pix/boleto y NFS-e C | API ofertada 25 solicitudes/h, no contrato inspeccionado; ARCA/MP No evidenciado. CL1–CL2, CL5 |
| [Dental Office](../../discovery/research/latinoamerica.md#3-dental-office-brasil) | Anamnesis, odonto, imágenes; periograma y otras fichas opcionales C | Flujo de caja, tarjetas/Pix/boleto y comisiones C; NF-e extra | Firma con certificado anunciada en Brasil no acredita firma digital argentina; MP/ARCA No evidenciado. DO1–DO3 |
| [Open Dental](../../discovery/research/internacional.md#4-open-dental) | Chart, imágenes/perio, planes activos/inactivos/guardados y firma electrónica D | Account, anticipos, reintegros, planes y seguros D | Bridges/API en catálogo; seguros USA no obras sociales; MP/ARCA/WhatsApp No evidenciado. OD-D3–OD-D8 |
| [Dentally](../../discovery/research/internacional.md#1-dentally) | Formularios, odonto/perio, Vision y planes C; modelo API D | Cuentas, depósitos y pagos; NHS regional | Developer Hub/API legacy y NexGen; Dojo/Worldpay C; MP/ARCA No evidenciado. DE-C2–DE-C5, DE-D1–DE-D4 |
| [CareStack](../../discovery/research/internacional.md#2-carestack) | Perfil/alergias D; charting/perio/planes/imágenes C | CS Pay, depósito D, planes/débito y ciclo de ingresos C | REST/webhooks D parcial, radiología/Overjet; eligibility/ERA ajenos a Argentina; MP/ARCA No evidenciado. CS-C2, CS-D3, CS-D5–CS-D8 |
| [tab32](../../discovery/research/internacional.md#3-tab32--alpine-y-summit) | Odonto, perio por voz, notas, imágenes y planes C | Ledger, ePayment, claims y propuestas de reintegro C | Stripe, radiología y BI C; API pública, MP/ARCA y liquidaciones No evidenciado. TA-C1–TA-C3 |
| [Curve Dental](../../discovery/research/internacional.md#5-curve-dental) | Charting/perio, imágenes, formularios, planes/eSignature C | Billing, Curve Pay y conciliación C; depósito bancario no seña | Zocdoc/Stripe/radiología/seguros C; Google Calendar, API general, MP/ARCA No evidenciado. CU-C3–CU-C9 |

### A.4 Operación, seguridad, precio, adopción, fortalezas y limitaciones

Precios son instantáneas, no ofertas vinculantes; los detalles completos, promociones, impuestos no explicitados y adicionales permanecen en las fichas. Ningún certificado o cumplimiento argentino fue auditado.

| Producto / ficha | Operación, seguridad y salida | Precio/adopción | Fortaleza y límite / fuentes |
|---|---|---|---|
| [Bilog](../../discovery/research/argentina.md#4-bilog) | Sucursales/permisos/backup C; exportación integral No evidenciado; soporte local | Mensual por cotización, alta sin costo; +1.500 clínicas/consultorios C, no auditado | Enfoque argentino; contradicción cierre Free/Premium y precio de packs No evidenciado. BI1–BI2, BI4, BI6–BI7 |
| [DentalSoft](../../discovery/research/argentina.md#5-dentalsoft) | Roles/logs, DB separada/TLS declarados; exportación pedible hasta 30 días posbaja, formato/costo No evidenciado | Gestión $30.000/mes, Pro $60.000/mes, selector 1 profesional; código ARS no explícito; prueba 3 meses/50 turnos mes; adopción independiente No evidenciado | Flujo MP concreto; importación no migra clínica/adjuntos; USD0,026/mensaje publicado no tarifa Meta universal. DS1, DS3–DS7 |
| [Odonthia](../../discovery/research/argentina.md#6-odonthia) | Sedes/roles/auditoría D; Secretaría accede a clínica; ZIP sin fotos/RX; hosting Brasil declarado | Gratis permanente; IA ARS78.700/mes, Max ARS162.500/mes, IVA incluido; 4.639 cuentas de consultorios C, no activos/pagos | Reglas detalladas y acceso inicial; adjuntos individuales y Meta aparte/número compartido con créditos. OD1–OD2, OD5–OD9 |
| [OdontoSoft Millennium](../../discovery/research/argentina.md#3-odontosoft-millennium--gb-systems) | Permisos e ingresos auditados C; red no prueba multisede; backup/exportación clínica integral No evidenciado | Español: compra USD390/799/1199; mensual USD35/65/99 según computadoras; inglés discrepante; adopción No evidenciado | Licencia perpetua y profundidad clínica; requisitos Windows antiguos y tarifas contradictorias. OS1–OS5 |
| [Dentalink](../../discovery/research/argentina.md#1-dentalink) | Multicentro, soporte, entrega de datos prometida; cifrado/backup/ISO declarados, certificado no inspeccionado | Base cotización; USD50/mes es promoción Contact Center de 80 conversaciones/1 profesional, no PMS; +15.000 clínicas/clientes C | Cobertura amplia; adicionales e inconsistencias de IA, exportación completa No evidenciado. DL1–DL6 |
| [Dentidesk](../../discovery/research/argentina.md#2-dentidesk) | Roles/multisede; Excel gratis activo; hasta 30 días posbaja con posible cargo | Importe No evidenciado; prueba 15 días; cargo por odontólogo y reactivación contractual; reseñas verificadas No evidenciado | Especialidades y términos expresos; costo de salida y WhatsApp manual. DD1–DD4 |
| [Dentis365](../../discovery/research/latinoamerica.md#5-dentis365-méxico-identidad-confirmada) | Sedes/roles/bitácoras C; exportación masiva No evidenciado; certificado mexicano enlazado pero inaccesible | USD39/mes o 390/año; médico extra USD10/mes; variante MXN en ficha; App Store 2,5/5, 10 calificaciones | Perio/laboratorio ofertados; certificación no validada, extras poco detallados. DE1–DE6 |
| [Simples Dental](../../discovery/research/latinoamerica.md#1-simples-dental) | Redes y roles; términos solo logs de acceso; copia pedible 30 meses tras bloqueo | BRL149,90/249,90/349,90 mensuales base; promociones anuales distintas; 100 mil+ descargas Play, no activos | Ayuda clínica/cobros; IA pre-lanzamiento, condiciones de migración divergentes. SD1–SD6 |
| [Codental](../../discovery/research/latinoamerica.md#4-codental-brasil) | Permisos, backups C; 2FA anunciado iOS no prueba web; exportación integral No evidenciado; multisede No evidenciado | BRL89,90/134,90/179,90 mes regular por agendas; extras; Play 10 mil+ descargas y App Store 4,5/5 con 16 notas | Manual concreto y costos; avisos eludibles y salida sin formato completo. CO1–CO4, CO6–CO7 |
| [Clinicorp](../../discovery/research/latinoamerica.md#2-clinicorp) | Redes/usuarios C; PSI y privacidad legales; copia personal no prueba exportación de clínica | BRL159,90/369,90/468,90 mes regular; implementación obligatoria y extras; Play 100 mil+ descargas | Tarifas/API detalladas; plazos de migración contradictorios, PSI no certificado ISO. CL1–CL6 |
| [Dental Office](../../discovery/research/latinoamerica.md#3-dental-office-brasil) | Permisos, cuotas 1/3/5/10 usuarios; portabilidad legal sin formato/plazo | BRL39,90/138,52/210,18/298,54 mes, último promocional; App Store 4,0/5 con 43 notas | Límites publicados; muchos extras, ayuda operativa no recuperada y mezcla Capim excluida. DO1–DO5 |
| [Open Dental](../../discovery/research/internacional.md#4-open-dental) | Permisos/Clinics D; notas concretas fuera de historial; autohosting exige administrar seguridad/backup | Other Countries USD89/mes/sede, 12 meses, hasta 3 providers; extras; adopción verificable No evidenciado | Manual profundo/compra internacional; soporte inglés, infraestructura y eServices suman costo. OD-C1–OD-C2, OD-D1–OD-D8 |
| [Dentally](../../discovery/research/internacional.md#1-dentally) | Roles, 2FA opcional y log declarados; política de 2020 exige reconfirmar; exportación integral No evidenciado | Ejemplo UK 3 surgeries: GBP285/410/551 mes sin VAT; testimonios propios, adopción argentina No evidenciado | Portal documentado; SMS OTP extra y restricciones regionales/temporales. DE-C1–DE-C6, DE-D1–DE-D3 |
| [CareStack](../../discovery/research/internacional.md#2-carestack) | Roles/sedes D parcial; HIPAA/backup C; salida integral y residencia contractual No evidenciado | USA desde $829/$1.299 mes; API y alta/migración aparte; 3.000+ prácticas C con otro párrafo 1.500 USA | Agenda detallada; costo total y timeline superpuesto problemático; privacidad ruta 404. CS-C1–CS-C3, CS-D1–CS-D7, CS-B1 |
| [tab32](../../discovery/research/internacional.md#3-tab32--alpine-y-summit) | SSO/roles/auditoría y exportación integral gratis C; SOC2 declarado no inspeccionado; privacidad 404 | Alpine desde USD95/mes/sede; agentes/mensajes/uso extra; 1.500+ clínicas C del proveedor, no atribuir a Alpine | Aprobación gradual y consumo visible; contradicciones usuarios/agentes/prueba. TA-C1–TA-C4, TA-B1 |
| [Curve Dental](../../discovery/research/internacional.md#5-curve-dental) | Sedes/roles, aislamiento y copia Excel C/legal; cobertura adjuntos No evidenciado; cache puede contener PHI | Cotización, importe/moneda No evidenciado; 6.000+ sedes USA/Canadá y 100.000+ profesionales C | Smart Fill/onboarding; política web excluye datos clínicos y requiere contrato específico. CU-C1–CU-C7 |

## B. Matriz ponderada reproducible

**No es ranking de desempeño ni recomendación automática de compra.** Favorece a quien publica documentación detallada, incluso cuando esa documentación revela límites. Una nota baja puede representar documentación insuficiente. Ni reseñas ni publicidad prueban efectividad. La prioridad argentina de A.1 no cambia por una diferencia pequeña de total.

Se aplica la rúbrica original: **0** No evidenciado; **1** declaración general/capacidad limitada; **2** varias capacidades parciales o comerciales; **3** cobertura amplia explícita con dudas relevantes; **4** amplia y con documentación operativa relevante; **5** integral, específica y pertinente al mercado objetivo. No se asigna 5: persisten incertidumbres de localización, alcance o salida de datos.

T = turnos/automatización **25%**; C = clínica **20%**; I = integraciones locales y WhatsApp **15%**; A = administración **15%**; P = paciente **10%**; S = seguridad/exportación/trazabilidad **10%**; F = precio/adopción **5%**.

`Total = (25*T + 20*C + 15*I + 15*A + 10*P + 10*S + 5*F) / 100`, escala 0–5, dos decimales, sin normalización por campos desconocidos. Ejemplo Bilog: `(75+60+30+45+20+20+5)/100 = 2,55`.

I=0 en referentes sin WhatsApp ni conectores argentinos evidenciados, aunque tengan APIs o pagos extranjeros. I=1 puede reflejar WhatsApp poco detallado sin adaptación argentina; I=2, capacidades más explícitas pero manuales/no locales; las notas 3–4 locales no presuponen ARCA. En F, tarifas visibles no eliminan cargos de mensajes/migración; cuentas/descargas no son clientes activos y no se premian como adopción probada. S=4 tampoco implica auditoría: Odonthia documenta permisos, cambios y exportación, pero la exclusión de adjuntos impide cobertura integral.

| Producto / ficha | T | C | I | A | P | S | F | Total /5 | Justificación y fuentes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| [Bilog](../../discovery/research/argentina.md#4-bilog) | 3 | 3 | 2 | 3 | 2 | 2 | 1 | 2,55 | Amplitud C; WhatsApp manual, portabilidad y precio No evidenciado. BI1, BI3–BI7 |
| [DentalSoft](../../discovery/research/argentina.md#5-dentalsoft) | 3 | 3 | 3 | 3 | 3 | 3 | 2 | 2,95 | Reglas/MP detallados pero C; privacidad legal no prueba técnica, precio variable. DS1–DS6 |
| [Odonthia](../../discovery/research/argentina.md#6-odonthia) | 4 | 4 | 4 | 4 | 4 | 4 | 3 | 3,95 | D de agenda, evolución, Meta, cobros y salida; reserva aprobada/adjuntos limitan. OD2–OD9 |
| [OdontoSoft Millennium](../../discovery/research/argentina.md#3-odontosoft-millennium--gb-systems) | 2 | 3 | 1 | 3 | 1 | 2 | 2 | 2,10 | Clínica/obras sociales C amplias; automatización limitada, precios divergentes. OS1–OS5 |
| [Dentalink](../../discovery/research/argentina.md#1-dentalink) | 3 | 3 | 2 | 3 | 3 | 2 | 1 | 2,65 | Mayoría C y ayuda parcial; integración argentina, salida y base económica inciertas. DL1–DL7 |
| [Dentidesk](../../discovery/research/argentina.md#2-dentidesk) | 2 | 3 | 1 | 3 | 2 | 3 | 1 | 2,25 | Clínica amplia C, WhatsApp manual; términos precisan permisos/exportación y cargos. DD1–DD3 |
| [Dentis365](../../discovery/research/latinoamerica.md#5-dentis365-méxico-identidad-confirmada) | 2 | 3 | 1 | 2 | 2 | 2 | 2 | 2,05 | Funciones comerciales, reglas/Meta/salida No evidenciado; precios visibles con extras No evidenciado. DE1–DE6 |
| [Simples Dental](../../discovery/research/latinoamerica.md#1-simples-dental) | 4 | 4 | 1 | 4 | 3 | 2 | 3 | 3,20 | D de confirmaciones, ficha y cobros más amplitud C; integración brasileña y solo logs acceso. SD1–SD4, SD6 |
| [Codental](../../discovery/research/latinoamerica.md#4-codental-brasil) | 4 | 3 | 2 | 3 | 2 | 2 | 3 | 2,90 | D agenda precisa incluso límites; Meta/Calendar explícitos sin conectores AR; salida integral No evidenciado. CO1–CO8 |
| [Clinicorp](../../discovery/research/latinoamerica.md#2-clinicorp) | 3 | 3 | 1 | 3 | 2 | 2 | 2 | 2,45 | Amplitud C, sin manual operativo; costos visibles con migración contradictoria. CL1–CL6 |
| [Dental Office](../../discovery/research/latinoamerica.md#3-dental-office-brasil) | 2 | 3 | 1 | 3 | 2 | 2 | 3 | 2,25 | Clínica/finanzas C; detalles de agenda excluidos por identidad; límites/precios explícitos. DO1–DO5 |
| [Open Dental](../../discovery/research/internacional.md#4-open-dental) | 4 | 4 | 0 | 4 | 3 | 3 | 3 | 3,15 | Manual operativo amplio; sin WA/localización AR y con exclusiones de auditoría/operación técnica. OD-C1–OD-C2, OD-D1–OD-D8 |
| [Dentally](../../discovery/research/internacional.md#1-dentally) | 4 | 3 | 0 | 3 | 4 | 3 | 3 | 2,90 | Portal y depósitos D; clínica C, precio regional, política antigua y sin salida integral. DE-C1–DE-C6, DE-D1–DE-D3 |
| [CareStack](../../discovery/research/internacional.md#2-carestack) | 4 | 3 | 0 | 3 | 3 | 2 | 2 | 2,65 | D agenda/portal; clínica/seguridad mayormente C y costo inicial no total. CS-C2–CS-C3, CS-D1–CS-D6 |
| [tab32](../../discovery/research/internacional.md#3-tab32--alpine-y-summit) | 3 | 3 | 0 | 3 | 3 | 2 | 2 | 2,40 | Propuesta amplia pero sin D funcional; salida/seguridad C e inconsistencias comerciales. TA-C1–TA-C4 |
| [Curve Dental](../../discovery/research/internacional.md#5-curve-dental) | 3 | 3 | 0 | 3 | 2 | 2 | 1 | 2,25 | Amplitud C, autoservicio poco detallado, precio y alcance de salida No evidenciado. CU-C2–CU-C9 |

### B.1 Reproducción y control

Los enteros de las siete columnas son los datos de entrada completos; no hay puntuaciones ocultas. Se puede recalcular cada fila con el siguiente PowerShell, reemplazando el vector por sus siete notas en orden T,C,I,A,P,S,F:

```powershell
$notas = @(3,3,2,3,2,2,1) # Bilog
$pesos = @(25,20,15,15,10,10,5)
$suma = 0
for ($i=0; $i -lt 7; $i++) { $suma += $notas[$i] * $pesos[$i] }
[math]::Round($suma / 100, 2)
```

Control editorial: 16 identidades en A.1, las mismas 16 en A.2–A.4 y B; pesos suman 100. Un total alto identifica documentación más cubierta en esta muestra; **no demuestra mejor software**. Las reseñas externas no alteran los enteros.

## C. Estándares observados, diferenciadores y oportunidades argentinas

### C.1 Capacidades habituales en la muestra

«Estándar» describe recurrencia documental, no una norma técnica ni una exigencia automáticamente aplicable al proyecto:

- Agenda y ficha clínica conectadas; odontograma, archivos, presupuestos/planes y cuentas del paciente aparecen reiteradamente, con profundidad e inclusión por plan dispares.
- Reserva online, recordatorios, estados y comunicación se repiten; no son equivalentes entre productos: solicitud aprobada, reserva directa y reserva condicionada al pago tienen semánticas distintas.
- Caja/ingresos, reportes y permisos son frecuentes. Publicar Excel de informes no demuestra exportación de historia clínica ni adjuntos.
- Automatización y firmas son recurrentes como oferta, pero abundan límites por plan, consumo y madurez. Una firma electrónica o un certificado extranjero no acredita firma digital argentina.

### C.2 Diferenciadores documentales concretos

| Eje | Referencia y evidencia | Qué merece contrastarse, sin dar por probado |
|---|---|---|
| Capacidad física y excepciones | Odonthia OD3; Codental CO3; CareStack CS-D2; Open Dental OD-D1 | Separar profesional/sillón, alerta, bloqueo duro y sobreturno autorizado; no todos verifican intervalos completos |
| Seña y autoservicio | DentalSoft DS3; Dentally DE-D1–DE-D2; CareStack CS-D3–CS-D5 | Reserva/pago/reintegro y liberación de cupo; reprogramar no siempre es una operación única |
| Recuperación de agenda | Open Dental OD-D2; Curve CU-C4; tab32 TA-C1–TA-C2 | Oferta de hueco, aceptación, expiración y supervisión; Smart Fill y agentes son C |
| Contexto administrativo argentino | Bilog BI2/BI6; OdontoSoft OS2; DentalSoft DS1/DS3; Odonthia OD6 | Coberturas, copagos, caja y liquidaciones; no inferir validación de prestadoras ni ARCA |
| Transparencia de límites | Odonthia OD9; Codental CO3; Open Dental OD-D3/OD-D5 | Adjuntos excluidos, validación solo de inicio y notas fuera de auditoría permiten preguntas precisas, no descalificación global |

### C.3 Constataciones muestrales frente a hipótesis de mercado

| Constatación restringida a fuentes consultadas | Hipótesis de oportunidad, todavía por validar |
|---|---|
| ARCA no quedó evidenciada en ninguno de los 16; Odonthia declara expresamente no emitir comprobantes fiscales | Un circuito argentino verificable podría diferenciar; no se puede afirmar que el mercado completo carezca de él |
| DentalSoft describe MP para cobrar pacientes; Odonthia menciona MP para suscripción y seña manual | Conciliación de señas, vencimiento y devolución podría reducir trabajo; validar demanda y costo operativo |
| Lista para adelantar citas es No evidenciado en varias fichas locales; no equivale a sala de espera | Recuperación de cancelaciones con permiso y toma exclusiva del cupo podría ser valiosa; medir volumen real |
| Concurrencia real no se probó en ningún producto; Codental documenta avisos sobre inicio y CareStack permite solapamiento manual | Agenda con invariantes explícitas, excepciones auditadas y prueba simultánea podría ser diferenciador verificable |
| Exportación integral con adjuntos/formato/costo/plazo suele ser No evidenciado; Odonthia excluye adjuntos de ZIP | Portabilidad completa y restauración demostrable pueden generar confianza; no afirmar ausencia generalizada |
| API Meta y costos no están igualmente documentados; existen envíos manuales comercializados junto a automatización | Comunicación con costo previsible, trazabilidad de entrega y estados claros puede diferenciar sin depender de IA |

### C.4 Contexto normativo y riesgo

La Ley 26.529 actualizada exige integridad, autenticidad, inalterabilidad, perdurabilidad y recuperabilidad de historia informatizada, con acceso restringido; reconoce titularidad y copia al paciente, y contiene requisitos odontológicos específicos incorporados por Ley 26.812. El art. 18 consultado indica guarda mínima de diez años desde última actuación. Los datos de salud son sensibles bajo Ley 25.326. Fuentes oficiales N1–N3 y límites en la ficha metodológica.

No basta elegir un proveedor que anuncie HIPAA, cifrado o backups. Contrato, roles responsable/encargado, acceso, cambios, adjuntos, entrega de copia, baja, transferencias internacionales y restauración requieren evaluación local. No se emitió dictamen jurídico ni se inspeccionaron certificados. Campañas y recordatorios deben diferenciar finalidad, permisos de contacto y minimización de datos; una casilla preactivada no prueba consentimiento válido.

## D. Priorización de demos, referencias UX y propuesta de MVP

### D.1 Cinco demostraciones prioritarias

Selección por pertinencia argentina y contraste útil, **no por orden de total**. No implica que se hayan concertado ni realizado.

| Prioridad | Producto | Motivo | Evidencia que debe producir la demo |
|---:|---|---|---|
| 1 | Bilog | Coberturas argentinas, sucursales y soporte local | Diferenciar recordatorio manual/IA automática; circuito de obra social y liquidación, precio por pack, portabilidad y permiso de sobreturno. BI1–BI7 |
| 2 | DentalSoft | Integración MP/seña y WhatsApp Meta descritas | Dos reservas/pagos simultáneos, expiración, reintegro/anulación, costos por profesional y mensajes, y qué sale al migrar. DS1–DS6 |
| 3 | Odonthia | Reglas documentadas de sillones y evolución; entrada gratuita | Colisión de solicitudes pendientes, permisos reales de Secretaría, confirmación por link versus respuesta libre, exportación con adjuntos fuera del ZIP. OD3–OD9 |
| 4 | Dentalink | Referencia regional amplia y recepción de consultas Argentina | Cotización aplicable localmente, API Meta/costos, recursos físicos, disponibilidad real IA, liquidación argentina y copia clínica al salir. DL1–DL7 |
| 5 | OdontoSoft Millennium | Contraste local/red y detalle de obras sociales | Instalación soportada hoy, concurrencia en red, backup/restauración, tarifas español/inglés, exportación y límites del módulo web. OS1–OS5 |

Dentidesk sigue en la muestra y puede ser siguiente candidato si confirma contratación argentina y automatización vigente. Open Dental sirve para contrastar control técnico y catálogo internacional, pero soporte inglés e infraestructura aumentan la fricción de una primera ronda local. Ninguna elección implica disponibilidad comercial ya confirmada.

### D.2 Guion común de demo verificable

Usar datos ficticios, cuenta de prueba y consentimiento para registrar pantalla; solicitar plan/versiones/región, fecha, actor y resultado. Marcar cada caso **demostrado / parcial / no demostrado / no aplicable**, adjuntar captura o archivo, y no convertir promesa verbal en demostrado.

| Caso | Preparación y acción | Comprobación solicitada |
|---|---|---|
| 1. Doble reserva | Dos operadores/navegadores intentan el mismo intervalo; repetir con inicios diferentes y solapamiento parcial; repetir desde reserva pública | Mostrar qué transacción obtiene cupo, qué ve la otra, si queda duplicado y qué autoriza un sobreturno; registrar actor/motivo. Una captura estática no acredita concurrencia |
| 2. Sillones | Dos profesionales y un sillón; luego dos sillones; bloquear uno y probar cruce entre sedes | Separar capacidad física de agenda del profesional; controlar ocupación de intervalo completo, duración/buffer y cupos pendientes/pagos |
| 3. Cancelación/reprogramación | Paciente confirma/cancela desde link y respuesta WhatsApp libre; cancelar con seña y cerca del límite; trasladar a otro horario | Verificar estados, liberación única, ventana aplicable, preservación de historia, política/reintegro y si es traslado o cancelar+reservar; probar link vencido/reusado |
| 4. Recuperación de huecos | Crear tres interesados y liberar un cupo; dos aceptan a la vez | Distinguir sala de espera de lista futura; prioridad, permiso de contacto, expiración y toma exclusiva; no dar por disponible lo No evidenciado |
| 5. WhatsApp y costo | Identificar número, WABA/BSP/API o apertura Web; enviar recordatorio y procesar confirmación/error | Evidenciar plantillas, opt-in, entrega/fallo/reintento, evento facturado, costo Meta/proveedor/IA, cuota y excedente; cotizar un mes con 500 citas y escenarios explícitos de mensajes, sin estimación inventada |
| 6. Cobro/seña | Pagar, duplicar notificación si el proveedor ofrece prueba, vencer intento y devolver pago ficticio | Verificar cupo, registro único, caja/cuenta paciente, comisiones, conciliación y reversión; MP de suscripción no satisface cobro de pacientes |
| 7. Exportación con adjuntos | Paciente ficticio con anamnesis/versiones, odonto, RX/foto, consentimiento, cobros y auditoría | Entregar export masivo utilizable más adjuntos; comparar conteos/vínculos, abrir archivos y confirmar formato, plazo, costo y retención posbaja; Excel de reportes no basta |
| 8. Fiscal ARCA | Pedir emisión en ambiente de prueba o evidencia contractual/técnica vigente, nota de crédito y errores | Identificar CUIT emisor, tipo, autorización/CAE y conciliación; una factura ilustrada, invoice o NFS-e extranjera no basta; si no existe, registrar ausencia explícita |
| 9. Permisos/trazabilidad | Entrar como recepción, odontólogo, administrador y usuario de otra sede; intentar leer/exportar/modificar clínica y caja | Verificar denegación efectiva, acceso mínimo, autor/fecha/antes-después, retención y protección del log; vista «mi agenda» no implica aislamiento |
| 10. Respaldo y contrato | Solicitar restauración de una copia de prueba y procedimiento de incidente/baja | Evidencia de recuperación, RPO/RTO ofrecidos, responsables, residencia/subencargados y transferencias; revisar certificado con emisor/alcance/vigencia si se invoca |

Solicitar una cotización escrita homogénea: profesionales/sedes/sillones/usuarios, almacenamiento, mensajes, firmas, IA, API, migración, impuestos, moneda, permanencia, aumentos y salida. Los resultados de demo deben actualizar la evidencia antes de una decisión, no retroactivamente convertir este informe documental en prueba.

### D.3 Tres referencias UX documentales

| Candidata | Patrón a estudiar | Riesgo y validación pendiente |
|---|---|---|
| **Dentally** | Flujo de reserva con OTP, retención temporal, seña y cancelación con nueva reserva. DE-D1–DE-D2 | No copiar cortes 1 h/48 h como requisitos; ensayar comprensión, accesibilidad y abandono con pacientes locales |
| **CareStack** | Vistas por profesional/sillón, distinción solicitud/directo y cola de reprogramación. CS-D1–CS-D5 | Evaluar densidad, recepción bajo presión y representación de sobreturnos; el timeline tiene límite documentado |
| **Codental** | Vistas día/semana/sillón, selección de recurso y avisos explícitos. CO3–CO4 | No copiar validación solo de inicio ni aviso eludible como garantía de cupo; ensayar interacción y mensajes de error |

Son **candidatas documentales, no ganadoras de usabilidad**: no hubo test de tareas, medición de tiempos, auditoría accesible ni evaluación visual comparada. La selección no aprueba pantallas ni sustituye las etapas de diseño del proyecto.

### D.4 MVP propuesto: hipótesis de alcance, no aprobación

La división siguiente propone conversación y experimentos. No transforma la consigna académica en requisitos, ni afirma que cualquier clínica necesite todas las capacidades. Depende de usuarios, problema, restricciones y viabilidad todavía por validar.

| Nivel propuesto | Capacidades candidatas | Validación antes de comprometer alcance |
|---|---|---|
| **Imprescindible candidato** | Agenda día/semana por profesional y recurso físico, horarios/duración/bloqueos, estados; control de conflictos y excepciones autorizadas | Observar operación de consultorio y clínica, necesidad de sillones/sedes, casos simultáneos y tolerancia a sobreturnos |
| **Imprescindible candidato** | Alta/búsqueda de paciente, antecedentes relevantes, odontograma mínimo, evoluciones con autor/fecha, adjuntos y plan básico | Validar con odontólogos qué registro clínico debe formar parte del primer producto y obligaciones aplicables; no asumir que toda gestión de turnos requiere un PMS completo |
| **Imprescindible candidato** | Reserva o solicitud pública según política, confirmación/cancelación y reprogramación controlada; recordatorio con costo y entrega trazables | Elegir flujo con usuarios; verificar conectividad, permisos de contacto y presupuesto WhatsApp; no prometer automatización API sin proveedor/costo |
| **Imprescindible candidato** | Roles mínimos, registro de cambios, copias/restauración y exportación utilizable con adjuntos | Modelar datos sensibles, contrato y acceso al registro; ensayar copia y recuperación, no limitarse a declarar backup |
| **Imprescindible candidato** | Presupuesto/cuenta y registro de cobro básico solo si el problema validado lo exige | Precisar alcance administrativo; no llamar «factura fiscal» a recibo interno ni comprometer ARCA por defecto |
| **Diferenciadores a experimentar** | Recuperación de cancelaciones con lista y oferta de cupo exclusiva; MP/seña con conciliación/reintegro; costos WhatsApp visibles; portabilidad completa autogestionada | Medir huecos, ausentismo, trabajo manual, costo e intención de uso; comparar beneficio con complejidad |
| **Diferenciadores locales por validar** | Coberturas/copagos/liquidaciones y eventual integración fiscal ARCA; calendario externo con reglas y privacidad explícitas | Entrevistar administración y contador; identificar prestadoras, documentación fiscal, conectores y responsabilidades; no prometer integraciones sin evidencia |
| **Postergar salvo necesidad demostrada** | IA diagnóstica/RX, agentes autónomos, voz clínica, marketing avanzado, financiación, BI de redes/DSO, app nativa, conectores de equipos y especialidades exhaustivas | Exigen evidencia clínica, demanda, seguridad, integración o escala que esta investigación no acredita; reconsiderar si Discovery demuestra prioridad |

### D.5 Alcance definitivo del MVP del proyecto

La sección D.4 presenta hipótesis surgidas del análisis competitivo y no constituye el alcance aprobado del proyecto.

Luego del proceso de Discovery, el equipo definió un MVP enfocado en la gestión de turnos de un consultorio odontológico con un profesional y un sillón.

**Funcionalidades incluidas en el MVP:**
- Gestión interna de turnos: creación, consulta, reprogramación y cancelación.
- Visualización de agenda diaria y semanal.
- Registro y consulta básica de pacientes.
- Catálogo de prestaciones y configuración del consultorio.
- Recordatorios de turnos mediante correo electrónico.

**Funcionalidades fuera del alcance inicial:**
- Autogestión de turnos por parte de los pacientes.
- Historia clínica, odontograma y registros clínicos.
- Gestión de múltiples profesionales, sillones o sucursales.
- Integraciones con WhatsApp, Mercado Pago o ARCA.
- Exportación integral de datos como funcionalidad del MVP.

Estas decisiones corresponden al alcance definido en `discovery/discovery.md`. Las capacidades analizadas en D.4 se conservan como oportunidades futuras y no deben interpretarse como compromisos de implementación.

**Trazabilidad de las decisiones del equipo:**

- DD-01: un único odontólogo y un único sillón, para mantener un alcance viable.
- DD-07: carga de turnos exclusivamente por el odontólogo, sin reserva pública.
- DD-08: registro de datos básicos del paciente, sin historia clínica.
- DD-09: prohibición de sobreturnos y uso de intervalos semiabiertos [inicio, fin).

Fuente: [Decisiones y supuestos del proyecto](../../knowledge-base/09_decisiones_y_supuestos.md).

## E. Reseñas externas, limitaciones y próximos pasos

Se buscaron fuentes independientes adicionales mediante Capterra (Open Dental y CareStack). Las lecturas directas de ambas páginas de reseñas devolvieron **HTTP 403** el 2026-11-21. Los resultados de búsqueda sirvieron para localizar las URL, pero **no se incorporan ratings, citas ni supuestas reseñas verificadas procedentes de esos resultados**. Verificación narrativa externa adicional: **No evidenciado**. No se intentó eludir el bloqueo.

Sí existen registros de tiendas leídos en las fichas: Dental Office App Store 4,0/43; Codental 4,5/16; Dentis365 2,5/10; descargas Play de Simples Dental y Clinicorp 100 mil+ y Codental 10 mil+. Son instantáneas de aplicaciones/plataformas y muestras distintas, no indicadores comparables del SaaS completo ni reseñas de clientes argentinos. Los testimonios y contadores de cada proveedor siguen siendo C. Para los otros productos, reseñas independientes verificadas: No evidenciado en esta investigación.

Limitaciones principales: dependencia de publicaciones de proveedores, checks de planes no siempre extraíbles, políticas antiguas/inaccesibles, precios contradictorios o por cotización, falta de contratos argentinos y ninguna prueba de producto. Un sitio inaccesible o una función No evidenciado no demuestra inexistencia. La ventaja documental de Odonthia en B no acredita superioridad funcional; la amplitud de Open Dental/Simples Dental no acredita adaptación argentina.

Próximos pasos sugeridos: validar problemas y población objetivo, contrastar las cinco demos con el mismo guion, obtener costos homogéneos y condiciones de datos/salida, y recién entonces discutir alcance. La eventual arquitectura, diseño visual y planificación requieren decisiones posteriores explícitas.

## Bibliografía y trazabilidad

**Todas las URL siguientes tienen fecha de consulta 2026-11-21**, salvo que se explicita intento bloqueado, con esa misma fecha. Los ID conservan el espacio de nombres de sus fichas: **OD1–OD9 = Odonthia; OD-C/OD-D = Open Dental; DE1–DE6 = Dentis365; DE-C/DE-D = Dentally**. Los registros completos, tipo de evidencia, fechas de actualización y fuentes secundarias están en las cuatro fichas enlazadas al inicio. Se incluyen aquí fuentes clave de los 16 productos, no solo enlaces a fichas.

| Producto / ID | URL clave | Alcance y condición |
|---|---|---|
| Bilog BI1 | https://www.bilog.com.ar/ | Oferta, modalidades, cifras y FAQ, C |
| Bilog BI4 | https://bilog.com.ar/reminders-whatsapp | Inicio manual, packs y respuestas, C con detalle operativo |
| Bilog BI5 / BI7 | https://bilog.com.ar/pacientes ; https://bilog.com.ar/seguridad | Clínica/firma electrónica y seguridad declarada |
| DentalSoft DS1 | https://dentalsoft.com.ar/ | Oferta/precios/identidad, C |
| DentalSoft DS2 / DS3 | https://www.dentalsoft.com.ar/funcionalidades/agenda-odontologica ; https://www.dentalsoft.com.ar/funcionalidades/cobros-mercadopago | Reglas y cobros, C detallada |
| DentalSoft DS4 / DS5 / DS6 | https://www.dentalsoft.com.ar/funcionalidades/recordatorios-whatsapp ; https://www.dentalsoft.com.ar/privacidad ; https://www.dentalsoft.com.ar/terminos | API y costos declarados; privacidad/contrato legales |
| Odonthia OD1 / OD2 | https://odonthia.com/ ; https://odonthia.com/planes | Identidad, cifras y precios, C |
| Odonthia OD3 / OD4 | https://odonthia.com/docs/agenda-y-turnos.md ; https://odonthia.com/docs/reserva-online.md | Reglas de agenda y solicitud, D |
| Odonthia OD5 / OD6 | https://odonthia.com/docs/whatsapp-y-emails-a-pacientes.md ; https://odonthia.com/docs/presupuestos-y-cobros.md | Comunicaciones/cobros y ausencia fiscal explícita, D |
| Odonthia OD7 / OD9 | https://odonthia.com/privacidad ; https://odonthia.com/docs/privacidad-accesos-y-respaldo.md | Declaraciones legales; roles/exportación D |
| OdontoSoft OS1 / OS2 | https://odontosoft.com/about.htm ; https://gbsystems.com/os/producto.htm | Origen y prestaciones, C |
| OdontoSoft OS3 / OS4 | https://gbsystems.com/os/precios.htm ; https://odontosoft.com/prices.htm | Tarifas oficiales discrepantes, C |
| Dentalink DL1 / DL2 / DL3 | https://www.softwaredentalink.com/ ; https://www.softwaredentalink.com/experiencia-de-pacientes/agenda ; https://www.softwaredentalink.com/planes | Oferta, agenda y planes, C |
| Dentalink DL4 / DL6 / DL7 | https://www.softwaredentalink.com/politica-de-privacidad ; https://ayuda.softwaredentalink.com/hc/es-419/articles/6311990109851-Configura-tu-Agenda-Online ; https://www.softwaredentalink.com/experiencia-de-pacientes/confirmaciones-automaticas-de-citas | Legal, ayuda D parcial y confirmaciones C |
| Dentidesk DD1 / DD2 / DD3 | https://www.dentidesk.com/ ; https://www.dentidesk.com/dentidesk/feature ; https://app.dentidesk.com/terminos.php | Funciones C; términos con WhatsApp manual y portabilidad |
| Dentis365 DE1 / DE2 / DE3 | https://www.dentis.com.mx ; https://www.dentis.com.mx/politicas-de-privacidad/ ; https://apps.apple.com/mx/app/dentis365/id1168066463 | Oferta C; identidad legal; tienda R con descripción declarativa |
| Dentis365 DE5 | https://www.dgis.salud.gob.mx/intercambio/certificados/DGIS-CER-P-009-2025-07_gobmx.html | Intento fallido de lectura, certificado no validado |
| Simples Dental SD1 / SD2 | https://www.simplesdental.com/planos-e-precos ; https://www.simplesdental.com/agenda-online | Oferta y precios C |
| Simples Dental SD3 / SD4 / SD6 | https://www.simplesdental.com/termos ; https://ajuda.simplesdental.com/pt-BR/articles/4677349-plano-basic ; https://play.google.com/store/apps/details?id=com.simplesdental&hl=pt | Términos; ayuda funcional D; tienda R |
| Codental CO1 / CO2 | https://www.codental.com.br/preco ; https://www.codental.com.br/politica-de-privacidade | Precios/funciones C; identidad y Calendar legal |
| Codental CO3 / CO4 | https://ajuda.codental.com.br/agenda-por-cadeiras-como-organizar-sua-clinica-por-espaco-de-atendimento ; https://www.codental.com.br/aprenda/configuracao-da-agenda-e-horarios-de-atendimento | Manual operativo D |
| Codental CO6 / CO7 | https://play.google.com/store/apps/details?id=com.codental.app ; https://apps.apple.com/br/app/codental/id1416513464 | Registros de tienda R; funciones/privacidad declarativas |
| Clinicorp CL1 / CL2 | https://www.clinicorp.com/planos ; https://www.clinicorp.com/custos-adicionais | Precios, mensajes y API C |
| Clinicorp CL4 / CL5 / CL6 | https://www.clinicorp.com/politica-de-seguranca ; https://play.google.com/store/apps/details?id=com.clinicorp&hl=pt_BR ; https://www.clinicorp.com/politica-de-privacidade | PSI/privacidad legales y tienda R |
| Dental Office DO1 / DO2 / DO3 | https://www.dentaloffice.com.br/planos/ ; https://www.dentaloffice.com.br/politica-de-privacidade/ ; https://www.dentaloffice.com.br/prontuario/ | Precios/clínica C; portabilidad legal |
| Dental Office DO4 / DO5 | https://apps.apple.com/br/app/dental-office/id1567047922 ; https://www.dentaloffice.com.br/agenda-para-dentistas/ | Tienda R; segunda URL devuelve Capim, no atribuida |
| Open Dental OD-C1 / OD-C2 | https://www.opendental.com/site/fees.html ; https://www.opendental.com/site/countries.html | Tarifas y compra internacional C |
| Open Dental OD-D1 / OD-D2 | https://www.opendental.com/manual/appointments.html ; https://www.opendental.com/site/websched.html | Agenda y Web Sched/ASAP D |
| Open Dental OD-D3 / OD-D4 / OD-D5 / OD-D7 | https://www.opendental.com/manual/chart.html ; https://www.opendental.com/manual/treatmentplan.html ; https://www.opendental.com/manual/account.html ; https://www.opendental.com/site/hipaa.html | Manual y responsabilidades de seguridad D |
| Dentally DE-C1 / DE-C5 / DE-C6 | https://www.dentally.com/en-gb/pricing ; https://www.dentally.com/en-gb/dental-software-features/clinical ; https://www.dentally.com/en-gb/security-policy | Precios/clínica C; política legal |
| Dentally DE-D1 / DE-D2 / DE-D3 | https://help.dentally.com/en/articles/3668861-how-to-use-online-booking-as-an-existing-patient ; https://help.dentally.com/en/articles/3668498-how-patients-can-cancel-an-appointment-online-via-portal ; https://developer.dentally.co/ | Portal y API legacy D |
| CareStack CS-C1 / CS-C2 / CS-C3 | https://carestack.com/company ; https://carestack.com/pricing ; https://carestack.com/dental-software/features/hipaa-compliant | Identidad, oferta y seguridad declaradas C |
| CareStack CS-D1 / CS-D2 | https://carestack.zendesk.com/hc/en-us/articles/25996244132884-A-Detailed-Overview-of-the-Scheduler ; https://carestack.zendesk.com/hc/en-us/articles/31695575377044-Double-Booking-of-Appointments-or-Block-Slots | Agenda y sobreturnos D |
| CareStack CS-D3 / CS-D5 / CS-D6 | https://carestack.zendesk.com/hc/en-us/articles/26111222881428-Manage-Online-Appointment-Portal ; https://carestack.zendesk.com/hc/en-us/articles/29569741719188-Cancel-Reschedule-Appointments-or-Change-Appointment-Status ; https://developer.carestack.com/ | Portal/reprogramación/API parcial D |
| tab32 TA-C1 / TA-C2 / TA-C3 / TA-C4 | https://tab32.com/ ; https://tab32.com/pricing/ ; https://tab32.com/platform/ ; https://tab32.com/tab32-launches-alpine-bringing-agentic-ai-to-independent-dental-practices/ | Funciones, precios, identidad y lanzamiento, C |
| Curve CU-C1 / CU-C2 / CU-C3 | https://www.curvedental.com/about ; https://www.curvedental.com/faq ; https://www.curvedental.com/pricing | Identidad, operación y cotización C |
| Curve CU-C4 / CU-C5 / CU-C6 / CU-C7 / CU-C9 | https://www.curvedental.com/dental-scheduling-software ; https://www.curvedental.com/dental-patient-engagement-software ; https://www.curvedental.com/data-policy ; https://www.curvedental.com/privacypolicy ; https://www.curvedental.com/feature-overview | Agenda/clínica C y políticas legales |
| N1 | https://www.argentina.gob.ar/normativa/nacional/ley-26529-160432/actualizacion | Texto oficial actualizado Ley 26.529 |
| N2 | https://www.argentina.gob.ar/justicia/derechofacil/aplicalaley/mi-historia-clinica | Orientación oficial, no reemplaza norma |
| N3 | https://www.argentina.gob.ar/noticias/tratamiento-de-datos-personales-ante-el-coronavirus | AAIP; publicada 2020-03-11; contexto pandemia |
| EXT1 | https://www.capterra.com/p/122350/Open-Dental/reviews | Intento directo 2026-11-21: HTTP 403; no se valida reseña ni rating |
| EXT2 | https://www.capterra.com/p/176206/CareStack/reviews | Intento directo 2026-11-21: HTTP 403; no se valida reseña ni rating |

Las fuentes adicionales referidas por ID (por ejemplo BI2/BI3/BI6, CO8, CU-C8 o índices técnicos) conservan su URL y fecha en las fichas originales. No se modificaron esas fuentes ni el estado de Discovery para producir esta síntesis.




## Verificación de fuentes

**Fecha de verificación manual:** 24/11/2026.

Se realizó una revisión manual de siete fuentes oficiales mediante el acceso a sus páginas web y la obtención de capturas de pantalla. Se contrastaron las afirmaciones del informe competitivo con la información publicada por los proveedores y el organismo oficial consultado.

### 1. Bilog (BI1)

- Tipo de fuente: sitio oficial comercial.
- Afirmación original: oferta de gestión odontológica y más de 1.500 clínicas y consultorios.
- Corrección: se mantiene la afirmación como declaración comercial no auditada.

- URL: https://www.bilog.com.ar/
- Resultado: se corroboró la oferta de gestión odontológica, pacientes, profesionales, agenda y administración.
- El proveedor declara más de 20 años de experiencia, 1.500 clínicas y consultorios, 5.000 usuarios activos y 150.000 turnos mensuales.
- Limitación: no se comprobaron las reglas internas de la agenda ni las cifras mediante fuentes independientes.

### 2. Bilog - Recordatorios por WhatsApp (BI4)

- Tipo de fuente: página de funcionalidad específica.
- Afirmación original: envío masivo iniciado manualmente y actualización de agenda mediante respuestas.
- Corrección: se confirma el inicio manual; la actualización automática de agenda queda sin confirmar en esta revisión.

- URL: https://bilog.com.ar/reminders-whatsapp/
- Resultado: se corroboró la selección de un día de la agenda y el envío masivo de recordatorios iniciado por el usuario. Se observaron plantillas de mensajes.
- Limitación: no se comprobó la integración mediante API oficial de WhatsApp ni la actualización automática de la agenda.

### 3. DentalSoft (DS1)

- Tipo de fuente: sitio oficial comercial.
- Afirmación original: software odontológico en la nube, agenda, reserva online y módulos administrativos.
- Corrección: se mantiene la oferta funcional declarada. Mercado Pago y prevención de solapamientos no se validaron nuevamente.

- URL: https://dentalsoft.com.ar/
- Resultado: se corroboró la oferta de software odontológico en la nube, gestión de pacientes, agenda, historias clínicas y reserva web integrada con la agenda. Se observaron módulos de recordatorios, profesionales, caja y presupuestos.
- Limitación: no se comprobó la integración con Mercado Pago ni las reglas de prevención de solapamientos.

### 4. Odonthia (OD1)

- Tipo de fuente: sitio oficial con información de planes y precios.
- Afirmación original: plan gratuito permanente, planes pagos y 4.639 cuentas de consultorios declaradas.
- Corrección: se registra una nueva cifra declarada de 4.875 consultorios. Los precios observados coinciden con los originales. Se conserva la cifra histórica con su fecha de consulta.

- URL: https://odonthia.com/
- Resultado: se corroboró el origen argentino declarado, la gestión gratuita sin límite de pacientes, la historia clínica, el odontograma y la oferta de WhatsApp automático en planes pagos.
- Al momento de la consulta, el proveedor declaraba 4.875 consultorios registrados.
- Precios publicados: plan Gratis, plan IA por ARS 78.700 mensuales y plan Max por ARS 162.500 mensuales.
- Limitación: no se comprobaron los recordatorios por correo electrónico ni las reglas internas de disponibilidad.

### 5. Dentalink (DL1)

- Tipo de fuente: sitio oficial comercial.
- Afirmación original: oferta para profesionales independientes y clínicas, con módulos administrativos y Argentina como opción comercial.
- Corrección: se mantiene la afirmación sin inferir adaptación fiscal argentina ni implementación de ARCA.

- URL: https://www.softwaredentalink.com/
- Resultado: se corroboró la oferta de gestión odontológica, carga masiva de pacientes, control de caja y gastos, cálculo de pagos a profesionales, inventario, laboratorios y reportes en Excel.
- Se observó Argentina como opción del formulario comercial y una oferta dirigida tanto a profesionales independientes como a redes dentales.
- Limitación: no se comprobó la adaptación fiscal argentina, la integración con ARCA ni los recordatorios automáticos por correo electrónico.

### 6. CareStack (CS-D1)

- Tipo de fuente: centro de ayuda y documentación de usuario.
- URL: https://carestack.zendesk.com/hc/en-us/articles/25996244132884-A-Detailed-Overview-of-the-Scheduler
- Afirmación original: CareStack documenta funcionalidades de agenda y gestión de recursos.
- Resultado: se corroboró que la guía oficial aborda filtros, fechas, turnos cancelados, ausencias, horarios de atención, sillones y disponibilidad de profesionales. Incluye material audiovisual y capturas de la interfaz.
- Corrección: no se requieren cambios en la afirmación original.
- Limitación: no se comprobaron las reglas internas de solapamiento ni el comportamiento ante operaciones concurrentes.

### 7. Ley 26.529 (N1)

- Tipo de fuente: normativa oficial argentina.
- URL: https://www.argentina.gob.ar/normativa/nacional/ley-26529-160432/actualizacion
- Afirmación original: el tratamiento de información clínica debe considerar los derechos del paciente y la confidencialidad.
- Resultado: se verificó el texto actualizado de la ley, sancionada el 21/10/2009 y publicada el 20/11/2009. El artículo 2, incisos c y d, establece derechos relativos a la intimidad y confidencialidad, con referencia a la Ley 25.326.
- Corrección: se mantiene la referencia normativa original.
- Aplicación al MVP: respalda la decisión de minimizar los datos almacenados y excluir información clínica de los recordatorios.
- Limitación: esta revisión no determina por sí sola los requisitos legales específicos del consentimiento para recordatorios por email.

### Conclusión de la verificación

Se revisaron siete fuentes oficiales y se contrastaron afirmaciones concretas del informe competitivo. Las funcionalidades observadas corresponden a declaraciones comerciales y documentación de los proveedores, y no constituyen pruebas funcionales de los productos. La fuente normativa aporta contexto legal, pero no acredita el cumplimiento integral del sistema.

Las cifras y los precios corresponden a la fecha de consulta y pueden variar. Se mantienen las limitaciones y los datos históricos de la investigación original.

El análisis respalda la relevancia de la gestión de turnos, pacientes, agenda y recordatorios como funcionalidades del mercado. El alcance definitivo del MVP se mantiene conforme a las decisiones del equipo documentadas en la sección D.5.




