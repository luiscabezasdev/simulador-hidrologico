---

description: "Task list for Simulador Matemático-Educativo de Caudal y Volumen (Río Magdalena)"
---

# Tasks: Simulador Matemático-Educativo de Caudal y Volumen (Río Magdalena)

**Input**: Design documents from `/specs/001-simulador-caudal-volumen/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/motor-matematico.contract.md](./contracts/motor-matematico.contract.md), [quickstart.md](./quickstart.md)

**Tests**: No se solicitaron pruebas automatizadas en `spec.md`. Conforme a `plan.md` (sección Testing) y R9 de `research.md`, la verificación se hace manualmente con `console.assert()` siguiendo `quickstart.md`; las tareas correspondientes están marcadas como "Validar" al final de cada fase de user story.

**Organization**: Las tareas se agrupan por historia de usuario (P1/P2/P3 de `spec.md`) para permitir implementación y prueba independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece la tarea (US1, US2, US3)
- Se incluye la ruta exacta del archivo en cada descripción

## Path Conventions

Proyecto único de sitio estático, exactamente 3 archivos en la raíz del repositorio (Constitución Principio VI / `plan.md` Project Structure): `index.html`, `styles.css`, `script.js`. Sin subcarpetas `src/`, `tests/` ni build step.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar los tres archivos de producción exigidos por la Constitución, sin lógica de negocio todavía.

- [ ] T001 [P] Crear el esqueleto de `index.html`: `<!DOCTYPE html>`, `<head>` con `<title>`, `<meta charset>`, `<meta viewport>` y `<link rel="stylesheet" href="styles.css">`, y `<body>` con `<script src="script.js" defer></script>`; sin `type="module"` (FR-006).
- [ ] T002 [P] Crear el esqueleto de `styles.css`: reset básico, tipografía base y fundación mobile-first (sin breakpoints todavía, se completan en Phase 6).
- [ ] T003 [P] Crear el esqueleto de `script.js`: `'use strict'`, JavaScript ES2020 sin `import`/`export` (FR-006), con dos bloques de comentario que delimitan "Motor Matemático (funciones puras)" y "Capa de Interfaz", según `contracts/motor-matematico.contract.md`.

**Checkpoint**: Los tres archivos existen y `index.html` carga `styles.css` y `script.js` sin errores de consola.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Motor matemático puro (sin DOM/Canvas) que usan las tres historias de usuario. Ninguna historia puede implementarse antes de completar esta fase.

**⚠️ CRITICAL**: Ninguna tarea de historia de usuario puede iniciar hasta que esta fase esté completa.

- [ ] T004 Declarar en `script.js` la constante inmutable `DATOS_ORIGINALES` con los 6 `RegistroCaudal` originales del río Magdalena (Constitución Principio III, NON-NEGOTIABLE; `data-model.md` → RegistroCaudal): `{t:0,Q:5825.54}`, `{t:6,Q:6000.69}`, `{t:12,Q:5840.28}`, `{t:24,Q:6146.58}`, `{t:30,Q:6192.00}`, `{t:36,Q:6175.96}`; congelar con `Object.freeze()` el array y cada objeto individual.
- [ ] T005 Implementar `validarDatos(datos)` en `script.js` según `contracts/motor-matematico.contract.md`: retorna `{esValido, mensaje}`; aplica en orden las 4 reglas de `data-model.md` → ResultadoValidacion (exactamente 6 registros; `t`/`Q` numéricos finitos; `t` estrictamente ascendente; duración de intervalo > 0), devolviendo en el primer fallo un mensaje orientado al estudiante (FR-007, Principio VII). Depende de: T004.
- [ ] T006 Implementar `calcularSegmento(datos)` en `script.js`: construye los 5 `SegmentoModelo` de `data-model.md` (`tInicio`, `tFin`, `QInicio`, `QFin`, `pendiente = (QFin-QInicio)/(tFin-tInicio)` con precisión completa, sin redondear); no revalida internamente (asume `datos` ya validado, DRY — Principio VI). Depende de: T004, T005.
- [ ] T007 Implementar `calcularIntegral(segmento)` en `script.js` según `contracts/motor-matematico.contract.md`: `V = 3600 · [QInicio·Δt + pendiente·Δt²/2]`, sin redondear; caso de control `[0,6]` con `pendiente = 29.191666666666666` debe dar `|resultado - 127723284| < 0.01`. Depende de: T006.
- [ ] T008 Implementar `calcularTrapecio(segmento)` en `script.js` según `contracts/motor-matematico.contract.md`: `V = 3600 · ((QInicio+QFin)/2) · Δt`, sin redondear. Depende de: T006.
- [ ] T009 Implementar `verificarResultados(datos, modo)` en `script.js`: combina `calcularSegmento()`, `calcularIntegral()` y `calcularTrapecio()` para poblar `volumenIntegral`, `volumenTrapecio`, `diferencia` y `estadoVerificacion` (`'VERIFICADO'` si `diferencia ≤ 0.01`, si no `'FALLIDO'`) en cada `SegmentoModelo`; selecciona 1 segmento `[0,6]` si `modo === 'primer_intervalo'` o los 5 si `modo === 'periodo_completo'`; agrega `ResultadoPeriodo` (`volumenTotalIntegral`, `volumenTotalTrapecio`, `diferenciaTotal`, `estadoGlobal`) por `data-model.md`. Depende de: T007, T008.
- [ ] T010 Implementar `calcularPeriodo(datos, modo)` en `script.js` como único punto de entrada público del motor matemático: ejecuta `validarDatos()`; si `esValido` es falso, lanza un `Error` con el `mensaje` de `ResultadoValidacion` (sin retornar un `ResultadoPeriodo` parcial); si es válido, retorna `verificarResultados(datos, modo)`. Depende de: T005, T009.

**Checkpoint**: `calcularPeriodo(DATOS_ORIGINALES, 'primer_intervalo').volumenTotalIntegral` es `127723284` (±0.01) y `calcularPeriodo(DATOS_ORIGINALES, 'periodo_completo').volumenTotalIntegral` es `781352568` (±0.01), ambos verificables desde la consola del navegador sin necesidad de interfaz.

---

## Phase 3: User Story 1 - Visualización y cálculo del primer intervalo (Priority: P1) 🎯 MVP

**Goal**: Al cargar la aplicación, el usuario ve por defecto "Primer intervalo [0,6]": un segmento graficado y sombreado, y el volumen exacto `127.723.284,00 m³` en el panel de resultados.

**Independent Test**: Abrir `index.html` directamente (`file://`), sin seleccionar nada, y verificar que la gráfica muestre exactamente 1 segmento entre `(0, 5825.54)` y `(6, 6000.69)`, el área esté sombreada, y el resultado sea `127.723.284,00 m³` sin artefactos de redondeo de pendiente.

