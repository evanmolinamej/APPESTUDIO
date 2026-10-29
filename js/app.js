// app.js · navegación entre vistas, pantalla de Inicio y sesión de estudio.

// ---------- Límites de "Personalizado" (minutos enteros) ----------
var LIMITE_ESTUDIO = { min: 1, max: 180 };
var LIMITE_DESCANSO = { min: 1, max: 60 };

// Elementos de la página que se usan varias veces
var cactusInicio, cactusMini, cactusReloj, cactusFin, cactusDescanso;
var botonEmpezar, resumen, tarjetasTecnica, tarjetaCustom;
var campoEstudio, campoDescanso, mensajeError;
var tiempoEl, barraProgreso, botonPausa, etiquetaFase, etiquetaBloque;
var tiempoDescanso, barraDescanso, botonPausaDescanso, etiquetaDescanso, botonSaltar, botonSiguiente, avisoDescanso;
var descansoTerminado = false;
var empezando = false;

// ============================================================
// Vistas
// ============================================================

// Muestra una vista y oculta las demás. "enfocar" mueve el foco al título (ayuda al teclado y a lectores de pantalla).
function mostrarVista(nombre, enfocar) {
  state.vista = nombre;
  document.querySelectorAll('.vista').forEach(function (vista) {
    vista.hidden = vista.dataset.vista !== nombre;
  });
  // En la sesión la página ocupa toda la ventana (el cronómetro queda fijo arriba).
  document.body.classList.toggle('en-sesion', nombre === 'estudio');
  actualizarCabecera();
  if (enfocar) {
    var titulo = document.querySelector('.vista:not([hidden]) [tabindex="-1"]');
    if (titulo) titulo.focus();
  }
}

// Encabezado: en Inicio dice "Nada se guarda"; en las demás vistas, el nombre de la técnica.
function actualizarCabecera() {
  var insignia = document.getElementById('insignia-cabecera');
  var enInicio = state.vista === 'inicio';
  insignia.textContent = enInicio ? 'Sin cuentas · Nada se guarda' : nombreTecnica();
  insignia.classList.toggle('punteada', enInicio);
}

// Ejemplo: "Pomodoro 25/5"
function nombreTecnica() {
  return state.tecnica.nombre + ' ' + state.tecnica.estudioMin + '/' + state.tecnica.descansoMin;
}

// ============================================================
// Inicio
// ============================================================

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

// Pulsar "Empezar": guarda la técnica, activa el audio, despierta al cactus y arranca el bloque 1.
function empezar() {
  var tecnica = tecnicaElegida();
  if (!tecnica.valida || empezando) return;
  empezando = true;
  state.tecnica = { nombre: tecnica.nombre, estudioMin: tecnica.estudioMin, descansoMin: tecnica.descansoMin };
  state.bloque = 1;

  activarAudio(); // debe hacerse dentro del clic, si no el navegador bloquea la campana

  // El cactus se despierta; después de su fundido pasamos a la sesión.
  cambiarCactus(cactusInicio.firstChild, 'lentes');
  setTimeout(function () {
    empezarBloque(false);
    empezando = false;
  }, 450);
}

// Vuelve al Inicio: detiene el cronómetro y el cactus se duerme.
function volverAlInicio() {
  temporizador.detener();
  state.pausado = false;
  state.fase = 'estudio';
  descansoTerminado = false;
  document.title = 'EffectiveStudy';
  cambiarCactus(cactusInicio.firstChild, 'dormido');
  cambiarCactus(cactusMini.firstChild, 'lentes');
  mostrarVista('inicio', true);
}

// ============================================================
// Sesión de estudio
// ============================================================

function dosDigitos(n) { return n < 10 ? '0' + n : String(n); }
function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

