# 01 · Funciones y comportamiento

Textos exactos de cada pantalla: copiarlos de `diseno/`. Aquí van las reglas.

## Flujo general
Inicio → Sesión (estudio) → Fin de bloque → Descanso → Sesión (siguiente bloque).
Estados de la app: `inicio`, `estudio`, `descanso`, `fin-bloque`. Cada pantalla es una vista que se muestra/oculta; no hay recargas.

## 1. Inicio (`Main`)
- 4 tarjetas: Pomodoro 25/5, Enfoque 50/10, Inmersión 90/20, Personalizado. Por defecto, Pomodoro seleccionada.
- Personalizado: dos campos numéricos, estudio y descanso, en minutos enteros. Rango: estudio 1–180, descanso 1–60 (supuesto ajustable). Si el valor no es válido, el botón "Empezar" queda deshabilitado y se muestra un mensaje breve bajo el campo.
- Al pulsar "Empezar": se **activa el audio** del navegador (no suena nada todavía; ver `03-tecnica.md`), el cactus pasa de `dormido` a `lentes` y arranca el bloque 1.

## 2. Sesión de estudio
- Encabezado: cactus `lentes`, nombre de la técnica (ej. "Pomodoro 25/5"), etiqueta "Estudiando", "Bloque N".
- Cronómetro MM:SS **fijo arriba**, es lo más grande de la pantalla. Solo el panel de abajo hace scroll.
- Botones: **Pausar/Reanudar**, **Reiniciar** (vuelve al tiempo completo del bloque actual, sin borrar tarjetas ni ideas), **Cambiar tiempo**.
- Panel con 3 pestañas y contador: Flashcards (n), Ideas clave (n), Repaso.
- Pie del panel, siempre visible: "Descargar mis tarjetas" + "Las tarjetas no se guardan al cerrar la pestaña."
- El título de la pestaña del navegador muestra el tiempo: `14:52 · Estudiando`.

## 3. Flashcards
- **Materias:** el usuario crea materias ("Nueva materia"). Chips de filtro: "Todas" + una por materia, con contador. Sin materias: estado vacío "Empieza con una materia" + botón "Crear materia".
- **Nueva tarjeta** (en la materia seleccionada): campos Pregunta y Respuesta, solo texto. `Ctrl+Enter` guarda. Botón "Añadir tarjeta". No permitir tarjetas con pregunta o respuesta vacías. Con "Todas" seleccionado, pedir elegir materia primero.
- **Lista:** cada tarjeta se voltea al hacer clic o con Enter/Espacio (frente: materia + pregunta + "Toca para ver la respuesta"; reverso: "Respuesta" + texto + "Toca para ver la pregunta").
- Poder borrar una tarjeta (con "Deshacer" breve, igual que en ideas).

## 4. Ideas clave
- Lista de notas cortas por materia; mismos chips de materia que Flashcards (las materias son **compartidas**).
- Campo "Nueva idea en {materia}", máximo **120 caracteres** con contador "0 / 120". `Enter` agrega.
- Borrar con un clic. Aviso "Idea borrada" + "Deshacer" durante unos 5 s.
- Estado vacío: "Aún no hay ideas" + botón "Escribir mi primera idea".

## 5. Repaso
- Selector "Materia a repasar" (incluye "Todas las materias"). Una tarjeta a la vez, con su respuesta oculta hasta voltearla.
- Tres botones tras ver la respuesta: **La sé (1)**, **Dudo (2)**, **No la sé (3)**; atajos de teclado 1, 2, 3. Se distinguen por relleno, ícono y orden, no solo por color.
- Regla de la ronda (definida aquí para resolver el diseño):
  - Una ronda = una pasada por las tarjetas elegidas, en orden aleatorio. Las que fallaron en la ronda anterior van primero.
  - "La sé": sale de la ronda.
  - "Dudo": vuelve **al final de la ronda actual**.
  - "No la sé": vuelve **3 tarjetas más adelante** (si quedan menos de 3, al final).
  - La ronda termina cuando la cola queda vacía.
- Indicadores: "Tarjeta 3 de 6" y "1 la sé · 1 volverá a salir · 3 por ver".
- Fin de ronda: cactus `celebra`, "¡Ronda completa!", "Dominaste X de N tarjetas" (X = las que marcó "La sé" al primer intento) y botones "Repasar otra ronda" / "Volver a Flashcards".
- Sin tarjetas: estado vacío "Nada que repasar aún" + botón "Ir a Flashcards".
- El repaso **no detiene** el cronómetro.

## 6. Fin de bloque
- Al llegar a 00:00 del estudio: suena la campana **una vez**, cactus `celebra` (con flor rosa), título "¡Bloque terminado!", mensaje "Estudiaste N minutos seguidos. Te ganaste M de descanso.", resumen (tarjetas creadas, ideas clave).
- Botones: "Empezar descanso de M min" y "Otro bloque" (salta el descanso y arranca el bloque siguiente). También "Descargar mis tarjetas".

## 7. Descanso
- Cactus `relajado`, etiqueta "Descanso", cuenta regresiva grande, "Campana suave al terminar", consejos ("Toma un vaso de agua", "Estira cuello y espalda", "Mira algo lejano 20 segundos").
- Botones: Pausar, **Saltar descanso**, Cambiar tiempo.
- Al llegar a 00:00: suena la campana una vez y se muestra "Descanso terminado" con el botón "Empezar bloque N+1". **El siguiente bloque no arranca solo** (supuesto: el estudiante decide cuándo volver).

## 8. Aviso al salir y descarga
- **"Cambiar tiempo"** con tarjetas o ideas creadas: modal con "Tus tarjetas no se guardan. ¿Descargarlas antes de salir?" y botones "Descargar mis tarjetas", "Continuar sin descargar" (vuelve al inicio y **borra** tarjetas, ideas y materias), "Seguir estudiando". Sin contenido creado, vuelve al inicio sin modal.
- **Cerrar o recargar la pestaña** con contenido creado: usar el aviso estándar del navegador (`beforeunload`). Su texto **no se puede personalizar**; no intentar hacerlo. Si no hay contenido, no mostrar nada.
- **"Descargar mis tarjetas"**: baja un archivo `effectivestudy-tarjetas.txt` legible, agrupado por materia: tarjetas (`P:` / `R:`) e ideas clave. Incluye las ideas aunque el botón diga "tarjetas". Importar el archivo queda fuera de v1.

## Estados del cactus
`dormido` (inicio) · `lentes` (estudio, repaso, flashcards, ideas) · `relajado` (descanso) · `celebra` (fin de bloque y fin de ronda). Cambio con fundido de 250 ms.