- [ ] T011 [US1] Implementar `formatearNumero(valor)` en `script.js` usando `Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`; se usa únicamente al presentar resultados, nunca en cálculos internos (FR-008). Depende de: Phase 2 completa.
- [ ] T012 [US1] En `script.js`, inicializar el contexto 2D del canvas: detectar soporte de `HTMLCanvasElement` (si no existe, marcar bandera `canvasSoportado = false`) y, si existe, escalar el contexto según `window.devicePixelRatio` fijando `canvas.width/height` en píxeles físicos y `canvas.style.width/height` en píxeles lógicos (R8, R10). Depende de: Phase 2 completa.
- [ ] T013 [US1] Implementar `actualizarGrafica(ctx, resultado)` en `script.js`: dibuja ejes con unidades (`t` en horas, `Q` en m³/s), los puntos y segmentos de `resultado.segmentos`, y sombrea el área bajo esos segmentos; no realiza ningún cálculo de volumen ni verificación (Principio VI). Depende de: T012.
- [ ] T014 [US1] En `index.html`, construir la tabla HTML semántica alternativa (misma información que el canvas: los 6 registros y, por segmento, tiempo/caudal/volumen) navegable por teclado y compatible con lectores de pantalla (FR-001, FR-009). Depende de: T001.
- [ ] T015 [US1] En `index.html`, añadir los controles de selección de intervalo ("Primer intervalo [0,6]" / "Periodo completo [0,36]") con `aria-label` descriptivo, seleccionando "Primer intervalo [0,6]" por defecto (FR-005, FR-011). Depende de: T001.
- [ ] T016 [US1] Implementar `actualizarInterfaz(resultado)` en `script.js`: renderiza el panel de "Procedimiento Matemático" (usando `formatearNumero` para los volúmenes), actualiza la tabla semántica de T014, y llama a `actualizarGrafica()` si `canvasSoportado` es verdadero; si es falso, oculta el canvas y muestra un mensaje explicativo junto a la tabla (FR-001, R8, Principio VII). Depende de: T011, T013, T014, T015.
- [ ] T017 [US1] En `script.js`, en el evento `DOMContentLoaded`, invocar `calcularPeriodo(DATOS_ORIGINALES, 'primer_intervalo')` y pasar el resultado a `actualizarInterfaz()` para que la carga inicial cumpla SC-001 sin necesidad de interacción del usuario. Depende de: T010, T016.
- [ ] T018 [US1] Validar manualmente la User Story 1 siguiendo `quickstart.md` secciones 1-2: confirmar puntos `(0, 5825.54)`/`(6, 6000.69)`, segmento único sombreado, y volumen `127.723.284,00 m³` (no `127.723.286,16 m³` ni `127.723.286,13 m³`); ejecutar en consola las aserciones de `quickstart.md` sección 5 relativas al primer intervalo. Depende de: T017.

