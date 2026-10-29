// cactus.js · la mascota en sus 4 estados.
// Cada estado es un dibujo SVG (un dibujo hecho con código, que se ve nítido a cualquier tamaño).
// Los dibujos son los de diseno/Cactus.dc.html. No se recolorean.

var CACTUS_ESTADOS = {
  dormido: {
    etiqueta: 'Cactus dormido',
    dibujo:
      '<g fill="none" stroke="#1E5B3C" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"><path d="M70 130H38V100"/><path d="M130 118H162V90"/></g>' +
      '<rect x="62" y="40" width="76" height="138" rx="38" fill="#1E5B3C" stroke="#1E5B3C" stroke-width="12"/>' +
      '<g fill="none" stroke="#4FAE74" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"><path d="M70 130H38V100"/><path d="M130 118H162V90"/></g>' +
      '<rect x="62" y="40" width="76" height="138" rx="38" fill="#4FAE74"/>' +
      '<path d="M82 138V158M118 138V158" stroke="#3A9560" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M80 94Q87 101 94 94M106 94Q113 101 120 94M95 113Q100 118 105 113" stroke="#1E5B3C" stroke-width="4.5" stroke-linecap="round"/>' +
      '<circle cx="74" cy="108" r="6" fill="#F28FA8"/><circle cx="126" cy="108" r="6" fill="#F28FA8"/>' +
      '<g stroke="#1E5B3C" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M150 40H164L150 56H164"/><path d="M168 22H179L168 34H179"/><path d="M182 8H190L182 17H190"/></g>'
  },
  lentes: {
    etiqueta: 'Cactus con lentes estudiando',
    dibujo:
      '<g fill="none" stroke="#1E5B3C" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"><path d="M70 130H38V104"/><path d="M130 116H162V86"/></g>' +
      '<rect x="62" y="40" width="76" height="138" rx="38" fill="#1E5B3C" stroke="#1E5B3C" stroke-width="12"/>' +
      '<g fill="none" stroke="#4FAE74" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"><path d="M70 130H38V104"/><path d="M130 116H162V86"/></g>' +
      '<rect x="62" y="40" width="76" height="138" rx="38" fill="#4FAE74"/>' +
      '<path d="M82 138V158M118 138V158" stroke="#3A9560" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="83" cy="94" r="15" fill="#F6F8F1" stroke="#1E5B3C" stroke-width="4.5"/>' +
      '<circle cx="117" cy="94" r="15" fill="#F6F8F1" stroke="#1E5B3C" stroke-width="4.5"/>' +
      '<path d="M98 92Q100 89 102 92" stroke="#1E5B3C" stroke-width="4.5" stroke-linecap="round"/>' +
      '<circle cx="85" cy="96" r="4.5" fill="#1E5B3C"/><circle cx="115" cy="96" r="4.5" fill="#1E5B3C"/>' +
      '<path d="M92 122Q100 128 108 122" stroke="#1E5B3C" stroke-width="4.5" stroke-linecap="round"/>' +
      '<circle cx="71" cy="118" r="5" fill="#F28FA8"/><circle cx="129" cy="118" r="5" fill="#F28FA8"/>'
  },
  relajado: {
    etiqueta: 'Cactus relajado tomando té',
    dibujo:
      '<g fill="none" stroke="#1E5B3C" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"><path d="M70 130H40V108"/><path d="M130 124H150"/></g>' +
      '<rect x="62" y="40" width="76" height="138" rx="38" fill="#1E5B3C" stroke="#1E5B3C" stroke-width="12"/>' +
      '<g fill="none" stroke="#4FAE74" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"><path d="M70 130H40V108"/><path d="M130 124H150"/></g>' +
      '<rect x="62" y="40" width="76" height="138" rx="38" fill="#4FAE74"/>' +
      '<path d="M82 138V158M118 138V158" stroke="#3A9560" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M80 97Q87 88 94 97M106 97Q113 88 120 97M90 108Q100 121 110 108" stroke="#1E5B3C" stroke-width="4.5" stroke-linecap="round"/>' +
      '<circle cx="73" cy="110" r="6" fill="#F28FA8"/><circle cx="127" cy="110" r="6" fill="#F28FA8"/>' +
      '<rect x="146" y="106" width="30" height="30" rx="9" fill="#F7EFD8" stroke="#1E5B3C" stroke-width="4.5"/>' +
      '<path d="M176 114Q188 114 188 122Q188 130 176 130" stroke="#1E5B3C" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M154 98Q148 91 154 85Q160 79 154 72M168 98Q162 91 168 85Q174 79 168 72" stroke="#1E5B3C" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>'
  },
  celebra: {
    etiqueta: 'Cactus celebrando con una flor rosa',
    dibujo:
      '<g fill="none" stroke="#1E5B3C" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"><path d="M70 124H42V64"/><path d="M130 124H158V64"/></g>' +
      '<rect x="62" y="40" width="76" height="138" rx="38" fill="#1E5B3C" stroke="#1E5B3C" stroke-width="12"/>' +
      '<g fill="none" stroke="#4FAE74" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"><path d="M70 124H42V64"/><path d="M130 124H158V64"/></g>' +
      '<rect x="62" y="40" width="76" height="138" rx="38" fill="#4FAE74"/>' +
      '<path d="M82 138V158M118 138V158" stroke="#3A9560" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="86" cy="92" r="6.5" fill="#1E5B3C"/><circle cx="114" cy="92" r="6.5" fill="#1E5B3C"/>' +
      '<circle cx="88" cy="90" r="2.2" fill="#F6F8F1"/><circle cx="116" cy="90" r="2.2" fill="#F6F8F1"/>' +
      '<path d="M87 106Q100 130 113 106Z" fill="#1E5B3C" stroke="#1E5B3C" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M94 115Q100 110 106 115Q100 122 94 115Z" fill="#F28FA8"/>' +
      '<circle cx="72" cy="108" r="6" fill="#F28FA8"/><circle cx="128" cy="108" r="6" fill="#F28FA8"/>' +
      '<g fill="#F28FA8" stroke="#1E5B3C" stroke-width="3.5" stroke-linejoin="round"><circle cx="100" cy="19" r="9.5"/><circle cx="110.5" cy="26.6" r="9.5"/><circle cx="106.5" cy="38.9" r="9.5"/><circle cx="93.5" cy="38.9" r="9.5"/><circle cx="89.5" cy="26.6" r="9.5"/></g>' +
      '<circle cx="100" cy="30" r="6.5" fill="#F7EFD8" stroke="#1E5B3C" stroke-width="3.5"/>' +
      '<circle cx="14" cy="30" r="5" fill="#F28FA8"/><circle cx="188" cy="58" r="4" fill="#F28FA8"/><circle cx="10" cy="108" r="4" fill="#F28FA8"/>' +
      '<rect x="20" y="8" width="10" height="10" rx="2.5" fill="#F7EFD8" stroke="#1E5B3C" stroke-width="2.5" transform="rotate(20 25 13)"/>' +
      '<rect x="176" y="14" width="10" height="10" rx="2.5" fill="#F7EFD8" stroke="#1E5B3C" stroke-width="2.5" transform="rotate(-18 181 19)"/>' +
      '<path d="M8 152l7-7M192 146l-7-7M186 100l6 3" stroke="#1E5B3C" stroke-width="3" stroke-linecap="round"/>'
  }
};

