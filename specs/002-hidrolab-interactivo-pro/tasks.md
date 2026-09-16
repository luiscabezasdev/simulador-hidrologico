---

description: "Task list template for feature implementation"
---

# Tasks: HidroLab Interactivo Pro

**Input**: Design documents from `/specs/002-hidrolab-interactivo-pro/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/interaccion-avanzada.contract.md, quickstart.md

**Tests**: No se solicitaron pruebas automatizadas en la especificación. La verificación se realiza mediante los escenarios manuales de `quickstart.md` (incluye `console.assert()` para `interpolarCaudal()` en DevTools), integrados como tareas de validación al cierre de cada historia y en la Fase de Polish.

**Organización**: Las tareas se agrupan por historia de usuario para permitir implementación y prueba independientes de cada una. Esta feature **extiende** la 001 (`specs/001-simulador-caudal-volumen/`); ningún módulo de esa feature se re-implementa aquí.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2, US3)
- Se incluyen rutas de archivo exactas en cada descripción

## Path Conventions

Proyecto único de aplicación web estática, exactamente los mismos tres archivos en la raíz del repositorio (Constitución, Principio VI): `index.html`, `styles.css`, `script.js`. Esta feature los **extiende**; no crea archivos ni subcarpetas nuevas (plan.md → Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar la agrupación por secciones dentro de `script.js` para las capacidades nuevas, sin tocar los ocho módulos ya exigidos por la Constitución.

- [X] T001 Añadir en `script.js`, después de la última función de interfaz existente (`inicializarAplicacion`, script.js:397) y antes del `document.addEventListener('DOMContentLoaded', ...)`, tres comentarios de sección vacíos que servirán de anclaje a las funciones nuevas: `// ===== TEMA =====`, `// ===== AISLAMIENTO DE SEGMENTO =====`, `// ===== RASTREO CONTINUO =====` (plan.md → Structure Decision, R22). Ningún nombre ni comportamiento de los ocho módulos existentes cambia.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura compartida por User Story 1 y User Story 2 (User Story 3 — modo oscuro — es independiente de esta fase, ver data-model.md → `EstadoInteraccion`).

**⚠️ CRITICAL**: Ninguna tarea de User Story 1 o User Story 2 puede comenzar hasta completar esta fase. User Story 3 no depende de ella y puede avanzar en paralelo.

- [X] T002 Extraer de `actualizarGrafica(ctx, resultado)` (script.js:211) una función `calcularEscalasGrafico(ancho, alto, resultado)` en `script.js` que retorne `{ margen, tMin, tMax, qEjeMin, qEjeMax, anchoGrafico, altoGrafico, escalarT, escalarQ }`, usando exactamente las mismas fórmulas de margen/escala ya presentes en `actualizarGrafica()`, sin cambiar ningún valor calculado; actualizar `actualizarGrafica()` para invocar esta función internamente en lugar de calcular las escalas en línea (contrato R19, DRY Principio VI).
- [X] T003 Definir en `script.js` la forma de `EstadoInteraccion` y un objeto de estado a nivel de módulo `estadoInteraccion = { segmentoAisladoIndice: null, puntoRastreo: null }`; ampliar las firmas de `actualizarGrafica(ctx, resultado, estadoInteraccion)` (script.js:211) y `actualizarInterfaz(resultado, estadoInteraccion)` (script.js:367) para aceptar el nuevo parámetro, y actualizar `renderizarResultado()` (script.js:378) para pasar el `estadoInteraccion` vigente en cada invocación. Cuando ambos campos son `null`, el renderizado debe ser idéntico al de la feature 001 (contrato → "Capa de interfaz — funciones existentes con firma ampliada"). Depende de T002.

**Checkpoint**: `calcularEscalasGrafico()` y la firma ampliada de `actualizarGrafica()`/`actualizarInterfaz()` listas — puede comenzar User Story 1 y User Story 2.

---

