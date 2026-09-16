<!--
Sync Impact Report
- Version change: 1.0.0 → 2.0.0
- Modified principles:
  I.   Propósito Educativo y Alcance — río/estación/departamento actualizados de Cauca/La Virginia/
       Risaralda a Magdalena/El Banco/Magdalena; se añade la aclaración de que el volumen es una
       estimación del comportamiento físico real, no una medición.
  II.  Stack Tecnológico Restringido — se añade la cláusula de publicación como sitio estático.
  III. Integridad de los Datos Originales (NON-NEGOTIABLE) — Tabla 1 reemplazada por los seis
       registros del río Magdalena/El Banco; caso de control del primer intervalo recalculado
       (V₁ = 127.723.284 m³) y el valor documental de referencia actualizado
       (127.723.286,13 m³, con pendiente redondeada 29.1917 → 127.723.286,16 m³).
- Sections added: Contexto Académico; Anexo A: Trazabilidad con la Actividad
- Sections renamed: "Flujo de Desarrollo y Criterios de Aceptación" → "Flujo de Desarrollo y
  Verificación" (contenido ampliado con el paso de publicación y enlace verificable)
- Sections removed: none
- Governance: tabla de discrepancia documental/exacta actualizada a los nuevos valores; orden de
  precedencia sin cambios.
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
mediante la integral definida, el volumen de agua asociado a registros de caudal del río Magdalena
en la estación El Banco, departamento del Magdalena. Su propósito es visualizar, calcular y
verificar el área bajo una función construida mediante segmentos rectos entre los registros
proporcionados. NO es una herramienta de predicción hidrológica ni sustituye mediciones reales;
toda pantalla de resultados DEBE dejar esa distinción explícita, aclarando que la integral es
exacta para el modelo lineal construido, pero que el volumen resultante es una estimación del
comportamiento físico real del río, no una medición.

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
protocolo `file://`, sin dependencia alguna de red. La publicación en línea PUEDE hacerse como
sitio estático (copia de los mismos archivos locales) siempre que no agregue lógica de servidor,
no dependa de APIs externas y se abra sin iniciar sesión; el enlace público no sustituye la
capacidad de ejecutar la aplicación localmente.

**Rationale**: garantiza portabilidad, auditabilidad total del cálculo matemático y elimina fallos
por dependencias externas en un contexto académico.

### III. Integridad de los Datos Originales (NON-NEGOTIABLE)
Los seis registros de la Tabla 1 son inmutables:

| t (horas) | Q (m³/s) |
| ---: | ---: |
| 0 | 5825.54 |
| 6 | 6000.69 |
| 12 | 5840.28 |
| 24 | 6146.58 |
| 30 | 6192.00 |
| 36 | 6175.96 |

No se permite redondear estos valores antes de calcular, sustituirlos por valores derivados,
alterar los tiempos, eliminar registros, interpolar datos para modificar el resultado ni usar una
pendiente redondeada como sustituto de los datos originales. Cualquier redondeo se aplica
ÚNICAMENTE al resultado final mostrado, nunca a los cálculos internos (pendientes, funciones,
integrales); JavaScript DEBE usar punto decimal internamente y la interfaz DEBE presentar los
resultados en formato colombiano (coma decimal, punto como separador de miles).

Caso de control obligatorio para el primer intervalo [0,6]: con
m=(6000.69-5825.54)/6=29.191666666…, el volumen exacto V₁ DEBE ser 127.723.284 m³ (presentado como
127.723.284,00 m³). El valor documental 127.723.286,13 m³ NO debe usarse como referencia interna;
no está suficientemente verificado que provenga de un único redondeo específico, y con la pendiente
redondeada m=29.1917 se obtiene 127.723.286,16 m³. La discrepancia (2,13 m³ frente al valor exacto)
se documenta como redondeo o error de transcripción, sin imponerse sobre el cálculo con datos
originales.

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
mostrar el estado "VERIFICACIÓN FALLIDA" y NO presentar el resultado como validado. La tolerancia
solo compensa error de punto flotante de JavaScript (p. ej. `Number.EPSILON`) y nunca debe usarse
para ocultar un error matemático real. Para el periodo completo, Vtotal = Σ (i=0..4) Vᵢ sobre los
cinco segmentos [0,6], [6,12], [12,24], [24,30], [30,36].

