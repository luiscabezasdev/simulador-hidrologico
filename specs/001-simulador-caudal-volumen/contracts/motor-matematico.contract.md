# Contrato: Motor Matemático ↔ Capa de Interfaz

**Feature**: [spec.md](../spec.md) | **Plan**: [plan.md](../plan.md) | **Data Model**: [data-model.md](../data-model.md)

Este es el único "contrato" externo del proyecto: no hay API de red ni CLI, pero la Constitución (Principio VI) exige una frontera estricta y **probable de forma independiente** entre el motor matemático (funciones puras, sin DOM/Canvas) y la capa de interfaz (Canvas + DOM). Este documento fija las firmas, tipos y comportamiento observable de los ocho módulos obligatorios, para que la implementación y la verificación manual (`quickstart.md`) compartan una única fuente de verdad.

Convención de tipos: se usa notación tipo TypeScript solo como documentación; el código se implementa en JavaScript vanilla (sin `import`/`export`, ES2020).

## Motor matemático (funciones puras)

Precondición común a todas las funciones de esta sección: no acceden a `document`, `window.canvas` ni a ningún elemento del DOM. Son invocables y verificables desde la consola del navegador sin haber renderizado la interfaz.

### `validarDatos(datos: RegistroCaudal[]): ResultadoValidacion`

- **Input**: array a validar (normalmente `DATOS_ORIGINALES`, pero la función debe aceptar cualquier array para poder probarse con datos inválidos).
- **Output**: `{ esValido, mensaje }` (ver `data-model.md`).
- **Comportamiento**: aplica las 4 reglas de validación en orden y retorna en el primer fallo encontrado con un mensaje específico de esa regla; si todas pasan, `{ esValido: true, mensaje: '' }`.
- **Casos de prueba** (ver `quickstart.md` para el detalle ejecutable):
  - `validarDatos(DATOS_ORIGINALES).esValido === true`.
  - `validarDatos([]).esValido === false`.
  - `validarDatos([{t:6,Q:100},{t:0,Q:200}]).mensaje` contiene una referencia al orden ascendente.

### `calcularSegmento(datos: RegistroCaudal[]): SegmentoModelo[]`

- **Precondición**: `datos` ya pasó `validarDatos()` con `esValido === true`. No revalida internamente (evita duplicar lógica, DRY — Principio VI).
- **Output**: array de 5 `SegmentoModelo` con `tInicio/tFin/QInicio/QFin/pendiente` poblados (los campos de volumen y verificación se completan después por `verificarResultados()`).
- **Invariante verificable**: para cada segmento, `QInicio + pendiente · (tFin - tInicio) === QFin` dentro de `1e-10`.

### `calcularIntegral(segmento: SegmentoModelo): number`

- **Fórmula**: con `Δt = tFin - tInicio` y `m = pendiente`, `fᵢ(t) = QInicio + m·(t - tInicio)`:

  `V = 3600 · [ QInicio·Δt + m·Δt²/2 ]`

- **Output**: volumen en m³, sin redondear.
- **Caso de control** (Constitución, Principio III): para el segmento `[0,6]` con `pendiente = 29.191666666666666`, `calcularIntegral(...) ≈ 127723284` con `|resultado - 127723284| < 0.01`.

### `calcularTrapecio(segmento: SegmentoModelo): number`

- **Fórmula**: `V = 3600 · ((QInicio + QFin) / 2) · (tFin - tInicio)`.
- **Output**: volumen en m³, sin redondear.
- **Caso de control**: para el mismo segmento `[0,6]`, resultado idéntico a `calcularIntegral()` dentro de tolerancia `0.01`.

### `verificarResultados(datos: RegistroCaudal[], modo: 'primer_intervalo' | 'periodo_completo'): ResultadoPeriodo`