## Phase 3: User Story 1 - Explorar el caudal en cualquier instante del hidrograma (Priority: P1) 🎯 MVP

**Goal**: Al mover el cursor (o arrastrar en táctil) sobre la gráfica, el sistema interpola y muestra de inmediato el instante y el caudal exactos en ese punto, usando el mismo modelo lineal por tramos ya calculado, en cualquier posición del rango graficado y no solo en los 6 registros originales.

**Independent Test**: Mover el cursor sobre la gráfica en cualquiera de los dos modos de intervalo y verificar que el valor mostrado en cada posición coincide con evaluar la función lineal del segmento correspondiente, incluyendo los extremos (donde debe coincidir exactamente con los 6 registros originales) y la ausencia de valor fuera del rango.

### Implementation for User Story 1

- [X] T004 [P] [US1] Implementar la función pura `interpolarCaudal(segmentos, t)` en el bloque "Motor Matemático" de `script.js` (después de `calcularPeriodo`, script.js:127-141): búsqueda lineal del índice `i` tal que `segmentos[i].tInicio ≤ t ≤ segmentos[i].tFin` (máximo 5 elementos); si lo encuentra, retorna `{ t, Q: segmentos[i].QInicio + segmentos[i].pendiente * (t - segmentos[i].tInicio), segmentoIndice: i }`, usando exactamente la misma expresión ya empleada por `calcularIntegral()` (sin una segunda fórmula, DRY Principio VI); si `t` está fuera de `[segmentos[0].tInicio, segmentos[segmentos.length-1].tFin]`, retorna `null` (FR-012). Casos de prueba del contrato: `t=0` → `Q === segmentos[0].QInicio` exacto; `t=36` → `Q === segmentos[últ].QFin` exacto; `t=18` → `segmentoIndice === 2`; `t=-1`/`t=999` → `null`. No depende de la Fase 2 (opera solo sobre `SegmentoModelo[]` ya producido por la feature 001).
- [X] T005 [US1] Implementar `posicionAInstante(x, escalas)` en `script.js` como inversa de `escalarT`: `escalas.tMin + ((x - escalas.margen.izquierda) / escalas.anchoGrafico) * (escalas.tMax - escalas.tMin)`, usando el objeto `EscalasGrafico` retornado por `calcularEscalasGrafico()` (T002). Depende de T002.
- [X] T006 [US1] Implementar `manejarMovimientoPuntero(evento)` en `script.js`: calcular `x = evento.clientX - canvas.getBoundingClientRect().left`, convertirlo a `t` con `posicionAInstante()` (T005) usando las escalas del modo activo; si `t` está dentro de `[tMin, tMax]`, invocar `interpolarCaudal(resultado.segmentos, t)` (T004) y guardar el resultado en `estadoInteraccion.puntoRastreo`; si está fuera de rango, fijar `estadoInteraccion.puntoRastreo = null`. Siempre volver a invocar `actualizarGrafica()`/`actualizarInterfaz()` (T003) al final (FR-009, FR-012). Depende de T003, T004, T005.
- [X] T007 [US1] Implementar `manejarPointerDown(evento)` y `manejarPointerUp(evento)` en `script.js`, relevantes solo para `evento.pointerType === 'touch'`: `manejarPointerDown` registra `{ x, y, tiempo }` de inicio; mientras el puntero permanece presionado, cada `pointermove` compara el desplazamiento acumulado contra un umbral de 8px — al superarlo, se activa el modo "arrastre" y cada `pointermove` subsiguiente invoca `manejarMovimientoPuntero()` (T006); si `pointerup`/`pointercancel` ocurre sin superar el umbral, se interpreta como toque breve (tap), delegado a la selección de segmento de User Story 2; al finalizar un arrastre que sí superó el umbral, limpiar `estadoInteraccion.puntoRastreo` (equivalente a que el puntero "salga" del gráfico) (R20, edge case táctil de `spec.md`). Depende de T006.
- [X] T008 [US1] Conectar en `script.js` (dentro de `inicializarAplicacion()` o `prepararLienzo()`, script.js:176) los listeners de puntero sobre `<canvas id="grafico">`: para `pointerType === 'mouse'`, suscribir `manejarMovimientoPuntero()` (T006) directamente a `pointermove` (hover libre, sin requerir botón presionado) y limpiar `puntoRastreo` en `pointerleave`/`pointerout`; para `pointerType === 'touch'`, suscribir `manejarPointerDown`/`manejarPointerUp` (T007) a `pointerdown`/`pointerup`/`pointercancel`. Depende de T006, T007.
- [X] T009 [US1] Extender `actualizarGrafica(ctx, resultado, estadoInteraccion)` en `script.js` (T003) para dibujar un indicador visual (punto o línea vertical) en `(escalarT(estadoInteraccion.puntoRastreo.t), escalarQ(estadoInteraccion.puntoRastreo.Q))` cuando `estadoInteraccion.puntoRastreo !== null`, visible incluso cuando `puntoRastreo.segmentoIndice` corresponde a un segmento atenuado por User Story 2 (FR-013); ningún otro comportamiento de dibujo existente (ejes, puntos originales, escalado) cambia. Depende de T003, T004.
- [X] T010 [P] [US1] Añadir en `index.html`, dentro de `#seccion-grafico` justo después del `<canvas id="grafico">` (index.html:20-23), un elemento de lectura continua `<div id="lectura-rastreo" aria-live="polite"></div>`.
- [X] T011 [US1] Extender `actualizarInterfaz(resultado, estadoInteraccion)` en `script.js` (T003) para poblar `#lectura-rastreo` (T010) con el instante, el caudal interpolado y el segmento al que pertenece cuando `estadoInteraccion.puntoRastreo !== null` (FR-011), y vaciarlo/ocultarlo cuando `puntoRastreo === null` (FR-012). No debe verse afectado ningún otro contenido de `actualizarInterfaz()`. Depende de T003, T010.
- [X] T012 [P] [US1] Añadir en `styles.css` los estilos de `#lectura-rastreo` (T010) y del indicador de puntero dibujado en el canvas, reutilizando las variables CSS existentes (p. ej. `--color-primario`) sin introducir colores nuevos, y asegurando que el texto de lectura mantenga el mismo contraste ≥4.5:1 ya exigido (FR-004). Depende de T010.
- [ ] T013 [US1] Validar manualmente User Story 1 contra `quickstart.md` sección 1 (pasos 1-7) y sección 4 (aserciones `console.assert()` sobre `interpolarCaudal`): valores continuos y sin saltos al cruzar segmentos, coincidencia exacta en los 6 instantes originales, ausencia/ocultación del indicador fuera de rango, y correcta distinción tap-vs-arrastre en un emulador táctil. Depende de T004-T012.

