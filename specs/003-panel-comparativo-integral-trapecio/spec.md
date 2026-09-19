# Feature Specification: Panel Comparativo Integral vs. Trapecios

**Feature Branch**: `003-panel-comparativo-integral-trapecio`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "Quiero una aplicación web educativa que simula el cálculo de volumen hidrológico comparando dos métodos: integración continua (cálculo infinitesimal) y aproximación discreta por suma trapezoidal, usando datos de caudal de una estación hidrométrica a lo largo de 36 horas divididas en 5 segmentos de 6 horas. La aplicación debe permitir al usuario: Ver un panel superior con 4 indicadores clave: volumen total por integral, volumen por trapecios, diferencia numérica entre ambos métodos, y caudal promedio/pico registrado; Alternar la vista entre el rango completo (0-36h) o cada segmento individual (S1 a S5) mediante botones; Activar/desactivar capas visuales en el gráfico: trapecios de integración, área continua Q(t), y guías lineales; Visualizar un gráfico de línea con el caudal en el tiempo, mostrando el área bajo la curva, el punto de caudal pico, y el volumen parcial de cada tramo; Consultar una tabla con los datos originales de caudal por intervalo (tiempo, caudal, delta t, volumen parcial, estado de validación); Ver un desglose matemático paso a paso por cada segmento: la ecuación lineal del tramo, la integral definida, la fórmula del trapecio, y la diferencia absoluta entre ambos métodos (con notación matemática tipo LaTeX); Leer una explicación final de por qué la integral y el trapecio coinciden exactamente cuando la interpolación es lineal. Es una herramienta educativa para entender visualmente que la integración de una función lineal a trozos es matemáticamente equivalente a la suma de trapecios, con error de aproximación cero. dejando la logica como esta solo es lo visual"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comparar los dos métodos de un vistazo (Priority: P1)

Como estudiante, quiero ver de inmediato, en un panel superior, el volumen total calculado por integral definida, el volumen calculado por suma de trapecios, la diferencia numérica entre ambos y el caudal promedio/pico registrado, para confirmar en segundos que ambos métodos producen (prácticamente) el mismo resultado sin tener que leer todo el detalle matemático.

**Why this priority**: Es el titular pedagógico de la herramienta — la comparación numérica inmediata es lo que engancha al estudiante y motiva a explorar el resto de la aplicación. Sin este panel, el resto de capacidades (gráfico, tabla, desglose) carecen de un punto de partida claro.

**Independent Test**: Puede probarse de forma aislada cargando la aplicación en la vista de rango completo y verificando que los 4 indicadores muestran valores numéricos coherentes con los datos originales de caudal, sin necesidad de interactuar con ninguna otra capacidad.

**Acceptance Scenarios**:

1. **Given** que la aplicación se carga en la vista de rango completo (0-36h), **When** el usuario observa el panel superior, **Then** ve 4 indicadores: volumen total por integral, volumen total por trapecios, diferencia numérica entre ambos, y el caudal promedio y el caudal pico registrados en el periodo.
2. **Given** que los 5 segmentos verifican correctamente (integral y trapecio coinciden dentro de la tolerancia), **When** el usuario observa la diferencia numérica del panel, **Then** el valor mostrado es cero o prácticamente cero (dentro del margen de redondeo de presentación).
3. **Given** que el usuario cambia la vista a un segmento individual (S1 a S5), **When** observa el panel superior, **Then** los 4 indicadores se actualizan para reflejar el volumen, la diferencia y el caudal de ese segmento en particular, no los totales del rango completo.

---

### User Story 2 - Entender por qué los dos métodos coinciden (Priority: P2)

Como estudiante, quiero ver, para cada segmento, la ecuación lineal del tramo, la integral definida evaluada paso a paso, la fórmula del trapecio evaluada paso a paso y la diferencia absoluta entre ambos resultados, y leer al final una explicación de por qué la integral y el trapecio coinciden exactamente cuando la función es lineal a trozos, para comprender la razón matemática detrás de la coincidencia que vi en el panel superior.

**Why this priority**: Profundiza el "qué" mostrado por el panel de indicadores (User Story 1) con el "por qué" matemático, que es el objetivo educativo central de la actividad. Depende de que exista un resultado que explicar, por lo que es un escalón por debajo del panel resumen.

**Independent Test**: Puede probarse de forma aislada inspeccionando el desglose matemático de cualquier segmento y confirmando que muestra la ecuación lineal, la integral evaluada, el trapecio evaluado y la diferencia absoluta con sus valores numéricos sustituidos, y que la explicación final es legible y está presente sin necesidad de generar ninguna otra vista.

**Acceptance Scenarios**:

