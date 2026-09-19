# Código fuente de simulador

## index.html

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Simulador de Caudal y Volumen - Río Magdalena</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <header>
    <h1>Simulador de Caudal y Volumen — Río Magdalena</h1>
    <button id="alternador-tema" type="button" aria-pressed="false">
      <span class="alternador-tema-icono" aria-hidden="true">🌙</span>
      <span class="alternador-tema-texto">Cambiar a tema oscuro</span>
    </button>
  </header>

  <main>

    <section id="seccion-grafico" aria-labelledby="titulo-grafico">
      <h2 id="titulo-grafico">Gráfica de caudal</h2>
      <div class="contenedor-grafico">
        <canvas id="grafico">
          Su navegador no admite gráficos mediante Canvas. Consulte la tabla de datos que se muestra a continuación.
        </canvas>
      </div>
      <div id="lectura-rastreo" aria-live="polite" hidden></div>
      <table id="tabla-datos">
        <caption>Datos originales de caudal — Estación El Banco, Magdalena</caption>
        <thead>
          <tr>
            <th scope="col">Tiempo (h)</th>
            <th scope="col">Caudal (m³/s)</th>
          </tr>
        </thead>
        <tbody id="cuerpo-tabla-datos"></tbody>
      </table>
    </section>

    <section id="seccion-controles" aria-labelledby="titulo-controles">
      <h2 id="titulo-controles">Selección de intervalo</h2>
      <div id="controles-intervalo" role="radiogroup" aria-labelledby="titulo-controles">
        <label class="opcion-intervalo">
          <input type="radio" name="modo-intervalo" id="radio-primer-intervalo" value="primer_intervalo"
            aria-label="Mostrar primer intervalo, de 0 a 6 horas" checked>
          Primer intervalo [0,6]
        </label>
        <label class="opcion-intervalo">
          <input type="radio" name="modo-intervalo" id="radio-periodo-completo" value="periodo_completo"
            aria-label="Mostrar periodo completo, de 0 a 36 horas">
          Periodo completo [0,36]
        </label>
      </div>
    </section>

    <section id="seccion-segmentos" aria-labelledby="titulo-segmentos" hidden>
      <h2 id="titulo-segmentos">Aislar segmento</h2>
      <div id="leyenda-segmentos" role="group" aria-labelledby="titulo-segmentos">
        <button type="button" class="boton-segmento" data-segmento-indice="0" aria-pressed="false"
          aria-label="Aislar segmento de 0 a 6 horas">[0, 6] h</button>
        <button type="button" class="boton-segmento" data-segmento-indice="1" aria-pressed="false"
          aria-label="Aislar segmento de 6 a 12 horas">[6, 12] h</button>
        <button type="button" class="boton-segmento" data-segmento-indice="2" aria-pressed="false"
          aria-label="Aislar segmento de 12 a 24 horas">[12, 24] h</button>
        <button type="button" class="boton-segmento" data-segmento-indice="3" aria-pressed="false"
          aria-label="Aislar segmento de 24 a 30 horas">[24, 30] h</button>
        <button type="button" class="boton-segmento" data-segmento-indice="4" aria-pressed="false"
          aria-label="Aislar segmento de 30 a 36 horas">[30, 36] h</button>
        <button type="button" id="boton-mostrar-todo">Mostrar periodo completo</button>
      </div>
    </section>

    <section id="seccion-resultados" aria-labelledby="titulo-resultados">
      <h2 id="titulo-resultados">Resultados</h2>
      <div id="panel-resultados">
        <div id="resumen-resultado"></div>
        <div id="seccion-procedimiento">
          <h3 id="titulo-procedimiento">Procedimiento Matemático</h3>
          <div id="bloques-procedimiento"></div>
        </div>
      </div>
    </section>

  </main>

  <script src="script.js"></script>
</body>
</html>
```

## script.js

```javascript
'use strict';

/* ==========================================================================
   MOTOR MATEMÁTICO (funciones puras, sin acceso a document/window.canvas)
   ========================================================================== */

const DATOS_ORIGINALES = Object.freeze([
  Object.freeze({ t: 0, Q: 5825.54 }),
  Object.freeze({ t: 6, Q: 6000.69 }),
  Object.freeze({ t: 12, Q: 5840.28 }),
  Object.freeze({ t: 24, Q: 6146.58 }),
  Object.freeze({ t: 30, Q: 6192.00 }),
  Object.freeze({ t: 36, Q: 6175.96 }),
]);

