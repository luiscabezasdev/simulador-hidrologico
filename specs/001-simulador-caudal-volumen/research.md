# Phase 0 Research: Simulador Matemático-Educativo de Caudal y Volumen

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Todas las incógnitas de `NEEDS CLARIFICATION` fueron resueltas durante `/speckit-clarify` y quedaron registradas en `spec.md` → `## Clarifications`. Este documento las consolida en formato Decision/Rationale/Alternatives e incorpora las decisiones técnicas adicionales de nivel de plan que no pertenecen al spec (estrategia de pruebas, manejo de HiDPI, nomenclatura de módulos).

## R1: Tolerancia de verificación matemática

- **Decision**: Tolerancia absoluta de `0.01 m³`: `|volumenIntegral - volumenTrapecio| ≤ 0.01`.
- **Rationale**: Para una función lineal, la integral definida y el área del trapecio son algebraicamente idénticas; cualquier diferencia mayor a 0.01 delata un error de implementación (p. ej. pendiente redondeada), no una limitación de punto flotante IEEE 754.
- **Alternatives considered**: Tolerancia relativa (porcentual) — descartada porque distorsiona la sensibilidad del umbral entre el primer segmento (volumen ~127M) y el resto de segmentos; `Number.EPSILON` puro — descartado por ser demasiado estricto para acumulación de error en sumas de 5 segmentos.

## R2: Motor de renderizado gráfico

- **Decision**: HTML5 Canvas 2D API para el gráfico, con una tabla HTML semántica alternativa (mismos datos) siempre presente en el DOM para accesibilidad.
- **Rationale**: Canvas ofrece control pixel-perfect del sombreado del área bajo la curva y evita manipulación de nodos SVG por segmento; la tabla alternativa cubre la falta de accesibilidad nativa de Canvas para lectores de pantalla.
- **Alternatives considered**: SVG generado dinámicamente — viable y accesible por naturaleza (elementos son nodos DOM), pero se descarta por mayor complejidad de manipulación de path/sombreado para el volumen de trabajo de este simulador; permitido igualmente por la Constitución pero no elegido aquí.

## R3: Formato numérico de salida

- **Decision**: `Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })`.
- **Rationale**: Fija el formato colombiano (punto de miles, coma decimal) sin depender del locale del navegador del usuario; es una API nativa, cumple Principio II (sin librerías externas).
- **Alternatives considered**: Formateo manual con `toFixed()` + regex — descartado por mayor superficie de error y duplicación de lógica que `Intl.NumberFormat` ya resuelve nativamente.

## R4: Versión mínima de JavaScript

- **Decision**: ECMAScript 2020 (ES11) como mínimo; prohibidos los módulos ES (`import`/`export`).
- **Rationale**: ES2020 tiene soporte >98% en navegadores modernos desde 2020 y habilita `const/let`, arrow functions, optional chaining y nullish coalescing sin transpilación; los módulos ES fallan bajo `file://` por política de origen del navegador, violando SC-002.
- **Alternatives considered**: `<script type="module">` — descartado explícitamente por romper la ejecución local sin servidor.

## R5: Accesibilidad

- **Decision**: WCAG 2.1 Nivel AA — contraste 4.5:1 (texto) / 3:1 (gráficos), navegación completa por teclado, `aria-label` en controles, tabla semántica alternativa al Canvas.
- **Rationale**: Estándar ampliamente adoptado en contextos académicos; complementa la mitigación de accesibilidad de Canvas decidida en R2.
- **Alternatives considered**: WCAG 2.1 Nivel AAA — descartado por exceder el alcance educativo del simulador y añadir restricciones de contraste (7:1) difíciles de justificar frente al beneficio marginal.

## R6: Responsividad

- **Decision**: Mobile-first con breakpoint único en 768px; columna única con gráfico a aspect-ratio 16:9 por debajo del breakpoint, dos columnas (gráfico + resultados) desde 768px.
- **Rationale**: Un único breakpoint mantiene el CSS simple (sin media queries adicionales) y cubre el caso de uso principal (estudiante en móvil o portátil).
- **Alternatives considered**: Múltiples breakpoints (480px/768px/1024px) — descartado por complejidad innecesaria para una interfaz de una sola pantalla con dos paneles.

## R7: Persistencia de estado

- **Decision**: Estado efímero; el intervalo seleccionado siempre reinicia a "Primer intervalo [0,6]" en cada carga. Sin `localStorage` ni cookies.
- **Rationale**: No hay valor pedagógico medible en persistir la selección entre sesiones; evita complejidad y posibles inconsistencias de estado obsoleto.
- **Alternatives considered**: `localStorage` — descartado por el mismo motivo (complejidad sin beneficio).

## R8: Fallback ante ausencia de soporte de Canvas

- **Decision**: Feature detection de `HTMLCanvasElement`; si no está soportado, se oculta el canvas y se muestra la tabla HTML alternativa (ya presente por R2/R5, con el contenido acotado por R13) junto con un mensaje explicativo dirigido al estudiante; el panel de resultados con el procedimiento matemático permanece visible como de costumbre, ya que es HTML accesible independiente del Canvas.
- **Rationale**: Cumple el Principio VII (mensajes de error comprensibles, sin `undefined`/`NaN` expuestos) para un caso extremo pero técnicamente posible.
- **Alternatives considered**: No hacer feature detection y dejar que Canvas falle silenciosamente — descartado por violar el Principio VII.

## R9: Estrategia de pruebas sin framework externo

