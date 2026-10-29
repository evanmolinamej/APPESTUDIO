// app.js · navegación entre vistas y pantalla de Inicio.

// ---------- Límites de "Personalizado" (minutos enteros) ----------
var LIMITE_ESTUDIO = { min: 1, max: 180 };
var LIMITE_DESCANSO = { min: 1, max: 60 };

// Elementos de la página que se usan varias veces
var cactusInicio, cactusMini, botonEmpezar, resumen, tarjetasTecnica, tarjetaCustom;
var campoEstudio, campoDescanso, mensajeError, empezando = false;

// ---------- Vistas ----------
// Muestra una vista y oculta las demás. "enfocar" mueve el foco al título (ayuda al teclado y a lectores de pantalla).
function mostrarVista(nombre, enfocar) {
  state.vista = nombre;
  document.querySelectorAll('.vista').forEach(function (vista) {
    vista.hidden = vista.dataset.vista !== nombre;
  });
  if (enfocar) {
    var titulo = document.querySelector('.vista:not([hidden]) [tabindex="-1"]');
    if (titulo) titulo.focus();
  }
}

// ---------- Técnica elegida ----------
// Devuelve la técnica seleccionada. Si es Personalizado y los valores no sirven, "valida" es false.
function tecnicaElegida() {
  if (tarjetaCustom.classList.contains('on')) {
    var estudio = leerEntero(campoEstudio);
    var descanso = leerEntero(campoDescanso);
    var valida = esValido(estudio, LIMITE_ESTUDIO) && esValido(descanso, LIMITE_DESCANSO);
    return { nombre: 'Personalizado', estudioMin: estudio, descansoMin: descanso, valida: valida };
  }
  var tarjeta = document.querySelector('button.tec.on');
  return {
    nombre: tarjeta.dataset.nombre,
    estudioMin: Number(tarjeta.dataset.estudio),
    descansoMin: Number(tarjeta.dataset.descanso),
    valida: true
  };
}

// Lee un campo y devuelve un entero, o null si no es un entero (vacío, decimal, negativo, letras...).
function leerEntero(campo) {
  var texto = campo.value.trim();
  return /^\d+$/.test(texto) ? Number(texto) : null;
}

function esValido(numero, limite) {
  return numero !== null && numero >= limite.min && numero <= limite.max;
}

// ---------- Selección de tarjetas ----------
function seleccionarTarjeta(elegida) {
  tarjetasTecnica.forEach(function (t) {
    var activa = t === elegida;
    t.classList.toggle('on', activa);
    t.setAttribute('aria-pressed', String(activa));
  });
  var customActiva = elegida === tarjetaCustom;
  tarjetaCustom.classList.toggle('on', customActiva);
  document.getElementById('custom-boton').setAttribute('aria-pressed', String(customActiva));
  refrescarInicio();
}

// ---------- Validación y resumen ----------
function refrescarInicio() {
  var tecnica = tecnicaElegida();
  actualizarMensajeCustom();
  botonEmpezar.disabled = !tecnica.valida;
  if (tecnica.valida) {
    resumen.textContent = tecnica.nombre + ' ' + tecnica.estudioMin + '/' + tecnica.descansoMin +
      ' · ' + tecnica.estudioMin + ' min de estudio y ' + tecnica.descansoMin + ' de descanso';
  } else {
    resumen.textContent = 'Corrige los tiempos de Personalizado para empezar.';
  }
}

// Mensaje breve bajo los campos y barra de proporción de Personalizado.
function actualizarMensajeCustom() {
  var estudio = leerEntero(campoEstudio);
  var descanso = leerEntero(campoDescanso);
  var estudioOk = esValido(estudio, LIMITE_ESTUDIO);
  var descansoOk = esValido(descanso, LIMITE_DESCANSO);

  campoEstudio.setAttribute('aria-invalid', String(!estudioOk));
  campoDescanso.setAttribute('aria-invalid', String(!descansoOk));

  var problemas = [];
  if (!estudioOk) problemas.push('Estudio: un número entero de ' + LIMITE_ESTUDIO.min + ' a ' + LIMITE_ESTUDIO.max + '.');
  if (!descansoOk) problemas.push('Descanso: un número entero de ' + LIMITE_DESCANSO.min + ' a ' + LIMITE_DESCANSO.max + '.');

  // El mensaje solo se muestra si Personalizado es la técnica elegida.
  var mostrar = problemas.length > 0 && tarjetaCustom.classList.contains('on');
  mensajeError.hidden = !mostrar;
  mensajeError.textContent = mostrar ? problemas.join(' ') : '';

  if (estudioOk) document.getElementById('custom-barra-est').style.flex = String(estudio);
  if (descansoOk) document.getElementById('custom-barra-des').style.flex = String(descanso);
}

// ---------- Empezar ----------
function empezar() {
  var tecnica = tecnicaElegida();
  if (!tecnica.valida || empezando) return;
  empezando = true;
  state.tecnica = { nombre: tecnica.nombre, estudioMin: tecnica.estudioMin, descansoMin: tecnica.descansoMin };
  state.bloque = 1;
  state.fase = 'estudio';
  state.pausado = false;

  // El cactus se despierta; después de su fundido pasamos a la sesión.
  // (El sonido se activa aquí en la Fase 3.)
  cambiarCactus(cactusInicio.firstChild, 'lentes');
  setTimeout(function () {
    document.getElementById('datos-sesion').textContent = state.tecnica.nombre + ' · ' +
      state.tecnica.estudioMin + ' min de estudio · ' + state.tecnica.descansoMin + ' min de descanso · Bloque ' + state.bloque;
    mostrarVista('estudio', true);
    empezando = false;
  }, 450);
}

function volverAlInicio() {
  cambiarCactus(cactusInicio.firstChild, 'dormido');
  mostrarVista('inicio', true);
}

// ---------- Arranque ----------
function arrancar() {
  cactusMini = document.getElementById('cactus-mini');
  cactusMini.appendChild(crearCactus('lentes', 34));
  cactusInicio = document.getElementById('cactus-inicio');
  cactusInicio.appendChild(crearCactus('dormido', 168));

  botonEmpezar = document.getElementById('boton-empezar');
  resumen = document.getElementById('resumen');
  tarjetaCustom = document.getElementById('tec-custom');
  campoEstudio = document.getElementById('custom-estudio');
  campoDescanso = document.getElementById('custom-descanso');
  mensajeError = document.getElementById('custom-error');
  tarjetasTecnica = Array.prototype.slice.call(document.querySelectorAll('button.tec'));

  tarjetasTecnica.forEach(function (t) {
    t.addEventListener('click', function () { seleccionarTarjeta(t); });
  });

  // Personalizado se activa al pulsar su título, la tarjeta, o al escribir en sus campos.
  tarjetaCustom.addEventListener('click', function () { seleccionarTarjeta(tarjetaCustom); });
  [campoEstudio, campoDescanso].forEach(function (campo) {
    campo.addEventListener('focus', function () { seleccionarTarjeta(tarjetaCustom); });
    campo.addEventListener('input', refrescarInicio);
  });

  botonEmpezar.addEventListener('click', empezar);
  document.getElementById('boton-volver').addEventListener('click', volverAlInicio);

  refrescarInicio();
  mostrarVista('inicio', false);
}

arrancar();
