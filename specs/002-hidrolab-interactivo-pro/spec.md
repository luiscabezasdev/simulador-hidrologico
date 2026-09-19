# Feature Specification: HidroLab Interactivo Pro

**Feature Branch**: `002-hidrolab-interactivo-pro`

**Created**: 2026-09-16

**Status**: Draft

**Input**: User description: "Implementar 'HidroLab Interactivo Pro': (1) modo oscuro con persistencia y detección automática de la preferencia del sistema, (2) aislamiento interactivo por segmento (drill-down) sobre el gráfico de caudal, y (3) rastreo continuo del cursor sobre la curva del hidrograma para interpolar y mostrar el valor exacto de caudal Q(t) en cualquier instante t del eje temporal, no solo en los 6 nodos discretos originales. El brief original incluía además ejemplos de código de referencia (no vinculantes para esta especificación, que se mantiene libre de detalles de implementación) y una sección de reto académico sobre interpolación por splines cúbicos y cuadratura numérica de orden superior, tratada aquí como material de reflexión y no como requisito funcional (ver Assumptions)."

## Clarifications

### Session 2026-09-16

- Q: ¿Qué mecanismo debe usarse para que alguien que navega solo con teclado pueda seleccionar y deseleccionar uno de los cinco segmentos del hidrograma (aislamiento por segmento)? → A: Una lista/leyenda de 5 controles accesibles (uno por segmento), operables por teclado, además del gesto directo sobre el gráfico.
- Q: Cuando un segmento está aislado (los demás atenuados), ¿el rastreo continuo del cursor debe seguir mostrando el valor exacto de caudal en toda la curva, o solo dentro del segmento aislado? → A: El rastreo continuo sigue funcionando en toda la curva, incluidos los segmentos atenuados; el aislamiento es solo un cambio visual y de métricas en el panel de resumen, no una restricción de lectura.
- Q: En pantallas táctiles, ¿un toque sobre la gráfica debe aislar el segmento tocado o iniciar un arrastre de rastreo continuo? → A: Un toque breve (tap) aísla/deselecciona el segmento tocado; mantener presionado y arrastrar activa el rastreo continuo, replicando la distinción estándar "tap" vs. "press-and-drag" en gráficos táctiles.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar el caudal en cualquier instante del hidrograma (Priority: P1)

Como estudiante, quiero mover el cursor sobre cualquier punto de la gráfica de caudal y ver de inmediato el instante y el caudal exactos en ese punto, para poder explorar el comportamiento del río entre los 6 registros originales y no solo en esos 6 puntos discretos.

**Why this priority**: Es la extensión de mayor valor pedagógico del simulador existente: convierte una gráfica de 6 puntos fijos en una herramienta exploratoria continua, reforzando la comprensión del modelo lineal por tramos que ya sustenta el cálculo del volumen. Sin esta capacidad, las otras dos mejoras (tema y aislamiento) solo embellecen o reorganizan información que ya existía.

**Independent Test**: Puede probarse de forma aislada moviendo el cursor sobre la gráfica en cualquiera de los dos modos de intervalo y verificando que el valor mostrado en cada posición coincide con el resultado de evaluar la función lineal del segmento correspondiente para ese instante, incluyendo los extremos (donde debe coincidir exactamente con los 6 registros originales).

**Acceptance Scenarios**:

