// review.js · repaso por rondas.
//
// Una RONDA es una pasada por las tarjetas elegidas, en orden aleatorio.
// Las tarjetas que no supiste a la primera en la ronda anterior van primero.
// Al calificar una tarjeta:
//   "La sé"    → sale de la ronda.
//   "Dudo"     → vuelve al final de la ronda.
//   "No la sé" → vuelve 3 tarjetas más adelante (si quedan menos de 3, al final).
// La ronda termina sola cuando la cola queda vacía.
//
// La ronda en curso vive en state.repaso:
//   { materiaSel, elegidaAMano, ronda, cola, vistas, saben, primerIntento, revelada, fin }
//   materiaSel    'todas' o el id de una materia
//   elegidaAMano  ¿la persona usó el selector "Materia a repasar"?
//   cola          ids de las tarjetas que faltan; la primera es la que se ve ahora
//   vistas        ids que ya se mostraron en esta ronda (para contar "por ver")
//   saben         ids que ya salieron con "La sé"
//   primerIntento lo que se contestó la primera vez que apareció cada tarjeta ('si' | 'dudo' | 'no')
//   revelada      ¿ya se mostró la respuesta de la tarjeta actual?
//   fin           ¿terminó la ronda?

var POSICIONES_NO_LA_SE = 3; // "No la sé" vuelve 3 tarjetas más adelante

// Elementos del repaso (se buscan una vez en iniciarRepaso)
var rpVacio, rpCuerpo, rpRonda, rpSelect, rpPos, rpJuego, rpSegs, rpCuenta;
var rpPillMateria, rpPillRespuesta, rpPregunta, rpRespuesta, rpAcciones, rpFin, rpFinTitulo, rpFinTexto;
var firmaOpcionesRepaso = '';

// ============================================================
// Lógica de la ronda
// ============================================================

// Mezcla una lista (Fisher-Yates): devuelve una copia en orden aleatorio.
function barajar(lista) {
  var copia = lista.slice();
  for (var i = copia.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var guardada = copia[i];
    copia[i] = copia[j];
    copia[j] = guardada;
  }
  return copia;
}

function tarjetaPorId(id) {
  for (var i = 0; i < state.tarjetas.length; i++) {
    if (state.tarjetas[i].id === id) return state.tarjetas[i];
  }
  return null;
}

// Ids de las tarjetas que entran al repaso según la materia elegida.
function idsDeSeleccion() {
  var r = state.repaso;
  return state.tarjetas.filter(function (t) {
    return r.materiaSel === 'todas' || t.materiaId === r.materiaSel;
  }).map(function (t) { return t.id; });
}

// Prepara una ronda nueva. "prioritarias" son las tarjetas que deben salir primero.
function iniciarRonda(prioritarias) {
  var r = state.repaso;
  var ids = idsDeSeleccion();
  var primero = barajar(ids.filter(function (id) { return prioritarias.indexOf(id) >= 0; }));
  var resto = barajar(ids.filter(function (id) { return prioritarias.indexOf(id) < 0; }));
  r.cola = primero.concat(resto);
  r.vistas = {};
  r.saben = {};
  r.primerIntento = {};
  r.revelada = false;
  r.fin = false;
  if (r.cola.length) r.vistas[r.cola[0]] = true;
}

// Califica la tarjeta actual: valor = 'si' | 'dudo' | 'no'.
function calificar(valor) {
  var r = state.repaso;
  if (!r || r.fin || !r.revelada || r.cola.length === 0) return;
  var id = r.cola.shift();
  if (!r.primerIntento[id]) r.primerIntento[id] = valor;

  if (valor === 'si') {
    r.saben[id] = true;
  } else if (valor === 'dudo') {
    r.cola.push(id); // al final de la ronda
  } else {
    // 3 tarjetas más adelante; si quedan menos de 3, al final
    r.cola.splice(Math.min(POSICIONES_NO_LA_SE, r.cola.length), 0, id);
  }

  r.revelada = false;
  if (r.cola.length === 0) r.fin = true;
  else r.vistas[r.cola[0]] = true;

  renderRepaso();
  // El foco sigue el flujo: a la próxima tarjeta o al mensaje de fin de ronda.
  if (r.fin) rpFinTitulo.focus();
  else document.getElementById('repaso-mostrar').focus();
}

// Muestra la respuesta de la tarjeta actual.
function mostrarRespuesta() {
  var r = state.repaso;
  if (!r || r.fin || r.revelada || r.cola.length === 0) return;
  r.revelada = true;
  renderRepaso();
  rpRespuesta.focus(); // así el lector de pantalla lee la respuesta
}

// Empieza otra ronda con la misma materia; las que no supiste a la primera salen primero.
function otraRonda() {
  var r = state.repaso;
  var fallaron = Object.keys(r.primerIntento).filter(function (id) { return r.primerIntento[id] !== 'si'; });
  r.ronda++;
  iniciarRonda(fallaron);
  renderRepaso();
  var boton = document.getElementById('repaso-mostrar');
  if (boton) boton.focus();
}