1. **Given** que el usuario consulta el desglose de un segmento cualquiera, **When** lo lee, **Then** encuentra la ecuación lineal del tramo con sus valores sustituidos, la integral definida evaluada paso a paso, la fórmula del trapecio evaluada paso a paso, y la diferencia absoluta entre ambos resultados.
2. **Given** que todos los segmentos verifican correctamente, **When** el usuario llega al final del desglose, **Then** encuentra una explicación en lenguaje natural de por qué la integral y el trapecio coinciden exactamente cuando la interpolación entre dos puntos es lineal.
3. **Given** que algún segmento no supera la verificación (diferencia mayor a la tolerancia permitida), **When** el usuario consulta su desglose y la explicación final, **Then** el sistema señala explícitamente ese segmento como no verificado en lugar de afirmar sin matices que ambos métodos coinciden.

---

### User Story 3 - Explorar el gráfico por capas y por segmento (Priority: P3)

Como estudiante, quiero activar y desactivar capas visuales del gráfico (trapecios de integración, área continua bajo la curva, guías lineales) y alternar entre ver el rango completo o un segmento individual (S1 a S5), para aislar visualmente el elemento que quiero estudiar en cada momento sin que el resto de información sature la gráfica.

**Why this priority**: Añade una capacidad exploratoria que enriquece la comprensión visual ya lograda por los indicadores (User Story 1) y el desglose matemático (User Story 2), pero no es indispensable para captar el mensaje pedagógico central, por lo que se ubica un escalón por debajo.

**Independent Test**: Puede probarse de forma aislada activando y desactivando cada una de las 3 capas visuales una por una y verificando que el gráfico refleja el cambio inmediatamente, y seleccionando cada uno de los botones de rango completo/S1-S5 y verificando que el gráfico y sus anotaciones (punto de caudal pico, volumen parcial por tramo) se ajustan al alcance elegido.

**Acceptance Scenarios**:

1. **Given** que el gráfico está visible, **When** el usuario activa la capa de trapecios de integración, **Then** el gráfico dibuja los trapecios usados para aproximar el volumen sobre el tramo visible.
2. **Given** que el gráfico está visible, **When** el usuario activa la capa de área continua Q(t), **Then** el gráfico sombrea el área bajo la curva de caudal en el tramo visible.
3. **Given** que el gráfico está visible, **When** el usuario activa la capa de guías lineales, **Then** el gráfico dibuja líneas de referencia que ayudan a leer los valores de caudal en los extremos de cada tramo.
4. **Given** que el usuario desactiva las 3 capas visuales, **When** observa el gráfico, **Then** la curva de caudal y los 6 puntos de registro originales permanecen visibles (el gráfico nunca queda vacío).
5. **Given** que el usuario selecciona uno de los botones S1 a S5, **When** observa el gráfico, **Then** este se ajusta para mostrar el punto de caudal pico y el volumen parcial de ese segmento en particular; **When** selecciona el botón de rango completo, **Then** el gráfico vuelve a mostrar los 36 horas con el punto de caudal pico y los volúmenes parciales de los 5 segmentos.

---

### User Story 4 - Consultar los datos originales con su validación (Priority: P4)

Como estudiante, quiero consultar una tabla con los datos originales de caudal por intervalo (tiempo, caudal, delta t, volumen parcial y estado de validación), para verificar por mí mismo, con una vista tabular tradicional, los números exactos que sustentan el gráfico y el desglose matemático.

**Why this priority**: Es una capacidad de referencia y transparencia adicional; el gráfico y el desglose matemático (User Stories 1-3) ya comunican la misma información de forma visual, por lo que la tabla es un complemento de consulta y no la vía principal de aprendizaje.

**Independent Test**: Puede probarse de forma aislada consultando la tabla y verificando que cada fila muestra el tiempo, el caudal, el delta t del intervalo, el volumen parcial calculado y el estado de validación de ese segmento, coincidiendo con los mismos valores mostrados en el panel superior y en el desglose matemático.

**Acceptance Scenarios**:

1. **Given** que el usuario consulta la tabla de datos, **When** la revisa, **Then** encuentra una fila por cada uno de los 5 intervalos con su tiempo de inicio y fin, caudal, delta t, volumen parcial y estado de validación.
2. **Given** que un segmento no supera la verificación, **When** el usuario consulta su fila en la tabla, **Then** el estado de validación de esa fila lo señala explícitamente en lugar de mostrar un volumen parcial como si estuviera validado.

---

### Edge Cases

