# Research: Favicon del proyecto

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

No quedaron `[NEEDS CLARIFICATION]` en el Technical Context del plan. Este documento registra las
decisiones técnicas tomadas para resolver los requisitos de la spec (SVG principal + PNG de
respaldo, legible en modo claro/oscuro) dentro de las restricciones de la constitución del
proyecto (HTML/CSS/JS vanilla, sin dependencias externas).

## Decisión 1: Cómo declarar SVG como principal y PNG como respaldo

**Decision**: Agregar dos etiquetas `<link>` en el `<head>` de `index.html`, en este orden:

```html
<link rel="icon" type="image/svg+xml" href="logo.svg">
<link rel="icon" type="image/png" href="logo.png">
```

**Rationale**: Es el patrón estándar y ampliamente soportado (sin necesidad de JavaScript ni
detección de capacidades) para declarar un ícono vectorial con respaldo rasterizado. Los
navegadores evalúan el atributo `type` de cada `<link rel="icon">`: si reconocen y soportan
`image/svg+xml` (Chrome, Firefox, Edge) usan ese ícono; si no lo soportan o tienen soporte parcial
para favicons SVG (históricamente el caso de Safari/WebKit), ignoran esa entrada y recurren al
siguiente `<link rel="icon">` compatible, que es el PNG. No requiere ninguna librería ni lógica
adicional, cumpliendo el Principio II (stack restringido) de la constitución.

**Alternatives considered**:
- *Un solo `<link rel="icon" href="logo.svg">` sin `type` ni PNG*: rechazado porque no cumple el
  requisito explícito de la spec (FR-002) de tener un respaldo PNG para navegadores sin soporte
  SVG.
- *Usar `<link rel="icon" sizes="any" href="logo.svg">` más `<link rel="alternate icon">`*:
  patrón más nuevo y menos soportado de forma consistente entre navegadores; se prefiere el
  patrón basado en `type`, más ampliamente documentado y compatible.
- *Detectar soporte SVG con JavaScript y escribir el `<link>` dinámicamente*: rechazado por
  innecesario — el propio navegador ya resuelve esto de forma declarativa vía HTML, y añadir JS
  para esto violaría el principio de no añadir complejidad innecesaria (Principio VI).

## Decisión 2: Orden de las etiquetas `<link>`

**Decision**: SVG primero, PNG después (como se muestra arriba).

**Rationale**: Es el orden recomendado en la práctica común de la industria: coloca primero el
formato preferido (vectorial, escala mejor) y el fallback después. El orden no afecta la
compatibilidad (los navegadores seleccionan por `type` soportado, no estrictamente por posición),
pero mantener el orden preferido→fallback hace el HTML más legible y consistente con el
requisito FR-001 (SVG como opción principal).

**Alternatives considered**: PNG primero, SVG después — funcionalmente equivalente en los
navegadores probados, pero menos legible respecto a la intención (SVG es el formato principal
según la spec).

## Decisión 3: Atributo `sizes` en el PNG de respaldo

**Decision**: No se añade el atributo `sizes` a la etiqueta del PNG.

**Rationale**: El archivo `logo.png` existente es de 51×41 px (no cuadrado y de tamaño no
estándar). La spec y las Assumptions indican que los archivos de imagen no se modifican ni
rediseñan en el alcance de esta feature. Omitir `sizes` permite que el navegador escale el PNG
según lo necesite para la pestaña o los marcadores, sin declarar una medida que no corresponde
exactamente al archivo real.

**Alternatives considered**: Declarar `sizes="32x32"` o similar — rechazado porque no reflejaría
el tamaño real del archivo y podría causar que algunos navegadores lo descarten por no coincidir
con el tamaño anunciado.

## Decisión 4: Legibilidad en modo claro y oscuro (FR-004)

**Decision**: No se crean variantes adicionales de ícono por tema (claro/oscuro); se usa el mismo
`logo.svg` / `logo.png` en ambos casos.

**Rationale**: El `logo.svg` ya tiene un `<rect>` de fondo sólido (`fill="#0284C7"`, azul) que
ocupa todo el viewBox de 44×44, por lo que el ícono no depende del color de fondo de la pestaña
del navegador para verse — mantiene contraste propio tanto en pestañas claras como oscuras. Esto
cumple FR-004 sin trabajo adicional. La media feature `prefers-color-scheme` aplicada a favicons
(vía `<link media="(prefers-color-scheme: dark)">`) existe pero tiene soporte inconsistente entre
navegadores y requeriría además una segunda variante de arte (fuera del alcance según las
Assumptions de la spec, que indican que el diseño visual del logo no se rediseña en esta feature).

**Alternatives considered**: Crear una segunda variante del SVG para modo oscuro y declararla con
`media="(prefers-color-scheme: dark)"` — rechazado por estar fuera de alcance (requeriría
diseñar un nuevo asset) y por soporte de navegador inconsistente para esta técnica en favicons.

## Resumen

Todas las decisiones se resuelven con marcado HTML declarativo estándar, sin nuevas dependencias,
sin tocar `script.js`, y reutilizando los archivos `logo.svg` / `logo.png` ya presentes en el
repositorio. No quedan incógnitas pendientes para el diseño (Phase 1).
