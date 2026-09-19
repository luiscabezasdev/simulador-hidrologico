# Feature Specification: Favicon del proyecto

**Feature Branch**: `004-favicon-proyecto`

**Created**: 2026-09-19

**Status**: Draft

**Input**: User description: "El sitio debe mostrar un logo/favicon visible en la pestaña del navegador. Requisitos: Debe soportar formato SVG como principal; Debe incluir un PNG de respaldo para navegadores sin soporte SVG (ej. Safari); El logo debe verse correctamente en pestañas de modo claro y oscuro. Las imágenes están en el mismo nivel del archivo index."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconocer el sitio por su ícono en la pestaña (Priority: P1)

Como visitante con varias pestañas abiertas en el navegador, quiero ver el logo del simulador en la pestaña correspondiente, para identificar y volver a esa pestaña rápidamente sin tener que leer el título completo.

**Why this priority**: Es el núcleo de la funcionalidad solicitada: sin un ícono visible en la pestaña, la feature no existe. Es una mejora de bajo esfuerzo con alto impacto en la identidad y usabilidad del sitio.

**Independent Test**: Se puede probar abriendo la página en un navegador moderno (Chrome, Firefox, Edge) y verificando visualmente que la pestaña muestra el logo en lugar del ícono genérico por defecto.

**Acceptance Scenarios**:

1. **Given** el usuario abre el sitio en un navegador con soporte para íconos SVG, **When** la página carga, **Then** la pestaña del navegador muestra el logo en formato SVG.
2. **Given** el usuario abre el sitio en un navegador sin soporte para íconos SVG (por ejemplo Safari), **When** la página carga, **Then** la pestaña del navegador muestra el logo en formato PNG como alternativa.
3. **Given** el usuario guarda el sitio como marcador/favorito, **When** revisa la lista de marcadores, **Then** el logo aparece junto al nombre del sitio.

---

### User Story 2 - Ver el logo correctamente en modo claro y oscuro (Priority: P2)

Como visitante cuyo navegador o sistema operativo está configurado en modo oscuro, quiero que el logo de la pestaña se siga viendo con buen contraste, para poder distinguirlo sin que se mezcle con el fondo de la pestaña.

**Why this priority**: Complementa la funcionalidad principal asegurando que el ícono sea legible en ambos temas del navegador; no bloquea el uso básico de la feature pero afecta la percepción de calidad y accesibilidad visual.

**Independent Test**: Se puede probar cambiando el tema del sistema operativo o del navegador entre claro y oscuro y confirmando visualmente que el logo mantiene contraste y forma reconocible en ambos casos.

**Acceptance Scenarios**:

1. **Given** el navegador o sistema operativo está en modo claro, **When** se muestra la pestaña, **Then** el logo es claramente visible con buen contraste contra el fondo claro de la pestaña.
2. **Given** el navegador o sistema operativo está en modo oscuro, **When** se muestra la pestaña, **Then** el logo es claramente visible con buen contraste contra el fondo oscuro de la pestaña.

---

### Edge Cases

- ¿Qué sucede si el navegador no logra cargar ninguno de los dos archivos de imagen (SVG o PNG)? El navegador debe recurrir a su ícono de pestaña por defecto sin generar errores visibles para el usuario ni romper la carga de la página.
- ¿Qué sucede en páginas o rutas adicionales del sitio (si existieran) además de la página principal? El logo debe mostrarse de forma consistente en todas las páginas que compartan la misma cabecera HTML.
- ¿Qué ocurre si el navegador solicita tamaños de ícono específicos (por ejemplo, para marcadores de alta resolución)? El PNG de respaldo debe tener resolución suficiente para verse nítido en los tamaños de ícono más comunes que solicitan los navegadores.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sitio DEBE declarar un ícono de pestaña (favicon) en formato SVG como opción principal.
- **FR-002**: El sitio DEBE declarar un ícono de pestaña en formato PNG como alternativa de respaldo para navegadores que no admiten favicons SVG.
- **FR-003**: El navegador DEBE poder seleccionar automáticamente el formato PNG cuando el SVG no sea compatible, sin requerir acción del usuario.
- **FR-004**: El ícono mostrado en la pestaña DEBE mantener contraste y legibilidad tanto en pestañas con tema claro como en pestañas con tema oscuro.
- **FR-005**: El sitio DEBE referenciar los archivos de imagen existentes (`logo.svg` y `logo.png`), ubicados en el mismo directorio que el archivo principal de la página, sin requerir mover o duplicar dichos archivos.
- **FR-006**: El favicon DEBE mostrarse en todas las páginas HTML del sitio que compartan la cabecera principal.

### Key Entities

- **Logo/Favicon**: Representa la identidad visual del sitio en la pestaña del navegador. Existe en dos variantes: SVG (vectorial, principal) y PNG (rasterizada, de respaldo), ambas ubicadas junto al archivo principal de la página.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de los navegadores modernos con soporte SVG (Chrome, Firefox, Edge) muestran el logo del sitio en la pestaña al cargar la página, en lugar del ícono genérico por defecto.
- **SC-002**: Los navegadores sin soporte de favicon SVG (por ejemplo Safari) muestran el logo en formato PNG en la pestaña, sin mostrar el ícono genérico por defecto.
- **SC-003**: Un usuario puede distinguir visualmente el logo tanto en modo claro como en modo oscuro sin que se pierda contra el fondo de la pestaña, verificado por inspección visual en ambos modos.
- **SC-004**: La carga de la página no se ve afectada negativamente (sin errores en consola ni bloqueos de carga) por la inclusión del favicon.

## Assumptions

- Los archivos `logo.svg` y `logo.png` ya existen en el repositorio, en el mismo nivel que `index.html`, y su contenido visual (diseño, colores) no forma parte del alcance de esta feature; solo se referencian, no se rediseñan.
- El `logo.svg` provisto tiene un fondo de color sólido propio, por lo que se considera visualmente legible tanto en pestañas claras como oscuras sin necesidad de variantes adicionales por tema.
- No se requiere soporte para manifiestos de aplicación web (PWA) ni íconos de pantalla de inicio (Apple touch icon) más allá del favicon estándar de pestaña, ya que no fueron solicitados.
- El sitio actualmente consiste en una única página principal (`index.html`); si existieran páginas adicionales con su propia cabecera, deberán replicar la misma referencia al favicon.