**Rationale**: la coincidencia entre dos métodos matemáticamente equivalentes es la prueba de
corrección que reemplaza a un oráculo externo.

### VI. Arquitectura y Estilo de Código
Separación estricta de responsabilidades en `index.html`, `styles.css` y `script.js`. La lógica
JavaScript se organiza en los módulos: `validarDatos()`, `calcularSegmento()`,
`calcularIntegral()`, `calcularTrapecio()`, `verificarResultados()`, `calcularPeriodo()`,
`actualizarGrafica()` y `actualizarInterfaz()`. Los nombres DEBEN ser semánticos (`tiempo`,
`caudal`, `pendiente`, `intervalo`, `volumenIntegral`, `volumenTrapecio`, `diferencia`,
`tolerancia`); PROHIBIDOS los nombres genéricos (`x`, `a`, `b`, `r`, `v1`, `temp`, `dato2`) cuando
exista una alternativa significativa. Los comentarios explican el porqué matemático o técnico,
nunca el qué sintáctico. Las fórmulas no se duplican (DRY); la precisión completa se mantiene
durante los cálculos y el formato solo se aplica al presentar resultados.

**Rationale**: la claridad del código es parte del valor pedagógico — debe poder leerse como una
traducción directa de las fórmulas matemáticas.

### VII. Validación y Manejo de Errores
El cálculo se DEBE detener si no se cumple: exactamente 6 registros; tiempos y caudales numéricos
válidos; cada registro con tiempo y caudal; tiempos en orden ascendente estricto; duración de cada
intervalo > 0; unidades coherentes. En cada segmento se verifica f(tinicio)=Qinicio, f(tfin)=Qfin y
la coincidencia integral/trapecio dentro de la tolerancia. Los mensajes de error DEBEN orientarse
al estudiante (p. ej. "No fue posible validar el segmento: los tiempos de sus extremos son
iguales") en lugar de exponer `NaN` o `undefined`. Cero dependencia de HTTP, CDNs, APIs, endpoints,
servidores externos o bases de datos remotas; la funcionalidad matemática esencial DEBE estar
garantizada en entorno local `file://`.

**Rationale**: un simulador educativo que falla en silencio o expone errores técnicos crudos
pierde su función didáctica y su confiabilidad.

## Contexto Académico

| Aspecto | Detalle |
| --- | --- |
| Actividad | Actividad 3. Datos del territorio con la mirada de la integral definida |
| Curso | Cálculo integral |
| Fechas de la actividad | Del 7 al 16 de septiembre de 2026 |
| Río elegido | Río Magdalena |
| Estación elegida | El Banco |
| Departamento | Magdalena |
| Enlace público de la hoja filtrada | <https://docs.google.com/spreadsheets/d/1c6woiHeKa9LkTKKdJkmOq4_KxrS8e5eiFQEEaZAXB9E/edit?usp=sharing> |

El enlace es evidencia académica; la aplicación NO DEBE depender de él en tiempo de ejecución. Los
datos son simulados con fines pedagógicos y no deben presentarse como mediciones hidrológicas
reales.

## Restricciones y Presentación

Datos inmutables (Principio III). Modelo limitado a segmentos rectos (Principio IV). La conversión
1h=3600s es obligatoria en toda integración (Principio V). Los resultados se presentan con
unidades explícitas en formato colombiano (coma decimal, punto de miles) — primer intervalo:
`127.723.284,00 m³`; periodo completo: `781.352.568,00 m³` — diferenciando visualmente valor
calculado, valor de verificación, diferencia entre métodos y estado de verificación. La interfaz
DEBE hacer explícita la cadena pedagógica: Caudal → Gráfica Q(t) → Área bajo la gráfica → Integral
definida → Conversión de horas a segundos → Volumen de agua.

| Intervalo | Volumen exacto de control (m³) | Presentación |
| --- | ---: | --- |
| `[0, 6]` | 127723284 | 127.723.284,00 m³ |
| `[6, 12]` | 127882476 | 127.882.476,00 m³ |
| `[12, 24]` | 258916176 | 258.916.176,00 m³ |
| `[24, 30]` | 133256664 | 133.256.664,00 m³ |
| `[30, 36]` | 133573968 | 133.573.968,00 m³ |
| **Total** | **781352568** | **781.352.568,00 m³** |

## Flujo de Desarrollo y Verificación

Orden de implementación: (1) Datos — cargar los seis registros originales; (2) Validación —
estructura, tipos, orden temporal y unidades; (3) Modelo — construir automáticamente los cinco
segmentos rectos; (4) Cálculo — pendiente, función, integral, trapecio, volumen por ambos métodos,
diferencia y estado de verificación por segmento; (5) Periodos — lógica de selección de Primer
intervalo y Periodo completo; (6) Visualización — puntos, segmentos, ejes, unidades y región
sombreada; (7) Interacción — comprobar que el cambio de periodo actualiza simultáneamente gráfica,
área sombreada, cálculo, resultado y verificación; (8) Verificación independiente — comprobar
manualmente que V=3600·Σ(Qᵢ+Qᵢ₊₁)/2·(tᵢ₊₁-tᵢ) coincide con la suma de integrales dentro de la
tolerancia (periodo completo esperado: 781.352.568,00 m³); (9) Prueba del primer intervalo —
confirmar Vintegral=127.723.284 m³ con datos originales y sin redondear la pendiente (el valor
documental 127.723.286,13 m³ no se considera más preciso); (10) Prueba del periodo completo — sumar
los cinco segmentos y comprobar coincidencia con cinco cálculos independientes por trapecio
(resultado esperado: 781.352.568,00 m³); (11) Publicación y enlace — verificar que el enlace
público abra sin iniciar sesión, cargue correctamente, conserve los seis datos, produzca los
resultados de control y muestre unidades, procedimiento y estado de verificación; el HTML local no
sustituye el requisito de un enlace público verificable.

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
  cálculo con datos originales, documentando la causa (p. ej. redondeo intermedio o error de
  transcripción).
- Trazabilidad obligatoria: dato original → segmento → función → integral → volumen →
  verificación geométrica → resultado mostrado.
- Este es un modelo matemático educativo, no un sistema de medición, predicción o pronóstico
  hidrológico.

| Referencia | Valor |
| --- | ---: |
| Valor documental del primer intervalo | 127.723.286,13 m³ |
| Valor exacto con datos originales | 127.723.284,00 m³ |

El valor interno de referencia es **127.723.284,00 m³**.

Toda enmienda a esta constitución DEBE documentarse con: descripción del cambio, justificación y
actualización del número de versión según versionado semántico (MAJOR: incompatibilidades o
eliminación/redefinición de principios, incluida la sustitución de los datos originales de la
Tabla 1; MINOR: nuevos principios o expansión material de guía; PATCH: aclaraciones y redacción).
Todo cambio de código DEBE verificar cumplimiento de esta constitución antes de integrarse;
cualquier complejidad añadida (nueva librería, nueva capa, dependencia externa) debe justificarse
explícitamente frente a los Principios II y VI, o rechazarse.

## Anexo A: Trazabilidad con la Actividad

| Requisito de la actividad | Cubierto por |
| --- | --- |
| Elección de río, estación y departamento | Contexto Académico; Principio I |
| Enlace público de la hoja filtrada | Contexto Académico |
| Tabla 1 con seis registros | Principio III |
| Tiempo en horas transcurridas desde t=0 | Principio III |
| Gráfica con seis puntos y segmentos rectos | Principios I y IV |
| Ejes con unidades | Principio I; Restricciones y Presentación |
| Sombreado del área | Principio I; Flujo de Desarrollo y Verificación |
| Función del primer segmento | Principio III (caso de control) |
| Integral definida del primer intervalo | Principios III y V |
| Conversión de horas a segundos | Principio V |
| Interpretación del volumen | Principio I; Restricciones y Presentación |
| Simulación interactiva en HTML | Principio II |
| Selección de primer intervalo y periodo completo | Principios I y V |
| Conservación de datos originales | Principio III; Governance |
| Verificación antes de usar | Principios V y VII; Flujo de Desarrollo y Verificación |
| Volumen del periodo completo | Principio V; Restricciones y Presentación |
| Publicación con enlace verificable | Flujo de Desarrollo y Verificación (paso 11); Principio II |

**Version**: 2.0.0 | **Ratified**: 2026-09-14 | **Last Amended**: 2026-09-16
