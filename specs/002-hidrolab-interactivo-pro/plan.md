# Implementation Plan: HidroLab Interactivo Pro

**Branch**: `002-hidrolab-interactivo-pro` | **Date**: 2026-09-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-hidrolab-interactivo-pro/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

HidroLab Interactivo Pro añade tres capacidades al simulador existente (`index.html`/`styles.css`/`script.js`, HTML5+CSS3+JavaScript vanilla, sin dependencias) sin tocar el motor matemático ya verificado (datos originales, segmentos lineales, integral/trapecio): (1) modo oscuro con detección automática de `prefers-color-scheme` y persistencia explícita en `localStorage`, implementado por completo con variables CSS existentes y un atributo `data-tema`; (2) aislamiento interactivo de uno de los cinco segmentos del "Periodo completo" (clic/tap sobre el gráfico o una leyenda de 5 botones accesibles por teclado), que atenúa visualmente el resto y sustituye los totales del panel de resumen por las métricas locales del segmento elegido, sin alterar el procedimiento matemático detallado; y (3) rastreo continuo del cursor/puntero sobre la curva que interpola Q(t) en cualquier instante usando el mismo modelo lineal por tramos ya calculado (`interpolarCaudal()`, una función pura nueva que reutiliza la fórmula de `calcularIntegral()`), con desambiguación estándar de tap-vs-drag en pantallas táctiles. Las tres capacidades son ortogonales entre sí y se implementan como funciones adicionales con nombres semánticos propios, sin modificar los ocho módulos ya exigidos por la Constitución salvo la ampliación de firma de `actualizarGrafica()`/`actualizarInterfaz()` para recibir el nuevo estado de interacción.

## Technical Context

**Language/Version**: JavaScript ES2020 (ES11) mínimo, sin módulos ES (`import`/`export`); HTML5; CSS3 — mismo baseline que la feature 001, extendido con la Pointer Events API (soporte nativo desde ES2020-era en navegadores modernos) y `window.matchMedia` / `localStorage` (APIs nativas del navegador).

**Primary Dependencies**: Ninguna nueva. Prohibidos frameworks, librerías de gráficos/theming y backend (Constitución, Principio II). Todas las capacidades nuevas usan únicamente APIs nativas del navegador: CSS Custom Properties + atributo `data-tema`, `window.matchMedia('(prefers-color-scheme: dark)')`, `localStorage` (con `try/catch`), y Pointer Events (`pointerdown`/`pointermove`/`pointerup`/`pointercancel`) sobre el `<canvas>` ya existente.

**Storage**: `localStorage`, clave única `hidrolab-tema` (`'claro' | 'oscuro'`), escrita solo tras una elección explícita del usuario (FR-002); envuelta en `try/catch` para degradar sin errores si no está disponible (R16). Ningún otro estado nuevo se persiste: el segmento aislado y el punto de rastreo son transitorios en memoria, igual que el modo de intervalo ya existente (feature 001, R7).

**Testing**: Sin framework externo (prohibido por el stack restringido). Se extiende la estrategia ya usada en la feature 001: aserciones `console.assert()` manuales en la consola del navegador contra la nueva función pura `interpolarCaudal()`, siguiendo los escenarios de `quickstart.md`; las capacidades de interfaz (tema, aislamiento, rastreo) se validan manualmente en el navegador siguiendo los pasos numerados de `quickstart.md`, dado que no involucran lógica matemática pura adicional que valga la pena aislar en aserciones.

**Target Platform**: Navegadores de escritorio modernos (Chrome, Firefox, Edge) sirviendo el archivo directamente vía `file://`, más pantallas táctiles (tablet/móvil) para el gesto de arrastre y tap (FR-005, FR-009); layout responsivo heredado de la feature 001 (breakpoint único 768px, sin cambios).

**Project Type**: Aplicación web estática de una sola página (client-only, sin backend) — se extiende, no se reestructura, la aplicación de la feature 001.

