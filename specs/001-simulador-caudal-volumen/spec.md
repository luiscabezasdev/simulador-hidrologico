# Feature Specification: Simulador Matemático-Educativo de Caudal y Volumen (Río Magdalena)

**Feature Branch**: `001-simulador-caudal-volumen`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "Constitución del simulador matemático-educativo para representar e interpretar mediante la integral definida el volumen de agua asociado a registros de caudal del río Magdalena en la estación El Banco, departamento del Magdalena, usando HTML5, CSS3 y JavaScript vanilla sin dependencias externas."

## Clarifications

### Session 2026-09-14

- Q: ¿Qué tipo y valor de tolerancia se usa para verificar la equivalencia entre el volumen por integral definida y el volumen por trapecio? → A: Tolerancia absoluta de 0.01 m³ (`|Vintegral - Vtrapecio| ≤ 0.01`); para una función lineal ambos métodos son algebraicamente idénticos, así que cualquier diferencia mayor indica un error de implementación, no una limitación de punto flotante.
- Q: ¿Con qué tecnología se renderiza el gráfico de los 6 puntos y los 5 segmentos, y cómo se mantiene accesible? → A: HTML5 Canvas 2D API para el dibujo, acompañada de una tabla HTML semántica alternativa (los mismos datos y resultados) navegable por teclado y compatible con lectores de pantalla.
- Q: ¿Con qué formato numérico y configuración regional se presentan los resultados finales al usuario? → A: `Intl.NumberFormat('es-CO')` con 2 decimales fijos y separador de miles (ej. `127723284` → `"127.723.284,00"`), independientemente del idioma configurado en el navegador.
- Q: ¿Qué versión mínima de JavaScript se admite y qué características quedan prohibidas? → A: ECMAScript 2020 (ES11) como mínimo; prohibido el uso de módulos ES (`import`/`export`) para garantizar que el archivo se ejecute sin servidor bajo `file://`.
- Q: ¿Qué estándar de accesibilidad debe cumplir la interfaz? → A: WCAG 2.1 Nivel AA — contraste mínimo 4.5:1 en texto y 3:1 en elementos gráficos, navegación completa por teclado, etiquetas `aria-label` en controles, y la tabla semántica alternativa al gráfico.
- Q: ¿Cómo debe adaptarse la interfaz a distintos tamaños de pantalla? → A: Enfoque mobile-first con un único breakpoint en 768px: una sola columna con el gráfico ajustado al ancho del contenedor (relación de aspecto 16:9) por debajo de 768px, y dos columnas (gráfico + panel de resultados) desde 768px en adelante.
- Q: ¿El intervalo seleccionado (Primer intervalo / Periodo completo) debe persistir tras recargar la página? → A: No; el estado es efímero y siempre reinicia a "Primer intervalo [0,6]" en cada carga, sin usar `localStorage` ni cookies.
- Q: ¿Qué debe ocurrir si el navegador del usuario no soporta HTML5 Canvas? → A: El sistema detecta la ausencia de soporte (`HTMLCanvasElement`), oculta el canvas y muestra en su lugar la tabla HTML con los datos y el procedimiento matemático, junto con un mensaje explicativo dirigido al estudiante.

### Session 2026-09-16

- Se actualizan los datos de origen y los valores de control conforme a la Constitución v2.0.0: río Magdalena, estación El Banco (Magdalena). Las decisiones técnicas de la sesión anterior (tolerancia, Canvas, formato numérico, versión de JavaScript, accesibilidad, diseño responsivo, persistencia de estado y compatibilidad sin Canvas) se mantienen sin cambios, ya que son independientes del conjunto de datos.
- Q: Si un segmento del periodo completo muestra "VERIFICACIÓN FALLIDA", ¿qué debe hacer el sistema con el volumen total del periodo completo? → A: No mostrar ningún volumen total; detener el cálculo del periodo completo y mostrar solo el mensaje de fallo, identificando el segmento problemático.
- Q: ¿Qué contenido debe tener la tabla HTML semántica alternativa que acompaña siempre al gráfico (FR-001), además de los datos originales? → A: Solo los datos originales (t, Q) de los 6 registros; el procedimiento matemático y los resultados por segmento se comunican por separado en el panel de resultados, que ya es HTML accesible independiente del Canvas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualización y cálculo del primer intervalo (Priority: P1)