// Cambió la materia a repasar: se empieza de cero.
function cambiarMateriaRepaso() {
  var r = state.repaso;
  r.materiaSel = rpSelect.value;
  r.elegidaAMano = true;
  r.ronda = 1;
  iniciarRonda([]);
  renderRepaso();
}

// Al abrir la pestaña Repaso se arma la ronda con las tarjetas que existan en ese momento.
// Si ya hay calificaciones en la ronda, se continúa donde se quedó (las tarjetas nuevas entran en la próxima ronda).
function entrarARepaso() {
  if (!state.repaso) {
    state.repaso = { materiaSel: 'todas', elegidaAMano: false, ronda: 1, cola: [], vistas: {}, saben: {}, primerIntento: {}, revelada: false, fin: false };
  }
  var r = state.repaso;
  var sinProgreso = Object.keys(r.primerIntento).length === 0 && !r.fin;
  if (sinProgreso) {
    // Mientras no se haya tocado el selector, el repaso sigue la materia elegida en los chips.
    if (!r.elegidaAMano) r.materiaSel = state.materiaActiva === null ? 'todas' : state.materiaActiva;
    iniciarRonda([]);
  }
}

// Si se borraron tarjetas mientras la ronda seguía abierta, se quitan de la cola.
function purgarRepaso() {
  var r = state.repaso;
  var existe = function (id) { return tarjetaPorId(id) !== null; };
  var actualAntes = r.cola[0];
  r.cola = r.cola.filter(existe);
  [r.saben, r.vistas, r.primerIntento].forEach(function (mapa) {
    Object.keys(mapa).forEach(function (id) { if (!existe(id)) delete mapa[id]; });
  });
  if (r.cola[0] !== actualAntes) {
    r.revelada = false;
    if (r.cola.length) r.vistas[r.cola[0]] = true;
  }
  if (!r.fin && r.cola.length === 0 && Object.keys(r.saben).length > 0) r.fin = true;
}

// ============================================================
// Dibujo
// ============================================================
var ICONOS_REPASO = {
  si: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
  dudo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4M12 18h.01"/></svg>',
  no: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  ojo: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
};

// Vuelve a dibujar el repaso con lo que haya en state.repaso.
function renderRepaso() {
  var r = state.repaso;
  if (!r) return;
  purgarRepaso();

  var disponibles = idsDeSeleccion().length;
  // La ronda solo arranca estando en la pestaña Repaso (no mientras se crean tarjetas en otra pestaña).
  if (!r.fin && r.cola.length === 0 && disponibles > 0 && state.pestana === 'repaso') iniciarRonda([]);

  var hayTarjetas = state.tarjetas.length > 0;
  var sinNadaQueRepasar = !r.fin && r.cola.length === 0;
  rpVacio.hidden = !sinNadaQueRepasar;
  rpCuerpo.hidden = !hayTarjetas;
  rpJuego.hidden = sinNadaQueRepasar || r.fin;
  rpFin.hidden = !r.fin;

  if (hayTarjetas) {
    renderSelectorRepaso();
    rpRonda.textContent = 'Ronda ' + r.ronda;
  }
  if (!rpJuego.hidden) renderTarjetaRepaso();
  if (r.fin) renderFinRepaso();
  rpPos.hidden = rpJuego.hidden;

  actualizarCactusDelReloj();
}

// Selector "Materia a repasar": cada materia y al final "Todas las materias".
function renderSelectorRepaso() {
  var r = state.repaso;
  var firma = state.materias.map(function (m) { return m.id + ':' + m.nombre; }).join('|');
  if (firma !== firmaOpcionesRepaso) { // solo se reconstruye si cambiaron las materias (así no pierde el foco)
    rpSelect.textContent = '';
    state.materias.forEach(function (m) {
      var opcion = el('option', '', m.nombre);
      opcion.value = m.id;
      rpSelect.appendChild(opcion);
    });
    var todas = el('option', '', 'Todas las materias');
    todas.value = 'todas';
    rpSelect.appendChild(todas);
    firmaOpcionesRepaso = firma;
  }
  rpSelect.value = r.materiaSel;
}