**Checkpoint**: User Story 1 completamente funcional y probable de forma independiente.

---

## Phase 4: User Story 2 - Cálculo y verificación del periodo completo (Priority: P2)

**Goal**: Al cambiar la selección a "Periodo completo [0,36]", la interfaz muestra los 5 segmentos, el área sombreada completa, el volumen total `781.352.568,00 m³` y el estado "VERIFICADO".

**Independent Test**: Con la aplicación ya cargada (US1 funcional), cambiar la selección a "Periodo completo" y verificar que se dibujan 5 segmentos, el sombreado cubre los 5 intervalos, y el volumen total coincide con la suma de los trapecios dentro de la tolerancia.

- [ ] T019 [US2] En `script.js`, añadir un listener de evento `change` a los controles de intervalo (T015) que vuelva a invocar `calcularPeriodo(DATOS_ORIGINALES, modo)` y `actualizarInterfaz()` con el modo seleccionado (FR-005). Depende de: T017.
- [ ] T020 [US2] Extender `actualizarGrafica()` en `script.js` para dibujar los 6 puntos y los 5 segmentos consecutivos con su área sombreada completa cuando `resultado.modo === 'periodo_completo'`. Depende de: T013, T019.
- [ ] T021 [US2] Extender `actualizarInterfaz()` en `script.js` para mostrar `volumenTotalIntegral`, `volumenTotalTrapecio`, `diferenciaTotal` y `estadoGlobal` (formateados con `formatearNumero`) cuando el modo sea `periodo_completo`. Depende de: T016, T019.
- [ ] T022 [US2] Validar manualmente la User Story 2 siguiendo `quickstart.md` secciones 3 y 5: confirmar 5 segmentos renderizados, volumen total `781.352.568,00 m³`, y `estadoGlobal === 'VERIFICADO'` mediante las aserciones de consola correspondientes al periodo completo.

**Checkpoint**: User Story 1 y 2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Transparencia del procedimiento matemático y estado de verificación (Priority: P3)

**Goal**: El panel de resultados desglosa, para cada segmento visible, la función fᵢ(t), la integral evaluada, el cálculo del trapecio y el estado de verificación, incluyendo el mensaje explícito cuando la verificación falla.

**Independent Test**: Inspeccionar el panel "Procedimiento Matemático" en cualquiera de los dos modos y confirmar que muestra la fórmula, los valores sustituidos, la conversión ×3600 y el resultado de la comparación entre métodos.

