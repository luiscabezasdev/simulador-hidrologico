# Contract: Marcado HTML del Favicon

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md)

Este proyecto es un sitio estático sin API ni backend, por lo que su único "contrato" expuesto es
el marcado HTML que el navegador consume para resolver el ícono de la pestaña. Este documento fija
ese contrato para que la implementación (Phase 2 / tasks) y cualquier verificación futura tengan
una referencia exacta.

## Contrato

El `<head>` de `index.html` (y de cualquier otra página HTML que comparta cabecera, ver FR-006)
DEBE incluir, en este orden, las siguientes etiquetas, sin atributos adicionales no listados aquí:

```html
<link rel="icon" type="image/svg+xml" href="logo.svg">
<link rel="icon" type="image/png" href="logo.png">
```

### Reglas del contrato

1. **Presencia obligatoria**: ambas etiquetas deben estar presentes; ninguna es opcional
   (cubre FR-001 y FR-002).
2. **Valores fijos**: `rel="icon"` en ambas; `type` debe ser exactamente `image/svg+xml` para la
   entrada SVG y `image/png` para la entrada PNG (permite al navegador decidir compatibilidad sin
   descargar el archivo primero).
3. **Rutas relativas**: `href` apunta a `logo.svg` y `logo.png` sin prefijo de carpeta, ya que
   ambos archivos están al mismo nivel que `index.html` (FR-005). Si `index.html` se moviera de
   ubicación, estas rutas tendrían que actualizarse — fuera del alcance de esta feature.
4. **Sin atributo `sizes`**: no se declara `sizes` en ninguna de las dos etiquetas (ver
   research.md, Decisión 3).
5. **Sin `media` query de tema**: no se declaran variantes `prefers-color-scheme` (ver
   research.md, Decisión 4) — el mismo SVG/PNG cubre modo claro y oscuro (FR-004) porque el SVG
   ya trae fondo sólido propio.
6. **Ubicación**: ambas etiquetas van dentro de `<head>`, junto al `<link rel="stylesheet">`
   existente; no se colocan en `<body>`.

## Consumidores del contrato

- El navegador del visitante, al pintar la pestaña, la barra de marcadores y el historial.
- Cualquier verificación manual futura (ver `quickstart.md`) que confirme visualmente el ícono en
  distintos navegadores y temas.

## Fuera de alcance de este contrato

- `apple-touch-icon`, `manifest.json` u otros íconos de PWA / pantalla de inicio — no solicitados
  por la spec (ver Assumptions).
- Variantes de tamaño múltiple (`sizes="16x16 32x32"`, `.ico` multi-resolución) — no se generan
  nuevos assets en esta feature.