1. **Given** que la gráfica está visible en modo "Periodo completo", **When** el usuario posiciona el cursor sobre un instante intermedio dentro de un segmento (por ejemplo t=18, dentro de [12,24]), **Then** el sistema muestra el tiempo y el caudal interpolado correspondiente a ese instante, calculado con el modelo lineal del segmento que lo contiene.
2. **Given** que el cursor se mueve continuamente sobre la gráfica, **When** cruza de un segmento a otro, **Then** el valor mostrado cambia de forma continua y coherente con la pendiente de cada segmento, sin saltos ni discontinuidades visuales.
3. **Given** que el cursor se posiciona exactamente sobre uno de los 6 instantes originales (t=0,6,12,24,30,36), **When** se lee el valor mostrado, **Then** este coincide exactamente con el registro original de caudal para ese instante.
4. **Given** que el cursor sale del rango de tiempo graficado (antes de t=0 o después del límite del modo activo), **When** el usuario observa la interfaz, **Then** el indicador de valor exacto desaparece o indica claramente que no hay dato en esa posición.
5. **Given** que un segmento está aislado y los demás están atenuados, **When** el usuario mueve el cursor sobre uno de los segmentos atenuados, **Then** el sistema sigue mostrando el valor exacto de caudal interpolado en ese punto, sin que la atenuación visual restrinja la lectura continua.

---

### User Story 2 - Aislar un segmento para analizarlo en detalle (Priority: P2)

Como estudiante, quiero seleccionar uno de los cinco segmentos del hidrograma para que el resto se atenúe visualmente y el panel superior muestre solo las métricas de ese segmento (volumen parcial, caudal promedio local y pendiente), para poder comparar y analizar un tramo específico sin la distracción del resto del periodo.

**Why this priority**: Añade una capacidad de análisis comparativo que profundiza el valor educativo ya existente (transparencia del procedimiento matemático), pero depende de que existan varios segmentos visibles a la vez (modo "Periodo completo"), por lo que es un escalón por debajo de poder leer cualquier valor de la curva.

**Independent Test**: Puede probarse de forma aislada seleccionando cada uno de los cinco segmentos en modo "Periodo completo" y verificando que los otros cuatro se atenúan visualmente, que el panel superior cambia a mostrar únicamente las métricas del segmento elegido, y que deseleccionarlo restaura la vista de totales del periodo completo.

**Acceptance Scenarios**:

1. **Given** que el usuario está en modo "Periodo completo" con los 5 segmentos visibles, **When** selecciona uno de los segmentos, **Then** los otros cuatro segmentos y sus áreas sombreadas se atenúan visualmente y el seleccionado permanece resaltado.
2. **Given** que un segmento está seleccionado, **When** el usuario observa el panel superior de resumen, **Then** este muestra el volumen parcial, el caudal promedio local y la pendiente m de ese segmento, en lugar de los totales del periodo completo.
3. **Given** que un segmento está seleccionado, **When** el usuario lo vuelve a seleccionar (o activa la opción de limpiar selección), **Then** todos los segmentos recuperan su opacidad normal y el panel superior vuelve a mostrar los totales del periodo completo.
4. **Given** que hay un segmento aislado, **When** el usuario cambia a modo "Primer intervalo" o vuelve a cambiar de modo, **Then** la selección de segmento se limpia automáticamente, ya que "Primer intervalo" solo tiene un segmento.
5. **Given** que el usuario navega solo con teclado, **When** usa la lista/leyenda de cinco controles accesibles (uno por segmento), **Then** puede seleccionar y deseleccionar cualquier segmento sin usar mouse ni pantalla táctil, con el mismo efecto que el gesto directo sobre el gráfico.

---

### User Story 3 - Usar el simulador cómodamente en modo oscuro (Priority: P3)

Como estudiante que usa el simulador en condiciones de poca luz o que prefiere temas oscuros, quiero que la interfaz respete mi preferencia de tema (clara u oscura), recordándola en futuras visitas, para reducir la fatiga visual sin perder la legibilidad del gráfico ni de los resultados.

**Why this priority**: Es una mejora de ergonomía y accesibilidad transversal, independiente de las dos capacidades anteriores; aporta valor por sí sola pero no es indispensable para el propósito matemático-educativo central del simulador.

**Independent Test**: Puede probarse de forma aislada activando el control de tema, recargando la página y verificando que la preferencia se mantiene, y comprobando en un navegador sin preferencia almacenada que la interfaz respeta la preferencia de tema del sistema operativo.

**Acceptance Scenarios**:

