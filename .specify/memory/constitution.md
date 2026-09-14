<!--
Sync Impact Report
- Version change: [TEMPLATE UNFILLED] → 1.0.0 (initial ratification)
- Modified principles: N/A (first fill of the template)
- Principles added:
  I. Propósito Educativo y Alcance
  II. Stack Tecnológico Restringido
  III. Integridad de los Datos Originales (NON-NEGOTIABLE)
  IV. Modelo de Segmentos Lineales
  V. Doble Verificación Matemática
  VI. Arquitectura y Estilo de Código
  VII. Validación y Manejo de Errores
- Sections added: Restricciones y Presentación; Flujo de Desarrollo y Criterios de Aceptación; Governance
- Sections removed: generic [SECTION_2_NAME]/[SECTION_3_NAME] placeholders (content folded into the
  principles and the two named sections above instead)
- Templates checked for alignment:
  ✅ .specify/templates/plan-template.md — generic, no principle-specific references to update
  ✅ .specify/templates/spec-template.md — generic, no principle-specific references to update
  ✅ .specify/templates/tasks-template.md — generic, no principle-specific references to update
  ✅ .specify/templates/checklist-template.md — generic, no principle-specific references to update
- Follow-up TODOs: none
-->

# Simulador Matemático-Educativo de Caudal Constitution

## Core Principles

### I. Propósito Educativo y Alcance
La aplicación es un simulador matemático-educativo interactivo que representa e interpreta,
mediante la integral definida, el volumen de agua asociado a registros de caudal del río Cauca en
la estación La Virginia, Risaralda. Su propósito es visualizar, calcular y verificar el área bajo
una función construida mediante segmentos rectos entre los registros proporcionados. NO es una
herramienta de predicción hidrológica ni sustituye mediciones reales; toda pantalla de resultados
DEBE dejar esa distinción explícita.

La interfaz DEBE: mostrar los seis registros originales; representar gráficamente los seis puntos
conectados por cinco segmentos rectos; mostrar ejes con sus unidades; permitir seleccionar entre
Primer intervalo (t=0 a t=6 h) y Periodo completo (t=0 a t=36 h); sombrear el área del intervalo
seleccionado; calcular el volumen en m³ mostrando el procedimiento paso a paso; y verificar el
resultado con dos métodos matemáticamente equivalentes.

**Rationale**: es un artefacto pedagógico — su valor está en hacer explícito el vínculo entre
gráfica, integral y volumen, no en la precisión predictiva.

### II. Stack Tecnológico Restringido
Permitido exclusivamente: HTML5 (estructura semántica), CSS3 (presentación) y JavaScript Vanilla
(lógica e interacción). PROHIBIDO: frameworks JS (React, Vue, Angular, etc.), backend, bases de
datos, APIs externas, librerías de terceros (Chart.js, D3.js, math.js, etc.) y sistemas de
autenticación o cálculo externo. La aplicación DEBE ejecutarse íntegramente en el cliente desde el
protocolo `file://`, sin dependencia alguna de red.

**Rationale**: garantiza portabilidad, auditabilidad total del cálculo matemático y elimina fallos
por dependencias externas en un contexto académico.

### III. Integridad de los Datos Originales (NON-NEGOTIABLE)
Los seis registros de la Tabla 1 son inmutables:

| t (horas) | Q (m³/s) |
| ---: | ---: |
| 0 | 1162.18 |
| 6 | 1173.05 |
| 12 | 1108.83 |
| 24 | 1213.33 |
| 30 | 1265.22 |
| 36 | 1228.10 |

Cualquier redondeo se aplica ÚNICAMENTE al resultado final mostrado, nunca a los cálculos internos
(pendientes, funciones, integrales). Caso de control obligatorio: para t∈[0,6], con pendiente
m=(1173.05-1162.18)/6=1.811666666…, el volumen exacto V₁ DEBE ser 25.220.484 m³; el valor
25.220.486,16 m³ (producto de redondear m a 1.8117) NO debe usarse como referencia interna.

**Rationale**: un redondeo intermedio propaga error silencioso y rompe la equivalencia entre
integral y trapecio que sustenta la verificación (Principio V).

### IV. Modelo de Segmentos Lineales
Para cada intervalo consecutivo (tᵢ,Qᵢ)→(tᵢ₊₁,Qᵢ₊₁) se construye
fᵢ(t) = Qᵢ + ((Qᵢ₊₁-Qᵢ)/(tᵢ₊₁-tᵢ))·(t-tᵢ), con tᵢ≤t≤tᵢ₊₁, calculada exclusivamente con valores
originales. DEBE cumplirse fᵢ(tᵢ)=Qᵢ y fᵢ(tᵢ₊₁)=Qᵢ₊₁. PROHIBIDO usar splines, regresiones,
promedios móviles o cualquier interpolación no lineal.

**Rationale**: el modelo lineal por tramos es el requisito pedagógico de la actividad (integral de
una función poligonal); cualquier suavizado alteraría el resultado esperado.

### V. Doble Verificación Matemática
El volumen por segmento se calcula por dos métodos independientes que DEBEN coincidir dentro de
una tolerancia:
- Integral definida: Vᵢ = 3600·∫ from tᵢ to tᵢ₊₁ of fᵢ(t) dt.
- Trapecio: Aᵢ = (Qᵢ+Qᵢ₊₁)/2·(tᵢ₊₁-tᵢ); Vᵢ,trapecio = 3600·Aᵢ.