function validarDatos(datos) {
  if (datos.length !== 6) {
    return {
      esValido: false,
      mensaje: 'No fue posible validar los datos: se esperaban 6 registros de caudal.',
    };
  }

  for (const registro of datos) {
    const tEsNumerico = typeof registro.t === 'number' && Number.isFinite(registro.t);
    const qEsNumerico = typeof registro.Q === 'number' && Number.isFinite(registro.Q);
    if (!tEsNumerico || !qEsNumerico) {
      return {
        esValido: false,
        mensaje: 'No fue posible validar los datos: todos los valores de tiempo y caudal deben ser numéricos.',
      };
    }
  }

  for (let i = 0; i < datos.length - 1; i++) {
    if (!(datos[i].t < datos[i + 1].t)) {
      return {
        esValido: false,
        mensaje: 'No fue posible validar el segmento: los tiempos de sus extremos no están en orden ascendente.',
      };
    }
  }

  for (let i = 0; i < datos.length - 1; i++) {
    if (!(datos[i + 1].t - datos[i].t > 0)) {
      return {
        esValido: false,
        mensaje: 'No fue posible validar el segmento: los tiempos de sus extremos son iguales.',
      };
    }
  }

  return { esValido: true, mensaje: '' };
}

function calcularSegmento(datos) {
  const segmentos = [];

  for (let i = 0; i < datos.length - 1; i++) {
    const tInicio = datos[i].t;
    const tFin = datos[i + 1].t;
    const QInicio = datos[i].Q;
    const QFin = datos[i + 1].Q;
    const pendiente = (QFin - QInicio) / (tFin - tInicio);

    segmentos.push({ tInicio, tFin, QInicio, QFin, pendiente });
  }

  return segmentos;
}

function calcularIntegral(segmento) {
  const deltaT = segmento.tFin - segmento.tInicio;
  const m = segmento.pendiente;
  return 3600 * (segmento.QInicio * deltaT + (m * deltaT * deltaT) / 2);
}

function calcularTrapecio(segmento) {
  const deltaT = segmento.tFin - segmento.tInicio;
  return 3600 * ((segmento.QInicio + segmento.QFin) / 2) * deltaT;
}

const TOLERANCIA_VERIFICACION = 0.01;

function verificarResultados(datos, modo) {
  const todosLosSegmentos = calcularSegmento(datos);
  const segmentos = modo === 'primer_intervalo'
    ? todosLosSegmentos.slice(0, 1)
    : todosLosSegmentos;

  const segmentosEvaluados = segmentos.map((segmento) => {
    const volumenIntegral = calcularIntegral(segmento);
    const volumenTrapecio = calcularTrapecio(segmento);
    const diferencia = Math.abs(volumenIntegral - volumenTrapecio);
    const estadoVerificacion = diferencia <= TOLERANCIA_VERIFICACION ? 'VERIFICADO' : 'FALLIDO';

    return { ...segmento, volumenIntegral, volumenTrapecio, diferencia, estadoVerificacion };
  });

  const segmentoFallidoIndice = segmentosEvaluados.findIndex(
    (segmento) => segmento.estadoVerificacion === 'FALLIDO'
  );
  const estadoGlobal = segmentoFallidoIndice === -1 ? 'VERIFICADO' : 'FALLIDO';

  const hayFallo = estadoGlobal === 'FALLIDO';
  const volumenTotalIntegral = hayFallo
    ? null
    : segmentosEvaluados.reduce((total, segmento) => total + segmento.volumenIntegral, 0);
  const volumenTotalTrapecio = hayFallo
    ? null
    : segmentosEvaluados.reduce((total, segmento) => total + segmento.volumenTrapecio, 0);
  const diferenciaTotal = hayFallo
    ? null
    : Math.abs(volumenTotalIntegral - volumenTotalTrapecio);

  return {
    modo,
    segmentos: segmentosEvaluados,
    volumenTotalIntegral,
    volumenTotalTrapecio,
    diferenciaTotal,
    estadoGlobal,
    segmentoFallidoIndice: hayFallo ? segmentoFallidoIndice : null,
  };
}

function calcularPeriodo(datos, modo) {
  const resultadoValidacion = validarDatos(datos);
  if (!resultadoValidacion.esValido) {
    throw new Error(resultadoValidacion.mensaje);
  }

  return verificarResultados(datos, modo);
}

function interpolarCaudal(segmentos, t) {
  const primerSegmento = segmentos[0];
  const ultimoSegmento = segmentos[segmentos.length - 1];

  if (t < primerSegmento.tInicio || t > ultimoSegmento.tFin) {
    return null;
  }

  for (let i = 0; i < segmentos.length; i++) {
    const segmento = segmentos[i];
    if (t >= segmento.tInicio && t <= segmento.tFin) {
      return {
        t,
        Q: segmento.QInicio + segmento.pendiente * (t - segmento.tInicio),
        segmentoIndice: i,
      };
    }
  }

  return null;
}

/* ==========================================================================
   INTERFAZ (Canvas + DOM — consume el motor matemático, sin lógica propia)
   ========================================================================== */

let ctxLienzo = null;
let resultadoActual = null;
let ultimoResultadoProcedimiento = null;

