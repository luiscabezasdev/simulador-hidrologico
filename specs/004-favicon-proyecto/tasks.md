---

description: "Task list template for feature implementation"
---

# Tasks: Favicon del proyecto

**Input**: Design documents from `/specs/004-favicon-proyecto/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/favicon-markup-contract.md, quickstart.md

**Tests**: No se solicitaron tests automatizados en la spec (proyecto sin framework de testing, Principio II de la constitución). Las tareas de verificación de esta feature son validaciones manuales en navegador, documentadas en `quickstart.md`.

**Organization**: Las tareas se agrupan por historia de usuario para permitir implementación y verificación independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2)
- Se incluyen rutas de archivo exactas en las descripciones

## Path Conventions

- **Proyecto único, sin `src/`**: sitio estático plano en la raíz del repositorio (`index.html`, `styles.css`, `script.js`, `logo.svg`, `logo.png`), según `plan.md` → Project Structure.

## Phase 1: Setup

**Purpose**: Confirmar que los prerrequisitos de la feature (los assets de imagen) están en su lugar antes de tocar el marcado.

- [X] T001 Verificar que `logo.svg` y `logo.png` existen en la raíz del repositorio, al mismo nivel que `index.html` (ver data-model.md → Entidad "Ícono de Favicon", atributo `archivo`)

**Checkpoint**: Assets confirmados; no se requieren cambios a `logo.svg` ni `logo.png` (quedan fuera de alcance, ver Assumptions de spec.md).

---

## Phase 2: Foundational

**Purpose**: Prerrequisitos bloqueantes compartidos por todas las historias de usuario.

*No aplica a esta feature*: no existe infraestructura compartida más allá de los assets verificados en la Fase 1. El propio cambio de marcado que habilita ambas historias de usuario se implementa como la tarea principal de la Historia de Usuario 1 (Fase 3), ya que es un cambio atómico de dos líneas en `<head>`.

---

## Phase 3: User Story 1 - Reconocer el sitio por su ícono en la pestaña (Priority: P1) 🎯 MVP

**Goal**: Que el navegador muestre el logo del proyecto en la pestaña, usando SVG como formato principal y PNG como respaldo cuando el navegador no admite favicons SVG.

**Independent Test**: Abrir `index.html` en un navegador con soporte de favicon SVG y confirmar visualmente el logo en la pestaña; luego abrirlo en un navegador sin ese soporte (o simular la ausencia) y confirmar que se muestra el PNG en su lugar.

### Implementation for User Story 1

- [X] T002 [US1] Agregar las etiquetas de favicon al `<head>` de `index.html`, exactamente como especifica `contracts/favicon-markup-contract.md`:
  `<link rel="icon" type="image/svg+xml" href="logo.svg">` seguida de
  `<link rel="icon" type="image/png" href="logo.png">`.
  Reglas a respetar (data-model.md → Entidad "Ícono de Favicon"): debe existir exactamente un ícono con rol `principal` en formato `image/svg+xml` (FR-001) y exactamente un ícono con rol `respaldo` en formato `image/png` (FR-002); ambas rutas son relativas sin prefijo de carpeta, ya que los archivos están al mismo nivel que `index.html` (FR-005); sin atributo `sizes` ni `media` en ninguna de las dos etiquetas (ver research.md, Decisiones 3 y 4)
- [ ] T003 [P] [US1] Verificar manualmente en un navegador con soporte de favicon SVG (Chrome, Firefox o Edge) que la pestaña muestra el logo SVG y que la pestaña Network/Red de las herramientas de desarrollador confirma `logo.svg` con código 200, según `quickstart.md` paso 2
- [ ] T004 [P] [US1] Verificar manualmente el respaldo PNG en un navegador sin soporte de favicon SVG (p. ej. Safari/WebKit, o simulando la ausencia de soporte) confirmando que la pestaña muestra el logo PNG en su lugar, según `quickstart.md` paso 3
- [ ] T005 [P] [US1] Verificar manualmente que, al guardar `index.html` como marcador/favorito del navegador, el logo aparece junto al nombre del sitio en la lista de marcadores, según `quickstart.md` paso 4

**Checkpoint**: User Story 1 completamente funcional y verificable de forma independiente — el favicon se ve en pestaña y marcadores, con respaldo PNG funcionando.

---

## Phase 4: User Story 2 - Ver el logo correctamente en modo claro y oscuro (Priority: P2)

**Goal**: Confirmar que el logo mostrado en la pestaña (ya implementado en la Historia de Usuario 1) mantiene buen contraste tanto en modo claro como en modo oscuro del sistema operativo/navegador.

**Independent Test**: Con el marcado de favicon de la Historia de Usuario 1 ya presente, cambiar el tema del sistema operativo o navegador entre claro y oscuro y confirmar visualmente que el logo se distingue con buen contraste en ambos casos.

### Implementation for User Story 2

- [ ] T006 [P] [US2] Verificar manualmente, con el sistema operativo o navegador en modo claro, que el logo de la pestaña se distingue con buen contraste contra el fondo claro, según `quickstart.md` paso 5.1
- [ ] T007 [P] [US2] Verificar manualmente, con el sistema operativo o navegador en modo oscuro, que el logo de la pestaña se distingue con buen contraste contra el fondo oscuro, según `quickstart.md` paso 5.2

**Checkpoint**: User Story 1 y User Story 2 verificadas — el favicon se ve correctamente en pestaña, marcadores, y en ambos temas de navegador.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final de extremo a extremo y ausencia de regresiones.

- [ ] T008 Ejecutar la validación completa de `quickstart.md` (pasos 1 a 6) sobre `index.html`, confirmando en las herramientas de desarrollador que no hay errores de consola ni solicitudes fallidas (404) para `logo.svg` o `logo.png`, y que el simulador de caudal sigue funcionando con normalidad (SC-004)
- [X] T009 [P] Confirmar que las etiquetas `<link>` añadidas en `index.html` cumplen exactamente `contracts/favicon-markup-contract.md` (atributos `rel`, `type`, `href`; ausencia de `sizes` y `media`; orden SVG antes de PNG; ubicación dentro de `<head>`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede iniciarse de inmediato.
- **Foundational (Phase 2)**: No aplica (sin tareas) — no bloquea nada adicional.
- **User Story 1 (Phase 3)**: Depende de Setup (Phase 1). Es la única fase que modifica código (`index.html`).
- **User Story 2 (Phase 4)**: Depende de que el marcado de User Story 1 (T002) ya esté implementado, ya que reutiliza el mismo favicon; no requiere cambios de código adicionales, solo verificación visual.
- **Polish (Phase 5)**: Depende de que User Story 1 y User Story 2 estén completas.

### User Story Dependencies

- **User Story 1 (P1)**: Puede iniciarse después de Setup. No depende de otras historias. Es el MVP.
- **User Story 2 (P2)**: Depende técnicamente de la implementación de User Story 1 (T002), porque valida el mismo favicon ya implementado; no añade código propio, solo verificación independiente de un criterio adicional (contraste en modo oscuro/claro).

### Within Each User Story

- User Story 1: la tarea de implementación (T002) precede a las verificaciones manuales (T003–T005), que pueden ejecutarse en paralelo entre sí una vez T002 esté completa.
- User Story 2: ambas verificaciones (T006, T007) pueden ejecutarse en paralelo entre sí, una vez T002 esté completa.

### Parallel Opportunities

- T003, T004 y T005 (verificaciones de User Story 1) pueden ejecutarse en paralelo entre sí después de T002.
- T006 y T007 (verificaciones de User Story 2) pueden ejecutarse en paralelo entre sí después de T002.
- T009 (Polish) puede ejecutarse en paralelo con T008 al ser una revisión de archivo distinta (aunque ambas leen el mismo `index.html`, no lo modifican, por lo que no hay conflicto de escritura).

---

## Parallel Example: User Story 1

```bash
# Después de completar T002 (agregar las etiquetas <link> de favicon):
Task: "Verificar favicon SVG en Chrome/Firefox/Edge, según quickstart.md paso 2"
Task: "Verificar respaldo PNG en Safari/WebKit, según quickstart.md paso 3"
Task: "Verificar logo en marcador/favorito, según quickstart.md paso 4"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup (verificar assets existentes).
2. Phase 2: Foundational no aplica — sin tareas.
3. Completar Phase 3: User Story 1 (agregar las dos etiquetas `<link>` y verificar).
4. **DETENERSE Y VALIDAR**: confirmar que el favicon se ve en pestaña, con respaldo PNG y en marcadores.
5. Publicar/mostrar si está listo — esto ya satisface el requisito central de la spec.

### Incremental Delivery

1. Setup completo → assets confirmados.
2. Agregar User Story 1 → verificar independientemente → esto es el MVP (favicon visible con respaldo PNG).
3. Agregar User Story 2 → verificar independientemente (contraste en modo claro/oscuro) → sin cambios de código adicionales.
4. Polish → validación completa de `quickstart.md` y del contrato de marcado.

---

## Notes

- [P] = archivos distintos o verificación sin conflicto de escritura, sin dependencias entre sí.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- No se generaron tareas de test automatizado: no fueron solicitadas en la spec y el proyecto no usa un framework de testing (Principio II de la constitución — solo HTML/CSS/JS vanilla).
- Toda la implementación de código se concentra en una sola tarea (T002) porque la feature completa es un cambio de dos líneas en `<head>`; el resto de las tareas son verificaciones manuales trazadas a `quickstart.md`.
- Confirmar después de T002 que el simulador (`script.js`) sigue funcionando sin cambios — esta feature no debe tocar la lógica matemática.
