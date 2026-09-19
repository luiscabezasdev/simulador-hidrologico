# Quickstart: Validación de HidroLab Interactivo Pro

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Contrato**: [contracts/interaccion-avanzada.contract.md](./contracts/interaccion-avanzada.contract.md)

Guía para comprobar de extremo a extremo que la implementación cumple `spec.md` (User Stories P1-P3, SC-001 a SC-006), sin servidor, build step ni dependencias. Complementa (no reemplaza) `specs/001-simulador-caudal-volumen/quickstart.md`, que sigue siendo válido para el motor matemático base.

## Prerrequisitos

- Un navegador de escritorio moderno con soporte de Pointer Events (Chrome, Firefox o Edge), y opcionalmente un dispositivo o emulador táctil para la validación de tap/drag.
- Los tres archivos de la aplicación (`index.html`, `styles.css`, `script.js`) actualizados con esta feature, en la misma carpeta.
- Ninguna instalación, `npm install` ni servidor local es necesaria (Principio II).

## 1. Validar User Story 1 — Rastreo continuo Q(t) (P1)

1. Abrir `index.html`, seleccionar "Periodo completo [0,36]".
2. Mover el cursor sobre un punto intermedio de un segmento (p. ej. `t=18`, dentro de `[12,24]`). **Esperado**: aparece un indicador con el instante y el caudal interpolado; el valor coincide con evaluar `fᵢ(18)` a mano usando la pendiente de ese segmento (Acceptance Scenario 1).
3. Mover el cursor lentamente a través de la frontera entre dos segmentos (p. ej. de `t=11` a `t=13`, cruzando `t=12`). **Esperado**: el valor cambia de forma continua, sin saltos (Acceptance Scenario 2).
4. Posicionar el cursor exactamente sobre `t=0, 6, 12, 24, 30, 36`. **Esperado**: el valor mostrado coincide exactamente con el registro original de `DATOS_ORIGINALES` en cada punto (Acceptance Scenario 3; ver también el caso de prueba de `interpolarCaudal` en el contrato).
5. Mover el cursor fuera del área graficada (antes de `t=0` o después del límite del modo activo). **Esperado**: el indicador de valor exacto desaparece o indica ausencia de dato, sin error en consola (Acceptance Scenario 4, FR-012).
6. Repetir el paso 2 mientras un segmento distinto está aislado (ver sección 2 más abajo) y verificar que el rastreo sigue funcionando con normalidad sobre el segmento atenuado (Acceptance Scenario 5, FR-013).
7. En un dispositivo táctil (o el emulador de DevTools), mantener presionado sobre la gráfica y arrastrar. **Esperado**: el valor de rastreo aparece y se actualiza mientras se arrastra; un toque breve (tap) sin arrastre, en cambio, aísla/deselecciona el segmento tocado (edge case táctil, R20).

## 2. Validar User Story 2 — Aislamiento de segmento (P2)

1. En "Periodo completo [0,36]", hacer clic sobre uno de los 5 segmentos del gráfico. **Esperado**: los otros 4 segmentos y sus áreas sombreadas se atenúan visualmente; el panel superior cambia a mostrar volumen parcial, caudal promedio local y pendiente m de ese segmento, en vez de los totales (Acceptance Scenarios 1-2).
2. Volver a hacer clic sobre el mismo segmento. **Esperado**: todos los segmentos recuperan opacidad normal; el panel superior vuelve a mostrar los totales del periodo completo (Acceptance Scenario 3).
3. Aislar un segmento usando en su lugar la leyenda de 5 botones accesibles (navegación con `Tab` + `Enter`/`Espacio`, sin mouse). **Esperado**: mismo efecto visual y de panel que el clic directo (Acceptance Scenario 5, FR-005).
4. Con un segmento aislado, hacer clic en el botón "Mostrar periodo completo" de la leyenda. **Esperado**: se limpia la selección igual que en el paso 2 (FR-007).
5. Con un segmento aislado, cambiar a "Primer intervalo [0,6]" y volver a "Periodo completo [0,36]". **Esperado**: la selección de segmento se limpió automáticamente al cambiar de modo (Acceptance Scenario 4, FR-008); confirmar también que en modo "Primer intervalo" la leyenda de 5 segmentos no está disponible/visible.
6. Con un segmento aislado, alternar el tema (ver sección 3). **Esperado**: el aislamiento no cambia; solo cambia la paleta visual (edge case de `spec.md`).

## 3. Validar User Story 3 — Modo oscuro (P3)