**Checkpoint**: User Story 1 completamente funcional y verificable de forma independiente (SC-001).

---

## Phase 4: User Story 2 - Aislar un segmento para analizarlo en detalle (Priority: P2)

**Goal**: Permitir seleccionar uno de los cinco segmentos del hidrograma (clic/tap sobre el gráfico o leyenda accesible de 5 botones) para atenuar visualmente el resto y sustituir los totales del panel de resumen por las métricas propias del segmento elegido, restaurando la vista de totales al deseleccionar.

**Independent Test**: En modo "Periodo completo", seleccionar cada uno de los cinco segmentos (por clic, tap o leyenda de teclado) y verificar que los otros cuatro se atenúan, que el panel superior muestra solo las métricas de ese segmento, y que deseleccionarlo (repitiendo el gesto, usando "Mostrar periodo completo", o cambiando de modo) restaura la vista de totales.

### Implementation for User Story 2

- [X] T014 [P] [US2] Añadir en `index.html`, dentro de `#seccion-controles` (o una nueva sección junto al gráfico), la leyenda accesible de segmentos: 5 `<button aria-pressed="false">` (uno por segmento) más un `<button>` "Mostrar periodo completo"; todo el bloque visible únicamente cuando el modo activo es `'periodo_completo'` (FR-005, FR-008).
- [X] T015 [US2] Implementar `aislarSegmento(indice)` y `limpiarSeleccionSegmento()` en `script.js` bajo `// ===== AISLAMIENTO DE SEGMENTO =====` (T001): `aislarSegmento(indice)` alterna — si `indice === estadoInteraccion.segmentoAisladoIndice`, delega en `limpiarSeleccionSegmento()`; en otro caso, fija `estadoInteraccion.segmentoAisladoIndice = indice`, actualiza `aria-pressed` de los 5 botones de la leyenda (T014, solo el de `indice` en `"true"`), y vuelve a invocar `actualizarGrafica()`/`actualizarInterfaz()` (T003). `limpiarSeleccionSegmento()` fija `segmentoAisladoIndice = null` incondicionalmente, pone `aria-pressed="false"` en los 5 botones, y vuelve a invocar ambas funciones de renderizado (FR-005, FR-007). Depende de T003, T014.
- [X] T016 [US2] Extender el manejador de `click` del canvas en `script.js` (o el `pointerup` sin superar el umbral táctil de T007) para disparar el aislamiento de segmento: calcular `t` en la posición del clic/tap con `calcularEscalasGrafico()` (T002) + `posicionAInstante()` (T005), obtener el segmento contenedor vía `interpolarCaudal(resultado.segmentos, t).segmentoIndice` (T004), e invocar `aislarSegmento(segmentoIndice)` (T015); solo activo cuando `resultado.modo === 'periodo_completo'` (FR-005, contrato → "Disparadores de aislarSegmento"). Depende de T002, T004, T005, T007, T015.
- [X] T017 [US2] Conectar en `script.js` los manejadores de `click`/`Enter`/`Espacio` (activación nativa de `<button>`) de los 5 botones de la leyenda (T014) a `aislarSegmento(indice)` (T015) y del botón "Mostrar periodo completo" a `limpiarSeleccionSegmento()` (T015); extender `manejarCambioModo(evento)` (script.js:388) para invocar `limpiarSeleccionSegmento()` antes de recalcular `calcularPeriodo()`, y para mostrar/ocultar la leyenda (T014) según el nuevo `resultado.modo` (solo visible en `'periodo_completo'`) (FR-007, FR-008, Acceptance Scenario 4-5 de US2). Depende de T014, T015.
- [X] T018 [US2] Extender `actualizarGrafica(ctx, resultado, estadoInteraccion)` en `script.js` (T003/T009) para dibujar los segmentos distintos al `estadoInteraccion.segmentoAisladoIndice` con opacidad reducida (canal alfa menor sobre el color de relleno/trazo ya usado, sin color nuevo), manteniendo el segmento aislado con opacidad normal, cuando `segmentoAisladoIndice !== null` (FR-005, Acceptance Scenario 1 US2). Depende de T003, T015.
- [X] T019 [US2] Extender `actualizarInterfaz(resultado, estadoInteraccion)` en `script.js` (T003/T011) para que, cuando `estadoInteraccion.segmentoAisladoIndice !== null`, el panel `#resumen-resultado` muestre únicamente las métricas locales del segmento aislado — volumen parcial (`segmentos[indice].volumenIntegral`), caudal promedio local (`(QInicio + QFin) / 2`) y pendiente `m` (`segmentos[indice].pendiente`) — en lugar de los totales de `generarResumen(resultado)`; cuando `segmentoAisladoIndice === null`, el comportamiento es idéntico al de la feature 001. `#bloques-procedimiento` (script.js:339-366) no se modifica en ningún caso (FR-006). Depende de T003, T015.
- [X] T020 [P] [US2] Añadir en `styles.css` los estilos de la leyenda de segmentos (T014): estado `:focus-visible` visible y un estilo distintivo para `[aria-pressed="true"]` que no dependa solo del color (WCAG AA), más el estilo del botón "Mostrar periodo completo". Depende de T014.
- [ ] T021 [US2] Validar manualmente User Story 2 contra `quickstart.md` sección 2 (pasos 1-6): aislamiento/deselección por clic en el canvas, operación completa por teclado vía leyenda, limpieza con "Mostrar periodo completo", limpieza automática al cambiar de modo, e independencia respecto al alternador de tema. Depende de T014-T020.