const estadoInteraccion = {
  segmentoAisladoIndice: null,
  puntoRastreo: null,
};

function obtenerVariableCSS(nombre, valorPorDefecto) {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  return valor || valorPorDefecto;
}

function formatearNumero(valor, decimales) {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor);
}

function poblarTablaAccesible(datos) {
  const cuerpoTabla = document.getElementById('cuerpo-tabla-datos');
  const formateador = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  for (const registro of datos) {
    const fila = document.createElement('tr');

    const celdaTiempo = document.createElement('td');
    celdaTiempo.textContent = formateador.format(registro.t);
    fila.appendChild(celdaTiempo);

    const celdaCaudal = document.createElement('td');
    celdaCaudal.textContent = formateador.format(registro.Q);
    fila.appendChild(celdaCaudal);

    cuerpoTabla.appendChild(fila);
  }
}

function prepararLienzo() {
  const canvas = document.getElementById('grafico');
  const soportaCanvas = !!(canvas && typeof canvas.getContext === 'function');

  if (!soportaCanvas) {
    if (canvas) {
      canvas.hidden = true;
    }

    const mensaje = document.createElement('p');
    mensaje.id = 'mensaje-canvas-no-soportado';
    mensaje.textContent = 'Su navegador no admite gráficos interactivos (Canvas). '
      + 'A continuación se muestra la tabla con los datos originales de caudal.';

    const seccionGrafico = document.getElementById('seccion-grafico');
    const tabla = document.getElementById('tabla-datos');
    seccionGrafico.insertBefore(mensaje, tabla);

    return null;
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const anchoLogico = canvas.clientWidth;
  const altoLogico = canvas.clientHeight;

  canvas.width = anchoLogico * dpr;
  canvas.height = altoLogico * dpr;
  canvas.style.width = anchoLogico + 'px';
  canvas.style.height = altoLogico + 'px';
  ctx.scale(dpr, dpr);

  return ctx;
}

function calcularEscalasGrafico(ancho, alto, resultado) {
  const puntos = [{ t: resultado.segmentos[0].tInicio, Q: resultado.segmentos[0].QInicio }];
  for (const segmento of resultado.segmentos) {
    puntos.push({ t: segmento.tFin, Q: segmento.QFin });
  }

  const tMin = puntos[0].t;
  const tMax = puntos[puntos.length - 1].t;
  const qValores = puntos.map((punto) => punto.Q);
  const qMin = Math.min(...qValores);
  const qMax = Math.max(...qValores);
  const margenQ = (qMax - qMin) * 0.1 || 1;
  const qEjeMin = qMin - margenQ;
  const qEjeMax = qMax + margenQ;

  const margen = { superior: 20, derecha: 20, inferior: 40, izquierda: 70 };
  const anchoGrafico = Math.max(ancho - margen.izquierda - margen.derecha, 1);
  const altoGrafico = Math.max(alto - margen.superior - margen.inferior, 1);

  const escalarT = (t) => margen.izquierda + ((t - tMin) / (tMax - tMin || 1)) * anchoGrafico;
  const escalarQ = (Q) => margen.superior + altoGrafico
    - ((Q - qEjeMin) / (qEjeMax - qEjeMin || 1)) * altoGrafico;

  return { puntos, margen, tMin, tMax, qEjeMin, qEjeMax, anchoGrafico, altoGrafico, escalarT, escalarQ };
}

function actualizarGrafica(ctx, resultado, estadoInteraccionActual) {
  const canvas = ctx.canvas;
  const ancho = canvas.clientWidth;
  const alto = canvas.clientHeight;

  ctx.clearRect(0, 0, ancho, alto);

  const { puntos, margen, anchoGrafico, altoGrafico, escalarT, escalarQ } =
    calcularEscalasGrafico(ancho, alto, resultado);

  const colorPrimario = obtenerVariableCSS('--color-primario', '#0b4f8a');
  const colorPrimarioClaro = obtenerVariableCSS('--color-primario-claro', '#4d8bc9');
  const colorTexto = obtenerVariableCSS('--color-texto', '#1a1a1a');
  const colorBorde = obtenerVariableCSS('--color-borde', '#6b7280');

  ctx.strokeStyle = colorBorde;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margen.izquierda, margen.superior);
  ctx.lineTo(margen.izquierda, margen.superior + altoGrafico);
  ctx.lineTo(margen.izquierda + anchoGrafico, margen.superior + altoGrafico);
  ctx.stroke();

  ctx.fillStyle = colorTexto;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Tiempo (h)', margen.izquierda + anchoGrafico / 2, alto - 8);

  ctx.save();
  ctx.translate(14, margen.superior + altoGrafico / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Caudal (m³/s)', 0, 0);
  ctx.restore();

  const segmentoAisladoIndice = estadoInteraccionActual ? estadoInteraccionActual.segmentoAisladoIndice : null;

  resultado.segmentos.forEach((segmento, indice) => {
    const atenuado = segmentoAisladoIndice !== null && indice !== segmentoAisladoIndice;
    ctx.fillStyle = colorPrimarioClaro + (atenuado ? '22' : '66');
    ctx.beginPath();
    ctx.moveTo(escalarT(segmento.tInicio), margen.superior + altoGrafico);
    ctx.lineTo(escalarT(segmento.tInicio), escalarQ(segmento.QInicio));
    ctx.lineTo(escalarT(segmento.tFin), escalarQ(segmento.QFin));
    ctx.lineTo(escalarT(segmento.tFin), margen.superior + altoGrafico);
    ctx.closePath();
    ctx.fill();
  });

  if (segmentoAisladoIndice === null) {
    ctx.strokeStyle = colorPrimario;
    ctx.lineWidth = 2;
    ctx.beginPath();
    puntos.forEach((punto, indice) => {
      const x = escalarT(punto.t);
      const y = escalarQ(punto.Q);
      if (indice === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  } else {
    resultado.segmentos.forEach((segmento, indice) => {
      const atenuado = indice !== segmentoAisladoIndice;
      ctx.strokeStyle = atenuado ? colorPrimario + '33' : colorPrimario;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(escalarT(segmento.tInicio), escalarQ(segmento.QInicio));
      ctx.lineTo(escalarT(segmento.tFin), escalarQ(segmento.QFin));
      ctx.stroke();
    });
  }

  ctx.fillStyle = colorPrimario;
  for (const punto of puntos) {
    ctx.beginPath();
    ctx.arc(escalarT(punto.t), escalarQ(punto.Q), 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  const puntoRastreo = estadoInteraccionActual ? estadoInteraccionActual.puntoRastreo : null;
  if (puntoRastreo) {
    const x = escalarT(puntoRastreo.t);
    const y = escalarQ(puntoRastreo.Q);

    ctx.strokeStyle = colorTexto;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, margen.superior);
    ctx.lineTo(x, margen.superior + altoGrafico);
    ctx.stroke();

    ctx.fillStyle = colorPrimario;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = colorTexto;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function mensajeVerificacionFallida(diferencia) {
  return 'VERIFICACIÓN FALLIDA: la diferencia entre el método de integral definida y el método del '
    + `trapecio (${formatearNumero(diferencia, 2)} m³) supera la tolerancia permitida (0.01 m³).`;
}

function generarBloqueSegmento(segmento) {
  const deltaT = segmento.tFin - segmento.tInicio;
  const esVerificado = segmento.estadoVerificacion === 'VERIFICADO';
  const claseEstado = esVerificado ? 'estado-verificado' : 'estado-fallido';
  const simboloEstado = esVerificado ? '✓' : '✕';
  const textoEstado = esVerificado ? 'VERIFICADO' : mensajeVerificacionFallida(segmento.diferencia);

  return `
    <article class="bloque-segmento">
      <h4>Segmento [${formatearNumero(segmento.tInicio, 0)} h, ${formatearNumero(segmento.tFin, 0)} h]</h4>
      <p class="formula-funcion">
        f(t) = Q<sub>inicio</sub> + m · (t − t<sub>inicio</sub>)<br>
        f(t) = ${formatearNumero(segmento.QInicio, 2)} + ${formatearNumero(segmento.pendiente, 6)}
        · (t − ${formatearNumero(segmento.tInicio, 0)})
      </p>
      <p class="formula-volumen">
        <strong>Integral definida</strong><br>
        V = 3600 · [ Q<sub>inicio</sub> · Δt + m · Δt<sup>2</sup> / 2 ]<br>
        V = 3600 · [ ${formatearNumero(segmento.QInicio, 2)} · ${formatearNumero(deltaT, 0)}
        + ${formatearNumero(segmento.pendiente, 6)} · ${formatearNumero(deltaT, 0)}<sup>2</sup> / 2 ]<br>
        V = <strong>${formatearNumero(segmento.volumenIntegral, 2)} m³</strong>
      </p>
      <p class="formula-trapecio">
        <strong>Método del trapecio</strong><br>
        V = 3600 · ( (Q<sub>inicio</sub> + Q<sub>fin</sub>) / 2 ) · Δt<br>
        V = 3600 · ( (${formatearNumero(segmento.QInicio, 2)} + ${formatearNumero(segmento.QFin, 2)}) / 2 )
        · ${formatearNumero(deltaT, 0)}<br>
        V = <strong>${formatearNumero(segmento.volumenTrapecio, 2)} m³</strong>
      </p>
      <p class="verificacion-segmento">
        Diferencia absoluta: ${formatearNumero(segmento.diferencia, 2)} m³<br>
        <span class="estado-badge ${claseEstado}">${simboloEstado} ${textoEstado}</span>
      </p>
    </article>
  `;
}

function generarResumen(resultado) {
  if (resultado.modo !== 'periodo_completo') {
    return '';
  }

  if (resultado.estadoGlobal === 'VERIFICADO') {
    return `
      <div class="resumen-total">
        <p>Volumen total (integral definida): <strong>${formatearNumero(resultado.volumenTotalIntegral, 2)} m³</strong></p>
        <p>Volumen total (trapecio): <strong>${formatearNumero(resultado.volumenTotalTrapecio, 2)} m³</strong></p>
        <p>Diferencia total: ${formatearNumero(resultado.diferenciaTotal, 2)} m³</p>
        <p><span class="estado-badge estado-verificado">✓ VERIFICADO</span></p>
      </div>
    `;
  }

  const segmentoFallido = resultado.segmentos[resultado.segmentoFallidoIndice];

  return `
    <div class="resumen-total">
      <p><span class="estado-badge estado-fallido">✕ VERIFICACIÓN FALLIDA</span></p>
      <p>Segmento afectado: [${formatearNumero(segmentoFallido.tInicio, 0)} h, ${formatearNumero(segmentoFallido.tFin, 0)} h]</p>
      <p>${mensajeVerificacionFallida(segmentoFallido.diferencia)}</p>
      <p>No se calcula el volumen total del periodo completo mientras este segmento no supere la verificación.</p>
    </div>
  `;
}

function generarResumenSegmentoAislado(segmento) {
  const caudalPromedio = (segmento.QInicio + segmento.QFin) / 2;

  return `
    <div class="resumen-total resumen-segmento-aislado">
      <p>Segmento aislado: [${formatearNumero(segmento.tInicio, 0)} h, ${formatearNumero(segmento.tFin, 0)} h]</p>
      <p>Volumen parcial: <strong>${formatearNumero(segmento.volumenIntegral, 2)} m³</strong></p>
      <p>Caudal promedio local: <strong>${formatearNumero(caudalPromedio, 2)} m³/s</strong></p>
      <p>Pendiente m: <strong>${formatearNumero(segmento.pendiente, 6)} m³/s por hora</strong></p>
    </div>
  `;
}

function actualizarLecturaRastreo(estadoInteraccionActual) {
  const contenedor = document.getElementById('lectura-rastreo');
  if (!contenedor) {
    return;
  }

  const puntoRastreo = estadoInteraccionActual ? estadoInteraccionActual.puntoRastreo : null;
  if (!puntoRastreo || !resultadoActual) {
    contenedor.textContent = '';
    contenedor.hidden = true;
    return;
  }

  const segmento = resultadoActual.segmentos[puntoRastreo.segmentoIndice];
  contenedor.hidden = false;
  contenedor.textContent = `t = ${formatearNumero(puntoRastreo.t, 2)} h · Q = ${formatearNumero(puntoRastreo.Q, 2)} m³/s`
    + ` · Segmento [${formatearNumero(segmento.tInicio, 0)} h, ${formatearNumero(segmento.tFin, 0)} h]`;
}

function actualizarInterfaz(resultado, estadoInteraccionActual) {
  const segmentoAisladoIndice = estadoInteraccionActual ? estadoInteraccionActual.segmentoAisladoIndice : null;

  document.getElementById('resumen-resultado').innerHTML = segmentoAisladoIndice !== null
    ? generarResumenSegmentoAislado(resultado.segmentos[segmentoAisladoIndice])
    : generarResumen(resultado);

  if (resultado !== ultimoResultadoProcedimiento) {
    document.getElementById('bloques-procedimiento').innerHTML = resultado.segmentos
      .map(generarBloqueSegmento)
      .join('');
    ultimoResultadoProcedimiento = resultado;
  }

  actualizarLecturaRastreo(estadoInteraccionActual);

  if (ctxLienzo) {
    actualizarGrafica(ctxLienzo, resultado, estadoInteraccionActual);
  }
}

function renderizarResultado(modo) {
  try {
    const resultado = calcularPeriodo(DATOS_ORIGINALES, modo);
    resultadoActual = resultado;
    mostrarOcultarLeyendaSegmentos(resultado.modo);
    actualizarInterfaz(resultado, estadoInteraccion);
  } catch (error) {
    resultadoActual = null;
    document.getElementById('resumen-resultado').innerHTML = `<p class="mensaje-error">${error.message}</p>`;
    document.getElementById('bloques-procedimiento').innerHTML = '';
  }
}

function manejarCambioModo(evento) {
  estadoInteraccion.segmentoAisladoIndice = null;
  estadoInteraccion.puntoRastreo = null;
  actualizarBotonesLeyenda();
  renderizarResultado(evento.target.value);
}

function configurarControlesIntervalo() {
  const radios = document.querySelectorAll('input[name="modo-intervalo"]');
  radios.forEach((radio) => radio.addEventListener('change', manejarCambioModo));
}

// ===== TEMA =====

const CLAVE_TEMA_ALMACENADO = 'hidrolab-tema';

function detectarPreferenciaSistema() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

function leerTemaGuardado() {
  try {
    const valor = localStorage.getItem(CLAVE_TEMA_ALMACENADO);
    return valor === 'claro' || valor === 'oscuro' ? valor : null;
  } catch (error) {
    return null;
  }
}

function guardarTemaElegido(tema) {
  try {
    localStorage.setItem(CLAVE_TEMA_ALMACENADO, tema);
  } catch (error) {
    // localStorage no disponible (modo privado, cuota excedida, etc.): se degrada en silencio (Principio VII).
  }
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;

  const boton = document.getElementById('alternador-tema');
  if (!boton) {
    return;
  }

  const esOscuro = tema === 'oscuro';
  boton.setAttribute('aria-pressed', String(esOscuro));

  const icono = boton.querySelector('.alternador-tema-icono');
  const texto = boton.querySelector('.alternador-tema-texto');
  if (icono) {
    icono.textContent = esOscuro ? '☀️' : '🌙';
  }
  if (texto) {
    texto.textContent = esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
  }
}

function alternarTema() {
  const temaActual = document.documentElement.dataset.tema === 'oscuro' ? 'oscuro' : 'claro';
  const temaNuevo = temaActual === 'oscuro' ? 'claro' : 'oscuro';
  aplicarTema(temaNuevo);
  guardarTemaElegido(temaNuevo);
}

function inicializarTema() {
  const temaGuardado = leerTemaGuardado();
  if (temaGuardado !== null) {
    aplicarTema(temaGuardado);
    return;
  }

  aplicarTema(detectarPreferenciaSistema());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (leerTemaGuardado() === null) {
      aplicarTema(detectarPreferenciaSistema());
    }
  });
}

function configurarAlternadorTema() {
  const boton = document.getElementById('alternador-tema');
  if (boton) {
    boton.addEventListener('click', alternarTema);
  }
}

// ===== AISLAMIENTO DE SEGMENTO =====

function actualizarBotonesLeyenda() {
  const botones = document.querySelectorAll('.boton-segmento');
  botones.forEach((boton) => {
    const indice = Number(boton.dataset.segmentoIndice);
    boton.setAttribute('aria-pressed', String(indice === estadoInteraccion.segmentoAisladoIndice));
  });
}

function aislarSegmento(indice) {
  if (estadoInteraccion.segmentoAisladoIndice === indice) {
    limpiarSeleccionSegmento();
    return;
  }

  estadoInteraccion.segmentoAisladoIndice = indice;
  actualizarBotonesLeyenda();
  actualizarInterfaz(resultadoActual, estadoInteraccion);
}

function limpiarSeleccionSegmento() {
  estadoInteraccion.segmentoAisladoIndice = null;
  actualizarBotonesLeyenda();
  actualizarInterfaz(resultadoActual, estadoInteraccion);
}

function mostrarOcultarLeyendaSegmentos(modo) {
  const seccion = document.getElementById('seccion-segmentos');
  if (seccion) {
    seccion.hidden = modo !== 'periodo_completo';
  }
}

function configurarLeyendaSegmentos() {
  const botones = document.querySelectorAll('.boton-segmento');
  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      aislarSegmento(Number(boton.dataset.segmentoIndice));
    });
  });

  const botonMostrarTodo = document.getElementById('boton-mostrar-todo');
  if (botonMostrarTodo) {
    botonMostrarTodo.addEventListener('click', limpiarSeleccionSegmento);
  }
}

// ===== RASTREO CONTINUO =====

const UMBRAL_ARRASTRE_TACTIL_PX = 8;
let inicioPunteroTactil = null;
let arrastreTactilActivo = false;

function posicionAInstante(x, escalas) {
  return escalas.tMin + ((x - escalas.margen.izquierda) / escalas.anchoGrafico) * (escalas.tMax - escalas.tMin);
}

function obtenerSegmentoEnPosicion(x, canvas) {
  if (!resultadoActual) {
    return null;
  }

  const escalas = calcularEscalasGrafico(canvas.clientWidth, canvas.clientHeight, resultadoActual);
  const t = posicionAInstante(x, escalas);
  return interpolarCaudal(resultadoActual.segmentos, t);
}

function manejarMovimientoPuntero(evento) {
  if (!resultadoActual) {
    return;
  }

  const canvas = evento.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const x = evento.clientX - rect.left;
  const escalas = calcularEscalasGrafico(canvas.clientWidth, canvas.clientHeight, resultadoActual);
  const t = posicionAInstante(x, escalas);

  estadoInteraccion.puntoRastreo = (t < escalas.tMin || t > escalas.tMax)
    ? null
    : interpolarCaudal(resultadoActual.segmentos, t);

  actualizarInterfaz(resultadoActual, estadoInteraccion);
}

function manejarSalidaPuntero(evento) {
  if (evento.pointerType !== 'mouse') {
    return;
  }

  estadoInteraccion.puntoRastreo = null;
  actualizarInterfaz(resultadoActual, estadoInteraccion);
}

function manejarClicCanvas(evento) {
  if (!resultadoActual || resultadoActual.modo !== 'periodo_completo') {
    return;
  }

  const canvas = evento.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const punto = obtenerSegmentoEnPosicion(evento.clientX - rect.left, canvas);
  if (punto) {
    aislarSegmento(punto.segmentoIndice);
  }
}

function manejarPointerDown(evento) {
  if (evento.pointerType !== 'touch') {
    return;
  }

  evento.preventDefault();
  inicioPunteroTactil = { x: evento.clientX, y: evento.clientY };
  arrastreTactilActivo = false;
}

function manejarPointerMoveCanvas(evento) {
  if (evento.pointerType === 'mouse') {
    manejarMovimientoPuntero(evento);
    return;
  }

  if (evento.pointerType === 'touch' && inicioPunteroTactil) {
    const dx = evento.clientX - inicioPunteroTactil.x;
    const dy = evento.clientY - inicioPunteroTactil.y;
    if (!arrastreTactilActivo && Math.hypot(dx, dy) > UMBRAL_ARRASTRE_TACTIL_PX) {
      arrastreTactilActivo = true;
    }
    if (arrastreTactilActivo) {
      manejarMovimientoPuntero(evento);
    }
  }
}

function manejarPointerUp(evento) {
  if (evento.pointerType !== 'touch') {
    return;
  }

  if (!arrastreTactilActivo && inicioPunteroTactil) {
    const canvas = evento.currentTarget;
    const rect = canvas.getBoundingClientRect();
    if (resultadoActual && resultadoActual.modo === 'periodo_completo') {
      const punto = obtenerSegmentoEnPosicion(inicioPunteroTactil.x - rect.left, canvas);
      if (punto) {
        aislarSegmento(punto.segmentoIndice);
      }
    }
  } else if (arrastreTactilActivo) {
    estadoInteraccion.puntoRastreo = null;
    actualizarInterfaz(resultadoActual, estadoInteraccion);
  }

  inicioPunteroTactil = null;
  arrastreTactilActivo = false;
}

function manejarPointerCancel() {
  inicioPunteroTactil = null;
  arrastreTactilActivo = false;
  estadoInteraccion.puntoRastreo = null;
  actualizarInterfaz(resultadoActual, estadoInteraccion);
}

function configurarRastreoPuntero() {
  const canvas = document.getElementById('grafico');
  if (!canvas) {
    return;
  }

  canvas.addEventListener('pointermove', manejarPointerMoveCanvas);
  canvas.addEventListener('pointerleave', manejarSalidaPuntero);
  canvas.addEventListener('pointerout', manejarSalidaPuntero);
  canvas.addEventListener('pointerdown', manejarPointerDown);
  canvas.addEventListener('pointerup', manejarPointerUp);
  canvas.addEventListener('pointercancel', manejarPointerCancel);
  canvas.addEventListener('click', manejarClicCanvas);
}

function inicializarAplicacion() {
  inicializarTema();
  configurarAlternadorTema();
  poblarTablaAccesible(DATOS_ORIGINALES);
  ctxLienzo = prepararLienzo();
  configurarControlesIntervalo();
  configurarLeyendaSegmentos();
  if (ctxLienzo) {
    configurarRastreoPuntero();
  }
  renderizarResultado('primer_intervalo');
}

document.addEventListener('DOMContentLoaded', inicializarAplicacion);
```

## styles.css

```css
/* Reset CSS mínimo */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

img,
canvas,
svg {
  display: block;
  max-width: 100%;
}

/* Variables de diseño (paleta y tipografía) */
:root {
  /* Contraste de texto verificado ≥ 4.5:1 sobre --color-fondo */
  --color-fondo: #ffffff;
  --color-superficie: #f4f6f8;
  --color-texto: #1a1a1a;
  --color-texto-secundario: #3d3d3d;
  --color-borde: #6b7280;

  /* Contraste de elementos gráficos verificado ≥ 3:1 sobre --color-fondo */
  --color-primario: #0b4f8a;
  --color-primario-claro: #4d8bc9;
  --color-exito: #1e6b34;
  --color-error: #a4211e;

  --fuente-base: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --tamano-base: 1rem;
  --interlineado-base: 1.5;
}

/* Tema oscuro (User Story 3) — mismas variables, mismo criterio de contraste ya
   verificado para el tema claro (≥4.5:1 texto, ≥3:1 elementos gráficos), R17 */
:root[data-tema="oscuro"] {
  --color-fondo: #121212;
  --color-superficie: #1e1e1e;
  --color-texto: #e8eaed;
  --color-texto-secundario: #b0b6bd;
  --color-borde: #8a9099;

  --color-primario: #8ab4f8;
  --color-primario-claro: #669df6;
  --color-exito: #81c995;
  --color-error: #f28b82;
}

html {
  font-size: 100%;
}

body {
  font-family: var(--fuente-base);
  font-size: var(--tamano-base);
  line-height: var(--interlineado-base);
  color: var(--color-texto);
  background-color: var(--color-fondo);
}

/* Layout mobile-first — breakpoint único en 768px (FR-010, R6) */
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--color-superficie);
  border-bottom: 1px solid var(--color-borde);
}

