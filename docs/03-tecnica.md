# 03 · Técnica

## Estructura de archivos
```
effectivestudy/
├── index.html          # todas las vistas, ocultas/mostradas con JS
├── css/styles.css      # variables, componentes, vistas
├── js/
│   ├── state.js        # objeto de estado en memoria (único lugar con datos)
│   ├── timer.js        # cronómetro exacto
│   ├── sound.js        # campana con Web Audio
│   ├── cactus.js       # SVG de los 4 estados
│   ├── cards.js        # materias, flashcards, ideas, descarga
│   ├── review.js       # lógica del repaso
│   └── app.js          # navegación entre vistas y arranque
└── diseno/             # referencia, no se publica
```
- **Scripts clásicos** con `<script src>` en ese orden, **sin módulos ES** (`import`/`export`), para que `index.html` abra con doble clic sin servidor.
- Sin librerías, sin npm, sin build.
- JavaScript comentado en español, sencillo, funciones cortas. Evan lo va a leer.

## Estado (en memoria)
```js
state = {
  vista: 'inicio',            // inicio | estudio | descanso | fin-bloque
  tecnica: { nombre, estudioMin, descansoMin },
  bloque: 1,
  fase: 'estudio',            // estudio | descanso
  pausado: false,
  materias: [],               // { id, nombre }
  tarjetas: [],               // { id, materiaId, pregunta, respuesta }
  ideas: [],                  // { id, materiaId, texto }
}
```
Prohibido persistir: nada de `localStorage`, `sessionStorage`, `IndexedDB`, cookies ni red.

## Cronómetro exacto (importante)
Los navegadores **frenan los temporizadores de pestañas en segundo plano**, y justo así se usará la app (el PDF al lado). Por eso **no se cuenta restando 1 cada segundo**:
1. Al iniciar o reanudar: `finMs = Date.now() + restanteMs`.
2. Un `setInterval` de ~250 ms calcula `restanteMs = finMs - Date.now()` y pinta `ceil(restanteMs / 1000)`.
3. Al pausar: guardar `restanteMs` y detener el intervalo.
4. Al llegar a 0: detener, sonar campana, cambiar de vista.
5. Actualizar `document.title` con `MM:SS · Estudiando` (o `Descanso`).
6. Escuchar `visibilitychange`: al volver a la pestaña, recalcular de inmediato.

## Sonido (campana)
- **Generada con Web Audio API, sin archivo de audio** (evita problemas de licencia): dos osciladores senoidales (~880 Hz y ~1320 Hz) con volumen que sube en 10 ms y decae exponencialmente en ~1,5 s. Volumen máximo ~0,2.
- Los navegadores bloquean el audio hasta que el usuario interactúa. Crear/reanudar el `AudioContext` dentro del clic de **"Empezar"**.
- Suena **una vez** al terminar el estudio y **una vez** al terminar el descanso. Si la pestaña está silenciada, no suena (comportamiento normal del navegador).

## Descarga
- Construir el texto, crear un `Blob` (`text/plain;charset=utf-8`) y descargarlo como `effectivestudy-tarjetas.txt` con un enlace temporal.
- Formato: por cada materia, un título, sus tarjetas (`P:` / `R:`) y sus ideas clave.

## Salir de la página
- `beforeunload` solo se registra si hay tarjetas o ideas. Usar `event.preventDefault()`. No intentar mostrar texto propio.

## Fases de construcción
Al terminar cada fase: **detenerse, indicar a Evan qué abrir y qué probar, y esperar su visto bueno.**
1. **Base:** `index.html`, variables CSS, tipografías, botones, y el cactus en sus 4 estados (página de prueba simple).
2. **Inicio:** 4 tarjetas de técnica, Personalizado con validación, botón Empezar.
3. **Sesión + cronómetro:** encabezado, tiempo grande, Pausar/Reiniciar, título de pestaña, campana, cambio de cactus.
4. **Flashcards y materias:** crear, filtrar, voltear, borrar con deshacer.
5. **Ideas clave:** agregar, contador de 120, borrar con deshacer.
6. **Repaso:** ronda, 3 botones, atajos 1-2-3, fin de ronda.
7. **Fin de bloque y descanso:** flujo completo entre bloques.
8. **Descarga y avisos:** botón de descarga, modal de "Cambiar tiempo", `beforeunload`, estados vacíos.
9. **Pulido:** accesibilidad, movimiento reducido, revisión contra el diseño en 700 px y a pantalla completa.

## Pruebas (definición de terminado)
- [ ] Técnica de 1 minuto: el cronómetro termina a los 60 s exactos aunque la pestaña esté en segundo plano 40 s.
- [ ] La campana suena una vez al terminar estudio y una vez al terminar descanso.
- [ ] Pausar y reanudar no pierde ni gana segundos.
- [ ] Personalizado rechaza 0, vacío, negativos y decimales.
- [ ] Crear materia → tarjeta → voltear → borrar → deshacer funciona; ídem ideas (tope de 120).
- [ ] Repaso: "No la sé" reaparece 3 tarjetas después; "Dudo" al final; la ronda termina sola.
- [ ] Con contenido, "Cambiar tiempo" muestra el modal; con la pestaña, el navegador avisa; sin contenido, ninguno de los dos.
- [ ] El archivo descargado abre bien y tiene tildes correctas.
- [ ] Todo se puede usar solo con teclado y el foco se ve.
- [ ] A 700 px y a 1280 px no hay scroll horizontal; el cronómetro queda fijo arriba.
- [ ] Recargar la página borra todo (es lo esperado).
- [ ] Ninguna llamada de red salvo la fuente de Google Fonts.
