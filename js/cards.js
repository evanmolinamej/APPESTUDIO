// cards.js · materias, flashcards e (en la Fase 5) ideas clave.
// Todo vive en el objeto "state" (en memoria). Aquí están los datos y también el dibujo de las listas.
// El texto que escribe la persona se inserta con textContent (nunca como HTML) para que no pueda romper la página.

var contadorId = 0;
var tarjetasVolteadas = {};     // ids de las tarjetas que están mostrando la respuesta
var formMateriaAbierto = false; // el formulario "Nueva materia" ya existiendo materias
var avisoTemporizador = null;   // cuenta los ~5 s del aviso "Deshacer"
var TIEMPO_AVISO = 5000;        // milisegundos

// Dibujos pequeños (íconos) reutilizados
var ICONO_MAS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
var ICONO_VOLTEAR = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>';
var ICONO_BORRAR = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';

// Elementos del panel (se buscan una vez en iniciarCards)
var formMateria, campoMateria, mensajeMateria, botonCancelarMateria, etiquetaMateria;
var cajaNuevaTarjeta, etiquetaTarjetaMateria, campoPregunta, campoRespuesta, mensajeTarjeta;
var avisoElegirMateria, listaTarjetas, vacioTarjetas, textoVacioTarjetas;
var formIdea, campoIdea, contadorIdea, mensajeIdea, etiquetaIdea, avisoElegirIdeas, listaIdeas, vacioIdeas;
var avisoBreve, avisoTexto, avisoDeshacer, botonDescargar, botonDescargarFin;
var avisoSalidaActivo = false; // ¿está registrado el aviso del navegador al cerrar la pestaña?
var MAX_IDEA = 120; // caracteres

// ============================================================
// Ayudas
// ============================================================

// Crea un elemento: el("div", "clase", "texto")
function el(etiqueta, clases, texto) {
  var nodo = document.createElement(etiqueta);
  if (clases) nodo.className = clases;
  if (texto !== undefined) nodo.textContent = texto;
  return nodo;
}

function nuevoId(prefijo) {
  contadorId++;
  return prefijo + contadorId;
}

function materiaPorId(id) {
  for (var i = 0; i < state.materias.length; i++) {
    if (state.materias[i].id === id) return state.materias[i];
  }
  return null;
}

// ¿Hay algo que se perdería al salir? (lo usa la Fase 8)
function hayContenido() {
  return state.tarjetas.length > 0 || state.ideas.length > 0;
}

function mostrarMensaje(parrafo, texto) {
  parrafo.textContent = texto;
  parrafo.hidden = false;
}

function ocultarMensaje(parrafo) {
  parrafo.textContent = '';
  parrafo.hidden = true;
}

// ============================================================
// Materias
// ============================================================

// Crea una materia. Devuelve { materia } o { error }.
function crearMateria(nombre) {
  var limpio = nombre.trim().replace(/\s+/g, ' ');
  if (!limpio) return { error: 'Escribe el nombre de la materia.' };
  var repetida = state.materias.some(function (m) {
    return m.nombre.toLowerCase() === limpio.toLowerCase();
  });
  if (repetida) return { error: 'Ya tienes una materia con ese nombre.' };
  var materia = { id: nuevoId('m'), nombre: limpio };
  state.materias.push(materia);
  return { materia: materia };
}

function enviarMateria(evento) {
  evento.preventDefault();
  var resultado = crearMateria(campoMateria.value);
  if (resultado.error) {
    mostrarMensaje(mensajeMateria, resultado.error);
    campoMateria.setAttribute('aria-invalid', 'true');
    campoMateria.focus();
    return;
  }
  campoMateria.value = '';
  campoMateria.removeAttribute('aria-invalid');
  ocultarMensaje(mensajeMateria);
  state.materiaActiva = resultado.materia.id; // la materia nueva queda elegida
  formMateriaAbierto = false;
  renderPanel();
  enfocarCampoPrincipal();
}

function abrirFormMateria() {
  formMateriaAbierto = true;
  renderPanel();
  campoMateria.focus();
}

function cancelarFormMateria() {
  formMateriaAbierto = false;
  ocultarMensaje(mensajeMateria);
  campoMateria.value = '';
  renderPanel();
  var chipNuevo = document.querySelector('#panel-' + state.pestana + ' .chip.nuevo');
  if (chipNuevo) chipNuevo.focus();
}