/* Alternador de tema (User Story 3) */
#alternador-tema {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-borde);
  border-radius: 0.25rem;
  background-color: var(--color-fondo);
  color: var(--color-texto);
  font: inherit;
  cursor: pointer;
}

#alternador-tema:focus-visible {
  outline: 3px solid var(--color-primario);
  outline-offset: 2px;
}

#alternador-tema[aria-pressed="true"] {
  border-color: var(--color-primario);
  background-color: var(--color-superficie);
  font-weight: bold;
}

/* Lectura continua de rastreo (User Story 1) */
#lectura-rastreo {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 0.25rem;
  color: var(--color-texto);
  font-variant-numeric: tabular-nums;
}

/* Leyenda de aislamiento de segmento (User Story 2) */
#leyenda-segmentos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.boton-segmento,
#boton-mostrar-todo {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-borde);
  border-radius: 0.25rem;
  background-color: var(--color-fondo);
  color: var(--color-texto);
  font: inherit;
  cursor: pointer;
}

.boton-segmento:focus-visible,
#boton-mostrar-todo:focus-visible {
  outline: 3px solid var(--color-primario);
  outline-offset: 2px;
}

.boton-segmento[aria-pressed="true"] {
  border-color: var(--color-primario);
  background-color: var(--color-primario);
  color: var(--color-fondo);
  font-weight: bold;
}