Como estudiante, quiero seleccionar el primer intervalo de tiempo (t=0 a t=6 horas) para observar cómo se construye el modelo lineal, se sombrea el área bajo la curva y se calcula el volumen resultante, validando el caso base de la actividad académica.

**Why this priority**: Es el Mínimo Producto Viable (MVP) matemático. Si el sistema no puede calcular y graficar correctamente un solo segmento con precisión absoluta (127.723.284 m³), el resto de la lógica es inválida.

**Independent Test**: Puede ser probado completamente al abrir el archivo HTML, seleccionar "Primer intervalo" y verificar que la gráfica muestre exactamente 1 segmento, el área sombreada sea correcta y el panel de resultados muestre el volumen exacto sin artefactos de redondeo de pendiente.

**Acceptance Scenarios**:

1. **Given** que la aplicación está cargada con los 6 registros originales, **When** el usuario selecciona "Primer intervalo [0, 6]", **Then** la gráfica renderiza los puntos (0, 5825.54) y (6, 6000.69) conectados por un segmento recto y sombreado.
2. **Given** que se seleccionó el primer intervalo, **When** el sistema ejecuta el cálculo, **Then** el volumen mostrado es 127.723.284,00 m³ (usando la precisión completa de la pendiente, no 29.1917).

---

### User Story 2 - Cálculo y verificación del periodo completo (Priority: P2)

Como estudiante, quiero seleccionar el periodo completo (t=0 a t=36 horas) para ver cómo el sistema acumula los 5 segmentos lineales, calcula la integral total y verifica el resultado contra la suma de áreas de trapecios.

**Why this priority**: Expande el MVP al requisito académico completo. Valida la lógica de iteración, sumatoria y la robustez del motor de verificación matemática.

**Independent Test**: Puede ser probado independientemente al cambiar la selección a "Periodo completo". Se verifica que se dibujen 5 segmentos, el sombreado cubra los 5 intervalos y el volumen total coincida con la sumatoria de los trapecios dentro de la tolerancia definida.

**Acceptance Scenarios**:

1. **Given** que el usuario cambia la selección a "Periodo completo [0, 36]", **When** la interfaz se actualiza, **Then** la gráfica muestra los 6 puntos originales conectados por 5 segmentos rectos consecutivos.
2. **Given** que se calcula el periodo completo, **When** el sistema compara el método de integral definida con el método del trapecio, **Then** la diferencia absoluta entre ambos es ≤ tolerancia, el estado muestra "VERIFICADO" y el volumen total es 781.352.568,00 m³.
3. **Given** que un segmento del periodo completo presenta una diferencia absoluta mayor a la tolerancia, **When** el sistema evalúa el resultado, **Then** detiene el cálculo del volumen total, no muestra ningún total (ni parcial ni completo) y señala explícitamente el segmento con estado "VERIFICACIÓN FALLIDA".

---

### User Story 3 - Transparencia del procedimiento matemático y estado de verificación (Priority: P3)

Como estudiante, quiero ver el desglose paso a paso de las fórmulas, los valores sustituidos y el resultado de la comparación entre métodos, para comprender la relación entre la integral definida y el volumen físico, no solo obtener un número final.

**Why this priority**: Cumple el propósito educativo de la constitución. Sin esta trazabilidad, la aplicación es una caja negra y pierde su valor pedagógico.

**Independent Test**: Puede ser probado inspeccionando el panel de "Procedimiento Matemático" en la interfaz. Debe mostrar explícitamente la función fᵢ(t), la integral evaluada, el cálculo del trapecio y el mensaje de estado de verificación.

**Acceptance Scenarios**:

1. **Given** que se ha realizado un cálculo, **When** el usuario observa el panel de resultados, **Then** ve la fórmula de la integral, la conversión de horas a segundos (×3600) y el resultado en m³.
2. **Given** que ocurre una discrepancia matemática > tolerancia, **When** el sistema evalúa los resultados, **Then** muestra claramente "VERIFICACIÓN FALLIDA" y explica la diferencia numérica, sin ocultar el error.

---

### Edge Cases