- [ ] T023 [US3] Extender `actualizarInterfaz()` en `script.js` para mostrar, por cada segmento visible, la fórmula sustituida `fᵢ(t) = QInicio + pendiente·(t - tInicio)`, la integral evaluada (`3600·[QInicio·Δt + pendiente·Δt²/2]`), el cálculo del trapecio (`3600·((QInicio+QFin)/2)·Δt`) y la conversión ×3600 explícita (FR-002, FR-003, SC-003). Depende de: T016.
- [ ] T024 [US3] En `script.js`, implementar el mensaje de verificación por segmento y global según la tabla de errores de `contracts/motor-matematico.contract.md`: `"VERIFICACIÓN FALLIDA: la diferencia entre el método de integral definida y el método del trapecio (<diferencia> m³) supera la tolerancia permitida (0.01 m³)."` cuando `estadoVerificacion`/`estadoGlobal` sea `'FALLIDO'`, y el texto "VERIFICADO" en caso contrario (FR-004, Principio VII). Depende de: T023.
- [ ] T025 [P] [US3] En `styles.css`, añadir estilos visualmente diferenciados (color, ícono o etiqueta) para los estados "VERIFICADO" y "VERIFICACIÓN FALLIDA" del mensaje de T024, respetando el contraste WCAG 2.1 AA (4.5:1 texto / 3:1 gráficos).
- [ ] T026 [US3] En `script.js`, envolver la invocación de `calcularPeriodo()` (T017, T019) en un bloque `try/catch`: si lanza error (datos inválidos), mostrar el `mensaje` capturado en el panel de resultados usando los textos de la tabla de errores de `contracts/motor-matematico.contract.md`, sin exponer `NaN`/`undefined` (FR-007, Principio VII). Depende de: T010, T016.
- [ ] T027 [US3] Validar manualmente la User Story 3 siguiendo `quickstart.md` sección 4: confirmar que se muestran fᵢ(t), la integral evaluada, el cálculo del trapecio y la diferencia para cada segmento visible; ejecutar la prueba de robustez opcional (redondear temporalmente la pendiente) y confirmar que aparece "VERIFICACIÓN FALLIDA" con la diferencia explicada, luego revertir el cambio.

**Checkpoint**: Las tres historias de usuario son funcionales de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cumplimiento transversal de accesibilidad, responsividad y gobernanza de la Constitución que afecta a las tres historias.

- [ ] T028 En `styles.css`, finalizar el diseño mobile-first con único breakpoint en 768px (una columna con el canvas a `aspect-ratio: 16/9` por debajo de 768px, dos columnas —gráfico y panel de resultados— desde 768px) y verificar contraste mínimo 4.5:1 (texto) / 3:1 (gráficos) y estados de foco visibles para navegación completa por teclado (FR-009, FR-010). Depende de: T002, T025.
- [ ] T029 Ejecutar de extremo a extremo la guía `quickstart.md` (secciones 1 a 6) y confirmar que la checklist de cierre pasa por completo: cero errores de consola, cero peticiones de red, funcionamiento bajo `file://`, y accesibilidad básica por teclado verificada (SC-002). Depende de: T018, T022, T027, T028.
- [ ] T030 Revisar `script.js` contra la Constitución Principio VI: confirmar que existen literalmente las ocho funciones exigidas (`validarDatos`, `calcularSegmento`, `calcularIntegral`, `calcularTrapecio`, `verificarResultados`, `calcularPeriodo`, `actualizarGrafica`, `actualizarInterfaz`), que ninguna fórmula está duplicada (DRY), y que las funciones del motor matemático no acceden a `document`/Canvas. Depende de: T029.
- [ ] T031 Publicar `index.html`, `styles.css` y `script.js` como copia estática en un sitio con enlace público (p. ej. GitHub Pages) y validar contra el paso 11 de la Constitución: el enlace abre sin sesión, carga sin errores, conserva los 6 registros y reproduce `127.723.284,00 m³` / `781.352.568,00 m³` (FR-012, SC-005). Depende de: T029.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede iniciar de inmediato.
- **Foundational (Phase 2)**: depende de Setup — bloquea las tres historias de usuario.
- **User Stories (Phase 3-5)**: todas dependen de Foundational. Pueden implementarse en paralelo por distintos desarrolladores o secuencialmente en orden de prioridad (P1 → P2 → P3).
- **Polish (Phase 6)**: depende de que las historias deseadas estén completas.