// Convierte milisegundos en "MM:SS". Se redondea hacia arriba: con 0,3 s de sobra todavía se ve 00:01.
function formatearTiempo(ms) {
  var segundos = Math.ceil(ms / 1000);
  var minutos = Math.floor(segundos / 60);
  var resto = segundos % 60;
  return { texto: dosDigitos(minutos) + ':' + dosDigitos(resto), minutos: minutos, segundos: resto };
}

// Muestra la sesión y empieza el bloque de estudio número state.bloque.
function empezarBloque(enfocar) {
  iniciarBloque();
  mostrarVista('estudio', false);
  actualizarCactusDelReloj(); // (si el repaso muestra el fin de ronda, el cactus sigue celebrando)
  if (enfocar) botonPausa.focus();
}

// Prepara y arranca el cronómetro del bloque de estudio.
function iniciarBloque() {
  state.fase = 'estudio';
  state.pausado = false;
  descansoTerminado = false;
  etiquetaBloque.textContent = 'Bloque ' + state.bloque;
  cambiarCactus(cactusReloj.firstChild, 'lentes');
  cambiarCactus(cactusMini.firstChild, 'lentes');
  actualizarEtiquetas();
  temporizador.iniciar(state.tecnica.estudioMin * 60000, pintarReloj, terminarBloque);
}

// Lo que dice la etiqueta de la fase actual y el título de la pestaña.
function textoDeFase() {
  if (state.pausado) return 'En pausa';
  return state.fase === 'descanso' ? 'Descanso' : 'Estudiando';
}

// Pinta el tiempo, la barra de avance y el título de la pestaña. Se llama con cada tic del cronómetro.
function pintarTiempo(restanteMs, elTiempo, elBarra) {
  var t = formatearTiempo(restanteMs);
  elTiempo.textContent = t.texto;
  // El lector de pantalla no lo anuncia cada segundo; esta etiqueta solo se lee si el usuario va al cronómetro.
  elTiempo.setAttribute('aria-label', plural(t.minutos, 'minuto', 'minutos') + ' ' + plural(t.segundos, 'segundo', 'segundos'));
  elBarra.style.width = (100 * (1 - restanteMs / temporizador.duracionMs)) + '%';
  document.title = t.texto + ' · ' + textoDeFase();
}

function pintarReloj(restanteMs) { pintarTiempo(restanteMs, tiempoEl, barraProgreso); }
function pintarDescanso(restanteMs) { pintarTiempo(restanteMs, tiempoDescanso, barraDescanso); }

// Botón Pausar/Reanudar: el mismo dibujo y texto en la sesión y en el descanso.
function contenidoBotonPausa() {
  return state.pausado
    ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>Reanudar'
    : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>Pausar';
}

// Textos que dependen de si está en pausa (sesión y descanso).
function actualizarEtiquetas() {
  etiquetaFase.textContent = state.pausado ? 'En pausa' : 'Estudiando';
  botonPausa.innerHTML = contenidoBotonPausa();
  etiquetaDescanso.textContent = descansoTerminado ? 'Descanso terminado' : (state.pausado ? 'En pausa' : 'Descanso');
  botonPausaDescanso.innerHTML = contenidoBotonPausa();
  document.getElementById('insignia-campana').hidden = descansoTerminado; // ya sonó
}

function pausarOReanudar() {
  if (state.pausado) {
    state.pausado = false;
    temporizador.reanudar();
  } else {
    state.pausado = true;
    temporizador.pausar();
  }
  actualizarEtiquetas();
  // refresca el título (Estudiando / Descanso / En pausa)
  if (state.fase === 'descanso') pintarDescanso(temporizador.restanteMs);
  else pintarReloj(temporizador.restanteMs);
}

// Reiniciar: vuelve al tiempo completo del bloque. No borra tarjetas ni ideas.
function reiniciarBloque() {
  temporizador.reiniciar();
}

// Cambiar tiempo: vuelve al Inicio.
// (Fase 8: si hay tarjetas o ideas creadas, aquí se mostrará antes el aviso de descarga.)
function cambiarTiempo() {
  volverAlInicio();
}