**Performance Goals**: Actualización del indicador de rastreo continuo y del resaltado de aislamiento percibida como inmediata (<16 ms por evento de puntero, SC-001/FR-012) sin acumular trabajo redundante — cada `pointermove` recalcula solo `interpolarCaudal()` (recorrido lineal sobre ≤5 segmentos) y vuelve a dibujar el mismo canvas ya usado por la feature 001, sin estructuras de datos adicionales de alto costo.

**Constraints**: Cero dependencia de red (debe seguir funcionando 100% bajo `file://`); cero librerías externas; WCAG 2.1 Nivel AA también en tema oscuro (contraste ≥4.5:1 texto, ≥3:1 gráficos/áreas sombreadas, FR-004/SC-006); alternador de tema y leyenda de aislamiento 100% operables por teclado y anunciados a tecnologías de asistencia (FR-015/SC-005); el rastreo continuo por puntero no requiere paridad exacta de teclado (Assumption de `spec.md` — la tabla de datos y el procedimiento matemático ya accesibles cubren esa necesidad); ninguna interpolación no lineal (splines, regresiones) puede introducirse en ningún cálculo mostrado (FR-014, Principio IV NON-NEGOTIABLE en cuanto a los datos).

**Scale/Scope**: Mismo dataset fijo de 6 registros / 5 segmentos de la feature 001; se añaden 3 elementos de interfaz nuevos (alternador de tema, leyenda de 5 botones + botón "Mostrar periodo completo", indicador de lectura de rastreo continuo) sobre la misma pantalla única, sin enrutamiento ni vistas adicionales.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Notas |
|---|---|---|
| I. Propósito Educativo y Alcance | PASS | Las tres capacidades son mejoras de exploración/ergonomía sobre la misma interfaz obligatoria (6 registros, 5 segmentos, selector de intervalo, sombreado, procedimiento paso a paso); ninguna sustituye ni reinterpreta el volumen como medición real (FR-014). |
| II. Stack Tecnológico Restringido | PASS | Solo APIs nativas del navegador (CSS Custom Properties, `matchMedia`, `localStorage`, Pointer Events); cero librerías, cero backend, cero red; sigue ejecutándose 100% bajo `file://` (Technical Context). |
| III. Integridad de los Datos Originales (NON-NEGOTIABLE) | PASS | `DATOS_ORIGINALES` no se lee ni se modifica desde ninguna función nueva; `interpolarCaudal()` opera exclusivamente sobre `SegmentoModelo[]` ya derivado y verificado por el motor matemático de la feature 001. |
| IV. Modelo de Segmentos Lineales | PASS | `interpolarCaudal()` reutiliza textualmente `fᵢ(t) = QInicio + pendiente·(t - tInicio)`, la misma fórmula lineal por tramos ya definida (Principio IV); FR-014 prohíbe explícitamente introducir splines u otra suavización, y el diseño (R18 de `research.md`) no lo hace. |
| V. Doble Verificación Matemática | PASS | No aplica cambio: `calcularIntegral()`/`calcularTrapecio()`/`verificarResultados()` no se modifican; el aislamiento de segmento solo redirige qué campos ya calculados se muestran (FR-006), sin recalcular con un método distinto. |
| VI. Arquitectura y Estilo de Código | PASS (con extensión documentada) | Los ocho módulos exigidos se conservan con su nombre y responsabilidad central; `actualizarGrafica()`/`actualizarInterfaz()` amplían su firma (parámetro `estadoInteraccion`) sin cambiar su rol. Las capacidades genuinamente nuevas (tema, aislamiento, rastreo) reciben funciones propias con nombres semánticos (`interpolarCaudal`, `aplicarTema`, `aislarSegmento`, `manejarMovimientoPuntero`, etc.), documentadas en `contracts/interaccion-avanzada.contract.md` y justificadas en R22 de `research.md`: el Principio VI no está marcado NON-NEGOTIABLE y su intención (nombres semánticos, DRY) se cumple igual con funciones adicionales que forzando lógica nueva dentro de los ocho nombres originales. |
| VII. Validación y Manejo de Errores | PASS | `interpolarCaudal()` retorna `null` de forma explícita fuera de rango (sin `NaN`/`undefined` visibles, FR-012); fallos de `localStorage` se capturan en `try/catch` y degradan silenciosamente a la preferencia del sistema (R16), consistente con "cero dependencia de... almacenamiento remoto" y con el estándar de mensajes orientados al estudiante ya vigente. |

