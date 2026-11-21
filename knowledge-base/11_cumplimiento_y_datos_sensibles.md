# Cumplimiento y Datos Sensibles

Archivo extra. No reemplaza un dictamen legal: resume el marco relevado en [metodologia-y-normativa.md](../discovery/research/metodologia-y-normativa.md) y su impacto en el MVP.

## Marco aplicable

| Norma | Qué exige (resumen) | Impacto en el MVP |
|---|---|---|
| Ley 25.326 (Protección de Datos Personales) | Los datos de salud son sensibles; finalidad, consentimiento, seguridad y confidencialidad | Login obligatorio, consentimiento para recordatorios, logs sin datos personales, emails sin datos clínicos |
| Ley 26.529 (Derechos del Paciente) y Ley 26.812 | Historia clínica informatizada íntegra, inalterable y recuperable; guarda mínima de 10 años; copia al paciente | No aplica plenamente: el MVP no guarda historia clínica ([DD-08](09_decisiones_y_supuestos.md)). Se vuelve obligatorio al incorporar la ficha clínica |

## Reglas del proyecto derivadas

- Nunca datos reales de pacientes en el repositorio, seeds, tests, capturas ni ejemplos ([RN-DS-01](05_reglas_de_negocio.md)).
- Ningún secreto versionado ([RN-DS-02](05_reglas_de_negocio.md)).
- Baja lógica: no se borran pacientes ni turnos ([RN-GL-02](05_reglas_de_negocio.md)).
- Recordatorios solo con consentimiento y sin información clínica ([RN-RE-02](05_reglas_de_negocio.md), [RN-RE-04](05_reglas_de_negocio.md)).

## Pendiente para versiones con ficha clínica

- Registro de auditoría append-only (autor, fecha, antes/después).
- Evoluciones inalterables; correcciones como nuevas entradas.
- Política de respaldo y restauración probada.
- Exportación de la historia del paciente a pedido.
