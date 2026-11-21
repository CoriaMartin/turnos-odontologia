# Turnos Odontología — Base de Conocimiento

Base de conocimiento construida en modo interactivo a partir del [Discovery](../discovery/discovery.md) y del [informe competitivo](../discovery/informe-competitivo.md).

## Índice de Archivos

| Archivo | Contenido |
|---|---|
| [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Propósito, objetivos por actor, alcance del MVP y fuera de alcance |
| [02_descripcion_general.md](02_descripcion_general.md) | Stack (Spring Boot, PostgreSQL, React), arquitectura, SMTP, API REST |
| [03_actores_y_roles.md](03_actores_y_roles.md) | Odontólogo, paciente, planificador; RBAC y rutas públicas |
| [04_modelo_de_datos.md](04_modelo_de_datos.md) | Entidades, ERD, restricciones de exclusión, seed |
| [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | Reglas RN-AG, RN-ES, RN-CA, RN-PA, RN-PR, RN-RE, RN-AU, RN-DS |
| [06_funcionalidades.md](06_funcionalidades.md) | Épicas e historias US-001 a US-050 |
| [07_flujos_principales.md](07_flujos_principales.md) | Login, crear/reprogramar/cancelar turno, asistencia, recordatorios |
| [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | Patrones, directorios, seguridad, tests, variables de entorno |
| [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | Decisiones DD-01 a DD-11 y supuestos SU-01 a SU-07 |
| [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | Inconsistencias, preguntas priorizadas y puntos "No evidenciado" |
| [11_cumplimiento_y_datos_sensibles.md](11_cumplimiento_y_datos_sensibles.md) | Leyes 25.326 y 26.529 y su impacto |

## Quick Start para Desarrolladores

1. Entender el dominio → [01](01_vision_y_objetivos.md), [03](03_actores_y_roles.md)
2. Entender los datos → [04](04_modelo_de_datos.md)
3. Entender las reglas → [05](05_reglas_de_negocio.md)
4. Entender la arquitectura → [02](02_descripcion_general.md), [08](08_arquitectura_propuesta.md)
5. Implementar → [07](07_flujos_principales.md), [06](06_funcionalidades.md)
6. Antes de codificar → [10](10_preguntas_abiertas.md), [11](11_cumplimiento_y_datos_sensibles.md)

## Resumen Ejecutivo

Agenda web para el odontólogo independiente argentino: un usuario, un sillón, turnos por prestación con duración propia, cancelación tardía y recordatorios por email. Su núcleo verificable es la prohibición de turnos superpuestos, garantizada en el servicio y en PostgreSQL incluso ante operaciones simultáneas, algo que ningún competidor relevado demostró públicamente.