**Checkpoint**: User Story 1 y User Story 2 funcionan de forma independiente y combinada (SC-002).

---

## Phase 5: User Story 3 - Usar el simulador cómodamente en modo oscuro (Priority: P3)

**Goal**: La interfaz detecta y respeta automáticamente la preferencia de tema del sistema en la primera visita, permite alternar explícitamente entre tema claro y oscuro, y recuerda esa elección explícita en visitas futuras, manteniendo el mismo contraste WCAG 2.1 AA en ambos temas.

**Independent Test**: Activar el control de tema, recargar la página y verificar que la preferencia se mantiene; en un navegador sin preferencia almacenada, verificar que la interfaz respeta la preferencia de tema del sistema operativo.

### Implementation for User Story 3

- [X] T022 [P] [US3] Añadir en `styles.css`, después del bloque `:root` existente (styles.css:18-35), un bloque `:root[data-tema="oscuro"] { ... }` que redefine las mismas 9 variables de color (`--color-fondo`, `--color-superficie`, `--color-texto`, `--color-texto-secundario`, `--color-borde`, `--color-primario`, `--color-primario-claro`, `--color-exito`, `--color-error`) con valores de tema oscuro verificados para mantener ≥4.5:1 de contraste en texto y ≥3:1 en elementos gráficos/áreas sombreadas contra el nuevo fondo oscuro (FR-004, R17); ningún otro selector de `styles.css` se modifica.
- [X] T023 [US3] Implementar en `script.js`, bajo `// ===== TEMA =====` (T001): `detectarPreferenciaSistema()` (retorna `'oscuro'` si `window.matchMedia('(prefers-color-scheme: dark)').matches`, si no `'claro'`); `leerTemaGuardado()` (envuelve `localStorage.getItem('hidrolab-tema')` en `try/catch`, retorna el valor solo si es exactamente `'claro'` o `'oscuro'`, si no `null`); `guardarTemaElegido(tema)` (envuelve `localStorage.setItem('hidrolab-tema', tema)` en `try/catch`, falla en silencio); `aplicarTema(tema)` (fija `document.documentElement.dataset.tema = tema` y actualiza `aria-pressed` del alternador de tema); `alternarTema()` (lee `dataset.tema` actual, lo invierte, llama a `aplicarTema()` y `guardarTemaElegido()`); `inicializarTema()` (llama a `leerTemaGuardado()` — si no es `null`, `aplicarTema(valorGuardado)` sin volver a guardar; si es `null`, `aplicarTema(detectarPreferenciaSistema())` y suscribe un listener `change` de `matchMedia` que reaplica `detectarPreferenciaSistema()` solo mientras `leerTemaGuardado() === null` en el momento del evento) (FR-001 a FR-003, R15, R16). No depende de la Fase 2 (independiente de `EstadoInteraccion`, ver data-model.md).
- [X] T024 [P] [US3] Añadir en `index.html`, dentro de `<header>` (index.html:11-13), un botón alternador de tema `<button id="alternador-tema" aria-pressed="false">` con una etiqueta accesible que describa su acción (p. ej. "Cambiar a tema oscuro"/"Cambiar a tema claro").
- [X] T025 [US3] Conectar en `script.js` el `click` de `#alternador-tema` (T024) a `alternarTema()` (T023), actualizando su `aria-pressed` y etiqueta visible en cada llamada a `aplicarTema()`; invocar `inicializarTema()` (T023) una sola vez al inicio de `inicializarAplicacion()` (script.js:397), antes del cálculo/renderizado inicial ya existente, para que el tema quede aplicado antes del primer dibujo (FR-001, FR-015). Depende de T023, T024.
- [X] T026 [P] [US3] Añadir en `styles.css` los estilos de `#alternador-tema` (T024): estado `:focus-visible` visible y un indicador de estado (icono/texto) que no dependa solo del color para reflejar `aria-pressed="true"/"false"` (FR-015, SC-005). Depende de T024.
- [ ] T027 [US3] Validar manualmente User Story 3 contra `quickstart.md` sección 3 (pasos 1-6): coincidencia con la preferencia del sistema en primera visita, cambio inmediato y legible al alternar, persistencia tras recargar, degradación correcta con `localStorage` deshabilitado, y verificación de contraste WCAG AA de la paleta oscura (T022) con un inspector de contraste del navegador. Depende de T022-T026.