function renderTarjetaRepaso() {
  var r = state.repaso;
  var tarjeta = tarjetaPorId(r.cola[0]);
  var materia = materiaPorId(tarjeta.materiaId);

  // Conteos: sé = ya salieron; volverán = vistas que siguen en la cola; por ver = nunca vistas
  var enEspera = r.cola.slice(1);
  var saben = Object.keys(r.saben).length;
  var volveran = enEspera.filter(function (id) { return r.vistas[id]; }).length;
  var porVer = enEspera.length - volveran;
  var total = saben + r.cola.length;
  var vistasCount = saben + volveran + 1;

  rpPos.textContent = 'Tarjeta ' + vistasCount + ' de ' + total;
  rpCuenta.textContent = saben + ' la sé · ' + volveran + ' volverá' + (volveran === 1 ? '' : 'n') + ' a salir · ' + porVer + ' por ver';
  rpSegs.setAttribute('aria-label', 'Progreso de la ronda: ' + saben + ' que sé, ' + volveran + ' que volverán, tarjeta ' +
    vistasCount + ' en curso, ' + porVer + ' por ver');
  dibujarSegmentos(saben, volveran, porVer, total);

  rpPillMateria.textContent = materia ? materia.nombre : '';
  rpPillRespuesta.hidden = !r.revelada;
  rpPregunta.textContent = tarjeta.pregunta;
  rpPregunta.classList.toggle('chica', r.revelada);
  rpRespuesta.hidden = !r.revelada;
  rpRespuesta.textContent = r.revelada ? tarjeta.respuesta : '';

  rpAcciones.innerHTML = r.revelada
    ? '<button class="rate si" type="button" data-nota="si">' + ICONOS_REPASO.si + 'La sé <kbd>1</kbd></button>' +
      '<button class="rate dudo" type="button" data-nota="dudo">' + ICONOS_REPASO.dudo + 'Dudo <kbd>2</kbd></button>' +
      '<button class="rate no" type="button" data-nota="no">' + ICONOS_REPASO.no + 'No la sé <kbd>3</kbd></button>'
    : '<button class="rate mostrar" id="repaso-mostrar" type="button">' + ICONOS_REPASO.ojo + 'Mostrar respuesta</button>';
}

// Barra de segmentos: sé (verde), volverán (rosa claro), la actual (oscuro), por ver (gris verdoso).
function dibujarSegmentos(saben, volveran, porVer, total) {
  rpSegs.textContent = '';
  rpSegs.style.gap = total <= 20 ? '6px' : (total <= 40 ? '3px' : '1px'); // con muchas tarjetas, segmentos más juntos
  var partes = [['si', saben], ['no', volveran], ['ahora', 1], ['', porVer]];
  partes.forEach(function (parte) {
    for (var i = 0; i < parte[1]; i++) rpSegs.appendChild(el('span', 'seg' + (parte[0] ? ' ' + parte[0] : '')));
  });
}

function renderFinRepaso() {
  var r = state.repaso;
  var total = Object.keys(r.saben).length;
  var dominadas = Object.keys(r.saben).filter(function (id) { return r.primerIntento[id] === 'si'; }).length;
  rpFinTexto.textContent = 'Dominaste ' + dominadas + ' de ' + total + ' ' + (total === 1 ? 'tarjeta' : 'tarjetas') + '. ' +
    (dominadas === total ? '¡Todas a la primera!' : 'Las que no supiste a la primera saldrán primero en la próxima ronda.');
}

// El cactus grande es el del cronómetro: celebra mientras se ve el fin de la ronda.
function actualizarCactusDelReloj() {
  if (state.vista !== 'estudio' || state.fase !== 'estudio') return;
  var celebrar = state.pestana === 'repaso' && state.repaso && state.repaso.fin && !rpFin.hidden;
  cambiarCactus(cactusReloj.firstChild, celebrar ? 'celebra' : 'lentes');
}

// ============================================================
// Arranque
// ============================================================
function iniciarRepaso() {
  rpVacio = document.getElementById('repaso-vacio');
  rpCuerpo = document.getElementById('repaso-cuerpo');
  rpRonda = document.getElementById('repaso-ronda');
  rpSelect = document.getElementById('repaso-materia');
  rpPos = document.getElementById('repaso-pos');
  rpJuego = document.getElementById('repaso-juego');
  rpSegs = document.getElementById('repaso-segs');
  rpCuenta = document.getElementById('repaso-cuenta');
  rpPillMateria = document.getElementById('repaso-pill-materia');
  rpPillRespuesta = document.getElementById('repaso-pill-respuesta');
  rpPregunta = document.getElementById('repaso-pregunta');
  rpRespuesta = document.getElementById('repaso-respuesta');
  rpAcciones = document.getElementById('repaso-acciones');
  rpFin = document.getElementById('repaso-fin');
  rpFinTitulo = document.getElementById('repaso-fin-titulo');
  rpFinTexto = document.getElementById('repaso-fin-texto');

  rpSelect.addEventListener('change', cambiarMateriaRepaso);
  document.getElementById('repaso-otra').addEventListener('click', otraRonda);
  document.getElementById('repaso-volver').addEventListener('click', function () { seleccionarPestana('flashcards', true); });
  document.getElementById('repaso-ir-flash').addEventListener('click', function () { seleccionarPestana('flashcards', true); });

  // Los botones de calificar y "Mostrar respuesta" se crean al dibujar; un solo oyente los atiende a todos.
  rpAcciones.addEventListener('click', function (e) {
    var boton = e.target.closest('button');
    if (!boton) return;
    if (boton.id === 'repaso-mostrar') mostrarRespuesta();
    else if (boton.dataset.nota) calificar(boton.dataset.nota);
  });

  // Atajos 1, 2 y 3 (solo con la respuesta visible y sin escribir en un campo)
  document.addEventListener('keydown', function (e) {
    if (state.vista !== 'estudio' || state.pestana !== 'repaso') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.matches('input, textarea, select')) return;
    var nota = { '1': 'si', '2': 'dudo', '3': 'no' }[e.key];
    if (nota) calificar(nota);
  });
}
