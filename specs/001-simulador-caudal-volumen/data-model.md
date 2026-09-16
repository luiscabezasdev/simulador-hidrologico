# Phase 1 Data Model: Simulador Matemático-Educativo de Caudal y Volumen

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

Todas las entidades son estructuras de datos en memoria (objetos/arrays JavaScript planos), sin persistencia (R7). Los valores numéricos internos NUNCA se redondean; el redondeo ocurre solo al formatear para presentación (FR-008, DEC-03).

## RegistroCaudal

Punto de dato hidrológico original e inmutable (Constitución, Principio III).

| Campo | Tipo | Descripción | Reglas |
|---|---|---|---|
| `t` | number | Tiempo en horas desde el inicio del registro. | Debe ser finito; estrictamente ascendente entre registros consecutivos. |
| `Q` | number | Caudal en m³/s. | Debe ser finito (no `NaN`/`Infinity`). |

**Origen de verdad** (Constitución, Sección 3):

| t (horas) | Q (m³/s) |
|---:|---:|
| 0 | 5825.54 |
| 6 | 6000.69 |
| 12 | 5840.28 |
| 24 | 6146.58 |
| 30 | 6192.00 |
| 36 | 6175.96 |

**Invariantes**: exactamente 6 registros; declarados con `Object.freeze()` a nivel de array y de cada objeto; nunca se mutan tras la carga inicial.

**Nota de nomenclatura**: los campos `t` y `Q` replican deliberadamente la notación matemática usada en toda la Constitución (`t`, `Qᵢ`, `fᵢ(t)`, Principios III-V) y en `contracts/motor-matematico.contract.md`. No se consideran nombres "genéricos" en el sentido prohibido por el Principio VI (que veta símbolos sin significado como `x`, `a`, `b`, `r`); son el símbolo estándar del dominio, igual que "tiempo" y "caudal" lo son para las variables derivadas (`pendiente`, `volumenIntegral`, etc.).

## ResultadoValidacion

Salida de `validarDatos()` (FR-007).

| Campo | Tipo | Descripción |
|---|---|---|
| `esValido` | boolean | `true` si los 6 `RegistroCaudal` cumplen todas las precondiciones. |
| `mensaje` | string | Mensaje orientado al estudiante; vacío o descriptivo del fallo (p. ej. "Los tiempos deben estar en orden ascendente estricto"). Nunca contiene `NaN`/`undefined` crudos. |

**Reglas de validación** (todas deben cumplirse para `esValido = true`):
1. `datos.length === 6`.
2. `typeof t === 'number' && Number.isFinite(t)` y lo mismo para `Q`, en cada registro.
3. `datos[i].t < datos[i+1].t` para todo `i` (orden ascendente estricto).
4. `datos[i+1].t - datos[i].t > 0` (duración de cada intervalo > 0 — implícito en la regla 3, pero verificado explícitamente por claridad del mensaje de error).

## SegmentoModelo

Modelo lineal entre dos `RegistroCaudal` consecutivos, producido por `calcularSegmento()` (Constitución, Principio IV) y enriquecido por `verificarResultados()` (Principio V).

| Campo | Tipo | Descripción | Regla / Fórmula |
|---|---|---|---|
| `tInicio` | number | Tiempo de inicio del segmento (horas). | `= RegistroCaudal[i].t` |
| `tFin` | number | Tiempo de fin del segmento (horas). | `= RegistroCaudal[i+1].t` |
| `QInicio` | number | Caudal al inicio (m³/s). | `= RegistroCaudal[i].Q` |
| `QFin` | number | Caudal al final (m³/s). | `= RegistroCaudal[i+1].Q` |
| `pendiente` | number | Pendiente de `fᵢ(t) = QInicio + pendiente · (t - tInicio)`. | `(QFin - QInicio) / (tFin - tInicio)`, precisión completa (sin redondear). |
| `volumenIntegral` | number | Volumen en m³ por integral definida. | `3600 · ∫[tInicio, tFin] fᵢ(t) dt` (ver fórmula analítica en `contracts/motor-matematico.contract.md`). |
| `volumenTrapecio` | number | Volumen en m³ por área del trapecio. | `3600 · ((QInicio + QFin) / 2) · (tFin - tInicio)`. |
| `diferencia` | number | Diferencia absoluta entre ambos métodos. | `Math.abs(volumenIntegral - volumenTrapecio)`. |
| `estadoVerificacion` | `'VERIFICADO' \| 'FALLIDO'` | Resultado de comparar `diferencia` contra la tolerancia. | `'VERIFICADO'` si `diferencia ≤ 0.01`, en otro caso `'FALLIDO'`. |

