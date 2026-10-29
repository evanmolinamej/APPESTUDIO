# EffectiveStudy — Brief central

Lee este archivo primero. Los detalles están en `docs/`. El diseño está en `diseno/`.

## Qué es
Web app para estudiantes universitarios. Eligen una técnica de tiempo (Pomodoro, Enfoque, Inmersión o Personalizado), el cronómetro corre y, mientras estudian su cuaderno o PDF, anotan flashcards e ideas clave en la misma pantalla. Mascota: un cactus con 4 estados.

**Contexto:** proyecto universitario, prototipo. Gratis. Lo construye Evan (estudiante, sin experiencia en programación) con Claude Code.

## Alcance (innegociable)
- Sin backend, sin cuentas, **sin guardado**: nada de localStorage, sessionStorage, IndexedDB ni cookies. Todo vive en memoria; al cerrar o recargar se pierde. La UI lo dice ("Nada se guarda").
- Solo computador. Ventana objetivo: **700 px de ancho** (el estudiante tiene su PDF al lado). Debe verse bien también a pantalla completa. Móvil queda fuera.
- Todo el texto de la interfaz en **español**.
- Stack: **HTML + CSS + JavaScript puro**. Sin frameworks, sin npm, sin build. Debe abrirse con doble clic en `index.html`.
- Flashcards: **solo texto**, agrupadas por **materia**.
- Técnicas: llamarlas "técnicas populares". **No escribir en la UI ni en la documentación que están "comprobadas científicamente"**.

## Índice
| Documento | Contenido |
|---|---|
| `docs/01-funciones.md` | Qué hace cada pantalla y reglas de comportamiento (cronómetro, repaso, descarga, avisos) |
| `docs/02-diseno.md` | Colores, tipografía, medidas, cactus, movimiento y accesibilidad |
| `docs/03-tecnica.md` | Estructura de archivos, cronómetro exacto, sonido, fases de construcción y pruebas |
| `diseno/` | Archivos del diseño de Claude Design (referencia visual, ver abajo) |

## Sobre la carpeta `diseno/`
Son archivos `.dc.html` exportados de Claude Design. **Son referencia, no el producto**: no se abren con doble clic (dependen de un visor). Léelos como código para copiar textos, medidas, clases y el SVG del cactus. Mapa: `Main` = inicio, `02` sesión, `03` flashcards, `04` ideas clave, `05` repaso, `06` descanso, `07` fin de bloque, `08` avisos y estados vacíos, `09` y `10` sistema de diseño, `Cactus` = mascota (4 estados).
Si algo del diseño choca con este brief, **manda este brief**, y avisa a Evan.

## Cómo trabajar con Evan
- Evan no sabe programar. Explica cada término técnico en lenguaje simple, sin dar nada por sentado.
- Respuestas breves, directas, en español.
- Antes de escribir código, muestra un plan corto de la fase. Al terminar cada fase, **detente**, di qué probar y espera su visto bueno.
- Ante una decisión importante, ofrece **dos opciones** con ventajas y desventajas; él decide.
- Si algo no tiene sentido o no va a funcionar, dilo. No inventes funciones fuera de este brief.
- Actúa sin preguntar en lo reversible; pregunta en lo importante.

## Fuera de alcance (v1)
Cuentas, base de datos, guardado, importar tarjetas, repaso espaciado entre días, imágenes en tarjetas, móvil, modo oscuro, otros idiomas.

## Definición de terminado
Todas las pruebas de `docs/03-tecnica.md` (sección Pruebas) pasan, y Evan confirma pantalla por pantalla contra el diseño.