El factor 3600 (conversión h→s) es obligatorio; PROHIBIDO integrar caudal en horas sin convertir.
Si |Vintegral - Vtrapecio| ≤ tolerancia, el resultado se marca verificado; si no, el sistema DEBE
mostrar el estado "VERIFICACIÓN FALLIDA". La tolerancia solo compensa error de punto flotante de
JavaScript (p. ej. `Number.EPSILON`) y nunca debe usarse para ocultar un error matemático real.
Para el periodo completo, Vtotal = Σ (i=0..4) Vᵢ sobre los cinco segmentos [0,6], [6,12], [12,24],
[24,30], [30,36].

**Rationale**: la coincidencia entre dos métodos matemáticamente equivalentes es la prueba de
corrección que reemplaza a un oráculo externo.

### VI. Arquitectura y Estilo de Código
Separación estricta de responsabilidades en `index.html`, `styles.css` y `script.js`. La lógica
JavaScript se organiza en los módulos: `validarDatos()`, `calcularSegmento()`,
`calcularIntegral()`, `calcularTrapecio()`, `verificarResultados()`, `calcularPeriodo()`,
`actualizarGrafica()` y `actualizarInterfaz()`. Los nombres DEBEN ser semánticos (`tiempo`,
`caudal`, `pendiente`, `volumenIntegral`, `tolerancia`); PROHIBIDOS los nombres genéricos (`x`,
`a`, `b`, `v1`, `temp`). Los comentarios explican el porqué matemático, nunca el qué sintáctico.
Las fórmulas no se duplican (DRY).

**Rationale**: la claridad del código es parte del valor pedagógico — debe poder leerse como una
traducción directa de las fórmulas matemáticas.

### VII. Validación y Manejo de Errores
El cálculo se DEBE detener si no se cumple: exactamente 6 registros; tiempos y caudales numéricos
válidos; tiempos en orden ascendente estricto; duración de cada intervalo > 0; unidades coherentes.
En cada segmento se verifica f(tinicio)=Qinicio, f(tfin)=Qfin y la coincidencia integral/trapecio.
Los mensajes de error DEBEN orientarse al estudiante (p. ej. "No fue posible validar el segmento:
los tiempos de sus extremos son iguales") en lugar de exponer `NaN` o `undefined`. Cero
dependencia de HTTP, CDNs o APIs; la funcionalidad DEBE estar garantizada en entorno local
`file://`.

**Rationale**: un simulador educativo que falla en silencio o expone errores técnicos crudos
pierde su función didáctica y su confiabilidad.

## Restricciones y Presentación

Datos inmutables (Principio III). Modelo limitado a segmentos rectos (Principio IV). La conversión
1h=3600s es obligatoria en toda integración (Principio V). Los resultados se presentan con
unidades explícitas (p. ej. `25.220.484,00 m³`), diferenciando visualmente valor calculado, valor
de verificación, diferencia y estado. La interfaz DEBE hacer explícita la cadena pedagógica:
Caudal → Gráfica Q(t) → Área → Integral → Conversión → Volumen.

## Flujo de Desarrollo y Criterios de Aceptación

Orden de implementación: (1) Datos — definir los 6 registros originales; (2) Validación —
estructura, tipos, orden; (3) Modelo — construir los 5 segmentos rectos; (4) Cálculo — pendiente,
función, integral, trapecio, volumen, diferencia y estado por segmento; (5) Periodos — lógica de
selección de intervalo; (6) Visualización — puntos, segmentos, ejes, unidades, región sombreada;
(7) Interacción — cambio de periodo actualiza todo; (8) Verificación independiente — comprobación
manual con la fórmula del trapecio sumatorio; (9) Prueba del primer intervalo — confirmar
V₁=25.220.484 m³ sin redondeo de pendiente; (10) Prueba del periodo completo — confirmar
coincidencia entre suma de integrales y suma de trapecios.

Criterio de aceptación: Datos originales → Segmentos correctos → Integral correcta → Trapecio
correcto → Resultados coincidentes → Visualización coherente.

## Governance

Esta constitución es la autoridad máxima del proyecto. Ante cualquier conflicto, prevalece el
siguiente orden de precedencia: (1) requisitos de la actividad académica, (2) datos originales de
la Tabla 1, (3) reglas matemáticas establecidas, (4) reglas de verificación, (5) arquitectura
definida, (6) requisitos visuales y de interacción.

Principios innegociables:
- Ninguna modificación de la interfaz altera silenciosamente la lógica matemática.
- Ninguna optimización de código modifica los resultados matemáticos.
- Ante discrepancia entre un resultado documentado y uno calculado con precisión, prevalece el
  cálculo con datos originales, documentando la causa (p. ej. redondeo intermedio).
- Trazabilidad obligatoria: dato original → segmento → función → integral → volumen →
  verificación geométrica → resultado mostrado.
- Este es un modelo matemático educativo, no un sistema de pronóstico hidrológico.

Toda enmienda a esta constitución DEBE documentarse con: descripción del cambio, justificación y
actualización del número de versión según versionado semántico (MAJOR: incompatibilidades o
eliminación/redefinición de principios; MINOR: nuevos principios o expansión material de guía;
PATCH: aclaraciones y redacción). Todo cambio de código DEBE verificar cumplimiento de esta
constitución antes de integrarse; cualquier complejidad añadida (nueva librería, nueva capa,
dependencia externa) debe justificarse explícitamente frente a los Principios II y VI, o
rechazarse.

**Version**: 1.0.0 | **Ratified**: 2026-09-14 | **Last Amended**: 2026-09-14