// La maceta es igual en los 4 estados.
var CACTUS_MACETA =
  '<path d="M58 184H142L134 214Q133 220 126 220H74Q67 220 66 214Z" fill="#E6D6A8" stroke="#1E5B3C" stroke-width="5" stroke-linejoin="round"/>' +
  '<rect x="48" y="160" width="104" height="28" rx="14" fill="#F7EFD8" stroke="#1E5B3C" stroke-width="5"/>';

var CACTUS_DURACION_FUNDIDO = 250; // milisegundos

// Arma el texto SVG de un estado.
function cactusSvg(estado) {
  var e = CACTUS_ESTADOS[estado];
  return '<svg viewBox="0 0 200 228" fill="none" role="img" aria-label="' + e.etiqueta + '">' +
    e.dibujo + CACTUS_MACETA + '</svg>';
}

// Convierte el texto SVG en un elemento listo para insertar en la página.
function cactusCapa(estado) {
  var caja = document.createElement('div');
  caja.innerHTML = cactusSvg(estado);
  return caja.firstChild;
}

// Crea un cactus. "tam" es el ancho en píxeles (mínimo 32); el alto es 1,14 veces el ancho.
function crearCactus(estado, tam) {
  var ancho = Math.max(32, tam);
  var el = document.createElement('span');
  el.className = 'cactus';
  el.style.width = ancho + 'px';
  el.style.height = Math.round(ancho * 1.14) + 'px';
  el.dataset.estado = estado;
  el.appendChild(cactusCapa(estado));
  return el;
}

// Cambia el estado con un fundido de 250 ms: la capa nueva aparece sobre la vieja y luego se quita la vieja.
function cambiarCactus(el, estado) {
  if (el.dataset.estado === estado) return;
  el.dataset.estado = estado;
  var viejas = Array.prototype.slice.call(el.querySelectorAll('svg'));
  var nueva = cactusCapa(estado);
  nueva.classList.add('entra'); // empieza transparente
  el.appendChild(nueva);
  nueva.getBoundingClientRect(); // obliga al navegador a "ver" el estado inicial antes de animar
  nueva.classList.remove('entra');
  viejas.forEach(function (capa) {
    capa.classList.add('sale');
    setTimeout(function () { capa.remove(); }, CACTUS_DURACION_FUNDIDO);
  });
}