1. **Given** que el usuario no ha elegido nunca un tema en este navegador, **When** carga el simulador, **Then** la interfaz se muestra en modo oscuro u claro según coincida con la preferencia de tema configurada en su sistema operativo o navegador.
2. **Given** que el usuario activa explícitamente el control de tema, **When** cambia entre modo claro y oscuro, **Then** toda la interfaz (encabezado, gráfico, controles, panel de resultados y procedimiento matemático) cambia de inmediato y permanece perfectamente legible en ambos temas.
3. **Given** que el usuario eligió explícitamente un tema, **When** cierra y vuelve a abrir el simulador (incluso en una sesión posterior), **Then** la interfaz recuerda y aplica esa elección, sin importar cuál sea la preferencia actual del sistema operativo.

---

### Edge Cases

- ¿Qué ocurre si el cursor se mueve muy rápido sobre la gráfica? El valor exacto mostrado debe seguir actualizándose de forma fluida y sin retraso perceptible, sin quedar "atascado" en una posición anterior.
- ¿Qué ocurre si el usuario intenta aislar un segmento estando en modo "Primer intervalo" (un solo segmento)? La capacidad de aislamiento no está disponible en ese modo, ya que no hay varios segmentos entre los cuales elegir.
- ¿Qué ocurre si el usuario redimensiona la ventana o cambia de orientación el dispositivo mientras explora la curva? El valor exacto mostrado sigue correspondiendo correctamente a la posición del cursor tras el reajuste del tamaño del gráfico.
- ¿Qué ocurre si el navegador no permite guardar la preferencia de tema (por ejemplo, almacenamiento local deshabilitado o modo privado)? El simulador sigue funcionando normalmente, aplicando la preferencia del sistema operativo en cada carga sin generar errores visibles.
- ¿Qué ocurre si un usuario navega el simulador solo con teclado o con un lector de pantalla? El control de tema y la selección de segmento siguen siendo completamente operables sin mouse; el valor exacto de caudal en cualquier instante sigue estando disponible a través de la tabla de datos y del panel de procedimiento matemático ya existentes, aunque el recorrido continuo con el cursor sea, por naturaleza, una interacción de puntero.
- ¿Qué ocurre si el usuario aísla un segmento y luego activa o desactiva el modo oscuro? El aislamiento del segmento se mantiene sin cambios; solo cambia la paleta visual de toda la interfaz.
- ¿Qué ocurre si el usuario aísla un segmento y luego mueve el cursor sobre uno de los segmentos atenuados? El rastreo continuo sigue mostrando el valor exacto de caudal en ese punto con normalidad; la atenuación visual del aislamiento no restringe ni desactiva la lectura continua en el resto de la curva.
- ¿Qué ocurre en pantallas táctiles cuando el usuario da un toque breve (tap) sobre un segmento? El sistema lo interpreta como una acción de aislar/deseleccionar ese segmento, no como el inicio del rastreo continuo; el rastreo continuo en táctil solo se activa al mantener presionado y arrastrar sobre la gráfica.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir al usuario alternar explícitamente entre tema claro y tema oscuro mediante un control accesible por teclado y compatible con lectores de pantalla.
- **FR-002**: El sistema MUST recordar la elección explícita de tema del usuario y aplicarla automáticamente en visitas futuras desde el mismo navegador, sin requerir cuenta de usuario ni servidor.
- **FR-003**: Cuando el usuario no ha elegido nunca un tema en ese navegador, el sistema MUST detectar y aplicar automáticamente la preferencia de tema (claro/oscuro) configurada a nivel de sistema operativo o navegador.
- **FR-004**: El tema oscuro MUST cumplir el mismo estándar de accesibilidad WCAG 2.1 Nivel AA ya exigido para el tema claro (contraste mínimo 4.5:1 en texto, 3:1 en elementos gráficos), para todo el texto, controles, líneas del gráfico y áreas sombreadas de segmentos.
- **FR-005**: El sistema MUST permitir al usuario seleccionar ("aislar") uno cualquiera de los cinco segmentos del hidrograma cuando el modo "Periodo completo" está activo, atenuando visualmente los demás segmentos y sus áreas sombreadas mientras la selección permanece activa. La selección MUST poder activarse con un clic sobre el segmento en el gráfico, con un toque breve (tap) sobre el segmento en pantallas táctiles, o mediante una lista/leyenda de cinco controles accesibles (uno por segmento) operables por teclado.
- **FR-006**: Mientras un segmento está aislado, el panel de resumen superior MUST mostrar únicamente las métricas propias de ese segmento (volumen parcial, caudal promedio local y pendiente m), en lugar de los totales del periodo completo, sin alterar los valores ya calculados que se muestran en el panel detallado de procedimiento matemático.
- **FR-007**: El sistema MUST permitir al usuario deseleccionar el segmento aislado, ya sea repitiendo el gesto o control usado para seleccionarlo (gráfico o lista/leyenda accesible) o mediante una acción de "limpiar selección" igualmente accesible, restaurando la vista de totales del periodo completo.
- **FR-008**: El aislamiento de segmento MUST estar disponible únicamente cuando hay más de un segmento visible (modo "Periodo completo"); el sistema MUST limpiar automáticamente cualquier segmento aislado al cambiar de modo de intervalo.
- **FR-009**: El sistema MUST permitir al usuario señalar cualquier posición horizontal dentro del rango de tiempo graficado y ver, de forma continua e inmediata, el caudal interpolado Q(t) correspondiente a ese instante exacto, sin limitarse a los 6 instantes originalmente medidos. Con mouse/trackpad, el rastreo continuo responde al movimiento del cursor sobre el gráfico; en pantallas táctiles, responde a mantener presionado y arrastrar (un toque breve/tap sobre un segmento lo aísla en su lugar, ver FR-005).
- **FR-010**: La interpolación usada para el valor continuo MUST ser lineal por tramos, usando el mismo modelo de segmentos consecutivos ya empleado para calcular el volumen, de modo que el valor mostrado sea siempre matemáticamente coherente con el volumen ya calculado y verificado en el resto del simulador.
- **FR-011**: El valor continuo mostrado MUST indicar tanto el instante señalado como el caudal interpolado en ese instante, y MUST identificar visualmente a cuál de los cinco segmentos pertenece dicho instante.
- **FR-012**: El valor continuo MUST dejar de mostrarse (o indicar claramente la ausencia de dato) cuando el cursor se encuentra fuera del rango de tiempo graficado, y MUST actualizarse de inmediato al desplazar el cursor, sin retraso perceptible.
- **FR-013**: El rastreo continuo MUST seguir funcionando en toda la curva, incluidos los segmentos actualmente atenuados por el aislamiento (User Story 2); el aislamiento de un segmento MUST afectar únicamente la opacidad visual y las métricas del panel de resumen, sin restringir ni desactivar la lectura del valor continuo en el resto de la gráfica.
- **FR-014**: Ninguna de las tres capacidades anteriores (tema, aislamiento de segmento, rastreo continuo) MUST alterar, sustituir o eludir los seis registros originales, el modelo lineal por tramos, ni la verificación entre integral definida y método del trapecio ya exigidos por el simulador existente; en particular, el sistema MUST NOT introducir splines, regresiones u otra suavización no lineal en los valores calculados o mostrados.
- **FR-015**: Todos los controles interactivos nuevos (alternador de tema, selección de segmento) MUST permanecer completamente operables solo con teclado y MUST anunciarse correctamente a tecnologías de asistencia, consistente con el nivel WCAG 2.1 AA ya exigido en el resto del simulador.

