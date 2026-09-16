# Implementation Plan: Simulador Matemático-Educativo de Caudal y Volumen (Río Magdalena)

**Branch**: `001-simulador-caudal-volumen` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-simulador-caudal-volumen/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Simulador educativo de una sola página (HTML5 + CSS3 + JavaScript vanilla, sin dependencias) que representa los 6 registros de caudal del río Magdalena (estación El Banco, Magdalena) como 5 segmentos rectos, calcula el volumen de agua por integral definida y por trapecio para el "Primer intervalo [0,6]" o el "Periodo completo [0,36]", y muestra ambos métodos con su verificación (tolerancia absoluta 0.01 m³) de forma completamente trazable. El enfoque técnico separa estrictamente un motor matemático puro (sin DOM/Canvas) de la capa de renderizado y de interfaz, siguiendo la arquitectura por capas `DATOS → VALIDACIÓN → MODELO → CÁLCULOS → VERIFICACIÓN → VISUALIZACIÓN → INTERFAZ` exigida por la Constitución.

## Technical Context

**Language/Version**: JavaScript ES2020 (ES11) mínimo, sin módulos ES (`import`/`export`); HTML5; CSS3.

**Primary Dependencies**: Ninguna. Prohibidos frameworks, librerías de gráficos (Chart.js, D3.js, math.js), backend y APIs de red (Constitución, Principio II).

**Storage**: N/A. Los 6 registros están hardcodeados e inmutables (`Object.freeze`); el estado de selección de intervalo es efímero y se reinicia en cada carga (FR-011).

**Testing**: Sin framework externo (prohibido por el stack restringido). El motor matemático se valida con aserciones `console.assert()` ejecutadas manualmente en la consola del navegador contra las funciones puras expuestas por `script.js`, siguiendo los escenarios de `quickstart.md`.

**Target Platform**: Navegadores de escritorio modernos (Chrome, Firefox, Edge) sirviendo el archivo directamente vía `file://`; layout responsivo hasta ancho móvil (breakpoint único 768px).

**Project Type**: Aplicación web estática de una sola página (client-only, sin backend).

**Performance Goals**: Recalculo y re-renderizado instantáneos (percibidos como inmediatos, <16 ms) al alternar de intervalo — la carga computacional es trivial (6 puntos, 5 segmentos).

**Constraints**: Cero dependencia de red (debe funcionar 100% bajo `file://`); cero librerías externas; WCAG 2.1 Nivel AA; tolerancia de verificación absoluta de 0.01 m³; precisión completa en cálculos internos, redondeo solo en presentación (`Intl.NumberFormat('es-CO')`, 2 decimales).

**Scale/Scope**: Dataset fijo de 6 registros / 5 segmentos; una sola pantalla, dos modos de visualización (Primer intervalo / Periodo completo); sin enrutamiento ni múltiples vistas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|---|---|---|
| I. Propósito Educativo y Alcance | PASS | El plan mantiene la interfaz exigida (6 registros, 5 segmentos, selector de intervalo, sombreado, procedimiento paso a paso, doble verificación) sin introducir predicción hidrológica. |
| II. Stack Tecnológico Restringido | PASS | Technical Context confirma HTML5/CSS3/JS vanilla, cero dependencias, ejecución 100% cliente bajo `file://`; los mismos 3 archivos se publican sin cambios como sitio estático con enlace público verificable (FR-012, SC-005). |
| III. Integridad de los Datos Originales (NON-NEGOTIABLE) | PASS | Los 6 registros se declaran con `Object.freeze()` y valores exactos de la Tabla 1; la pendiente se calcula y usa en precisión completa (ver `data-model.md`); el redondeo se aplica solo al formatear la salida (FR-008). |
| IV. Modelo de Segmentos Lineales | PASS | `data-model.md` define `SegmentoModelo` construido exclusivamente por interpolación lineal entre puntos consecutivos, sin splines ni regresiones. |
| V. Doble Verificación Matemática | PASS | `calcularIntegral()` y `calcularTrapecio()` son funciones independientes; `verificarResultados()` aplica la tolerancia absoluta 0.01 m³ (DEC-01) y el factor 3600 obligatorio; si un segmento del periodo completo falla, `ResultadoPeriodo` no expone ningún volumen total (`volumenTotalIntegral`/`volumenTotalTrapecio`/`diferenciaTotal` en `null`, R12), evitando presentar como validado un resultado que mezcle segmentos verificados con uno que no lo está. |
| VI. Arquitectura y Estilo de Código | PASS (con reconciliación de nombres) | El desglose de tareas de referencia usaba nombres como `construirSegmentos()` o `renderizarGrafica()`; `contracts/motor-matematico.contract.md` normaliza la nomenclatura a los ocho módulos exigidos textualmente por la Constitución: `validarDatos()`, `calcularSegmento()`, `calcularIntegral()`, `calcularTrapecio()`, `verificarResultados()`, `calcularPeriodo()`, `actualizarGrafica()`, `actualizarInterfaz()`. Los campos `t`/`Q` de `RegistroCaudal` se conservan como notación matemática (ver nota en `data-model.md`), no como nombres genéricos. |
| VII. Validación y Manejo de Errores | PASS | `validarDatos()` bloquea el cálculo ante datos inválidos con mensajes orientados al estudiante (FR-007); `contracts/motor-matematico.contract.md` documenta los mensajes de error por caso, incluido el fallo agregado del periodo completo (R12) que identifica el segmento problemático en vez de exponer un total no confiable. |

No se identifican violaciones que requieran justificación en Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-simulador-caudal-volumen/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/            # Phase 1 output (/speckit-plan command)
│   └── motor-matematico.contract.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Aplicación estática de un solo proyecto — estructura exigida por la Constitución (Principio VI):
# exactamente tres archivos de producción, sin subcarpetas src/, sin build step.
index.html   # Estructura semántica: canvas del gráfico, tabla accesible alternativa,
             # controles de selección de intervalo, panel de resultados.
styles.css   # Presentación: layout mobile-first (breakpoint 768px), contraste WCAG 2.1 AA.
script.js    # Lógica: DATOS_ORIGINALES (inmutables) + los 8 módulos del Principio VI
             # (validarDatos, calcularSegmento, calcularIntegral, calcularTrapecio,
             # verificarResultados, calcularPeriodo, actualizarGrafica, actualizarInterfaz),
             # organizados internamente en las capas Motor Matemático (puro, sin DOM/Canvas)
             # y Capa de Interfaz (Canvas + DOM), según contracts/motor-matematico.contract.md.
```

**Structure Decision**: Proyecto único de aplicación web estática, limitado a los tres archivos que exige la Constitución (`index.html`, `styles.css`, `script.js`). Dentro de `script.js` se mantiene la separación por capas mediante convención de nombres y agrupación de funciones (no mediante módulos ES, prohibidos por FR-006): un bloque de "Motor Matemático" con funciones puras testeables desde la consola del navegador, y un bloque de "Interfaz" que consume esas funciones puras y manipula Canvas/DOM. No se introducen subcarpetas `src/`, `tests/` ni herramientas de build, ya que estarían fuera del stack restringido (Principio II).

## Complexity Tracking

> No se registran violaciones de la Constitution Check. Esta sección no aplica.
