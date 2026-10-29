# 02 · Diseño "Desierto fresco"

Fuente de verdad visual: `diseno/09-sistema-fundamentos.dc.html` y `diseno/10-sistema-componentes.dc.html`. Usar **los mismos nombres de variables CSS y de clases** que el diseño.

## Variables CSS (`:root`)
| Variable | Valor | Uso |
|---|---|---|
| `--menta` | `#E4F5EA` | Fondo general |
| `--crema` | `#F6F8F1` | Zona de estudio (cronómetro y paneles) |
| `--cactus` | `#4FAE74` | **Solo relleno** (cactus, progreso). Nunca texto |
| `--bosque` | `#1E5B3C` | Texto, botones, trazos |
| `--arena` | `#F7EFD8` | Tarjetas y flashcards |
| `--rosa` | `#F28FA8` | Acento (flor, descanso en barras). Nunca texto |
| `--arena-borde` | `#E6D6A8` | Borde de tarjetas |
| `--menta-media` | `#CBE9D5` | Pista de barras, insignias |
| `--rosa-claro` | `#FCE3EA` | Fondo de "No la sé" |
| `--suave` | `#4B6B59` | Texto secundario, etiquetas |
| `--campo` | `#FFFFFC` | Fondo de campos |
| `--borde-campo` | `#5E8D72` | Borde de campos |
| `--sombra-sm/md/lg` | verde bosque transparente | Nunca gris ni negro |

**Regla de contraste:** todo texto ≥ 4,5:1. Nunca texto sobre `--cactus` ni `--rosa`. Nunca texto claro sobre verde claro.

## Tipografía
- **Nunito** (500–900) para todo el texto. **JetBrains Mono** (700–800) solo para el cronómetro.
- Cargar desde Google Fonts (el diseño ya trae el `<link>`), con respaldo `system-ui` y `ui-monospace`.
- Cronómetro: Mono 800, **116–128 px**, interlineado 1, `letter-spacing: -0.02em`.
- Título de pantalla: Nunito 900, 32–38 px. Título de panel: 900, 19–22 px. Cuerpo: 600, 16–17 px, interlineado 1,4. Botón/pestaña: 800, 15–17 px (21 px en el grande). Etiqueta: 800, 14 px, color `--suave`.

## Forma, bordes y espaciado
- Radios: 999 (botón, chip), 32 (zona), 24 (tarjeta), 16 (campo).
- Bordes 2 px en tarjetas y campos; 3 px en la opción seleccionada.
- Espaciado: 4, 8, 12, 16, 24, 32. Ventana de 700 px, margen lateral 24, 16 entre zonas, 12 entre tarjetas.
- Botones: grande 64, normal 52, pequeño 44 de alto. **Nunca menos de 44 px.**
- Estados de botón: normal, hover, foco (`outline: 3px solid var(--bosque); outline-offset: 3px`), deshabilitado.

## Cactus
- Extraer el SVG de `diseno/Cactus.dc.html`, uno por estado: `dormido`, `lentes`, `relajado`, `celebra`.
- Trazo bosque de 6 px por cada 200 px de ancho. Tamaño mínimo 32 px. Un solo cactus grande por pantalla (más el pequeño del encabezado). Solo sobre menta, crema o arena. Nunca recolorear.
- `celebra` es el único con flor rosa y confeti.
- Cambio de estado: fundido de 250 ms.

## Movimiento
- Hover y foco: 150 ms, solo color y sombra.
- Voltear flashcard: 350 ms, giro sobre el eje Y, `ease-in-out`.
- **`prefers-reduced-motion`:** sin giro; la tarjeta cambia con un fundido corto. Sin confeti animado.

## Accesibilidad mínima
- Tarjetas de técnica: `button` con `aria-pressed`. Pestañas: `role="tablist"`, `tab`, `tabpanel`, con flechas del teclado.
- Todo se maneja con teclado, con foco visible. Cada ícono sin texto lleva `aria-label`.
- El cronómetro **no** se anuncia cada segundo: usar `aria-live="polite"` solo en mensajes de fin de bloque y de descanso.
- No transmitir información solo con color (por eso los botones de repaso llevan ícono y orden).
