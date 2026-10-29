# EffectiveStudy

Web app para estudiantes: eliges una técnica de tiempo (Pomodoro, Enfoque, Inmersión o Personalizado), el cronómetro corre y, mientras estudias, anotas flashcards e ideas clave en la misma pantalla. Mascota: un cactus con 4 estados.

**Nada se guarda.** Todo vive en memoria; al cerrar o recargar la pestaña se pierde. Puedes bajar tus tarjetas e ideas en un `.txt` con "Descargar mis tarjetas".

## Cómo abrirla
Doble clic en `index.html`. No necesita instalar nada ni un servidor. Requiere internet solo para las fuentes (Nunito y JetBrains Mono); sin conexión se ve con las fuentes del sistema.

Ventana objetivo: ~700 px de ancho (el PDF al lado). También se ve bien a pantalla completa. Solo computador.

## Qué hay en cada archivo
| Archivo | Para qué sirve |
|---|---|
| `index.html` | Todas las pantallas (inicio, sesión, fin de bloque, descanso) y el aviso al salir |
| `css/styles.css` | Colores, botones y estilos de cada pantalla |
| `js/state.js` | El estado en memoria (único lugar con datos) |
| `js/timer.js` | Cronómetro exacto (usa la hora real, no resta de a 1) |
| `js/sound.js` | La campana (se genera con Web Audio, sin archivo de audio) |
| `js/cactus.js` | Los 4 dibujos del cactus y su cambio con fundido |
| `js/cards.js` | Materias, flashcards, ideas clave, descarga y aviso al salir |
| `js/review.js` | Repaso por rondas |
| `js/app.js` | Navegación entre pantallas, inicio, sesión, descanso y pestañas |
| `BRIEF.md`, `docs/` | Qué se construye y las reglas |
| `diseno/` | Referencia visual (no es parte del producto) |

## Cómo probar rápido
Usa **Personalizado con 1 minuto de estudio y 1 de descanso** para ver el ciclo completo en pocos minutos: sesión → campana → fin de bloque → descanso → campana → bloque 2.

Lista de pruebas de terminado: `docs/03-tecnica.md`, sección "Pruebas".

## Reglas del proyecto
- Solo HTML, CSS y JavaScript puro. Sin frameworks, sin npm, sin build.
- Prohibido guardar: nada de `localStorage`, `sessionStorage`, `IndexedDB` ni cookies.
- Sin llamadas de red, salvo la fuente de Google Fonts.
- Todo el texto de la interfaz en español.