- Combina `calcularSegmento()`, `calcularIntegral()` y `calcularTrapecio()` para producir los `SegmentoModelo` completos (incluye `volumenIntegral`, `volumenTrapecio`, `diferencia`, `estadoVerificacion`) y agrega el `ResultadoPeriodo` (ver `data-model.md`).
- **Selección por modo**:
  - `'primer_intervalo'` → solo el segmento `[0,6]` (índice 0).
  - `'periodo_completo'` → los 5 segmentos `[0,6],[6,12],[12,24],[24,30],[30,36]`.
- **Tolerancia**: absoluta, `0.01 m³` (R1/DEC-01). Aplicada tanto por segmento (`estadoVerificacion`) como al total (`estadoGlobal`).
- **Nota de nomenclatura**: esta función es la responsable de la comparación y agregación que en el desglose de tareas de referencia estaban repartidas entre `calcularPeriodo()` + `calcularTotales()`; aquí se consolidan bajo el nombre exigido por la Constitución.

### `calcularPeriodo(datos: RegistroCaudal[], modo: 'primer_intervalo' | 'periodo_completo'): ResultadoPeriodo`

- **Rol**: punto de entrada público del motor matemático que la interfaz invoca en cada cambio de selección. Internamente ejecuta `validarDatos()` → (si válido) `verificarResultados()`.
- **Output en caso de datos inválidos**: lanza un error con el `mensaje` de `ResultadoValidacion` como texto (la interfaz lo captura y lo muestra sin exponer `NaN`/`undefined`, Principio VII); no retorna un `ResultadoPeriodo` parcial.
- **Caso de control end-to-end**: `calcularPeriodo(DATOS_ORIGINALES, 'primer_intervalo').volumenTotalIntegral` verifica `|resultado - 127723284| < 0.01` y `estadoGlobal === 'VERIFICADO'` (Hito H1).

## Capa de interfaz (consume el motor, sin lógica matemática propia)

### `actualizarGrafica(ctx: CanvasRenderingContext2D, resultado: ResultadoPeriodo): void`

- **Input**: contexto 2D ya inicializado (con `devicePixelRatio` aplicado, R10) y el `ResultadoPeriodo` calculado por `calcularPeriodo()`.
- **Comportamiento**: dibuja únicamente lo que hay en `resultado.segmentos` — ejes con unidades, los puntos y segmentos correspondientes, y el área sombreada. No realiza ningún cálculo de volumen ni de verificación.
- **Fallback**: si `HTMLCanvasElement` no está soportado (feature detection previa, R8), esta función no se invoca; la interfaz muestra la tabla HTML alternativa en su lugar.

### `actualizarInterfaz(resultado: ResultadoPeriodo): void`

- **Input**: el mismo `ResultadoPeriodo`.
- **Comportamiento**: actualiza el panel de resultados (fórmulas con valores sustituidos, volúmenes formateados con `Intl.NumberFormat('es-CO')`, estado "VERIFICADO"/"VERIFICACIÓN FALLIDA" con estilo diferenciado) y la tabla HTML semántica alternativa. Orquesta también la llamada a `actualizarGrafica()` cuando Canvas está disponible.
- **Disparador**: se invoca en la carga inicial (modo por defecto `'primer_intervalo'`, R7) y en cada evento `change` de los controles de selección de intervalo.

## Errores y mensajes (Principio VII)

| Condición | Mensaje mostrado al estudiante |
|---|---|
| `datos.length !== 6` | "No fue posible validar los datos: se esperaban 6 registros de caudal." |
| Tiempo o caudal no numérico | "No fue posible validar los datos: todos los valores de tiempo y caudal deben ser numéricos." |
| Tiempos no ascendentes | "No fue posible validar el segmento: los tiempos de sus extremos no están en orden ascendente." |
| Duración de intervalo = 0 | "No fue posible validar el segmento: los tiempos de sus extremos son iguales." |
| `estadoVerificacion === 'FALLIDO'` en algún segmento | "VERIFICACIÓN FALLIDA: la diferencia entre el método de integral definida y el método del trapecio (<diferencia> m³) supera la tolerancia permitida (0.01 m³)." |
