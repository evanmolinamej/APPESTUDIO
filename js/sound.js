// sound.js · la campana.
// No usa ningún archivo de audio: el sonido se genera con la Web Audio API del navegador
// (dos tonos puros, ~880 Hz y ~1320 Hz, que suben rápido y se apagan en ~1,5 s).
//
// Los navegadores bloquean el audio hasta que la persona toca la página.
// Por eso activarAudio() se llama dentro del clic de "Empezar".

var contextoAudio = null;
var VOLUMEN_CAMPANA = 0.2;   // volumen máximo
var DURACION_CAMPANA = 1.5;  // segundos

// Crea (o despierta) el motor de audio. Llamar dentro de un clic del usuario.
function activarAudio() {
  var Motor = window.AudioContext || window.webkitAudioContext;
  if (!Motor) return;
  if (!contextoAudio) contextoAudio = new Motor();
  if (contextoAudio.state === 'suspended') contextoAudio.resume();
}

// Hace sonar la campana una vez.
function sonarCampana() {
  if (!contextoAudio) return;
  if (contextoAudio.state === 'suspended') contextoAudio.resume();

  var ahora = contextoAudio.currentTime;

  // Volumen general: sube en 10 ms y baja de forma exponencial.
  var general = contextoAudio.createGain();
  general.gain.setValueAtTime(0.0001, ahora);
  general.gain.linearRampToValueAtTime(VOLUMEN_CAMPANA, ahora + 0.01);
  general.gain.exponentialRampToValueAtTime(0.0001, ahora + DURACION_CAMPANA);
  general.connect(contextoAudio.destination);

  // Dos tonos; el agudo suena más bajito para que la campana sea suave.
  tonoDeCampana(880, 0.6, general, ahora);
  tonoDeCampana(1320, 0.4, general, ahora);
}

function tonoDeCampana(frecuencia, fuerza, destino, ahora) {
  var oscilador = contextoAudio.createOscillator();
  var volumen = contextoAudio.createGain();
  oscilador.type = 'sine';
  oscilador.frequency.value = frecuencia;
  volumen.gain.value = fuerza;
  oscilador.connect(volumen);
  volumen.connect(destino);
  oscilador.start(ahora);
  oscilador.stop(ahora + DURACION_CAMPANA + 0.1);
}
