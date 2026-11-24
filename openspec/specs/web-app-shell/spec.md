# web-app-shell Specification

## Purpose

Define la estructura visible común de la web app (barra superior con la marca, área de contenido, página de inicio y página de ruta inexistente) para que todas las pantallas compartan la misma base visual y el mismo idioma.

## Requirements

### Requirement: Barra superior con la marca
Toda página de la web app que requiere sesión SHALL mostrar una barra superior con el logo, con texto alternativo, el nombre visible del producto, "Agenda de Odontología", y el botón "Cerrar sesión". La página `/login` SHALL NOT mostrar esta barra.

#### Scenario: Página de inicio con la marca
- **WHEN** el usuario con sesión iniciada abre la ruta `/`
- **THEN** ve una barra superior con el logo, con texto alternativo, y el nombre "Agenda de Odontología"
- **AND** ve el botón "Cerrar sesión"
- **AND** no ve el rótulo "Marca provisoria"

#### Scenario: Barra presente en una ruta inexistente
- **WHEN** el usuario con sesión iniciada abre una ruta que no existe
- **THEN** la barra superior con logo, nombre y "Cerrar sesión" sigue visible

#### Scenario: Login sin barra superior
- **WHEN** el usuario sin sesión abre `/login`
- **THEN** no ve la barra superior ni el botón "Cerrar sesión"

### Requirement: Área de contenido principal
Debajo de la barra superior, la web app SHALL mostrar el contenido de la ruta actual dentro de una única región principal identificable por tecnologías de asistencia. La página `/login` también SHALL tener exactamente una región principal.

#### Scenario: Contenido de la ruta en la región principal
- **WHEN** el usuario con sesión iniciada abre la ruta `/`
- **THEN** la página tiene exactamente una región principal (`main`)
- **AND** esa región contiene un título de nivel 1

#### Scenario: Región principal en el login
- **WHEN** el usuario sin sesión abre `/login`
- **THEN** la página tiene exactamente una región principal (`main`) con un título de nivel 1

### Requirement: Página para rutas inexistentes
Ante una ruta que no existe, con sesión iniciada, la web app SHALL mostrar una página que explique en español rioplatense que la página no existe y ofrezca un enlace para volver al inicio, sin mostrar códigos técnicos.

#### Scenario: Ruta inexistente
- **WHEN** el usuario con sesión iniciada abre `/ruta-que-no-existe`
- **THEN** ve el título "No encontramos esta página"
- **AND** ve un enlace "Volver al inicio" que lleva a `/`
- **AND** no ve el código "404" en la página

#### Scenario: Volver al inicio desde la página inexistente
- **WHEN** el usuario con sesión iniciada está en una ruta inexistente y activa "Volver al inicio"
- **THEN** la web app muestra la página de inicio

### Requirement: Idioma y estilos del sistema de diseño
La web app SHALL declarar el idioma `es-AR` y SHALL tomar colores, tipografía, espaciado, radios, sombras y foco exclusivamente de las variables del sistema de diseño aprobado.

#### Scenario: Idioma del documento
- **WHEN** se carga la web app
- **THEN** el documento declara `lang="es-AR"`

#### Scenario: Variables del sistema de diseño disponibles
- **WHEN** se carga la web app
- **THEN** la variable `--color-brand-600` del sistema de diseño está definida en el documento