function elegirMateria(id) {
  state.materiaActiva = id;
  renderPanel();
}

// Lleva el foco al campo donde se escribe en la pestaña activa.
function enfocarCampoPrincipal() {
  if (state.pestana === 'flashcards' && !cajaNuevaTarjeta.hidden) campoPregunta.focus();
  if (state.pestana === 'ideas' && !formIdea.hidden) campoIdea.focus();
}

// ============================================================
// Tarjetas
// ============================================================

// Las tarjetas que se ven según el chip elegido.
function tarjetasVisibles() {
  return state.tarjetas.filter(function (t) {
    return state.materiaActiva === null || t.materiaId === state.materiaActiva;
  });
}

function guardarTarjeta() {
  var pregunta = campoPregunta.value.trim();
  var respuesta = campoRespuesta.value.trim();
  if (!pregunta || !respuesta) {
    mostrarMensaje(mensajeTarjeta, 'Escribe la pregunta y la respuesta.');
    campoPregunta.setAttribute('aria-invalid', String(!pregunta));
    campoRespuesta.setAttribute('aria-invalid', String(!respuesta));
    (pregunta ? campoRespuesta : campoPregunta).focus();
    return;
  }
  state.tarjetas.push({ id: nuevoId('t'), materiaId: state.materiaActiva, pregunta: pregunta, respuesta: respuesta });
  campoPregunta.value = '';
  campoRespuesta.value = '';
  campoPregunta.removeAttribute('aria-invalid');
  campoRespuesta.removeAttribute('aria-invalid');
  ocultarMensaje(mensajeTarjeta);
  renderPanel();
  campoPregunta.focus();
}

// Borra una tarjeta y ofrece "Deshacer".
function borrarTarjeta(id) {
  var visibles = tarjetasVisibles().slice().reverse(); // el orden en que se ven (la más nueva arriba)
  var posicionVista = visibles.findIndex(function (t) { return t.id === id; });
  var indice = state.tarjetas.findIndex(function (t) { return t.id === id; });
  if (indice < 0) return;
  var tarjeta = state.tarjetas.splice(indice, 1)[0];
  delete tarjetasVolteadas[id];
  renderPanel();

  // El foco no debe perderse: va a la tarjeta vecina o, si no quedan, al campo de pregunta.
  var botones = listaTarjetas.querySelectorAll('.fc');
  if (botones.length) botones[Math.min(posicionVista, botones.length - 1)].focus();
  else if (!cajaNuevaTarjeta.hidden) campoPregunta.focus();

  mostrarAviso('Tarjeta borrada', function () {
    state.tarjetas.splice(indice, 0, tarjeta);
    renderPanel();
  });
}

// Arma una tarjeta que se voltea (frente: pregunta; reverso: respuesta).
function elementoTarjeta(tarjeta) {
  var materia = materiaPorId(tarjeta.materiaId);
  var envoltorio = el('div', 'fc-wrap');
  var boton = el('button', 'fc');
  boton.type = 'button';
  boton.dataset.id = tarjeta.id;

  var frente = el('span', 'fc-cara frente');
  frente.setAttribute('aria-hidden', 'true');
  frente.appendChild(el('span', 'pill', materia ? materia.nombre : ''));
  frente.appendChild(el('span', 'q', tarjeta.pregunta));
  frente.appendChild(pista('Toca para ver la respuesta'));

  var reverso = el('span', 'fc-cara reverso');
  reverso.setAttribute('aria-hidden', 'true');
  reverso.appendChild(el('span', 'pill dark', 'Respuesta'));
  reverso.appendChild(el('span', 'q', tarjeta.respuesta));
  reverso.appendChild(pista('Toca para ver la pregunta'));

  boton.appendChild(frente);
  boton.appendChild(reverso);
  ponerEstadoTarjeta(boton, tarjeta, !!tarjetasVolteadas[tarjeta.id]);
  boton.addEventListener('click', function () {
    var volteada = !tarjetasVolteadas[tarjeta.id];
    tarjetasVolteadas[tarjeta.id] = volteada;
    ponerEstadoTarjeta(boton, tarjeta, volteada);
  });

  var borrar = el('button', 'icon-btn');
  borrar.type = 'button';
  borrar.setAttribute('aria-label', 'Borrar tarjeta: ' + tarjeta.pregunta);
  borrar.innerHTML = ICONO_BORRAR;
  borrar.addEventListener('click', function () { borrarTarjeta(tarjeta.id); });

  envoltorio.appendChild(boton);
  envoltorio.appendChild(borrar);
  return envoltorio;
}