- ¿Qué sucede cuando la precisión de punto flotante de JavaScript genera una diferencia mínima (ej. 0.000000001)? El sistema utiliza la tolerancia absoluta definida de 0.01 m³ para marcarlo como verificado, sin ocultar errores de lógica reales.
- ¿Cómo maneja el sistema si los datos originales resultan alterados o inválidos? Una función de validación detecta la anomalía (ej. tiempos no ascendentes, cantidad de registros ≠ 6) y detiene la ejecución, mostrando un mensaje descriptivo dirigido al estudiante: "Los datos originales han sido modificados o son inválidos".
- ¿Qué sucede si el archivo se ejecuta directamente con el protocolo `file://`? La aplicación funciona al 100%, ya que no hay llamadas de red, importaciones externas ni dependencias de CDN que fallen por políticas de origen cruzado.
- ¿Qué sucede si el navegador del usuario no soporta HTML5 Canvas? El sistema detecta la ausencia de soporte, oculta el canvas y muestra en su lugar la tabla HTML con los datos originales (FR-001), mientras el panel de resultados con el procedimiento matemático permanece visible como de costumbre (ya es HTML accesible, independiente del Canvas), junto con un mensaje explicativo dirigido al estudiante.
- ¿Qué sucede si el valor documental de la actividad académica (127.723.286,13 m³) difiere del valor calculado internamente? El sistema conserva y muestra el valor calculado con los datos originales sin redondear (127.723.284,00 m³) como referencia interna, sin imponer el valor documental sobre el cálculo exacto.
- ¿Qué sucede si un segmento del Periodo completo muestra "VERIFICACIÓN FALLIDA"? El sistema detiene el cálculo del volumen total, no muestra ningún total (ni parcial ni completo), identifica el segmento problemático y presenta el mensaje de fallo, evitando combinar segmentos verificados con uno no confiable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST renderizar exactamente los 6 puntos de datos originales y conectarlos mediante 5 segmentos rectos en un gráfico 2D construido con HTML5 Canvas 2D API, acompañado de una tabla HTML semántica alternativa con únicamente los datos originales (t, Q) de los 6 registros, navegable por teclado y compatible con lectores de pantalla. El procedimiento matemático y los resultados por segmento NO se duplican en esta tabla; se comunican por separado en el panel de resultados (ya accesible en HTML, independiente del Canvas).
- **FR-002**: El sistema MUST calcular el volumen de cada segmento usando la integral definida de la función lineal fᵢ(t), multiplicando el resultado por 3600 para convertir horas a segundos.
- **FR-003**: El sistema MUST calcular independientemente el volumen de cada segmento usando la fórmula del área del trapecio: V = 3600 · ((Qᵢ + Qᵢ₊₁) / 2) · (tᵢ₊₁ - tᵢ).
- **FR-004**: El sistema MUST comparar el volumen obtenido por integral definida y por trapecio usando una tolerancia absoluta de 0.01 m³ (`|Vintegral - Vtrapecio| ≤ 0.01`). Si la diferencia absoluta de cualquier segmento excede ese umbral, MUST mostrar "VERIFICACIÓN FALLIDA" para ese segmento, identificarlo explícitamente, detener el cálculo del volumen total del Periodo completo (sin sumar ni mostrar ningún total, parcial o completo) y no presentar ese resultado como validado.
- **FR-005**: El sistema MUST permitir al usuario alternar entre "Primer intervalo [0,6]" y "Periodo completo [0,36]", actualizando reactivamente el gráfico, el sombreado, los cálculos y el panel de resultados.
- **FR-006**: El sistema MUST ejecutarse exclusivamente con HTML5, CSS3 y JavaScript vanilla (ECMAScript 2020 o superior, sin módulos ES `import`/`export`), sin frameworks, librerías externas, backend ni APIs de red, garantizando compatibilidad total con el protocolo `file://`.
- **FR-007**: El sistema MUST validar las precondiciones de los datos (exactamente 6 registros, tipos numéricos válidos, orden ascendente estricto de tiempo, duración de cada intervalo > 0) antes de ejecutar cualquier cálculo.
- **FR-008**: El sistema MUST preservar la precisión completa de los números durante los cálculos internos, aplicando formato de presentación (redondeo a 2 decimales, separador de miles y formato numérico `es-CO`, ej. `"127.723.284,00"`) únicamente al mostrar el resultado final al usuario.
- **FR-009**: El sistema MUST cumplir el estándar de accesibilidad WCAG 2.1 Nivel AA: contraste mínimo 4.5:1 en texto y 3:1 en elementos gráficos, navegación completa por teclado, etiquetas `aria-label` en controles interactivos, y la tabla semántica alternativa al gráfico exigida por FR-001.
- **FR-010**: El sistema MUST adaptar su diseño mediante un enfoque mobile-first con un único breakpoint en 768px: diseño de una sola columna con el gráfico ajustado al ancho del contenedor (relación de aspecto 16:9) por debajo de 768px, y diseño de dos columnas (gráfico y panel de resultados) desde 768px en adelante.
- **FR-011**: El sistema MUST reiniciar la selección de intervalo a "Primer intervalo [0,6]" en cada carga de la página, sin persistir el estado entre sesiones (sin `localStorage` ni cookies).
- **FR-012**: El sistema MUST poder publicarse como copia estática de los mismos tres archivos (`index.html`, `styles.css`, `script.js`) en un sitio accesible mediante un enlace público, sin lógica de servidor, sin autenticación y sin dependencia de APIs externas (Constitución, Principio II y "Flujo de Desarrollo y Verificación", paso 11).