main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin-inline: auto;
}

.contenedor-grafico {
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: var(--color-superficie);
  border: 1px solid var(--color-borde);
}

#grafico {
  width: 100%;
  height: 100%;
  touch-action: none;
}

#tabla-datos {
  width: 100%;
  margin-top: 1rem;
  border-collapse: collapse;
}

#tabla-datos th,
#tabla-datos td {
  border: 1px solid var(--color-borde);
  padding: 0.5rem;
  text-align: right;
}

/* Controles de selección de intervalo (T023) */
#controles-intervalo {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.opcion-intervalo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-borde);
  border-radius: 0.25rem;
  cursor: pointer;
}

.opcion-intervalo:has(input:checked) {
  border-color: var(--color-primario);
  background-color: var(--color-superficie);
}

.opcion-intervalo input:focus-visible {
  outline: 3px solid var(--color-primario);
  outline-offset: 2px;
}

/* Panel de resultados — primer intervalo (T017) */
#panel-resultados {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resumen-total {
  padding: 1rem;
  background-color: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 0.25rem;
}

.mensaje-error {
  padding: 1rem;
  border: 1px solid var(--color-error);
  border-radius: 0.25rem;
  color: var(--color-error);
}

/* Estado de verificación — color + indicador textual/de forma (WCAG 2.1 AA) */
.estado-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 0.25rem;
  font-weight: bold;
}

