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

/* ==========================================================================
   INTERFAZ (Canvas + DOM — consume el motor matemático, sin lógica propia)
   ========================================================================== */

let ctxLienzo = null;

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

function actualizarGrafica(ctx, resultado) {
  const canvas = ctx.canvas;
  const ancho = canvas.clientWidth;
  const alto = canvas.clientHeight;

  ctx.clearRect(0, 0, ancho, alto);

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

  ctx.fillStyle = colorPrimarioClaro + '66';
  for (const segmento of resultado.segmentos) {
    ctx.beginPath();
    ctx.moveTo(escalarT(segmento.tInicio), margen.superior + altoGrafico);
    ctx.lineTo(escalarT(segmento.tInicio), escalarQ(segmento.QInicio));
    ctx.lineTo(escalarT(segmento.tFin), escalarQ(segmento.QFin));
    ctx.lineTo(escalarT(segmento.tFin), margen.superior + altoGrafico);
    ctx.closePath();
    ctx.fill();
  }

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

  ctx.fillStyle = colorPrimario;
  for (const punto of puntos) {
    ctx.beginPath();
    ctx.arc(escalarT(punto.t), escalarQ(punto.Q), 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function actualizarInterfaz(resultado) {
  const panelResultados = document.getElementById('panel-resultados');

  const bloquesSegmentos = resultado.segmentos.map((segmento) => {
    const deltaT = segmento.tFin - segmento.tInicio;

    return `
      <article class="bloque-segmento">
        <h3>Segmento [${formatearNumero(segmento.tInicio, 0)} h, ${formatearNumero(segmento.tFin, 0)} h]</h3>
        <p class="formula-volumen">
          V = 3600 · [ Q<sub>inicio</sub> · Δt + m · Δt<sup>2</sup> / 2 ]<br>
          V = 3600 · [ ${formatearNumero(segmento.QInicio, 2)} · ${formatearNumero(deltaT, 0)}
          + ${formatearNumero(segmento.pendiente, 6)} · ${formatearNumero(deltaT, 0)}<sup>2</sup> / 2 ]
        </p>
        <p class="volumen-segmento">Volumen (integral definida): <strong>${formatearNumero(segmento.volumenIntegral, 2)} m³</strong></p>
      </article>
    `;
  }).join('');

  panelResultados.innerHTML = bloquesSegmentos;

  if (ctxLienzo) {
    actualizarGrafica(ctxLienzo, resultado);
  }
}

function inicializarAplicacion() {
  poblarTablaAccesible(DATOS_ORIGINALES);
  ctxLienzo = prepararLienzo();

  try {
    const resultado = calcularPeriodo(DATOS_ORIGINALES, 'primer_intervalo');
    actualizarInterfaz(resultado);
  } catch (error) {
    const panelResultados = document.getElementById('panel-resultados');
    panelResultados.textContent = error.message;
  }
}

document.addEventListener('DOMContentLoaded', inicializarAplicacion);