**Checkpoint**: Las tres historias de usuario están completas e independientemente funcionales.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final integrada contra los criterios de éxito (`spec.md`) y `quickstart.md`, sin introducir cambios estructurales.

- [ ] T028 [P] Ejecutar la validación manual completa de `quickstart.md` (secciones 1 a 5) con las tres historias de usuario implementadas en conjunto, confirmando que no hay regresiones cruzadas (p. ej. el rastreo continuo sigue funcionando sobre segmentos atenuados, y alternar el tema no altera el aislamiento de segmento vigente) (SC-001 a SC-006).
- [ ] T029 [P] Verificar navegación completa solo con teclado de todos los controles nuevos (alternador de tema, 5 botones de la leyenda de segmentos, botón "Mostrar periodo completo"): alcanzables con `Tab`, operables con `Enter`/`Espacio`, con indicador de foco visible (FR-015, SC-005).
- [ ] T030 [P] Con la pestaña "Network" de DevTools abierta, alternar el tema, aislar un segmento y mover el cursor sobre la gráfica: confirmar que no se registra ninguna petición de red en ningún momento (Principio II).
- [X] T031 [P] Revisar los nuevos estados y mensajes (indicador de rastreo, estados `aria-pressed` de la leyenda, alternador de tema) contra la tabla de errores de `contracts/interaccion-avanzada.contract.md` (`localStorage` no disponible → degradación silenciosa; `t` fuera de rango → `puntoRastreo = null` sin error de consola), confirmando que ningún `NaN`/`undefined` queda expuesto (Principio VII).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede iniciar de inmediato.
- **Foundational (Phase 2)**: Depende de Setup. BLOQUEA User Story 1 y User Story 2; no bloquea User Story 3.
- **User Story 1 (Phase 3)**: Depende de Foundational (T002-T003) para `estadoInteraccion` y `calcularEscalasGrafico()`; `interpolarCaudal()` (T004) en sí no depende de Foundational.
- **User Story 2 (Phase 4)**: Depende de Foundational y reutiliza `interpolarCaudal()` (T004) y `posicionAInstante()`/`manejarPointerDown`/`manejarPointerUp` (T005, T007) de User Story 1 para el hit-testing de clic/tap sobre el canvas (T016); la leyenda accesible (T014-T015, T017) y las extensiones de renderizado (T018-T019) no dependen de User Story 1.
- **User Story 3 (Phase 5)**: Totalmente independiente de Foundational, User Story 1 y User Story 2 (`PreferenciaTema` no forma parte de `EstadoInteraccion`, data-model.md); puede implementarse en cualquier momento, incluso en paralelo a las otras dos.
- **Polish (Phase 6)**: Depende de que las tres historias de usuario estén completas.

