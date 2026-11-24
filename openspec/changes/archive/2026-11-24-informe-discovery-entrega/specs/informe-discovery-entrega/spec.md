## ADDED Requirements

### Requirement: Entrega del informe Discovery

La entrega SHALL incluir portada, resumen ejecutivo,
secciones A-D y versiones Markdown y PDF.

#### Scenario: Informe disponible

- **WHEN** se consulta docs/discovery/
- **THEN** existen informe-discovery.md e informe-discovery.pdf
- **AND** ambos contienen el informe definitivo

### Requirement: Verificación manual de fuentes

El informe SHALL documentar al menos cinco fuentes verificadas
manualmente y contemplar distintos tipos de fuentes.

#### Scenario: Revisión de fuentes

- **WHEN** se consulta la sección Verificación de fuentes
- **THEN** se identifica cada fuente y su tipo
- **AND** se documenta la afirmación original, el resultado
  de la comprobación y las correcciones correspondientes

### Requirement: Justificación del MVP definitivo

El informe SHALL distinguir las hipótesis iniciales
del alcance definitivo acordado por el equipo.

#### Scenario: Consulta del alcance

- **WHEN** se consulta la sección D.5
- **THEN** se identifican las funcionalidades incluidas y excluidas
- **AND** se justifican las decisiones mediante la base de conocimiento

### Requirement: Checklist Discovery

La entrega SHALL incorporar el checklist de 11 puntos.

#### Scenario: Checklist disponible

- **WHEN** se consulta docs/discovery/
- **THEN** existe discovery.md con los 11 puntos del checklist
