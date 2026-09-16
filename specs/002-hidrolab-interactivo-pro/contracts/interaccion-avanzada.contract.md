# Contrato: Interacción Avanzada (Tema, Aislamiento de Segmento, Rastreo Continuo)

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Data Model**: [data-model.md](../data-model.md)

Extiende `specs/001-simulador-caudal-volumen/contracts/motor-matematico.contract.md`, que sigue vigente sin modificaciones para `validarDatos`, `calcularSegmento`, `calcularIntegral`, `calcularTrapecio`, `verificarResultados` y `calcularPeriodo`. Este documento fija las firmas y el comportamiento observable de: (1) la nueva función pura del motor matemático (`interpolarCaudal`), (2) la firma ampliada de `actualizarGrafica`/`actualizarInterfaz`, y (3) las funciones nuevas de la capa de interfaz para tema, aislamiento y rastreo por puntero. Notación tipo TypeScript solo como documentación; implementación en JavaScript vanilla ES2020 (sin `import`/`export`).

## Motor matemático (función pura nueva)

### `interpolarCaudal(segmentos: SegmentoModelo[], t: number): PuntoRastreo | null`

- **Precondición**: `segmentos` es el array ya producido por `calcularSegmento()`/`verificarResultados()` para el modo activo (1 elemento en `'primer_intervalo'`, 5 en `'periodo_completo'`). No accede a `document` ni a Canvas.
- **Comportamiento**: busca el índice `i` tal que `segmentos[i].tInicio ≤ t ≤ segmentos[i].tFin` (recorrido lineal; 5 elementos como máximo, sin necesidad de búsqueda binaria). Si lo encuentra, retorna `{ t, Q: segmentos[i].QInicio + segmentos[i].pendiente * (t - segmentos[i].tInicio), segmentoIndice: i }`. Si `t` está fuera de `[segmentos[0].tInicio, segmentos[segmentos.length-1].tFin]`, retorna `null` (FR-012).
- **Reutilización de fórmula (DRY, Principio VI)**: usa exactamente la misma expresión `fᵢ(t) = QInicio + pendiente·(t - tInicio)` ya definida por `calcularIntegral()`; no declara una segunda fórmula equivalente.
- **Casos de prueba**:
  - `interpolarCaudal(segmentos, segmentos[0].tInicio).Q === segmentos[0].QInicio` exactamente (Acceptance Scenario 3, US1).
  - `interpolarCaudal(segmentos, segmentos[segmentos.length-1].tFin).Q === segmentos[segmentos.length-1].QFin` exactamente.
  - Para `t=18` con los segmentos del periodo completo, `interpolarCaudal(segmentos, 18).segmentoIndice === 2` (segmento `[12,24]`) y el `Q` coincide con `fᵢ(18)` evaluado a mano.
  - `interpolarCaudal(segmentos, -1) === null` y `interpolarCaudal(segmentos, 999) === null` (fuera de rango).

## Capa de interfaz — funciones existentes con firma ampliada

### `actualizarGrafica(ctx: CanvasRenderingContext2D, resultado: ResultadoPeriodo, estadoInteraccion: EstadoInteraccion): void`

- **Cambio respecto a la feature 001**: recibe un tercer parámetro `estadoInteraccion` (ver `data-model.md`).
- **Comportamiento añadido**:
  - Si `estadoInteraccion.segmentoAisladoIndice !== null`, dibuja los segmentos distintos al aislado con opacidad reducida (p. ej. aplicando un canal alfa menor al color de relleno/trazo ya usado, sin introducir un color nuevo) y mantiene el segmento aislado con su opacidad normal (FR-005, Acceptance Scenario 1 de US2).
  - Si `estadoInteraccion.puntoRastreo !== null`, dibuja un indicador visual (p. ej. un punto o línea vertical) en `(escalarT(puntoRastreo.t), escalarQ(puntoRastreo.Q))`, visible incluso cuando `puntoRastreo.segmentoIndice` corresponde a un segmento atenuado (FR-013).
  - Ninguna otra parte del dibujo existente (ejes, puntos originales, escalado) cambia de comportamiento.
- **No hace**: no decide si un segmento se aísla ni calcula el punto de rastreo; solo dibuja el estado que recibe (sigue sin lógica matemática propia, igual que en la feature 001).

