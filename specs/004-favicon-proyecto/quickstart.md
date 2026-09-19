# Quickstart: Validar el Favicon del proyecto

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Contract**: [contracts/favicon-markup-contract.md](./contracts/favicon-markup-contract.md)

Esta guía valida manualmente que el favicon cumple la spec (User Story 1 y 2). No requiere build,
servidor ni herramientas adicionales — el sitio es HTML/CSS/JS estático (Principio II de la
constitución).

## Prerrequisitos

- Los archivos `logo.svg` y `logo.png` existen en la raíz del proyecto, junto a `index.html`.
- `index.html` incluye las dos etiquetas `<link rel="icon">` descritas en el contrato de marcado.
- Un navegador con soporte de favicon SVG (Chrome, Firefox o Edge) y, si es posible, Safari o un
  motor WebKit para probar el caso de respaldo PNG.

## Pasos de validación

### 1. Verificar el marcado

Abrir `index.html` y confirmar en el `<head>` la presencia exacta de:

```html
<link rel="icon" type="image/svg+xml" href="logo.svg">
<link rel="icon" type="image/png" href="logo.png">
```

### 2. Probar en un navegador con soporte SVG (User Story 1, escenario 1)

1. Abrir `index.html` directamente en el navegador (doble clic o `file://` — no requiere
   servidor, cumple Principio II).
2. Observar la pestaña del navegador: debe mostrarse el logo (ícono azul con las líneas de
   caudal), no el ícono genérico por defecto.
3. Abrir las herramientas de desarrollador → pestaña Network/Red → recargar → confirmar que
   `logo.svg` se solicita con código 200 (no 404).

**Resultado esperado**: la pestaña muestra el logo en SVG (SC-001).

### 3. Probar el respaldo PNG (User Story 1, escenario 2)

1. Abrir el mismo `index.html` en un navegador sin soporte de favicon SVG (p. ej. Safari) o
   simular la ausencia de soporte SVG si no se dispone de uno.
2. Observar la pestaña: debe mostrarse el logo en PNG, no el ícono genérico por defecto.

**Resultado esperado**: la pestaña muestra el logo en PNG cuando el SVG no es utilizable
(SC-002).

### 4. Probar marcadores/favoritos (User Story 1, escenario 3)

1. Guardar la página como marcador/favorito en el navegador.
2. Abrir la lista de marcadores y confirmar que el logo aparece junto al nombre del sitio.

### 5. Probar modo claro y modo oscuro (User Story 2)

1. Con el sistema operativo o el navegador en modo claro, observar la pestaña: el logo debe
   distinguirse con buen contraste contra el fondo claro.
2. Cambiar el sistema operativo o el navegador a modo oscuro, recargar si es necesario, y
   observar la pestaña: el logo debe seguir distinguiéndose con buen contraste contra el fondo
   oscuro.

**Resultado esperado**: el logo es reconocible en ambos temas sin cambios adicionales, gracias a
su fondo sólido propio (SC-003).

### 6. Confirmar que no hay errores ni bloqueos (Edge case / SC-004)

1. Con las herramientas de desarrollador abiertas, recargar la página.
2. Confirmar que la consola no muestra errores relacionados con `logo.svg` o `logo.png`.
3. Confirmar que la página carga y funciona con normalidad (el simulador de caudal sigue
   operando igual que antes del cambio).

## Criterio de aceptación de esta validación

Todos los pasos anteriores deben cumplirse sin ítems fallidos para considerar la feature
completa, en línea con los Success Criteria de la spec (SC-001 a SC-004).
