# Phase 1 Data Model: HidroLab Interactivo Pro

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

Este documento extiende el modelo de datos de la feature 001 (`specs/001-simulador-caudal-volumen/data-model.md`), que sigue vigente sin cambios: `RegistroCaudal`, `ResultadoValidacion`, `SegmentoModelo` y `ResultadoPeriodo` no se modifican en su estructura ni en sus fórmulas (Principio III/IV/V). Aquí solo se documentan las entidades **nuevas**, todas en memoria y sin persistencia salvo donde se indique explícitamente (Preferencia de Tema).

## PreferenciaTema

Corresponde a la entidad "Preferencia de Tema" de `spec.md` (FR-001 a FR-004).

| Campo | Tipo | Descripción | Reglas |
|---|---|---|---|
| `tema` | `'claro' \| 'oscuro'` | Tema actualmente aplicado a la interfaz. | Se refleja en `document.documentElement.dataset.tema`. |
| `origen` | `'explicito' \| 'sistema'` | Si el valor de `tema` proviene de una elección del usuario o de la detección automática. | `'explicito'` solo tras una interacción con el alternador de tema. |

**Persistencia**: únicamente cuando `origen === 'explicito'`, se guarda `tema` bajo la clave `localStorage` `hidrolab-tema` (R16). Si `origen === 'sistema'`, no se escribe nada en `localStorage`; el tema se deriva en cada carga de `window.matchMedia('(prefers-color-scheme: dark)')` (R15).

**Invariante**: en la carga inicial, si `localStorage.getItem('hidrolab-tema')` existe y es `'claro'` o `'oscuro'`, `origen = 'explicito'` y ese valor gana sobre la preferencia del sistema (FR-002); en caso contrario, `origen = 'sistema'` (FR-003).

## SegmentoAislado

Corresponde a la entidad "Segmento Aislado" de `spec.md` (FR-005 a FR-008).

| Campo | Tipo | Descripción |
|---|---|---|
| `indice` | `number \| null` | Índice (0-4) del `SegmentoModelo` actualmente aislado dentro de `resultado.segmentos` en modo `'periodo_completo'`; `null` si no hay ninguno aislado. |

**Métricas locales mostradas** (FR-006): no son campos nuevos — se leen directamente del `SegmentoModelo` en `resultado.segmentos[indice]`, ya calculado por la feature 001:

| Métrica mostrada | Fuente |
|---|---|
| Volumen parcial | `segmentos[indice].volumenIntegral` (m³) |
| Caudal promedio local | `(segmentos[indice].QInicio + segmentos[indice].QFin) / 2` (m³/s) — promedio del caudal lineal en el tramo, algebraicamente igual a `(1/Δt)·∫f(t)dt`; no introduce una fórmula nueva, es la misma base que usa `calcularTrapecio()`. |
| Pendiente m | `segmentos[indice].pendiente` (m³/s por hora) |

**Invariantes**:
- `indice` solo puede ser distinto de `null` cuando `resultado.modo === 'periodo_completo'` (FR-008).
- Un cambio de `modo` (evento `change` de los controles de intervalo ya existentes) fuerza `indice = null` (FR-008, Acceptance Scenario 4 de User Story 2).
- Cambiar `PreferenciaTema.tema` **no** afecta `SegmentoAislado.indice` (edge case de `spec.md`: "si el usuario aísla un segmento y luego activa o desactiva el modo oscuro, el aislamiento se mantiene sin cambios").

## PuntoRastreo

Corresponde a la entidad "Punto de Rastreo" de `spec.md` (FR-009 a FR-013). Es un valor derivado y transitorio (no persistido), recalculado en cada evento de movimiento de puntero.

| Campo | Tipo | Descripción |
|---|---|---|
| `t` | `number` | Instante señalado por el usuario, dentro del rango `[tMin, tMax]` del modo activo. |
| `Q` | `number` | Caudal interpolado en `t`, calculado por `interpolarCaudal()` (ver `contracts/interaccion-avanzada.contract.md`). |
| `segmentoIndice` | `number` | Índice (0-based) del `SegmentoModelo` de `resultado.segmentos` que contiene a `t` (`tInicio ≤ t ≤ tFin`). |

Cuando el puntero está fuera del rango graficado, no existe `PuntoRastreo` válido: el estado de interacción representa esa ausencia como `puntoRastreo: null` (FR-012).

**Invariantes** (heredados de `SegmentoModelo`, Principio IV):
- Si `t === segmentos[segmentoIndice].tInicio`, entonces `Q === segmentos[segmentoIndice].QInicio` exactamente (Acceptance Scenario 3, User Story 1).
- Si `t === segmentos[segmentoIndice].tFin`, entonces `Q === segmentos[segmentoIndice].QFin` exactamente.
- `PuntoRastreo` se calcula y se muestra igual sobre segmentos atenuados por `SegmentoAislado` (FR-013): ambas entidades son independientes — `interpolarCaudal()` nunca consulta `SegmentoAislado.indice`.

## EstadoInteraccion (agregado de presentación)

No es una entidad de negocio nueva, sino el objeto que la capa de interfaz pasa a las funciones extendidas `actualizarGrafica()` y `actualizarInterfaz()` (Principio VI, módulos existentes con firma ampliada — ver R22 de `research.md`) para que el dibujo y el panel reflejen `SegmentoAislado` y `PuntoRastreo` sin que esas funciones necesiten leer variables globales implícitas.

| Campo | Tipo | Descripción |
|---|---|---|
| `segmentoAisladoIndice` | `number \| null` | Copia de `SegmentoAislado.indice` en el momento del renderizado. |
| `puntoRastreo` | `PuntoRastreo \| null` | Copia del punto de rastreo vigente en el momento del renderizado. |

`PreferenciaTema` **no** forma parte de `EstadoInteraccion`: el tema se aplica vía el atributo `data-tema` en `<html>` y la cascada CSS (R14), por lo que ni `actualizarGrafica()` ni `actualizarInterfaz()` necesitan conocerlo explícitamente — leen los mismos nombres de variable CSS (`obtenerVariableCSS()`, ya existente) que ya resuelven al color correcto según el tema activo.

## Diagrama de flujo de datos (extensión sobre el de la feature 001)

```text
ResultadoPeriodo (sin cambios, feature 001)
        │
        ├──► interpolarCaudal(segmentos, t) ──► PuntoRastreo | null   (evento pointermove/mousemove)
        │
        ├──► aislarSegmento(indice) / limpiarSeleccionSegmento() ──► SegmentoAislado.indice   (clic/tap/leyenda)
        │
        ▼
EstadoInteraccion { segmentoAisladoIndice, puntoRastreo }
        │
        ▼
actualizarGrafica(ctx, resultado, estadoInteraccion)   ──► atenuación de segmentos + indicador del punto de rastreo
actualizarInterfaz(resultado, estadoInteraccion)       ──► panel de resumen (totales o métricas locales del segmento aislado)

PreferenciaTema (independiente, no pasa por ResultadoPeriodo)
        │
        ▼
aplicarTema(tema) ──► document.documentElement.dataset.tema = tema ──► cascada CSS (obtenerVariableCSS ya existente)
```