// "Toca para ver..." con su ícono
function pista(texto) {
  var nodo = el('span', 'hint');
  nodo.innerHTML = ICONO_VOLTEAR;
  nodo.appendChild(document.createTextNode(texto));
  return nodo;
}

// Gira la tarjeta y actualiza lo que lee el lector de pantalla.
function ponerEstadoTarjeta(boton, tarjeta, volteada) {
  boton.classList.toggle('volteada', volteada);
  boton.setAttribute('aria-label', volteada
    ? 'Respuesta: ' + tarjeta.respuesta + '. Pulsa para ver la pregunta.'
    : 'Pregunta: ' + tarjeta.pregunta + '. Pulsa para ver la respuesta.');
}

// ============================================================
// Ideas clave
// ============================================================

// Las ideas que se ven según el chip elegido.
function ideasVisibles() {
  return state.ideas.filter(function (idea) {
    return state.materiaActiva === null || idea.materiaId === state.materiaActiva;
  });
}

// Agrega una idea en la materia elegida (Enter o botón "Agregar").
function agregarIdea(evento) {
  evento.preventDefault();
  var texto = campoIdea.value.trim().replace(/\s+/g, ' ');
  if (!texto) {
    mostrarMensaje(mensajeIdea, 'Escribe una idea antes de agregarla.');
    campoIdea.setAttribute('aria-invalid', 'true');
    campoIdea.focus();
    return;
  }
  state.ideas.push({ id: nuevoId('i'), materiaId: state.materiaActiva, texto: texto.slice(0, MAX_IDEA) });
  campoIdea.value = '';
  campoIdea.removeAttribute('aria-invalid');
  ocultarMensaje(mensajeIdea);
  actualizarContadorIdea();
  renderPanel();
  campoIdea.focus();
}

// "0 / 120": se actualiza con cada letra.
function actualizarContadorIdea() {
  contadorIdea.textContent = campoIdea.value.length + ' / ' + MAX_IDEA;
}

// Borra una idea y ofrece "Deshacer".
function borrarIdea(id) {
  var visibles = ideasVisibles().slice().reverse(); // el orden en que se ven
  var posicionVista = visibles.findIndex(function (i) { return i.id === id; });
  var indice = state.ideas.findIndex(function (i) { return i.id === id; });
  if (indice < 0) return;
  var idea = state.ideas.splice(indice, 1)[0];
  renderPanel();

  var botones = listaIdeas.querySelectorAll('.icon-btn');
  if (botones.length) botones[Math.min(posicionVista, botones.length - 1)].focus();
  else if (!formIdea.hidden) campoIdea.focus();

  mostrarAviso('Idea borrada', function () {
    state.ideas.splice(indice, 0, idea);
    renderPanel();
  });
}

// Una idea de la lista: punto verde, texto y botón de borrar.
function elementoIdea(idea) {
  var item = el('li', 'idea');
  item.appendChild(el('span', 'dot'));
  item.appendChild(el('span', 'txt', idea.texto));
  if (state.materiaActiva === null) { // con "Todas" se indica de qué materia es cada idea
    var materia = materiaPorId(idea.materiaId);
    item.appendChild(el('span', 'pill', materia ? materia.nombre : ''));
  }
  var borrar = el('button', 'icon-btn');
  borrar.type = 'button';
  borrar.setAttribute('aria-label', 'Borrar idea: ' + idea.texto);
  borrar.innerHTML = ICONO_BORRAR;
  borrar.addEventListener('click', function () { borrarIdea(idea.id); });
  item.appendChild(borrar);
  return item;
}

// El botón del estado vacío lleva el foco a donde se puede empezar a escribir.
function escribirPrimeraIdea() {
  if (state.materias.length === 0) campoMateria.focus();
  else if (state.materiaActiva === null) {
    var primerChip = document.querySelector('#panel-ideas .chip[data-chip]:not([data-chip="todas"])');
    if (primerChip) primerChip.focus();
  } else campoIdea.focus();
}

