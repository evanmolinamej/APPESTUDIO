// state.js · el estado de la app.
// Es el ÚNICO lugar donde viven los datos. Está en memoria: al cerrar o recargar la pestaña se pierde.
// Prohibido guardar en localStorage, sessionStorage, IndexedDB o cookies.

var state = {
  vista: 'inicio',        // inicio | estudio | descanso | fin-bloque
  tecnica: { nombre: 'Pomodoro', estudioMin: 25, descansoMin: 5 },
  bloque: 1,
  fase: 'estudio',        // estudio | descanso
  pausado: false,
  materias: [],           // { id, nombre }
  tarjetas: [],           // { id, materiaId, pregunta, respuesta }
  ideas: [],              // { id, materiaId, texto }
  materiaActiva: null,    // materia elegida en los chips (null = "Todas"); la comparten Flashcards e Ideas
  pestana: 'flashcards'   // flashcards | ideas | repaso
};