**Invariantes**: `fᵢ(tInicio) === QInicio` y `fᵢ(tFin) === QFin` dentro de tolerancia `1e-10` (verificación de consistencia del modelo, no de negocio); existen exactamente 5 instancias, una por cada par consecutivo de los 6 `RegistroCaudal`.

## ResultadoPeriodo

Agregado producido por `calcularPeriodo(datos, modo)` para un modo de visualización (FR-005).

| Campo | Tipo | Descripción |
|---|---|---|
| `modo` | `'primer_intervalo' \| 'periodo_completo'` | Modo de visualización seleccionado por el usuario. |
| `segmentos` | `SegmentoModelo[]` | 1 elemento si `modo = 'primer_intervalo'` (solo el segmento [0,6]); 5 elementos si `modo = 'periodo_completo'`. |
| `volumenTotalIntegral` | number \| null | Suma de `volumenIntegral` de todos los `segmentos` incluidos. `null` si `estadoGlobal === 'FALLIDO'` (FR-004: no se calcula ni se muestra ningún total cuando un segmento no verifica). |
| `volumenTotalTrapecio` | number \| null | Suma de `volumenTrapecio` de todos los `segmentos` incluidos. Mismo criterio de `null` que `volumenTotalIntegral`. |
| `diferenciaTotal` | number \| null | `Math.abs(volumenTotalIntegral - volumenTotalTrapecio)`. Mismo criterio de `null`. |
| `estadoGlobal` | `'VERIFICADO' \| 'FALLIDO'` | `'VERIFICADO'` solo si **todos** los `segmentos.estadoVerificacion` son `'VERIFICADO'`; `'FALLIDO'` si al menos uno es `'FALLIDO'`. |
| `segmentoFallidoIndice` | number \| null | Índice (0-based, dentro de `segmentos`) del primer `SegmentoModelo` con `estadoVerificacion === 'FALLIDO'`. `null` si `estadoGlobal === 'VERIFICADO'`. Permite a la interfaz identificar explícitamente el segmento problemático sin recorrer el array de nuevo (FR-004). |

**Relaciones**: `ResultadoPeriodo.segmentos` es un subconjunto ordenado y contiguo de los 5 `SegmentoModelo` derivados de los 6 `RegistroCaudal`; no se crean, reordenan ni interpolan segmentos adicionales.

**Regla de fallo de verificación** (FR-004, decisión de `/speckit-clarify` sesión 2026-09-16): si `estadoGlobal === 'FALLIDO'`, `verificarResultados()` NO suma los volúmenes de los segmentos incluidos — `volumenTotalIntegral`, `volumenTotalTrapecio` y `diferenciaTotal` quedan en `null` en lugar de un total parcial o mixto. La interfaz nunca combina un total numérico con un estado `'FALLIDO'`.

## Diagrama de flujo de datos

```text
RegistroCaudal[6] (inmutable)
        │
        ▼
validarDatos() ──► ResultadoValidacion
        │ (si esValido)
        ▼
calcularSegmento() ──► SegmentoModelo[5]
        │
        ▼
calcularIntegral() + calcularTrapecio() (por segmento)
        │
        ▼
verificarResultados() ──► SegmentoModelo[5] enriquecidos + ResultadoPeriodo
        │
        ▼
actualizarGrafica() / actualizarInterfaz() (capa de presentación, solo lectura)
```