.estado-badge.estado-verificado {
  color: var(--color-exito);
  border: 1px solid var(--color-exito);
}

.estado-badge.estado-fallido {
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

/* Procedimiento Matemático (T027) */
#seccion-procedimiento h3 {
  margin-bottom: 0.75rem;
  color: var(--color-texto);
}

#bloques-procedimiento {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bloque-segmento {
  padding: 1rem;
  background-color: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 0.25rem;
}

.bloque-segmento h4 {
  margin-bottom: 0.5rem;
  color: var(--color-texto);
}

.bloque-segmento p {
  margin-bottom: 0.5rem;
}

.formula-funcion,
.formula-volumen,
.formula-trapecio {
  font-family: "Cambria Math", Cambria, Georgia, serif;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-texto-secundario);
  word-break: break-word;
}

.formula-volumen strong,
.formula-trapecio strong,
.verificacion-segmento strong {
  color: var(--color-primario);
}

.verificacion-segmento {
  font-size: 1rem;
  color: var(--color-texto);
}

/* Desde 768px: dos columnas — gráfico + panel de controles/resultados */
@media (min-width: 768px) {
  main {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    grid-template-areas:
      "grafico controles"
      "grafico segmentos"
      "grafico resultados";
    align-items: start;
  }

  #seccion-grafico {
    grid-area: grafico;
  }

  #seccion-controles {
    grid-area: controles;
  }

  #seccion-segmentos {
    grid-area: segmentos;
  }

  #seccion-resultados {
    grid-area: resultados;
  }
}
```