// ============================================================
// Fin de bloque
// ============================================================

// El estudio llegó a 00:00: suena la campana una vez y el cactus celebra.
function terminarBloque() {
  sonarCampana();
  var estudio = state.tecnica.estudioMin;
  var descanso = state.tecnica.descansoMin;
  cambiarCactus(cactusMini.firstChild, 'celebra');
  mostrarVista('fin-bloque', true);
  document.title = 'EffectiveStudy · ¡Bloque terminado!';
  document.getElementById('mensaje-fin').textContent = 'Estudiaste ' + plural(estudio, 'minuto seguido', 'minutos seguidos') +
    '. Te ganaste ' + descanso + ' de descanso.';
  document.getElementById('stat-tarjetas').textContent = state.tarjetas.length;
  document.getElementById('stat-tarjetas-txt').textContent = state.tarjetas.length === 1 ? 'tarjeta creada' : 'tarjetas creadas';
  document.getElementById('stat-ideas').textContent = state.ideas.length;
  document.getElementById('stat-ideas-txt').textContent = state.ideas.length === 1 ? 'idea clave' : 'ideas clave';
  document.getElementById('texto-descanso').textContent = 'Empezar descanso de ' + descanso + ' min';
}

// "Otro bloque": se salta el descanso y empieza el bloque siguiente.
function otroBloque() {
  state.bloque++;
  empezarBloque(true);
}

// ============================================================
// Descanso
// ============================================================

function iniciarDescanso() {
  state.fase = 'descanso';
  state.pausado = false;
  descansoTerminado = false;
  botonSaltar.hidden = false;
  botonPausaDescanso.hidden = false;
  botonSiguiente.hidden = true;
  document.getElementById('descanso-aviso').textContent = '';
  cambiarCactus(cactusDescanso.firstChild, 'relajado');
  cambiarCactus(cactusMini.firstChild, 'relajado');
  actualizarEtiquetas();
  mostrarVista('descanso', false);
  botonPausaDescanso.focus();
  temporizador.iniciar(state.tecnica.descansoMin * 60000, pintarDescanso, terminarDescanso);
}

// El descanso llegó a 00:00: suena la campana una vez. El bloque siguiente NO arranca solo.
function terminarDescanso() {
  sonarCampana();
  descansoTerminado = true;
  state.pausado = false;
  botonSaltar.hidden = true;
  botonPausaDescanso.hidden = true;
  botonSiguiente.hidden = false;
  document.getElementById('texto-siguiente').textContent = 'Empezar bloque ' + (state.bloque + 1);
  actualizarEtiquetas();
  document.title = 'EffectiveStudy · Descanso terminado';
  document.getElementById('descanso-aviso').textContent = 'Descanso terminado. Puedes empezar el bloque ' + (state.bloque + 1) + '.';
  botonSiguiente.focus();
}

// "Saltar descanso" o "Empezar bloque N+1": detiene lo que corra y empieza el bloque siguiente.
function siguienteBloque() {
  temporizador.detener();
  state.bloque++;
  empezarBloque(true);
}

// ============================================================
// Pestañas del panel (Flashcards · Ideas clave · Repaso)
// ============================================================
var PESTANAS = ['flashcards', 'ideas', 'repaso'];

// Cambia de pestaña: marca la pestaña, muestra su panel y oculta los otros.
function seleccionarPestana(nombre, enfocar) {
  state.pestana = nombre;
  PESTANAS.forEach(function (p) {
    var tab = document.getElementById('tab-' + p);
    var activa = p === nombre;
    tab.classList.toggle('on', activa);
    tab.setAttribute('aria-selected', String(activa));
    tab.tabIndex = activa ? 0 : -1; // solo la pestaña activa entra con Tab; las demás, con flechas
    document.getElementById('panel-' + p).hidden = !activa;
  });
  if (nombre === 'repaso') entrarARepaso();
  if (enfocar) document.getElementById('tab-' + nombre).focus();
  renderPanel(); // el formulario de materia se coloca bajo los chips de la pestaña activa
}