1. Abrir el simulador en una ventana/perfil de navegador sin preferencia de tema guardada previamente (o borrar `localStorage` del sitio antes de recargar).
2. Con el sistema operativo o el navegador configurado en modo oscuro, cargar el simulador. **Esperado**: la interfaz se muestra en modo oscuro sin interacción del usuario (Acceptance Scenario 1, SC-003).
3. Activar el alternador de tema (accesible por teclado). **Esperado**: toda la interfaz (encabezado, gráfico, controles, panel de resultados, procedimiento matemático) cambia de inmediato y permanece legible (Acceptance Scenario 2).
4. Recargar la página (o cerrar y reabrir la pestaña). **Esperado**: se conserva el tema elegido explícitamente en el paso 3, sin importar la preferencia actual del sistema operativo (Acceptance Scenario 3, SC-004).
5. Con las herramientas de desarrollador, deshabilitar `localStorage` (o usar una ventana privada con almacenamiento bloqueado) y repetir los pasos 1-3. **Esperado**: el simulador sigue funcionando, aplicando la preferencia del sistema en cada carga, sin errores visibles en consola (edge case de `spec.md`, R16).
6. Verificar manualmente con una herramienta de contraste (p. ej. el inspector de accesibilidad del navegador) que, en tema oscuro, el texto principal mantiene ≥4.5:1 y las líneas del gráfico/áreas sombreadas ≥3:1 contra el fondo oscuro (FR-004, SC-006).

## 4. Validar el motor matemático de interpolación (consola del navegador)

Con la aplicación cargada en "Periodo completo", pegar en la consola de DevTools (referencia: `contracts/interaccion-avanzada.contract.md`):

```javascript
const resultado = calcularPeriodo(DATOS_ORIGINALES, 'periodo_completo');
const segmentos = resultado.segmentos;

// Continuidad en los extremos originales (Acceptance Scenario 3, US1)
console.assert(
  interpolarCaudal(segmentos, 0).Q === segmentos[0].QInicio,
  'Q(0) debe coincidir exactamente con el registro original'
);
console.assert(
  interpolarCaudal(segmentos, 36).Q === segmentos[segmentos.length - 1].QFin,
  'Q(36) debe coincidir exactamente con el registro original'
);

// Valor intermedio dentro de un segmento conocido
const punto18 = interpolarCaudal(segmentos, 18);
console.assert(punto18.segmentoIndice === 2, 'Q(18) debe pertenecer al segmento [12,24]');
console.assert(
  Math.abs(punto18.Q - (segmentos[2].QInicio + segmentos[2].pendiente * (18 - segmentos[2].tInicio))) < 1e-9,
  'Q(18) debe coincidir con la evaluación manual de f_2(t)'
);

// Fuera de rango (FR-012)
console.assert(interpolarCaudal(segmentos, -1) === null, 'Antes de t=0 debe retornar null');
console.assert(interpolarCaudal(segmentos, 999) === null, 'Después de t=36 debe retornar null');
```

**Resultado esperado**: ninguna aserción imprime un mensaje de fallo en la consola.

## 5. Verificar independencia de red y accesibilidad

1. Con la pestaña "Network" de DevTools abierta, alternar el tema, aislar un segmento y mover el cursor sobre la gráfica: no debe registrarse ninguna petición de red en ningún momento (Principio II).
2. Navegar toda la interfaz nueva usando solo el teclado: alternador de tema y los 5 botones de la leyenda de segmentos deben ser alcanzables con `Tab` y operables con `Enter`/`Espacio`, con foco visible (FR-015, SC-005).
3. Confirmar con un lector de pantalla (o el árbol de accesibilidad de DevTools) que el alternador de tema anuncia su estado (`aria-pressed`/`aria-checked`) y que cada botón de la leyenda anuncia si su segmento está seleccionado.

## Checklist de cierre

- [ ] SC-001: valor exacto de Q(t) disponible en <1s al mover el cursor, coherente con el modelo lineal por tramos.
- [ ] SC-002: aislar y restaurar un segmento requiere una interacción cada uno.
- [ ] SC-003: primera visita sin elección previa coincide con la preferencia de tema del sistema operativo.
- [ ] SC-004: la elección explícita de tema se conserva entre visitas posteriores.
- [ ] SC-005: alternador de tema y leyenda de segmentos 100% operables por teclado.
- [ ] SC-006: contraste WCAG 2.1 AA verificado en tema oscuro (texto, líneas, áreas sombreadas).
- [ ] Aserciones de consola de la sección 4 sin fallos.
- [ ] Cero peticiones de red durante tema, aislamiento y rastreo continuo.