// ============================================================
// Descarga y salida
// ============================================================

// Arma el texto del archivo: por cada materia, sus tarjetas (P: / R:) y sus ideas clave.
function textoDeDescarga() {
  var lineas = ['EffectiveStudy · Mis tarjetas e ideas clave', 'Descargado el ' + new Date().toLocaleString('es'), ''];
  state.materias.forEach(function (materia) {
    var tarjetas = state.tarjetas.filter(function (t) { return t.materiaId === materia.id; });
    var ideas = state.ideas.filter(function (i) { return i.materiaId === materia.id; });
    if (tarjetas.length === 0 && ideas.length === 0) return; // las materias vacías no se incluyen
    lineas.push('== ' + materia.nombre + ' ==', '');
    if (tarjetas.length) {
      lineas.push('Tarjetas (' + tarjetas.length + ')');
      tarjetas.forEach(function (t, n) {
        lineas.push('P: ' + sangrar(t.pregunta), 'R: ' + sangrar(t.respuesta));
        if (n < tarjetas.length - 1) lineas.push('');
      });
      lineas.push('');
    }
    if (ideas.length) {
      lineas.push('Ideas clave (' + ideas.length + ')');
      ideas.forEach(function (i) { lineas.push('- ' + sangrar(i.texto)); });
      lineas.push('');
    }
  });
  return lineas.join('\r\n'); // saltos de línea de Windows: así se ve bien en el Bloc de notas
}

// Si un texto tiene varias líneas, las siguientes se sangran para que se lea cuál es la continuación.
function sangrar(texto) {
  return texto.replace(/\r?\n/g, '\r\n   ');
}

// Baja el archivo effectivestudy-tarjetas.txt: se crea un "Blob" (archivo en memoria) y un enlace temporal que se pulsa solo.
function descargarTarjetas() {
  if (!hayContenido()) return;
  // "\uFEFF" al inicio avisa al Bloc de notas de Windows de que el archivo es UTF-8 (para que las tildes salgan bien).
  var archivo = new Blob(['\uFEFF' + textoDeDescarga()], { type: 'text/plain;charset=utf-8' });
  var direccion = URL.createObjectURL(archivo);
  var enlace = document.createElement('a');
  enlace.href = direccion;
  enlace.download = 'effectivestudy-tarjetas.txt';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(function () { URL.revokeObjectURL(direccion); }, 1000);
}

// Los botones de descarga solo sirven si hay algo que bajar; el aviso del navegador solo se registra si hay algo que perder.
function actualizarDescargaYAviso() {
  var hay = hayContenido();
  botonDescargar.disabled = !hay;
  botonDescargarFin.disabled = !hay;
  if (hay && !avisoSalidaActivo) {
    window.addEventListener('beforeunload', avisarAlSalir);
    avisoSalidaActivo = true;
  } else if (!hay && avisoSalidaActivo) {
    window.removeEventListener('beforeunload', avisarAlSalir);
    avisoSalidaActivo = false;
  }
}

// El navegador muestra SU propio aviso estándar; su texto no se puede personalizar.
function avisarAlSalir(evento) {
  evento.preventDefault();
  evento.returnValue = ''; // algunos navegadores lo exigen; no muestra ningún texto propio
}

// Borra todo lo que vive en memoria (materias, tarjetas, ideas y repaso) y deja el panel como nuevo.
function reiniciarDatos() {
  state.materias = [];
  state.tarjetas = [];
  state.ideas = [];
  state.materiaActiva = null;
  state.repaso = null;
  tarjetasVolteadas = {};
  formMateriaAbierto = false;
  firmaOpcionesRepaso = '';
  [campoMateria, campoPregunta, campoRespuesta, campoIdea].forEach(function (campo) {
    campo.value = '';
    campo.removeAttribute('aria-invalid');
  });
  [mensajeMateria, mensajeTarjeta, mensajeIdea].forEach(ocultarMensaje);
  actualizarContadorIdea();
  ocultarAviso();
  seleccionarPestana('flashcards', false); // vuelve a dibujar el panel
}