No se identifican violaciones que requieran justificación en Complexity Tracking: no se añaden dependencias, archivos de producción, backend ni interpolación no lineal.

## Project Structure

### Documentation (this feature)

```text
specs/002-hidrolab-interactivo-pro/
├── plan.md                                    # This file (/speckit-plan command output)
├── research.md                                # Phase 0 output (/speckit-plan command)
├── data-model.md                              # Phase 1 output (/speckit-plan command)
├── quickstart.md                              # Phase 1 output (/speckit-plan command)
├── contracts/                                 # Phase 1 output (/speckit-plan command)
│   └── interaccion-avanzada.contract.md
├── checklists/
│   └── requirements.md                        # Already produced by /speckit-specify
└── tasks.md                                   # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
# Aplicación estática de un solo proyecto — se mantienen exactamente los tres archivos
# de producción exigidos por la Constitución (Principio VI); esta feature los EXTIENDE,
# no añade archivos ni subcarpetas nuevas.
index.html   # + botón alternador de tema (accesible, con estado anunciado); leyenda de
             #   5 botones "aria-pressed" (uno por segmento) + botón "Mostrar periodo
             #   completo", visibles solo en modo Periodo completo; elemento de lectura
             #   continua del punto de rastreo (instante + caudal + segmento).
styles.css   # + bloque de variables CSS bajo `:root[data-tema="oscuro"]` (mismos nombres
             #   de variable ya usados, R14/R17); estilos de la leyenda de segmentos y
             #   estados aria-pressed; estilo del indicador de rastreo; reglas de opacidad
             #   reducida para segmentos atenuados del canvas (aplicadas vía JS al dibujar,
             #   no vía CSS, ya que el canvas no es DOM estilizable por selector).
script.js    # + interpolarCaudal() (motor matemático puro, nueva); calcularEscalasGrafico()
             #   extraído de actualizarGrafica() para reutilizarse en el hit-testing del
             #   puntero (R19); ampliación de firma de actualizarGrafica()/actualizarInterfaz()
             #   con el parámetro estadoInteraccion; funciones nuevas de interfaz para tema
             #   (inicializarTema, detectarPreferenciaSistema, leerTemaGuardado,
             #   guardarTemaElegido, aplicarTema, alternarTema), aislamiento
             #   (aislarSegmento, limpiarSeleccionSegmento) y puntero
             #   (manejarMovimientoPuntero, manejarPointerDown, manejarPointerUp,
             #   posicionAInstante) — ver contracts/interaccion-avanzada.contract.md.
```

**Structure Decision**: Se conserva el proyecto único de aplicación web estática limitado a `index.html`, `styles.css` y `script.js` (Principio VI). Dentro de `script.js` se mantiene la separación por capas ya establecida (Motor Matemático puro vs. Capa de Interfaz), añadiendo `interpolarCaudal()` al primer bloque y todas las funciones de tema/aislamiento/puntero al segundo, agrupadas bajo comentarios de sección nuevos (`TEMA`, `AISLAMIENTO DE SEGMENTO`, `RASTREO CONTINUO`) para mantener la legibilidad exigida por el Principio VI sin introducir módulos ES ni subcarpetas.

## Complexity Tracking

> No se registran violaciones de la Constitution Check. Esta sección no aplica.