- **Decision**: Verificación manual mediante `console.assert()` ejecutado en la consola del navegador contra las funciones puras del motor matemático, expuestas para depuración en un espacio de nombres no invasivo (p. ej. una constante interna referenciable desde DevTools). Los escenarios se documentan en `quickstart.md`.
- **Rationale**: Cualquier framework de pruebas (Jest, Mocha, etc.) es una dependencia externa prohibida por el Principio II; `console.assert()` es una API nativa del navegador y no requiere build step, preservando la ejecución bajo `file://`.
- **Alternatives considered**: Archivo de pruebas HTML separado (`tests.html` + `tests.js`) — viable y no prohibido, pero se descarta como parte del entregable para mantener el proyecto exactamente en los tres archivos que exige el Principio VI; queda como opción del implementador durante el desarrollo, fuera del alcance de este plan.

## R10: Manejo de alta resolución (HiDPI) en Canvas

- **Decision**: Al inicializar el canvas, escalar el contexto según `window.devicePixelRatio`, fijando el tamaño de buffer interno (`canvas.width/height`) en píxeles físicos y el tamaño CSS (`canvas.style.width/height`) en píxeles lógicos.
- **Rationale**: Evita que el gráfico se vea borroso en pantallas Retina/HiDPI, sin dependencias externas — es una técnica estándar de la Canvas API nativa.
- **Alternatives considered**: Ignorar `devicePixelRatio` — descartado porque degrada la calidad visual en portátiles y móviles modernos, relevante dado el requisito de responsividad (R6/DEC-06).

## R11: Nomenclatura de los módulos del motor matemático

- **Decision**: Los nombres de función usados en la implementación son exactamente los ocho exigidos por la Constitución (Principio VI): `validarDatos()`, `calcularSegmento()`, `calcularIntegral()`, `calcularTrapecio()`, `verificarResultados()`, `calcularPeriodo()`, `actualizarGrafica()`, `actualizarInterfaz()`.
- **Rationale**: El desglose de tareas de referencia entregado por el usuario proponía nombres alternativos (`construirSegmentos()`, `calcularTotales()`, `inicializarCanvas()`, `renderizarGrafica()`) que describen el mismo comportamiento pero no coinciden textualmente con la Constitución. Para evitar ambigüedad de implementación se normaliza a la nomenclatura constitucional; `calcularSegmento()` construye los 5 `SegmentoModelo` (equivalente a la `construirSegmentos()` propuesta), `verificarResultados()` absorbe la comparación y el cálculo de totales por periodo, y `actualizarGrafica()`/`actualizarInterfaz()` cubren la inicialización y el renderizado de Canvas y del panel de resultados respectivamente.
- **Alternatives considered**: Mantener los nombres del desglose de tareas del usuario y tratarlos como sinónimos aceptables — descartado porque el Principio VI usa lenguaje MUST y lista los nombres de forma literal; divergir introduce riesgo de inconsistencia entre plan, contratos y código.

## R12: Volumen total del Periodo completo ante fallo de verificación de un segmento

- **Decision**: Si algún `SegmentoModelo` del Periodo completo resulta `'FALLIDO'`, `verificarResultados()` fija `ResultadoPeriodo.estadoGlobal = 'FALLIDO'`, identifica el segmento mediante `segmentoFallidoIndice`, y **no** calcula ni expone `volumenTotalIntegral`/`volumenTotalTrapecio`/`diferenciaTotal` (quedan en `null`). La interfaz detiene el flujo normal y muestra únicamente el mensaje de fallo con el segmento identificado (FR-004).
- **Rationale**: Decisión tomada en `/speckit-clarify` (sesión 2026-09-16). Evita que la aplicación combine, en un mismo total, segmentos verificados con uno no confiable — lo cual sería pedagógicamente engañoso y contradice el Principio VII ("un simulador educativo que falla en silencio... pierde su función didáctica"). En la práctica esta rama es inalcanzable con `DATOS_ORIGINALES` (todos los segmentos verifican exactamente), pero el motor debe manejarla explícitamente como salvaguarda de corrección.
- **Alternatives considered**: Mostrar el total igualmente con una advertencia visual — descartado por riesgo de que un estudiante copie un número no confiable; mostrar un total parcial excluyendo el segmento fallido — descartado porque un "total" que en realidad es la suma de 4 de 5 segmentos podría confundirse con el volumen real del periodo completo (781.352.568,00 m³).

## R13: Alcance de contenido de la tabla HTML accesible alternativa

- **Decision**: La tabla HTML semántica siempre presente (FR-001) contiene **únicamente** los 6 pares `(t, Q)` de `DATOS_ORIGINALES`. No duplica volúmenes, fórmulas ni estado de verificación por segmento. Se puebla una sola vez en la inicialización (los datos son inmutables) y no se re-renderiza en cada cambio de intervalo.
- **Rationale**: Decisión tomada en `/speckit-clarify` (sesión 2026-09-16). El procedimiento matemático y los resultados ya son accesibles por separado en el panel de resultados (HTML estándar, sin Canvas); duplicar esa información en la tabla añadiría complejidad de sincronización sin beneficio de accesibilidad adicional.
- **Alternatives considered**: Tabla completa con resultados por segmento (duplicando todo el panel en formato tabular) — descartada por duplicación innecesaria; contenido de la tabla dependiente de si Canvas está soportado (tabla mínima con Canvas, tabla ampliada con el procedimiento sin Canvas) — descartada explícitamente por el usuario en la sesión de clarificación a favor de un contenido único y consistente en ambos casos.