### Key Entities

- **Preferencia de Tema**: valor de tema (claro/oscuro) aplicado a la interfaz, con un origen (elegido explícitamente por el usuario o detectado automáticamente del sistema) y persistencia local entre visitas.
- **Segmento Aislado**: referencia al segmento actualmente seleccionado (o ninguno) entre los cinco segmentos del periodo completo, junto con sus métricas locales derivadas (volumen parcial, caudal promedio local, pendiente).
- **Punto de Rastreo**: posición temporal señalada por el usuario dentro del rango graficado, el caudal interpolado correspondiente y el segmento que la contiene; es un valor derivado y transitorio, no un dato persistido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden identificar el caudal exacto en cualquier instante arbitrario de la gráfica (no solo en los 6 registros originales) en menos de 1 segundo desde que señalan ese punto, con un valor coherente con el modelo lineal por tramos dentro del margen de redondeo de presentación.
- **SC-002**: Los usuarios pueden aislar cualquiera de los cinco segmentos y ver sus métricas propias por separado del total del periodo en una sola interacción, y volver a la vista de totales en una interacción adicional.
- **SC-003**: En la primera visita, sin ninguna elección previa, la interfaz coincide con la preferencia de tema del sistema operativo del usuario en el 100% de los casos verificados.
- **SC-004**: Los usuarios pueden cambiar entre tema claro y oscuro en una sola acción, y esa elección se conserva en el 100% de las visitas posteriores desde el mismo navegador hasta que el usuario la cambie de nuevo o borre los datos del sitio.
- **SC-005**: El 100% de los controles interactivos nuevos (tema, selección de segmento) son operables usando únicamente el teclado, igualando el nivel de accesibilidad ya alcanzado por el resto del simulador.
- **SC-006**: El tema oscuro mantiene el mismo cumplimiento de contraste WCAG 2.1 AA ya exigido para el tema claro, verificado en texto, líneas del gráfico y áreas sombreadas de segmentos.

