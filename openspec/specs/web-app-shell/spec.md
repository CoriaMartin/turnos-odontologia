# web-app-shell Specification

## Purpose

Define la estructura visible común de la web app (barra superior con la marca, área de contenido, página de inicio y página de ruta inexistente) para que todas las pantallas compartan la misma base visual y el mismo idioma.

## Requirements

### Requirement: Barra superior con la marca
Toda página de la web app SHALL mostrar una barra superior con el logo, con texto alternativo, y el nombre visible del producto, "Agenda de Odontología".

#### Scenario: Página de inicio con la marca
- **WHEN** el usuario abre la ruta `/`
- **THEN** ve una barra superior con el logo, con texto alternativo, y el nombre "Agenda de Odontología"
- **AND** no ve el rótulo "Marca provisoria"

#### Scenario: Barra presente en una ruta inexistente
- **WHEN** el usuario abre una ruta que no existe
- **THEN** la barra superior con logo y nombre sigue visible

### Requirement: Área de contenido principal
Debajo de la barra superior, la web app SHALL mostrar el contenido de la ruta actual dentro de una única región principal identificable por tecnologías de asistencia.

#### Scenario: Contenido de la ruta en la región principal
- **WHEN** el usuario abre la ruta `/`
- **THEN** la página tiene exactamente una región principal (`main`)
- **AND** esa región contiene un título de nivel 1

### Requirement: Página de inicio provisoria
Hasta que exista la agenda (C-16), la ruta `/` SHALL mostrar una página de inicio que indique en español rioplatense que la agenda todavía no está disponible.

#### Scenario: Inicio sin agenda
- **WHEN** el usuario abre la ruta `/`
- **THEN** ve el título "Inicio"
- **AND** ve un texto que explica que la agenda va a aparecer ahí

### Requirement: Página para rutas inexistentes
Ante una ruta que no existe, la web app SHALL mostrar una página que explique en español rioplatense que la página no existe y ofrezca un enlace para volver al inicio, sin mostrar códigos técnicos.

#### Scenario: Ruta inexistente
- **WHEN** el usuario abre `/ruta-que-no-existe`
- **THEN** ve el título "No encontramos esta página"
- **AND** ve un enlace "Volver al inicio" que lleva a `/`
- **AND** no ve el código "404" en la página

#### Scenario: Volver al inicio desde la página inexistente
- **WHEN** el usuario está en una ruta inexistente y activa "Volver al inicio"
- **THEN** la web app muestra la página de inicio

### Requirement: Idioma y estilos del sistema de diseño
La web app SHALL declarar el idioma `es-AR` y SHALL tomar colores, tipografía, espaciado, radios, sombras y foco exclusivamente de las variables del sistema de diseño aprobado.

#### Scenario: Idioma del documento
- **WHEN** se carga la web app
- **THEN** el documento declara `lang="es-AR"`

#### Scenario: Variables del sistema de diseño disponibles
- **WHEN** se carga la web app
- **THEN** la variable `--color-brand-600` del sistema de diseño está definida en el documento
