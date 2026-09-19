# Data Model: Favicon del proyecto

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Esta feature no introduce datos en tiempo de ejecución, estado, ni persistencia. El único
"modelo" relevante es el conjunto de assets estáticos que representan el ícono del sitio y cómo
se relacionan con el documento HTML.

## Entidad: Ícono de Favicon

Representa un archivo de imagen estático referenciado desde el `<head>` de `index.html` para ser
usado por el navegador como ícono de pestaña.

| Atributo | Descripción | Valores en esta feature |
| --- | --- | --- |
| `archivo` | Ruta relativa al archivo de imagen, al mismo nivel que `index.html` | `logo.svg`, `logo.png` |
| `formato` | Tipo de imagen | `image/svg+xml` (vectorial), `image/png` (rasterizado) |
| `rol` | Función dentro de la declaración de favicon | `principal` (SVG), `respaldo` (PNG) |
| `origen` | Si el archivo ya existe o se crea en esta feature | Ambos ya existen en el repositorio; no se crean ni modifican |

**Reglas de validación** (derivadas de los Functional Requirements de la spec):

- Debe existir exactamente un ícono con rol `principal` en formato `image/svg+xml` (FR-001).
- Debe existir exactamente un ícono con rol `respaldo` en formato `image/png` (FR-002).
- Ambos archivos deben ubicarse en el mismo directorio que `index.html`, sin rutas relativas que
  apunten fuera del proyecto (FR-005).
- Ninguno de los dos archivos se modifica en su contenido visual como parte de esta feature
  (Assumption de la spec).

**Relaciones**: Ambos íconos se referencian desde el mismo documento (`index.html`); si el sitio
llegara a tener páginas HTML adicionales que compartan cabecera, cada una debe declarar la misma
referencia (FR-006), pero no existe una relación de datos entre archivos — son referencias
independientes al mismo par de assets.

**Transiciones de estado**: No aplica — son archivos estáticos sin ciclo de vida ni cambios de
estado en tiempo de ejecución.