### `actualizarInterfaz(resultado: ResultadoPeriodo, estadoInteraccion: EstadoInteraccion): void`

- **Cambio respecto a la feature 001**: recibe un segundo parámetro `estadoInteraccion`.
- **Comportamiento añadido**:
  - Si `estadoInteraccion.segmentoAisladoIndice !== null`, el panel de resumen superior muestra volumen parcial, caudal promedio local y pendiente m del segmento aislado (fuentes en `data-model.md` → `SegmentoAislado`) **en lugar de** `generarResumen(resultado)` (totales de periodo completo) (FR-006).
  - Si `estadoInteraccion.segmentoAisladoIndice === null`, el comportamiento es idéntico al de la feature 001 (totales de periodo completo o vacío en primer intervalo).
  - Si `estadoInteraccion.puntoRastreo !== null`, actualiza un elemento de lectura continua (p. ej. `#lectura-rastreo`) con el instante y el caudal interpolado, identificando el segmento al que pertenece (FR-011); si es `null`, ese elemento se vacía u oculta (FR-012).
  - No modifica `#bloques-procedimiento` (el procedimiento matemático paso a paso de los 5 segmentos permanece completo y sin alterar, tal como exige FR-006 explícitamente).

## Capa de interfaz — funciones nuevas: Tema

### `detectarPreferenciaSistema(): 'claro' | 'oscuro'`

- Retorna `'oscuro'` si `window.matchMedia('(prefers-color-scheme: dark)').matches`, en otro caso `'claro'`.

### `leerTemaGuardado(): 'claro' | 'oscuro' | null`

- Envuelve `localStorage.getItem('hidrolab-tema')` en `try/catch`; retorna el valor solo si es exactamente `'claro'` o `'oscuro'`, en cualquier otro caso (incluida una excepción) retorna `null` (R16, Principio VII: ningún error visible al usuario).

### `guardarTemaElegido(tema: 'claro' | 'oscuro'): void`

- Envuelve `localStorage.setItem('hidrolab-tema', tema)` en `try/catch`; si falla (almacenamiento deshabilitado), no hace nada más — el tema se sigue aplicando en memoria durante la sesión actual (edge case de `spec.md`).

### `aplicarTema(tema: 'claro' | 'oscuro'): void`

- Fija `document.documentElement.dataset.tema = tema` y actualiza el estado (`aria-pressed` o `aria-checked`, según el control elegido) del alternador de tema en el DOM para tecnologías de asistencia (FR-001, FR-015).

### `alternarTema(): void`

- Lee el tema actualmente aplicado (`document.documentElement.dataset.tema`), invierte a el otro valor, llama a `aplicarTema()` y a `guardarTemaElegido()` (marca `origen = 'explicito'`, FR-002). Es el manejador del control de alternancia de tema (clic o `Enter`/`Espacio` vía `<button>` nativo).

### `inicializarTema(): void`

- Se ejecuta una vez en `inicializarAplicacion()`. Orden: `leerTemaGuardado()` → si no es `null`, `aplicarTema(valorGuardado)` (sin volver a guardar); si es `null`, `aplicarTema(detectarPreferenciaSistema())` y suscribe el listener de `matchMedia` (R15) que reaplica `detectarPreferenciaSistema()` únicamente mientras `leerTemaGuardado() === null` en el momento del evento.

## Capa de interfaz — funciones nuevas: Aislamiento de segmento

### `aislarSegmento(indice: number): void`

- Si `indice === segmentoAisladoIndiceActual`, equivale a llamar `limpiarSeleccionSegmento()`. En otro caso, fija el estado a `indice`, actualiza `aria-pressed` de los 5 botones de la leyenda (solo el de `indice` en `"true"`) y vuelve a invocar `actualizarGrafica()`/`actualizarInterfaz()` con el `EstadoInteraccion` recalculado (FR-005, FR-007).
- **Precondición implícita**: solo se registra como manejador de eventos cuando `resultado.modo === 'periodo_completo'`; en `'primer_intervalo'` la leyenda de 5 segmentos no se renderiza (FR-008).

### `limpiarSeleccionSegmento(): void`

- Fija el estado a `null` incondicionalmente, pone `aria-pressed="false"` en los 5 botones de la leyenda, y vuelve a invocar `actualizarGrafica()`/`actualizarInterfaz()` (FR-007).

