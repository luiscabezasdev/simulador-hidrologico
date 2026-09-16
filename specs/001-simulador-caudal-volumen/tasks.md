---

description: "Task list template for feature implementation"
---

# Tasks: Simulador Matemático-Educativo de Caudal y Volumen (Río Magdalena)

**Input**: Design documents from `/specs/001-simulador-caudal-volumen/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/motor-matematico.contract.md, quickstart.md

**Tests**: No se solicitaron pruebas automatizadas en la especificación. La verificación se realiza mediante los escenarios manuales de `quickstart.md` (incluye `console.assert()` ejecutado en DevTools), integrados como tareas de la Fase de Polish.

**Organización**: Las tareas se agrupan por historia de usuario para permitir implementación y prueba independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2, US3)
- Se incluyen rutas de archivo exactas en cada descripción

## Path Conventions

Proyecto único de aplicación web estática, exactamente tres archivos en la raíz del repositorio (Constitución, Principio VI): `index.html`, `styles.css`, `script.js`. Sin subcarpetas `src/`/`tests/`, sin build step (plan.md → Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización de los tres archivos de producción exigidos por la Constitución.

- [X] T001 Crear la estructura base de archivos en la raíz del repositorio: `index.html`, `styles.css`, `script.js`. `index.html` incluye boilerplate HTML5 (`<!DOCTYPE html>`, `lang="es"`, `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<title>`, enlace a `styles.css`, y carga de `script.js` al final de `<body>` **sin** `type="module"`). `script.js` inicia con `'use strict';`. Ningún archivo usa `import`/`export` (FR-006).
- [X] T002 Configurar en `styles.css` un reset CSS mínimo y variables de diseño (`:root { --... }`) para la paleta de color (contraste mínimo 4.5:1 en texto y 3:1 en elementos gráficos, FR-009) y la tipografía base. Depende de T001.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Datos inmutables, esqueleto DOM, layout base y funciones puras compartidas por todas las historias de usuario.

**⚠️ CRITICAL**: Ninguna historia de usuario puede comenzar hasta completar esta fase.

- [ ] T003 Declarar en `script.js` la constante `DATOS_ORIGINALES`: array de 6 objetos `{ t, Q }` con los valores exactos de `data-model.md` (`(0,5825.54), (6,6000.69), (12,5840.28), (24,6146.58), (30,6192.00), (36,6175.96)`), congelado con `Object.freeze()` tanto a nivel de array como de cada objeto individual (Constitución, Principio III — inmutabilidad). Depende de T001.
- [ ] T004 [P] Construir en `index.html` el esqueleto DOM: `<canvas id="grafico">` con contenido de respaldo textual dentro de la etiqueta; tabla HTML semántica (`<table>`) con encabezados `<th>` "Tiempo (h)" y "Caudal (m³/s)" y un `<tbody>` vacío; contenedor vacío para los controles de selección de intervalo (`FR-005`); contenedor vacío para el panel de resultados. Usar landmarks semánticos (`<main>`, `<section>`) (FR-001, FR-009). Depende de T001.
- [ ] T005 [P] Definir en `styles.css` el layout mobile-first con único breakpoint en 768px (FR-010, R6): por debajo de 768px, una sola columna con el contenedor del gráfico a `aspect-ratio: 16/9` ajustado al ancho disponible; desde 768px, dos columnas (gráfico + panel de resultados) mediante CSS Grid o Flexbox. Depende de T002.
- [ ] T006 Implementar `validarDatos(datos)` en el bloque "Motor Matemático" de `script.js`: aplica en orden las 4 reglas de `data-model.md` — (1) `datos.length === 6` → si falla, mensaje `"No fue posible validar los datos: se esperaban 6 registros de caudal."`; (2) `typeof t/Q === 'number' && Number.isFinite(...)` en cada registro → si falla, `"No fue posible validar los datos: todos los valores de tiempo y caudal deben ser numéricos."`; (3) `datos[i].t < datos[i+1].t` para todo `i` (orden ascendente estricto) → si falla, `"No fue posible validar el segmento: los tiempos de sus extremos no están en orden ascendente."`; (4) `datos[i+1].t - datos[i].t > 0` → si falla, `"No fue posible validar el segmento: los tiempos de sus extremos son iguales."`. Retorna `{ esValido, mensaje }`, deteniéndose en el primer fallo; `{ esValido: true, mensaje: '' }` si las 4 reglas pasan. Depende de T003.
- [ ] T007 Implementar `calcularSegmento(datos)` en `script.js`: construye un array de 5 `SegmentoModelo` a partir de cada par consecutivo de `datos` (ya validado, no revalida — DRY, Principio VI), poblando `tInicio`, `tFin`, `QInicio`, `QFin` y `pendiente = (QFin - QInicio) / (tFin - tInicio)` con precisión completa sin redondear. Invariante verificable: `QInicio + pendiente · (tFin - tInicio) === QFin` dentro de `1e-10`. Depende de T006.
- [ ] T008 Poblar, una sola vez durante la inicialización, el `<tbody>` de la tabla accesible (T004) con los 6 pares `(t, Q)` de `DATOS_ORIGINALES` (T003), formateados con `Intl.NumberFormat('es-CO')`. No incluir volúmenes, fórmulas ni estado de verificación (FR-001, R13) — esta tabla no se vuelve a re-renderizar en cambios de intervalo. Depende de T003, T004.
- [ ] T009 Implementar en `script.js` la detección de soporte de `HTMLCanvasElement` (R8): si no está soportado, ocultar el `<canvas>` (T004) y mostrar la tabla accesible (T008) junto con un mensaje explicativo dirigido al estudiante, mientras el panel de resultados permanece visible; si está soportado, obtener el contexto 2D e inicializarlo escalando por `window.devicePixelRatio` (fijar `canvas.width`/`canvas.height` en píxeles físicos y `canvas.style.width`/`canvas.style.height` en píxeles lógicos, R10). Depende de T004.

**Checkpoint**: Datos, DOM base, layout y funciones `validarDatos()`/`calcularSegmento()` listos — puede comenzar el trabajo por historia de usuario.

---

## Phase 3: User Story 1 - Visualización y cálculo del primer intervalo (Priority: P1) 🎯 MVP

**Goal**: Al seleccionar "Primer intervalo [0,6]" (estado inicial por defecto), el sistema construye el segmento lineal entre los dos primeros registros, calcula su volumen por integral definida y por trapecio, y lo muestra con precisión completa.

**Independent Test**: Abrir `index.html` sin ninguna otra historia implementada; confirmar que la gráfica muestra el segmento `(0, 5825.54)`–`(6, 6000.69)` sombreado y que el panel de resultados muestra `127.723.284,00 m³`.

### Implementation for User Story 1

- [ ] T010 Implementar `calcularIntegral(segmento)` en el bloque "Motor Matemático" de `script.js`: con `Δt = tFin - tInicio` y `m = pendiente`, `V = 3600 · [ QInicio·Δt + m·Δt²/2 ]`, sin redondear. Caso de control: para el segmento `[0,6]` (`pendiente = 29.191666666666666`), `|calcularIntegral(...) - 127723284| < 0.01`. Depende de T007.
- [ ] T011 Implementar `calcularTrapecio(segmento)` en `script.js`: `V = 3600 · ((QInicio + QFin) / 2) · (tFin - tInicio)`, sin redondear. Caso de control: para el segmento `[0,6]`, resultado idéntico a `calcularIntegral(...)` dentro de tolerancia `0.01`. Depende de T007.
- [ ] T012 Implementar `verificarResultados(datos, modo)` en `script.js`: para cada segmento de `calcularSegmento(datos)` seleccionado según `modo` (`'primer_intervalo'` → solo el segmento `[0,6]`; `'periodo_completo'` → los 5 segmentos), calcula `volumenIntegral`, `volumenTrapecio`, `diferencia = Math.abs(volumenIntegral - volumenTrapecio)` y `estadoVerificacion` (`'VERIFICADO'` si `diferencia ≤ 0.01`, si no `'FALLIDO'`). Agrega `ResultadoPeriodo { modo, segmentos, volumenTotalIntegral, volumenTotalTrapecio, diferenciaTotal, estadoGlobal, segmentoFallidoIndice }`: `estadoGlobal = 'VERIFICADO'` solo si todos los segmentos verifican; si al menos uno falla, `estadoGlobal = 'FALLIDO'`, `segmentoFallidoIndice` apunta al primer segmento fallido, y `volumenTotalIntegral`/`volumenTotalTrapecio`/`diferenciaTotal` quedan en `null` (nunca se suma un total con un segmento no verificado — FR-004, R12). Depende de T010, T011.
- [ ] T013 Implementar `calcularPeriodo(datos, modo)` en `script.js` como punto de entrada público del motor matemático: ejecuta `validarDatos(datos)`; si `esValido`, retorna `verificarResultados(datos, modo)`; si no, lanza un `Error` cuyo mensaje es `ResultadoValidacion.mensaje` (sin retornar un `ResultadoPeriodo` parcial). Depende de T006, T012.
- [ ] T014 Implementar `actualizarGrafica(ctx, resultado)` en el bloque "Interfaz" de `script.js`: dibuja ejes con unidades (horas / m³ por segundo), los puntos y el/los segmento(s) rectos de `resultado.segmentos`, y el área sombreada bajo cada segmento; no realiza ningún cálculo de volumen ni verificación propio. Se invoca solo si Canvas está soportado (T009). Depende de T009, T013.
- [ ] T015 Implementar `actualizarInterfaz(resultado)` en `script.js`: renderiza en el panel de resultados, para el/los segmento(s) de `resultado.segmentos`, la fórmula de la integral evaluada, los valores sustituidos, la conversión explícita `×3600` (horas → segundos), y el volumen formateado con `Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` (ej. `"127.723.284,00 m³"`); invoca `actualizarGrafica()` (T014) cuando el canvas está disponible (SC-001, SC-003). Depende de T014.
- [ ] T016 Inicializar la aplicación en `script.js`: en el evento `DOMContentLoaded`, invocar `calcularPeriodo(DATOS_ORIGINALES, 'primer_intervalo')` y `actualizarInterfaz(resultado)` como estado por defecto al cargar la página (R7 — sin `localStorage` ni cookies); si `calcularPeriodo` lanza un error, mostrar su mensaje en el panel de resultados sin exponer `NaN`/`undefined` (Principio VII). Depende de T013, T015.
- [ ] T017 [P] Añadir en `styles.css` los estilos del panel de resultados y del contenedor del canvas para el primer intervalo: tipografía legible de fórmulas, espaciado, y contraste de texto conforme a las variables AA definidas en T002. Depende de T005.

**Checkpoint**: User Story 1 completamente funcional y verificable de forma independiente (SC-001: `127.723.284,00 m³`).

---

## Phase 4: User Story 2 - Cálculo y verificación del periodo completo (Priority: P2)

**Goal**: Permitir alternar a "Periodo completo [0,36]" para calcular y verificar los 5 segmentos, mostrando el volumen total agregado o, en caso de fallo de verificación de algún segmento, deteniendo el cálculo del total y señalando el segmento problemático.

**Independent Test**: Cambiar el selector a "Periodo completo"; confirmar que la gráfica muestra 6 puntos y 5 segmentos sombreados, y que el panel muestra `781.352.568,00 m³` con estado "VERIFICADO".

### Implementation for User Story 2

- [ ] T018 [P] [US2] Implementar en `index.html` (contenedor de T004) los controles de selección de intervalo funcionalmente operables: dos opciones ("Primer intervalo [0,6]" preseleccionada por defecto, y "Periodo completo [0,36]"), con `aria-label` descriptivo y alcanzables/operables completamente por teclado (FR-005, FR-009, FR-011). Depende de T004.
- [ ] T019 [US2] Conectar en `script.js` el evento `change` de los controles de selección (T018): al cambiar, invocar `calcularPeriodo(DATOS_ORIGINALES, modoSeleccionado)` y `actualizarInterfaz(resultado)` reactivamente, actualizando gráfico y panel de resultados (FR-005). Depende de T016, T018.
- [ ] T020 [US2] Extender `actualizarGrafica()` (T014) en `script.js` para dibujar correctamente los 6 puntos originales conectados por 5 segmentos rectos consecutivos, con el área de los 5 intervalos sombreada, cuando `resultado.segmentos.length === 5` (FR-001). Depende de T019.
- [ ] T021 [US2] Extender `actualizarInterfaz()` (T015) en `script.js` para mostrar, cuando `resultado.modo === 'periodo_completo'` y `estadoGlobal === 'VERIFICADO'`, el volumen total (`resultado.volumenTotalIntegral`/`volumenTotalTrapecio`, formateados `es-CO`), la `diferenciaTotal`, y el estado "VERIFICADO" con estilo diferenciado (SC-004: total `781.352.568,00 m³`). Depende de T019.
- [ ] T022 [US2] Implementar en `actualizarInterfaz()` (T021) el manejo de `estadoGlobal === 'FALLIDO'` (FR-004, R12): no renderizar ningún volumen total (ni parcial ni completo), identificar `resultado.segmentos[resultado.segmentoFallidoIndice]` por su intervalo `[tInicio, tFin]`, y mostrar el mensaje exacto del contrato: `"VERIFICACIÓN FALLIDA: la diferencia entre el método de integral definida y el método del trapecio (<diferencia> m³) supera la tolerancia permitida (0.01 m³)."` seguido de `"No se calcula el volumen total del periodo completo mientras este segmento no supere la verificación."`. Depende de T021.
- [ ] T023 [P] [US2] Añadir en `styles.css` estilos diferenciados para los estados "VERIFICADO" y "VERIFICACIÓN FALLIDA" (color más un indicador textual/de forma, no solo color, para cumplir WCAG AA). Depende de T005.

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente (SC-004).

---

## Phase 5: User Story 3 - Transparencia del procedimiento matemático y estado de verificación (Priority: P3)

**Goal**: Mostrar, para cada segmento visible, el desglose paso a paso completo: la función fᵢ(t), la integral evaluada, el cálculo del trapecio y el mensaje de comparación/verificación, para cumplir el propósito educativo del simulador.

**Independent Test**: Con cualquiera de los dos modos seleccionados, inspeccionar el panel "Procedimiento Matemático" y confirmar que muestra explícitamente fᵢ(t), la integral evaluada, el cálculo del trapecio y el mensaje de estado de verificación por segmento.

### Implementation for User Story 3

- [ ] T024 [P] [US3] Añadir en `index.html` (dentro del panel de resultados de T004) el contenedor de la sección "Procedimiento Matemático", con espacio para un bloque de desglose por cada segmento visible. Depende de T004.
- [ ] T025 [US3] Extender `actualizarInterfaz()` (T015) en `script.js` para renderizar, por cada segmento de `resultado.segmentos`, dentro del contenedor de T024: la fórmula `fᵢ(t) = QInicio + pendiente·(t - tInicio)` con los valores numéricos sustituidos, la integral evaluada paso a paso (`V = 3600 · [QInicio·Δt + pendiente·Δt²/2]` con sustitución), y el cálculo del trapecio con sus valores sustituidos (`V = 3600 · ((QInicio+QFin)/2) · Δt`), incluyendo explícitamente la conversión `×3600` en ambos métodos (SC-003, US3-AC1). Depende de T015, T024.
- [ ] T026 [US3] Extender el desglose de T025 para mostrar, por segmento, la diferencia absoluta (`diferencia`) y el mensaje de estado de verificación correspondiente (`"VERIFICADO"` o el mensaje completo de `"VERIFICACIÓN FALLIDA: ..."` de la tabla de errores del contrato), sin ocultar el error cuando ocurre (US3-AC2). Depende de T025.
- [ ] T027 [P] [US3] Añadir en `styles.css` los estilos de la sección "Procedimiento Matemático": legibilidad de fórmulas matemáticas (`<sup>`/`<sub>` o notación equivalente) y separación visual clara entre los bloques de cada segmento. Depende de T005.

**Checkpoint**: Las tres historias de usuario están completas e independientemente funcionales.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final contra los criterios de éxito (`spec.md`) y `quickstart.md`, sin introducir cambios estructurales.

- [ ] T028 Ejecutar la validación manual completa de `quickstart.md` (pasos 1 a 6), incluyendo las aserciones `console.assert()` en la consola del navegador contra `DATOS_ORIGINALES`: confirmar `127.723.284,00 m³` (SC-001), `781.352.568,00 m³` (SC-004), y que ninguna aserción falla.
- [ ] T029 [P] Verificar accesibilidad WCAG 2.1 AA de extremo a extremo: navegación completa por teclado de todos los controles, presencia de `aria-label`, y contraste medido ≥4.5:1 en texto y ≥3:1 en elementos gráficos (FR-009).
- [ ] T030 [P] Verificar el comportamiento responsivo en el breakpoint de 768px: una columna con `aspect-ratio` 16:9 por debajo del breakpoint, dos columnas (gráfico + panel) desde 768px en adelante (FR-010).
- [ ] T031 [P] Con la pestaña "Network" de DevTools abierta, recargar `index.html` bajo el protocolo `file://` y confirmar que no se registra ninguna petición de red (FR-006, SC-002).
- [ ] T032 [P] Revisar todos los mensajes producidos por `validarDatos()`, `calcularPeriodo()` y `verificarResultados()` contra la tabla de mensajes de `contracts/motor-matematico.contract.md`, confirmando que ningún mensaje expone `NaN`/`undefined` crudos (Principio VII).
- [ ] T033 [P] Publicar la copia estática de los mismos tres archivos (`index.html`, `styles.css`, `script.js`), sin cambios, en un sitio con enlace público accesible sin autenticación, y confirmar que reproduce los mismos resultados de control (`127.723.284,00 m³` y `781.352.568,00 m³`) que la versión local (FR-012, SC-005).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — puede iniciar de inmediato.
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEA todas las historias de usuario.
- **User Story 1 (Phase 3)**: Depende de Foundational. Es la base del motor matemático (`calcularIntegral`, `calcularTrapecio`, `verificarResultados`, `calcularPeriodo`) y de la interfaz (`actualizarGrafica`, `actualizarInterfaz`) que las Historias 2 y 3 extienden.
- **User Story 2 (Phase 4)**: Depende de Foundational y de la implementación base de User Story 1 (T013-T016), ya que extiende las mismas funciones `actualizarGrafica()`/`actualizarInterfaz()` para el modo `periodo_completo`.
- **User Story 3 (Phase 5)**: Depende de Foundational y de la implementación base de User Story 1 (T015), ya que extiende `actualizarInterfaz()` con el desglose detallado; es compatible con y independiente de User Story 2.
- **Polish (Phase 6)**: Depende de que las historias de usuario deseadas estén completas.