// Flechas ← → y Inicio/Fin mueven entre pestañas.
function teclaEnPestanas(evento) {
  var posicion = PESTANAS.indexOf(state.pestana);
  var nueva = null;
  if (evento.key === 'ArrowRight') nueva = (posicion + 1) % PESTANAS.length;
  else if (evento.key === 'ArrowLeft') nueva = (posicion + PESTANAS.length - 1) % PESTANAS.length;
  else if (evento.key === 'Home') nueva = 0;
  else if (evento.key === 'End') nueva = PESTANAS.length - 1;
  if (nueva === null) return;
  evento.preventDefault();
  seleccionarPestana(PESTANAS[nueva], true);
}

// ============================================================
// Arranque
// ============================================================
function arrancar() {
  cactusMini = document.getElementById('cactus-mini');
  cactusMini.appendChild(crearCactus('lentes', 34));
  cactusInicio = document.getElementById('cactus-inicio');
  cactusInicio.appendChild(crearCactus('dormido', 168));
  cactusReloj = document.getElementById('cactus-reloj');
  cactusReloj.appendChild(crearCactus('lentes', 124));
  cactusFin = document.getElementById('cactus-fin');
  cactusFin.appendChild(crearCactus('celebra', 240));
  cactusDescanso = document.getElementById('cactus-descanso');
  cactusDescanso.appendChild(crearCactus('relajado', 160));

  botonEmpezar = document.getElementById('boton-empezar');
  resumen = document.getElementById('resumen');
  tarjetaCustom = document.getElementById('tec-custom');
  campoEstudio = document.getElementById('custom-estudio');
  campoDescanso = document.getElementById('custom-descanso');
  mensajeError = document.getElementById('custom-error');
  tarjetasTecnica = Array.prototype.slice.call(document.querySelectorAll('button.tec'));

  tiempoEl = document.getElementById('tiempo');
  barraProgreso = document.getElementById('progreso-barra');
  botonPausa = document.getElementById('boton-pausa');
  etiquetaFase = document.getElementById('etiqueta-fase');
  etiquetaBloque = document.getElementById('etiqueta-bloque');
  tiempoDescanso = document.getElementById('tiempo-descanso');
  barraDescanso = document.getElementById('progreso-descanso');
  botonPausaDescanso = document.getElementById('boton-pausa-descanso');
  etiquetaDescanso = document.getElementById('etiqueta-descanso');
  botonSaltar = document.getElementById('boton-saltar');
  botonSiguiente = document.getElementById('boton-siguiente');

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
  botonPausa.addEventListener('click', pausarOReanudar);
  document.getElementById('boton-reiniciar').addEventListener('click', reiniciarBloque);
  document.getElementById('boton-cambiar').addEventListener('click', cambiarTiempo);
  document.getElementById('boton-descanso').addEventListener('click', iniciarDescanso);
  document.getElementById('boton-otro-bloque').addEventListener('click', otroBloque);
  botonPausaDescanso.addEventListener('click', pausarOReanudar);
  botonSaltar.addEventListener('click', siguienteBloque);
  botonSiguiente.addEventListener('click', siguienteBloque);
  document.getElementById('boton-cambiar-descanso').addEventListener('click', cambiarTiempo);

  PESTANAS.forEach(function (p) {
    document.getElementById('tab-' + p).addEventListener('click', function () { seleccionarPestana(p, false); });
  });
  document.querySelector('[role="tablist"]').addEventListener('keydown', teclaEnPestanas);
  iniciarCards();
  iniciarRepaso();

  actualizarEtiquetas();
  refrescarInicio();
  mostrarVista('inicio', false);
}

arrancar();
