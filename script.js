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

/* ==========================================================================
   INTERFAZ (Canvas + DOM — consume el motor matemático, sin lógica propia)
   ========================================================================== */

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

poblarTablaAccesible(DATOS_ORIGINALES);
prepararLienzo();