// ============================================================
// Aviso breve con "Deshacer" (compartido por tarjetas e ideas)
// ============================================================
function mostrarAviso(texto, alDeshacer) {
  clearTimeout(avisoTemporizador);
  avisoTexto.textContent = texto;
  avisoBreve.hidden = false;
  avisoBreve.alDeshacer = alDeshacer;
  avisoTemporizador = setTimeout(ocultarAviso, TIEMPO_AVISO);
}

function ocultarAviso() {
  clearTimeout(avisoTemporizador);
  avisoBreve.hidden = true;
  avisoBreve.alDeshacer = null;
}

function deshacerUltimo() {
  var accion = avisoBreve.alDeshacer;
  ocultarAviso();
  if (accion) accion();
}

// ============================================================
// Dibujo del panel
// ============================================================

// Vuelve a dibujar todo lo que depende de los datos: chips, formularios, lista y contadores.
function renderPanel() {
  renderChips();
  renderFormMateria();
  renderNuevaTarjeta();
  renderListaTarjetas();
  renderIdeas();
  renderRepaso();
  actualizarDescargaYAviso();
  document.getElementById('badge-tarjetas').textContent = state.tarjetas.length;
  document.getElementById('badge-ideas').textContent = state.ideas.length;
}

// Chips de materia: "Todas" + una por materia + "Nueva materia". Cada pestaña cuenta lo suyo.
function renderChips() {
  document.querySelectorAll('.js-chips').forEach(function (contenedor) {
    var enfocado = document.activeElement && contenedor.contains(document.activeElement)
      ? document.activeElement.dataset.chip : null;
    contenedor.textContent = '';
    if (state.materias.length === 0) { contenedor.hidden = true; return; }
    contenedor.hidden = false;

    var elementos = contenedor.dataset.tipo === 'ideas' ? state.ideas : state.tarjetas;
    contenedor.appendChild(crearChip('todas', 'Todas', elementos.length, state.materiaActiva === null));
    state.materias.forEach(function (materia) {
      var cuantas = elementos.filter(function (e) { return e.materiaId === materia.id; }).length;
      contenedor.appendChild(crearChip(materia.id, materia.nombre, cuantas, state.materiaActiva === materia.id));
    });

    var nuevo = el('button', 'chip nuevo');
    nuevo.type = 'button';
    nuevo.dataset.chip = 'nuevo';
    nuevo.innerHTML = ICONO_MAS;
    nuevo.appendChild(document.createTextNode('Nueva materia'));
    nuevo.addEventListener('click', abrirFormMateria);
    contenedor.appendChild(nuevo);

    // Si un chip tenía el foco, se lo devolvemos (al redibujar se pierde).
    if (enfocado) {
      var mismo = contenedor.querySelector('[data-chip="' + enfocado + '"]');
      if (mismo) mismo.focus();
    }
  });
}

function crearChip(clave, nombre, cuantas, activo) {
  var chip = el('button', 'chip' + (activo ? ' on' : ''));
  chip.type = 'button';
  chip.dataset.chip = clave;
  chip.setAttribute('aria-pressed', String(activo));
  chip.appendChild(document.createTextNode(nombre + ' '));
  chip.appendChild(el('span', 'badge', cuantas));
  chip.addEventListener('click', function () { elegirMateria(clave === 'todas' ? null : clave); });
  return chip;
}

// El formulario de materia aparece si no hay materias, o si se pidió "Nueva materia".
function renderFormMateria() {
  var sinMaterias = state.materias.length === 0;
  var visible = (sinMaterias || formMateriaAbierto) && state.pestana !== 'repaso';
  formMateria.hidden = !visible;
  etiquetaMateria.textContent = sinMaterias ? 'Empieza con una materia' : 'Nueva materia';
  botonCancelarMateria.hidden = sinMaterias;
  var hueco = document.querySelector('#panel-' + state.pestana + ' .slot-materia');
  if (hueco && formMateria.parentNode !== hueco) hueco.appendChild(formMateria);
}

function renderNuevaTarjeta() {
  var sinMaterias = state.materias.length === 0;
  var materia = materiaPorId(state.materiaActiva);
  cajaNuevaTarjeta.hidden = sinMaterias || !materia;
  avisoElegirMateria.hidden = sinMaterias || !!materia;
  etiquetaTarjetaMateria.textContent = materia ? 'en ' + materia.nombre : '';
}