### User Story Dependencies

- **User Story 1 (P1)**: puede iniciar tras Foundational; sin dependencia de otras historias.
- **User Story 2 (P2)**: reutiliza los controles y `actualizarInterfaz()`/`actualizarGrafica()` de US1 (T013, T015, T016, T017), por lo que en la práctica se implementa después de US1, aunque su lógica de negocio (`verificarResultados`, `calcularPeriodo`) ya existe desde Foundational.
- **User Story 3 (P3)**: extiende `actualizarInterfaz()` de US1 (T016) y las invocaciones de `calcularPeriodo()` de US1/US2 (T017, T019); se implementa después de US1 (y preferiblemente después de US2, para cubrir ambos modos).

### Within Each User Story

- El motor matemático (Foundational) siempre precede a la interfaz.
- Dentro de US1: Canvas/gráfica antes de `actualizarInterfaz()`; `actualizarInterfaz()` antes de conectar el evento de carga inicial.
- Historia completa y validada antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- Phase 1: T001, T002 y T003 son completamente paralelas (tres archivos distintos).
- Phase 2: secuencial en su mayoría por compartir `script.js` y por dependencias de datos; `calcularIntegral()` (T007) y `calcularTrapecio()` (T008) son lógicamente independientes entre sí pero comparten archivo, por lo que se listan en secuencia.
- Phase 5: T025 (estilos en `styles.css`) puede ejecutarse en paralelo con T024/T026 (`script.js`), al ser archivos distintos.
- Distintas historias de usuario pueden repartirse entre varios desarrolladores una vez completada la Fase 2, coordinando los puntos de integración compartidos señalados arriba (T013, T015, T016, T017).

---

## Parallel Example: Phase 1 (Setup)

```bash
# Lanzar los tres esqueletos de archivo juntos (no hay dependencias entre ellos):
Task: "Crear el esqueleto de index.html"
Task: "Crear el esqueleto de styles.css"
Task: "Crear el esqueleto de script.js"
```

## Parallel Example: Phase 5 (User Story 3)

```bash
# Estas dos tareas pueden avanzar en paralelo (archivos distintos):
Task: "Implementar el mensaje de verificación por segmento y global en script.js (T024)"
Task: "Añadir estilos diferenciados para VERIFICADO/VERIFICACIÓN FALLIDA en styles.css (T025)"
```

---

## Implementation Strategy

### MVP First (User Story 1 solamente)

1. Completar Phase 1: Setup.
2. Completar Phase 2: Foundational (crítico — bloquea todas las historias).
3. Completar Phase 3: User Story 1.
4. **Detenerse y validar**: ejecutar T018 y confirmar `127.723.284,00 m³`.
5. Publicar/demostrar si está listo (MVP matemático).

### Incremental Delivery

1. Setup + Foundational → motor matemático verificado desde consola.
2. Añadir User Story 1 → validar independientemente → MVP.
3. Añadir User Story 2 → validar independientemente (`781.352.568,00 m³`, VERIFICADO).
4. Añadir User Story 3 → validar independientemente (transparencia y mensaje de fallo).
5. Phase 6: Polish (accesibilidad, responsividad, cumplimiento de la Constitución) y validación final con `quickstart.md` completo.

---

## Notes

- [P] = archivo distinto, sin dependencias pendientes.
- [Story] mapea cada tarea a su historia de usuario para trazabilidad.
- Los valores numéricos de control (`127.723.284,00 m³`, `781.352.568,00 m³`) provienen de `data-model.md`/`contracts/motor-matematico.contract.md` y de la Constitución (Principio III, NON-NEGOTIABLE); no deben alterarse durante la implementación.
- No se generan tareas de "tests primero" porque `spec.md` no las solicitó explícitamente; la verificación se hace con las aserciones de consola de `quickstart.md` al cierre de cada historia (T018, T022, T027) y de forma integral en T029.
- Evitar: redondear la pendiente antes de calcular, mezclar lógica de DOM/Canvas dentro de las funciones del motor matemático, y duplicar las fórmulas de integral/trapecio en más de un lugar.