### Disparadores de `aislarSegmento()`/`limpiarSeleccionSegmento()`

1. Clic/tap sobre un segmento del canvas (hit-testing: igual que el manejador de puntero de R19, pero disparado en el evento de "tap"/`click`, no en el de movimiento).
2. Clic o `Enter`/`Espacio` sobre uno de los 5 botones `aria-pressed` de la leyenda accesible.
3. Clic o `Enter`/`Espacio` sobre el botón "Mostrar periodo completo" → siempre llama a `limpiarSeleccionSegmento()`.
4. Evento `change` de los controles de modo de intervalo ya existentes → siempre llama a `limpiarSeleccionSegmento()` antes de recalcular (FR-008).

## Capa de interfaz — funciones nuevas: Rastreo continuo por puntero

### `calcularEscalasGrafico(ancho: number, alto: number, resultado: ResultadoPeriodo): EscalasGrafico`

- Extrae de `actualizarGrafica()` (feature 001) el cálculo de `margen`, `tMin`, `tMax`, `qEjeMin`, `qEjeMax`, `anchoGrafico`, `altoGrafico` y las funciones `escalarT`/`escalarQ`, sin cambiar sus fórmulas. Ambas — dibujo y manejo de puntero — llaman a esta única función (R19, DRY).

### `posicionAInstante(x: number, escalas: EscalasGrafico): number`

- Inversa de `escalarT`: `escalas.tMin + ((x - escalas.margen.izquierda) / escalas.anchoGrafico) * (escalas.tMax - escalas.tMin)`.

### `manejarMovimientoPuntero(evento: PointerEvent): void`

- Obtiene la posición `x` relativa al canvas (`evento.clientX - canvas.getBoundingClientRect().left`), la convierte a `t` con `posicionAInstante()`, y si `t` está dentro de `[tMin, tMax]` del modo activo, llama a `interpolarCaudal(resultado.segmentos, t)` y actualiza el estado `puntoRastreo`; si está fuera de rango, fija `puntoRastreo = null`. Siempre vuelve a invocar `actualizarGrafica()`/`actualizarInterfaz()` (FR-009, FR-012).
- **Distinción mouse/touch (R20)**: para `evento.pointerType === 'mouse'`, se suscribe directamente a `pointermove` sobre el canvas (hover libre). Para `evento.pointerType === 'touch'`, solo se invoca desde dentro del manejador de arrastre (ver `manejarPointerDown`/`manejarPointerUp`) una vez superado el umbral de movimiento.

### `manejarPointerDown(evento: PointerEvent): void` / `manejarPointerUp(evento: PointerEvent): void`

- Solo relevantes para `evento.pointerType === 'touch'` (en mouse, el rastreo ya es continuo por hover y la selección de segmento usa el evento `click` nativo). `manejarPointerDown` registra `{ x, y, tiempo }` de inicio. Mientras el puntero se mantiene presionado, cada `pointermove` compara el desplazamiento acumulado contra un umbral (p. ej. 8px); al superarlo, se activa el modo "arrastre" y a partir de ahí cada `pointermove` llama a `manejarMovimientoPuntero()`. Si `manejarPointerUp` ocurre sin haber superado el umbral, se interpreta como tap: se calcula `t` en la posición de `pointerdown` y se llama a `aislarSegmento(segmentoIndice)` del segmento que contiene ese `t` (FR-005, FR-009, edge case táctil de `spec.md`). Al finalizar el arrastre (`pointerup`/`pointercancel` tras superar el umbral), se limpia `puntoRastreo` (equivalente a que el puntero "salga" del gráfico).

## Errores y mensajes (Principio VII) — adiciones

| Condición | Comportamiento |
|---|---|
| `localStorage` no disponible al leer o guardar tema | Silencioso: se recae en `detectarPreferenciaSistema()` en cada carga; ningún mensaje de error se muestra (edge case de `spec.md`). |
| `t` fuera de rango en `manejarMovimientoPuntero` | `puntoRastreo = null`; el elemento de lectura continua se vacía/oculta, sin mensaje de error (FR-012). |
| Intento de aislar un segmento en modo `'primer_intervalo'` | No aplica: la leyenda de 5 botones y el hit-testing de aislamiento no se registran en ese modo (FR-008); no hay manejador que pueda dispararse. |