function renderListaTarjetas() {
  var visibles = tarjetasVisibles().slice().reverse(); // la más nueva arriba
  listaTarjetas.textContent = '';
  visibles.forEach(function (tarjeta) {
    listaTarjetas.appendChild(elementoTarjeta(tarjeta));
  });
  vacioTarjetas.hidden = visibles.length > 0;
  textoVacioTarjetas.textContent = state.materias.length === 0
    ? 'Crea una materia y anota una pregunta con su respuesta mientras estudias. Aparecerán aquí.'
    : 'Anota una pregunta con su respuesta mientras estudias. Aparecerán aquí.';
}

function renderIdeas() {
  var sinMaterias = state.materias.length === 0;
  var materia = materiaPorId(state.materiaActiva);
  formIdea.hidden = sinMaterias || !materia;
  avisoElegirIdeas.hidden = sinMaterias || !!materia;
  etiquetaIdea.textContent = materia ? 'Nueva idea en ' + materia.nombre : 'Nueva idea';

  var visibles = ideasVisibles().slice().reverse(); // la más nueva arriba
  listaIdeas.textContent = '';
  visibles.forEach(function (idea) { listaIdeas.appendChild(elementoIdea(idea)); });
  vacioIdeas.hidden = visibles.length > 0;
}

// ============================================================
// Arranque del panel
// ============================================================
function iniciarCards() {
  formMateria = document.getElementById('form-materia');
  campoMateria = document.getElementById('materia-nombre');
  mensajeMateria = document.getElementById('materia-msg');
  botonCancelarMateria = document.getElementById('materia-cancelar');
  etiquetaMateria = document.getElementById('materia-etiqueta');
  cajaNuevaTarjeta = document.getElementById('nueva-tarjeta');
  etiquetaTarjetaMateria = document.getElementById('tarjeta-materia');
  campoPregunta = document.getElementById('tarjeta-pregunta');
  campoRespuesta = document.getElementById('tarjeta-respuesta');
  mensajeTarjeta = document.getElementById('tarjeta-msg');
  avisoElegirMateria = document.getElementById('elegir-materia');
  listaTarjetas = document.getElementById('lista-tarjetas');
  vacioTarjetas = document.getElementById('vacio-tarjetas');
  textoVacioTarjetas = document.getElementById('vacio-tarjetas-texto');
  formIdea = document.getElementById('form-idea');
  campoIdea = document.getElementById('idea-texto');
  contadorIdea = document.getElementById('idea-contador');
  mensajeIdea = document.getElementById('idea-msg');
  etiquetaIdea = document.getElementById('idea-etiqueta');
  avisoElegirIdeas = document.getElementById('elegir-materia-ideas');
  listaIdeas = document.getElementById('lista-ideas');
  vacioIdeas = document.getElementById('vacio-ideas');
  avisoBreve = document.getElementById('aviso-breve');
  avisoTexto = document.getElementById('aviso-texto');
  avisoDeshacer = document.getElementById('aviso-deshacer');
  botonDescargar = document.getElementById('boton-descargar');
  botonDescargarFin = document.getElementById('boton-descargar-fin');

  formMateria.addEventListener('submit', enviarMateria);
  botonCancelarMateria.addEventListener('click', cancelarFormMateria);
  // Escape cierra "Nueva materia" (solo si ya existen materias)
  formMateria.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && state.materias.length > 0) cancelarFormMateria();
  });

  document.getElementById('tarjeta-guardar').addEventListener('click', guardarTarjeta);
  [campoPregunta, campoRespuesta].forEach(function (campo) {
    campo.addEventListener('keydown', function (e) {
      // Ctrl+Enter (o Cmd+Enter en Mac) guarda la tarjeta
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        guardarTarjeta();
      }
    });
  });

  formIdea.addEventListener('submit', agregarIdea);
  campoIdea.addEventListener('input', actualizarContadorIdea);
  document.getElementById('idea-primera').addEventListener('click', escribirPrimeraIdea);

  avisoDeshacer.addEventListener('click', deshacerUltimo);
  botonDescargar.addEventListener('click', descargarTarjetas);
  botonDescargarFin.addEventListener('click', descargarTarjetas);
  renderPanel();
}