### User Story Dependencies

- **User Story 1 (P1)**: Depende solo de Foundational.
- **User Story 2 (P2)**: Depende de Foundational y de las funciones de hit-testing/puntero de User Story 1 (T004, T005, T007) para el gesto de clic/tap directo sobre el canvas (T016); la vía de la leyenda accesible (T014, T015, T017) es independiente de User Story 1.
- **User Story 3 (P3)**: Sin dependencias de otras historias.

### Within Each User Story

- Funciones puras/de estado antes que los manejadores de eventos que las consumen; manejadores de eventos antes que las extensiones de `actualizarGrafica()`/`actualizarInterfaz()` que dibujan/muestran su resultado.
- Elementos de `index.html` referenciados por `id` deben existir antes de que el `script.js` correspondiente los consulte (p. ej. T010 antes de T011; T014 antes de T015/T017; T024 antes de T025).
- Tareas de `styles.css` pueden avanzar en paralelo a la lógica de `script.js` de la misma historia, ya que no comparten archivo.

### Parallel Opportunities

- T004 (interpolarCaudal) puede avanzar en paralelo a T002-T003 (Foundational), ya que no depende de ellas.
- T010 (HTML) y T012 (CSS) de User Story 1 pueden avanzar en paralelo a T004-T009 (script.js) de la misma historia.
- T014 (HTML de la leyenda) y T020 (CSS de la leyenda) de User Story 2 pueden avanzar en paralelo a T015-T019 (script.js).
- Toda la User Story 3 (T022-T027) puede avanzar en paralelo a User Story 1 y User Story 2, al no compartir estado ni funciones con ellas.
- Todas las tareas de Polish marcadas `[P]` (T028-T031) son verificaciones independientes y pueden ejecutarse en paralelo.