### User Story Dependencies

- **User Story 1 (P1)**: Sin dependencias de otras historias — MVP matemático.
- **User Story 2 (P2)**: Extiende funciones creadas en US1 (`actualizarGrafica`, `actualizarInterfaz`, `calcularPeriodo`); no requiere que US3 exista.
- **User Story 3 (P3)**: Extiende `actualizarInterfaz()` de US1; funciona igual con o sin US2 implementado (se aplica a 1 o 5 segmentos indistintamente).

### Within Each User Story

- Funciones puras del motor matemático antes que las funciones de interfaz que las consumen.
- `calcularIntegral`/`calcularTrapecio` antes que `verificarResultados`; `verificarResultados` antes que `calcularPeriodo`; `calcularPeriodo` antes que `actualizarGrafica`/`actualizarInterfaz`.
- Estilos (`styles.css`) pueden avanzar en paralelo a la lógica (`script.js`) de la misma historia, ya que no comparten archivo.

### Parallel Opportunities

- T002 (CSS) puede avanzar en paralelo a partes de T001 una vez creado el archivo.
- T004 (HTML) y T005 (CSS) pueden ejecutarse en paralelo entre sí en la Fase 2 (archivos distintos).
- Dentro de cada historia de usuario, la tarea de estilos (`[P]`, `styles.css`) puede ejecutarse en paralelo a las tareas de lógica (`script.js`) de esa misma historia.
- T018 (HTML) y T024 (HTML) pueden avanzar en paralelo a tareas de estilos de otras historias, ya que tocan `index.html`/`styles.css` respectivamente y no bloquean el motor matemático.
- Todas las tareas de Polish marcadas `[P]` (T029-T033) son verificaciones independientes y pueden ejecutarse en paralelo.