## Assumptions

- **Interacción de selección de segmento**: seleccionar un segmento se activa con un gesto directo sobre su área en la gráfica (clic o toque) o mediante la lista/leyenda de cinco controles accesibles (uno por segmento; ver Clarifications); repetir el gesto o control sobre el mismo segmento, o usar una acción visible de "limpiar selección", lo deselecciona. El diseño visual concreto de esa lista/leyenda queda como decisión de la fase de planeación.
- **Accesibilidad del rastreo continuo**: al ser una interacción basada en puntero (mouse, trackpad o arrastre táctil), no se exige una réplica exacta punto-a-punto para navegación por teclado, dado que la tabla de datos accesible y el panel de procedimiento matemático ya existentes exponen todos los valores calculados de forma discreta y totalmente accesible; ninguna tarea educativa del simulador depende exclusivamente de la interacción por puntero.
- **Reto académico de splines e integración de orden superior**: la sección del pedido original sobre interpolación por splines cúbicos naturales, cuadratura de orden superior (Simpson/Gauss) y la pregunta de metacognición asociada se documentan como material de reflexión académica que acompañó la solicitud, no como requisito funcional de esta especificación. Implementarlo contradiría la prohibición NO NEGOCIABLE vigente del proyecto sobre interpolación no lineal (splines, regresiones) para el modelo de caudal, y requeriría primero una modificación explícita de esa constitución antes de poder incluirse como una funcionalidad futura.
- **Alcance de datos**: los cinco segmentos que puede aislar el usuario son los mismos cinco segmentos fijos ya producidos por los seis registros originales de caudal; esta funcionalidad no introduce carga de datos nuevos ni configuración adicional de segmentos.
- **Persistencia de tema**: la preferencia de tema se guarda únicamente en el navegador del usuario (sin cuenta, sin sincronización entre dispositivos ni servidor), consistente con que el simulador no tiene backend.
- **Ejemplos de código del pedido original**: los fragmentos de código (manejo de `mousemove`, alternador de tema con `localStorage`, referencias a Tailwind CSS y SVG) se tratan como ilustraciones de la intención funcional del usuario, no como restricciones de tecnología para esta especificación; la elección concreta de tecnología de implementación (que debe respetar el stack restringido ya definido por la constitución del proyecto) se decide en la fase de planeación, no en esta especificación.