- ¿Qué ocurre si el usuario desactiva las 3 capas visuales del gráfico a la vez? El gráfico no debe quedar vacío: la curva de caudal y los 6 puntos de registro originales siguen visibles en todo momento.
- ¿Qué ocurre si un segmento no supera la verificación entre integral y trapecio? El panel de indicadores, el desglose matemático, la explicación final y la tabla de datos deben señalar ese segmento como no verificado de forma consistente entre sí, y el sistema no debe presentar un volumen total ni una explicación de "coincidencia exacta" sin matizar que ese segmento falló.
- ¿Qué ocurre si el usuario selecciona un segmento individual (S1 a S5) y luego activa una capa visual (por ejemplo, guías lineales)? La capa se aplica únicamente dentro del tramo visible de ese segmento, sin mostrar información de los demás segmentos.
- ¿Qué ocurre si el caudal pico del periodo completo coincide exactamente con uno de los extremos de un segmento? El punto de caudal pico se marca una sola vez en el gráfico, sin duplicarse entre segmentos adyacentes.
- ¿Qué ocurre si el usuario navega solo con teclado o con un lector de pantalla? Los botones de vista por segmento, los interruptores de capas visuales y el resto de controles nuevos deben ser completamente operables sin mouse ni pantalla táctil, y la tabla de datos debe seguir exponiendo toda la información de forma accesible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST mostrar un panel superior con 4 indicadores: volumen total por integral definida, volumen total por suma de trapecios, diferencia numérica absoluta entre ambos métodos, y el caudal promedio y el caudal pico del alcance actualmente visible (rango completo o segmento individual).
- **FR-002**: El sistema MUST permitir al usuario alternar la vista entre el rango completo (0 a 36 horas) y cada uno de los 5 segmentos individuales del periodo, mediante controles (botones) dedicados a cada alcance, accesibles por teclado.
- **FR-003**: Al cambiar de alcance (rango completo o segmento individual), el sistema MUST actualizar simultáneamente el panel de indicadores (FR-001), el gráfico y sus anotaciones, y el desglose matemático visible, de modo que los tres reflejen siempre el mismo alcance seleccionado.
- **FR-004**: El sistema MUST permitir al usuario activar y desactivar, de forma independiente entre sí, 3 capas visuales del gráfico: los trapecios usados para aproximar el volumen, el área continua bajo la curva de caudal, y las guías lineales de referencia en los extremos de cada tramo.
- **FR-005**: Con cualquier combinación de capas visuales activas o inactivas, el sistema MUST mantener siempre visibles, como mínimo, la curva de caudal y los 6 puntos de registro originales (el gráfico nunca queda vacío).
- **FR-006**: El gráfico MUST señalar visualmente el punto de caudal pico del alcance visible y el volumen parcial correspondiente a cada tramo mostrado.
- **FR-007**: El sistema MUST mostrar una tabla con los datos originales de caudal organizados por intervalo, incluyendo para cada uno: el tiempo de inicio y fin, el caudal registrado, la duración del intervalo (delta t), el volumen parcial calculado, y su estado de validación.
- **FR-008**: El sistema MUST mostrar, para cada uno de los 5 segmentos, un desglose matemático paso a paso que incluya: la ecuación lineal del tramo con sus valores sustituidos, la integral definida evaluada paso a paso, la fórmula del trapecio evaluada paso a paso, y la diferencia absoluta entre ambos resultados, presentados con notación matemática formal (fracciones, exponentes, subíndices, símbolo de integral).
- **FR-009**: El sistema MUST mostrar una explicación final, en lenguaje natural, de por qué la integral definida y la suma de trapecios coinciden exactamente cuando la función interpolada entre dos puntos es lineal.
- **FR-010**: Cuando uno o más segmentos no superen la verificación entre integral y trapecio, el sistema MUST señalar explícitamente cuáles, de forma consistente en el panel de indicadores, el desglose matemático, la tabla de datos y la explicación final, sin presentar un volumen total ni una afirmación de coincidencia exacta sin matizar la falla.
- **FR-011**: El sistema MUST NOT alterar, sustituir ni recalcular con un método distinto los seis registros originales, el modelo de segmentos lineales, ni el procedimiento de verificación por doble método ya establecidos; esta funcionalidad únicamente cambia cómo se presenta y organiza visualmente esa misma información ya calculada.
- **FR-012**: Todos los controles interactivos nuevos (botones de alcance, interruptores de capas visuales) MUST ser completamente operables solo con teclado y MUST anunciarse correctamente a tecnologías de asistencia, con el mismo nivel de accesibilidad (WCAG 2.1 AA) ya exigido en el resto de la aplicación.

### Key Entities