---

## Parallel Example: User Story 1

```bash
# T010 y T011 dependen ambas de T007 pero editan el mismo archivo (script.js) —
# se recomienda ejecutarlas en secuencia dentro de ese archivo.
Task: "Implementar calcularIntegral(segmento) en script.js"
Task: "Implementar calcularTrapecio(segmento) en script.js"

# T017 (styles.css) sí puede avanzar en paralelo a T010-T016 (script.js):
Task: "Añadir estilos del panel de resultados y del canvas en styles.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Fase 1: Setup.
2. Completar Fase 2: Foundational (bloqueante para todas las historias).
3. Completar Fase 3: User Story 1.
4. **DETENER Y VALIDAR**: probar User Story 1 de forma independiente (SC-001: `127.723.284,00 m³`).
5. Publicar/demostrar si está listo.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. Añadir User Story 1 → probar independientemente → demo (MVP).
3. Añadir User Story 2 → probar independientemente (incluye el caso de fallo de verificación, FR-004) → demo.
4. Añadir User Story 3 → probar independientemente (transparencia del procedimiento) → demo.
5. Fase de Polish → validación completa contra `quickstart.md` y criterios de éxito, y publicación pública (FR-012, SC-005).

---

## Notes

- `[P]` = archivo distinto, sin dependencias pendientes.
- `[Story]` mapea cada tarea a su historia de usuario para trazabilidad.
- Los 8 nombres de función (`validarDatos`, `calcularSegmento`, `calcularIntegral`, `calcularTrapecio`, `verificarResultados`, `calcularPeriodo`, `actualizarGrafica`, `actualizarInterfaz`) son exactamente los exigidos por la Constitución (Principio VI, R11) — no se introducen alias.
- Ninguna tarea de codificación crea archivos fuera de `index.html`, `styles.css`, `script.js` (Principio VI: exactamente 3 archivos de producción).
- Confirmar que cada valor con redondeo interno (pendiente, sumas) nunca se trunca antes de completar los cálculos — el redondeo solo ocurre en las tareas de formateo de presentación (T015, T021, T025).