### Key Entities

- **Registro de Caudal**: Representa un punto de dato hidrológico original del río Magdalena, estación El Banco. Atributos: tiempo en horas, caudal en m³/s. Es inmutable; son exactamente 6 registros que constituyen la única fuente de verdad de la aplicación.
- **Segmento del Modelo**: Representa el modelo matemático lineal entre dos registros consecutivos. Atributos: tiempo de inicio, tiempo de fin, caudal de inicio, caudal de fin, pendiente (calculada con precisión completa), volumen por integral definida, volumen por trapecio, diferencia absoluta entre ambos métodos, y estado de verificación ("VERIFICADO" o "VERIFICACIÓN FALLIDA").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El volumen calculado para el primer intervalo [0, 6] usando precisión completa debe ser exactamente 127.723.284 m³ (con un margen de error de punto flotante menor a 0.01), rechazando el valor artefacto de 127.723.286,16 m³ producido por redondeo intermedio de la pendiente (m=29.1917), y sin usar como referencia interna el valor documental de la actividad académica (127.723.286,13 m³).
- **SC-002**: La aplicación debe cargar y funcionar correctamente al abrirse directamente mediante el protocolo `file://` en los navegadores de escritorio más usados (Chrome, Firefox, Edge), sin errores visibles ni interrupciones de funcionalidad.
- **SC-003**: El 100% de los cálculos matemáticos mostrados son trazables en la interfaz: para cada segmento se exhibe la fórmula, los valores sustituidos y el resultado con formato numérico `es-CO` (ej. `"127.723.284,00 m³"`), tanto para el método de integral definida como para el método del trapecio.
- **SC-004**: La verificación matemática confirma la equivalencia entre ambos métodos para los 5 segmentos del periodo completo, dentro de una tolerancia numérica absoluta de 0.01 m³, sin necesidad de intervención manual del usuario, y el volumen total resultante es 781.352.568 m³.
- **SC-005**: El enlace público de la aplicación publicada abre sin iniciar sesión, carga correctamente, conserva los 6 registros originales, y produce los mismos resultados de control que la versión local (`127.723.284,00 m³` y `781.352.568,00 m³`), mostrando unidades, procedimiento y estado de verificación.

## Assumptions

- **Usuarios**: los usuarios finales son estudiantes o educadores que requieren ver el procedimiento matemático explícito, no solo el resultado final, incluyendo quienes acceden desde dispositivos móviles o usan tecnologías de asistencia.
- **Alcance del renderizado**: el gráfico se construye con HTML5 Canvas 2D API (ver Clarifications), ya que el uso de librerías de graficación de terceros está fuera de alcance para este simulador.
- **Origen de los datos**: los 6 puntos de datos del río Magdalena, estación El Banco, están fijos como la única fuente de verdad de esta versión. No se implementará carga de datos desde archivos externos (CSV, JSON) ni formularios de entrada de usuario.
- **Entorno de ejecución**: la tolerancia para la comparación de punto flotante se establece en 0.01 m³ (tipo absoluto), valor suficiente para absorber las limitaciones de precisión numérica del navegador sin enmascarar errores lógicos reales en las fórmulas.
- **Discrepancia documental**: el valor documental de la actividad académica para el primer intervalo (127.723.286,13 m³) no está suficientemente verificado como producto de un único redondeo específico; se documenta como referencia, pero el sistema siempre calcula y muestra el valor exacto con los datos originales sin redondear.
