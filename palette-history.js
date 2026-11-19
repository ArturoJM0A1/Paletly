// Archivo: palette-history.js — componente <palette-history> de Paletly.
//
// Lit 3 desde CDN (misma URL en los 6 archivos = un solo módulo
// compartido): LitElement (clase base), html (plantillas) y
// css (estilos encapsulados dentro del Shadow DOM).
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";

// =========================================================
// 2) <palette-history>
//    Responsabilidad: mostrar el registro de todas las paletas
//    generadas (4 valores por cada cambio). No guarda estado propio:
//    recibe el historial desde <app-dashboard> mediante una propiedad
//    reactiva, siguiendo el patrón de datos "hacia abajo" del proyecto.
// =========================================================
class HistorialPaletas extends LitElement {
  // Propiedad reactiva: lista de paletas, cada una con sus 4 colores.
  static properties = {
    historial: { type: Array } // Array de arrays: [["#AA..", "#BB..", ...], ...]
  }; 

  // Estilos encapsulados en el Shadow DOM (se repiten por diseño).
  static styles = css`
    :host { display: block; height: 100%; }

    .tarjeta {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 21px;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.55);
      box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    /* Etiqueta pequeña en mayúsculas (cabecera de la tarjeta) */
    .marca {
      color: #2b6cb0;
      font-size: 0.7rem;
      font-weight: 760;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    /* Título de la tarjeta */
    h2 { margin: 8px 0 4px; color: #0f2d4a; font-size: 1.35rem; letter-spacing: -0.02em; }

    /* Contador de paletas guardadas (se escribe en singular o plural) */
    .contador { margin: 0 0 14px; color: #5b7fa6; font-size: 0.82rem; }

    /* Lista con scroll propio para que el historial no alargue la tarjeta */
    .lista {
      display: grid;
      gap: 10px;
      max-height: 268px;
      margin: 0;
      padding: 2px 8px 2px 0;
      overflow-y: auto;
      list-style: none;
    }

    /* Barra de scroll del historial: 1 px, azul celeste translúcido.
       Los estilos del documento NO llegan al Shadow DOM, así que aquí
       hay que declarar la barra otra vez para que sea consistente. */
    .lista::-webkit-scrollbar { width: 1px; height: 1px; }
    .lista::-webkit-scrollbar-track { background: rgba(125, 211, 252, 0.18); }
    .lista::-webkit-scrollbar-thumb {
      background: rgba(53, 91, 230, 0.81);
      border-radius: 999px;
    }
    .lista { scrollbar-width: thin; scrollbar-color: rgba(56, 117, 248, 0.65) rgba(125, 211, 252, 0.18); }

    /* Cada paleta del historial: tarjeta pequeña dentro de la lista */
    .entrada {
      display: grid;
      gap: 7px;
      padding: 11px 11px;
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-bottom: 2px solid rgba(187, 219, 255, 0.9);
      border-radius: 14px;
      background: rgba(231, 247, 255, 0.5);
    }

    /* Número correlativo: "Paleta 1", "Paleta 2"... */
    .entrada__indice {
      color: #2b6cb0;
      font-size: 0.68rem;
      font-weight: 760;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    /* Las 4 muestras de cada paleta guardada */
    .entrada__colores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0px; }

    /* Miniatura de UN solo color de la paleta guardada */
    .celda {
      height: 32px;
      border-radius: 8px;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
    }

    /* Los 4 valores en texto (hex) para poder copiarlos */
    .entrada__hex {
      color: #40617f;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.66rem;
      line-height: 1.5;
      word-break: break-all;
      text-align: center;
    }

    /* Mensaje de estado vacío: aún no se ha generado ninguna paleta */
    .vacio { margin: 0; color: #5b7fa6; font-size: 0.88rem; line-height: 1.6; }
  `;

  constructor() {
    super();
    this.historial = []; // estado inicial: sin paletas registradas
  }

  render() {
    // Número correlativo: la más reciente (índice 0) queda la última.
    return html`
      <article class="tarjeta">
        <p class="marca">Historial · paletas</p>
        <h2>Paletas generadas</h2>
        <p class="contador">
          ${this.historial.length === 1
            ? "1 paleta guardada"
            : `${this.historial.length} paletas guardadas`}
        </p>

        <!-- Interpolación + map() para pintar cada entrada del registro -->
        ${this.historial.length === 0
          ? html`<p class="vacio">Todavía no hay paletas: pulsa «Generar nueva paleta».</p>`
          : html`
              <ol class="lista">
                ${this.historial.map(
                  (paleta, indice) => html`
                    <li class="entrada">
                            <!-- Indice inicia en 0 - 1 se reta para para obtener todo el historial-->

                      <span class="entrada__indice">Paleta ${this.historial.length}</span>
                      <!-- Muestra visual de los 4 colores guardados -->
                      <div class="entrada__colores">
                        ${paleta.map(
                          (color) => html`<span class="celda" style="background-color:${color}" title="${color}"></span>`
                        )}
                      </div>

                      <!-- Los 4 valores en texto (hex) para poder copiarlos -->
                      <code class="entrada__hex">${paleta.join("    ✦    ")}</code>
                    </li>
                  `
                )}
              </ol>
            `}
      </article>
    `;
  }
}

// REGISTRO del componente: existe la etiqueta <palette-history>.
customElements.define("palette-history", HistorialPaletas);