- **Indicador Clave**: uno de los 4 valores resumen del panel superior (volumen por integral, volumen por trapecios, diferencia numérica, caudal promedio/pico), junto con el alcance (rango completo o segmento individual) al que corresponde en cada momento.
- **Alcance de Vista**: el rango de tiempo actualmente seleccionado para mostrar en el panel, el gráfico y el desglose — el periodo completo o uno de los 5 segmentos individuales (S1 a S5).
- **Capa Visual**: uno de los tres elementos activables/desactivables del gráfico (trapecios de integración, área continua Q(t), guías lineales), con su estado (activa/inactiva).
- **Fila de Datos**: un intervalo de la tabla, con su tiempo de inicio y fin, caudal, delta t, volumen parcial y estado de validación.
- **Desglose de Segmento**: el conjunto de expresiones matemáticas mostradas para un segmento — ecuación lineal, integral definida evaluada, fórmula del trapecio evaluada y diferencia absoluta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden identificar los 4 indicadores clave (volumen por integral, volumen por trapecios, diferencia, caudal promedio/pico) en menos de 5 segundos desde que cargan la vista de rango completo.
- **SC-002**: Los usuarios pueden cambiar entre el rango completo y cualquiera de los 5 segmentos individuales en una sola interacción, y el panel de indicadores, el gráfico y el desglose matemático reflejan el nuevo alcance sin ninguna acción adicional.
- **SC-003**: El 100% de los segmentos muestra su desglose matemático completo (ecuación lineal, integral evaluada, trapecio evaluado, diferencia absoluta) sin necesidad de navegar a una vista distinta a la del propio segmento.
- **SC-004**: Los usuarios pueden activar o desactivar cada una de las 3 capas visuales del gráfico de forma independiente, con el cambio reflejado de inmediato en la gráfica.
- **SC-005**: La tabla de datos expone el 100% de los intervalos originales con su delta t, volumen parcial y estado de validación, sin que el usuario necesite consultar otro panel para completar esa información.
- **SC-006**: Cuando todos los segmentos verifican correctamente, el 100% de los usuarios que leen la explicación final pueden identificar que la diferencia numérica entre los dos métodos es cero (dentro del margen de redondeo de presentación).
- **SC-007**: El 100% de los controles interactivos nuevos (botones de alcance, interruptores de capas) son operables usando únicamente el teclado, igualando el nivel de accesibilidad ya alcanzado por el resto de la aplicación.

## Assumptions

- **Los 5 segmentos no tienen igual duración**: el pedido original menciona "36 horas divididas en 5 segmentos de 6 horas", pero los seis registros originales de caudal (inmutables, ver la constitución del proyecto) definen 5 segmentos de duración desigual: [0,6], [6,12], [12,24], [24,30] y [30,36] horas (uno de ellos dura 12 horas, no 6). Esta especificación usa esos cinco segmentos reales y ya verificados, sin inventar ni redistribuir datos nuevos para forzar segmentos de 6 horas exactas, ya que los registros originales son innegociables.
- **"Integración continua" no introduce una curva suavizada**: la "integración continua (cálculo infinitesimal)" y el "área continua Q(t)" mencionadas en el pedido se refieren a la integral definida de la función lineal a trozos ya establecida (la misma que ya calcula y verifica la aplicación), no a una interpolación suavizada, spline o de otro tipo no lineal entre los seis registros originales, ya que eso está expresamente prohibido por las reglas matemáticas ya vigentes del proyecto.
- **La notación "tipo LaTeX" se logra con tipografía matemática nativa, sin librerías externas**: la aplicación ya presenta fórmulas (ecuación lineal, integral, trapecio) con notación matemática formal (exponentes, subíndices, símbolos) usando únicamente marcado y tipografía nativos del navegador. Esta especificación asume que esa misma vía sigue siendo válida para cumplir con "notación matemática tipo LaTeX", en lugar de incorporar una librería externa de renderizado matemático, ya que el proyecto no permite añadir dependencias de terceros sin justificación explícita. La decisión técnica concreta se confirma en la fase de planeación.
- **Relación con la interfaz ya existente**: esta funcionalidad redefine cómo se organiza y presenta visualmente la información ya calculada (paneles, gráfico, tabla y desglose), por lo que puede reemplazar o reorganizar los elementos de interfaz específicos de mejoras visuales anteriores del proyecto. Cualquier capacidad de esas mejoras anteriores que no se mencione aquí explícitamente (por ejemplo, un alternador de tema) queda fuera del alcance de esta especificación y su continuidad se decide en la fase de planeación; en cualquier caso, el nivel de accesibilidad (WCAG 2.1 AA) y la integridad de los datos y el procedimiento matemático ya exigidos deben mantenerse.
- **Alcance de datos**: no se introducen registros de caudal nuevos ni estaciones hidrométricas adicionales; se usa exclusivamente el mismo conjunto fijo de seis registros y cinco segmentos ya establecido y verificado por el proyecto.
- **Sin cambios en el motor matemático**: conforme al pedido explícito del usuario ("dejando la lógica como está, solo es lo visual"), esta especificación no requiere ni introduce ningún cambio en las fórmulas, el modelo de segmentos lineales o el procedimiento de verificación por doble método; toda la funcionalidad descrita consume valores ya calculados y verificados.
