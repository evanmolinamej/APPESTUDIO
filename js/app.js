// app.js · arranque de la app.
// Fase 1: solo arma la página de prueba. En la Fase 2 pasa a manejar las vistas.

function armarPaginaDePrueba() {
  // Los 4 cactus de la fila
  document.querySelectorAll('[data-cactus]').forEach(function (celda) {
    var cactus = crearCactus(celda.dataset.cactus, Number(celda.dataset.tam));
    celda.insertBefore(cactus, celda.firstChild);
  });

  // Cactus que cambia de estado con los botones
  var principal = crearCactus('dormido', 140);
  document.getElementById('cactus-prueba').appendChild(principal);
  document.querySelectorAll('button[data-estado]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      cambiarCactus(principal, boton.dataset.estado);
    });
  });

  // Cactus pequeño del encabezado
  document.getElementById('cactus-mini').appendChild(crearCactus('lentes', 34));

  // Paleta: lee los valores reales de las variables CSS
  var nombres = ['menta', 'crema', 'cactus', 'bosque', 'arena', 'rosa', 'arena-borde', 'menta-media',
                 'rosa-claro', 'suave', 'campo', 'borde-campo'];
  var estilos = getComputedStyle(document.documentElement);
  var paleta = document.getElementById('paleta');
  nombres.forEach(function (nombre) {
    var valor = estilos.getPropertyValue('--' + nombre).trim();
    var celda = document.createElement('div');
    celda.innerHTML = '<div style="height:48px;border-radius:14px;border:2px solid rgba(30,91,60,.18);background:var(--' +
      nombre + ')"></div><b style="font-size:14px;font-weight:900">' + nombre +
      '</b><br><span class="lbl mono" style="font-size:12px">' + valor + '</span>';
    paleta.appendChild(celda);
  });
}

armarPaginaDePrueba();
