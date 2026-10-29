// timer.js · cronómetro exacto.
//
// Los navegadores frenan los temporizadores de las pestañas en segundo plano.
// Por eso NO se cuenta "restando 1 cada segundo": se guarda la HORA EN QUE DEBE TERMINAR
// y cada ~250 ms se calcula cuánto falta mirando el reloj real (Date.now()).
// Así, aunque el navegador duerma la pestaña, al volver el tiempo sigue siendo correcto.

var temporizador = {
  duracionMs: 0,        // duración total del bloque
  restanteMs: 0,        // lo que falta (cuando está en pausa, es lo que quedó)
  finMs: 0,             // hora (en ms) en que termina
  corriendo: false,
  intervaloId: null,    // el "reloj" que revisa cada 250 ms
  finId: null,          // aviso extra justo a la hora de terminar
  alCambiar: null,      // función que pinta el tiempo: alCambiar(restanteMs)
  alTerminar: null,     // función que se llama una vez al llegar a 0

  // Empieza una cuenta regresiva nueva.
  iniciar: function (duracionMs, alCambiar, alTerminar) {
    this.detener();
    this.duracionMs = duracionMs;
    this.restanteMs = duracionMs;
    this.alCambiar = alCambiar;
    this.alTerminar = alTerminar;
    this.alCambiar(this.restanteMs);
    this.arrancar();
  },

  // Fija la hora de fin a partir de lo que falta y enciende los relojes internos.
  arrancar: function () {
    var yo = this;
    this.finMs = Date.now() + this.restanteMs;
    this.corriendo = true;
    this.intervaloId = setInterval(function () { yo.revisar(); }, 250);
    this.finId = setTimeout(function () { yo.revisar(); }, this.restanteMs);
  },

  // Apaga los relojes internos (no toca el tiempo restante).
  limpiar: function () {
    clearInterval(this.intervaloId);
    clearTimeout(this.finId);
    this.intervaloId = null;
    this.finId = null;
  },

  // Pausa: guarda lo que falta y detiene los relojes.
  pausar: function () {
    if (!this.corriendo) return;
    this.restanteMs = Math.max(0, this.finMs - Date.now());
    this.limpiar();
    this.corriendo = false;
  },

  // Reanuda: calcula una hora de fin nueva con lo que quedó.
  reanudar: function () {
    if (this.corriendo || this.restanteMs <= 0) return;
    this.arrancar();
  },

  // Vuelve al tiempo completo. Si estaba en pausa, sigue en pausa.
  reiniciar: function () {
    var estabaCorriendo = this.corriendo;
    this.limpiar();
    this.corriendo = false;
    this.restanteMs = this.duracionMs;
    if (this.alCambiar) this.alCambiar(this.restanteMs);
    if (estabaCorriendo) this.arrancar();
  },

  // Para todo y no llama a nada más.
  detener: function () {
    this.limpiar();
    this.corriendo = false;
  },

  // Calcula cuánto falta mirando el reloj real. Si llegó a 0, termina.
  revisar: function () {
    if (!this.corriendo) return;
    this.restanteMs = Math.max(0, this.finMs - Date.now());
    if (this.alCambiar) this.alCambiar(this.restanteMs);
    if (this.restanteMs === 0) {
      var alTerminar = this.alTerminar;
      this.detener();
      if (alTerminar) alTerminar();
    }
  }
};

// Al volver a la pestaña, recalcula de inmediato (sin esperar al siguiente tic).
document.addEventListener('visibilitychange', function () {
  if (!document.hidden) temporizador.revisar();
});
