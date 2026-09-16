# Quickstart: Validación del Simulador Matemático-Educativo

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Contrato**: [contracts/motor-matematico.contract.md](./contracts/motor-matematico.contract.md)

Guía para comprobar de extremo a extremo que la implementación cumple `spec.md` (User Stories P1-P3, SC-001 a SC-004), sin necesidad de servidor, build step ni dependencias.

## Prerrequisitos

- Un navegador de escritorio moderno: Chrome, Firefox o Edge (SC-002).
- Los tres archivos de la aplicación en la misma carpeta: `index.html`, `styles.css`, `script.js`.
- Ninguna instalación, `npm install` ni servidor local es necesaria.

## 1. Ejecutar la aplicación

1. Abrir `index.html` haciendo doble clic, o arrastrándolo a una pestaña del navegador (protocolo `file://`).
2. Abrir las DevTools del navegador (F12) y revisar la pestaña "Console": **no debe haber ningún error** en la carga inicial (SC-002).

## 2. Validar User Story 1 — Primer intervalo (P1)

1. Verificar que "Primer intervalo [0, 6]" está seleccionado por defecto (estado inicial, R7).
2. Confirmar visualmente que la gráfica muestra los puntos `(0, 5825.54)` y `(6, 6000.69)` unidos por un único segmento sombreado.
3. En el panel de resultados, confirmar que el volumen mostrado es **`127.723.284,00 m³`** — no `127.723.286,16 m³` (pendiente redondeada) ni `127.723.286,13 m³` (valor documental de la actividad) (SC-001).
4. Confirmar que se muestra la fórmula de la integral, los valores sustituidos y la conversión `×3600` (SC-003).

**Resultado esperado**: coincide con `data-model.md` → `SegmentoModelo` para `[0,6]`, y con el caso de control de `contracts/motor-matematico.contract.md` → `calcularIntegral()`.

## 3. Validar User Story 2 — Periodo completo (P2)

1. Cambiar la selección a "Periodo completo [0, 36]".
2. Confirmar que la gráfica ahora muestra los 6 puntos originales unidos por 5 segmentos consecutivos, con el área de los 5 intervalos sombreada.
3. Confirmar que el panel de resultados muestra el volumen total **`781.352.568,00 m³`** y el estado **"VERIFICADO"** (SC-004).

**Resultado esperado**: coincide con `ResultadoPeriodo` para `modo = 'periodo_completo'` en `data-model.md`, con `estadoGlobal === 'VERIFICADO'`.

## 4. Validar User Story 3 — Transparencia matemática (P3)

1. Con cualquiera de los dos modos seleccionados, revisar el panel "Procedimiento Matemático".
2. Confirmar que se muestran, para cada segmento visible: la función `fᵢ(t)`, la integral evaluada, el cálculo del trapecio y la diferencia entre ambos.
3. (Prueba de robustez, opcional) Simular una discrepancia editando temporalmente `script.js` para redondear la pendiente antes de calcular (p. ej. `Math.round(pendiente * 10000) / 10000`), recargar, y confirmar que el estado cambia a **"VERIFICACIÓN FALLIDA"** con la diferencia explicada. Revertir el cambio después de la prueba.

## 5. Validar el motor matemático de forma aislada (consola del navegador)

Con la aplicación cargada, pegar en la consola de DevTools (referencia: `contracts/motor-matematico.contract.md`):

```javascript
// Validación de datos
console.assert(validarDatos(DATOS_ORIGINALES).esValido === true, 'Datos originales deben ser válidos');
console.assert(validarDatos([]).esValido === false, 'Array vacío debe ser inválido');
console.assert(
  validarDatos([{ t: 6, Q: 100 }, { t: 0, Q: 200 }]).mensaje.length > 0,
  'Tiempos no ascendentes deben producir un mensaje descriptivo'
);

// Motor matemático — caso de control del primer intervalo (SC-001)
const resultadoP1 = calcularPeriodo(DATOS_ORIGINALES, 'primer_intervalo');
console.assert(
  Math.abs(resultadoP1.volumenTotalIntegral - 127723284) < 0.01,
  'Volumen del primer intervalo debe ser 127.723.284 m3 con precisión completa'
);
console.assert(resultadoP1.estadoGlobal === 'VERIFICADO', 'Primer intervalo debe verificar');

// Motor matemático — periodo completo (SC-004)
const resultadoCompleto = calcularPeriodo(DATOS_ORIGINALES, 'periodo_completo');
console.assert(resultadoCompleto.segmentos.length === 5, 'Periodo completo debe tener 5 segmentos');
console.assert(
  Math.abs(resultadoCompleto.volumenTotalIntegral - 781352568) < 0.01,
  'Volumen total del periodo completo debe ser 781.352.568 m3'
);
console.assert(resultadoCompleto.estadoGlobal === 'VERIFICADO', 'Periodo completo debe verificar');
```

**Resultado esperado**: ninguna aserción imprime un mensaje de fallo en la consola.

## 6. Verificar independencia de red y accesibilidad básica

1. Con la pestaña "Network" de DevTools abierta, recargar la página: no debe registrarse ninguna petición de red (confirma FR-006/SC-002).
2. Navegar la interfaz completa usando solo el teclado (Tab / flechas / Enter): los controles de selección de intervalo deben ser alcanzables y operables (FR-009).
3. Redimensionar la ventana del navegador por debajo de 768px de ancho: el layout debe pasar a una sola columna y el gráfico debe conservar la relación de aspecto 16:9 (FR-010).

## Checklist de cierre

- [ ] SC-001: primer intervalo = `127.723.284,00 m³`.
- [ ] SC-002: cero errores de consola, cero peticiones de red, funciona bajo `file://`.
- [ ] SC-003: fórmula, sustitución y resultado visibles para ambos métodos.
- [ ] SC-004: periodo completo verificado (5/5 segmentos).
- [ ] Aserciones de consola (paso 5) sin fallos.
- [ ] Accesibilidad básica (paso 6) verificada.