---

## Parallel Example: User Story 1

```bash
# T004 (motor matemático puro) no depende de Foundational ni de T005-T009:
Task: "Implementar interpolarCaudal(segmentos, t) en script.js"

# T010 (HTML) y T012 (CSS) pueden avanzar en paralelo a T005-T009 (script.js):
Task: "Añadir #lectura-rastreo en index.html"
Task: "Añadir estilos de #lectura-rastreo y del indicador de puntero en styles.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Fase 1: Setup.
2. Completar Fase 2: Foundational (bloqueante para User Story 1 y 2).
3. Completar Fase 3: User Story 1.
4. **DETENER Y VALIDAR**: probar User Story 1 de forma independiente contra `quickstart.md` sección 1 y 4 (SC-001).
5. Demostrar si está listo — ya aporta el mayor valor pedagógico por sí solo (spec.md → "Why this priority" de US1).

### Incremental Delivery

1. Setup + Foundational → base lista para US1/US2 (US3 puede avanzar en paralelo desde el inicio).
2. Añadir User Story 1 → probar independientemente → demo (MVP, SC-001).
3. Añadir User Story 2 (reutiliza T004/T005/T007 de US1 para el hit-testing de clic/tap) → probar independientemente, incluida la vía de leyenda accesible → demo (SC-002).
4. Añadir/confirmar User Story 3 (independiente, pudo avanzar en paralelo) → probar independientemente → demo (SC-003, SC-004, SC-006).
5. Fase de Polish → validación integrada completa contra `quickstart.md` y los seis criterios de éxito.

---

## Notes

- `[P]` = archivo distinto, sin dependencias pendientes sobre tareas del mismo momento.
- `[Story]` mapea cada tarea a su historia de usuario para trazabilidad.
- Ningún nombre de los ocho módulos exigidos por la Constitución (`validarDatos`, `calcularSegmento`, `calcularIntegral`, `calcularTrapecio`, `verificarResultados`, `calcularPeriodo`, `actualizarGrafica`, `actualizarInterfaz`) se renombra; solo `actualizarGrafica`/`actualizarInterfaz` amplían su firma (T003).
- Ninguna tarea de codificación crea archivos fuera de `index.html`, `styles.css`, `script.js` (Principio VI: exactamente 3 archivos de producción).
- FR-014 prohíbe explícitamente introducir splines, regresiones u otra suavización no lineal en cualquier tarea: `interpolarCaudal()` (T004) reutiliza únicamente la fórmula lineal por tramos ya definida.
