// Archivo: generador-paletas.js — componente <generador-paletas> de Paletly.
// Extraído de app.js (ahora hay UN archivo por componente) para
// facilitar su estudio: el código del componente es IDÉNTICO al
// original; solo cambia que los imports viven ahora en este archivo.
//
// Lit 3 desde CDN (misma URL en los 6 archivos = un solo módulo
// compartido): LitElement (clase base), html (plantillas) y
// css (estilos encapsulados dentro del Shadow DOM).
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";

// =========================================================
// 1) <generador-paletas>
//    Responsabilidad: generar EXACTAMENTE cuatro colores hex
//    aleatorios y avisar al exterior cuando cambian.
// =========================================================
class GeneradorPaleta extends LitElement {
  // Propiedad reactiva: Lit observa sus cambios y re-renderiza la vista.
  static properties = {
    paleta: { type: Array } // Array: lista de códigos hexadecimales
  };

  // Estilos encapsulados: solo aplican dentro de este Shadow DOM.
  static styles = css`
    /* El host (la etiqueta) ocupa toda la fila de la rejilla:
       height:100% iguala la altura de todas las tarjetas */
    :host { display: block; height: 100%; }

    /* Tarjeta de cristal (Glassmorphism) */
    .tarjeta {
      display: flex;
      flex-direction: column;
      height: 313px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.55);
      box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      margin-bottom: 0px;
      bottom: 0px;
    }

    /* Etiqueta pequeña en mayúsculas (cabecera de la tarjeta) */
    .marca {
      color: #2b6cb0;
      font-size: 0.7rem;
      font-weight: 760;
      letter-spacing: 0.14em;
       
    }

    /* Título de la tarjeta */
    h2 { margin: 8px 0 16px; color: #0f2d4a; font-size: 1.35rem; letter-spacing: -0.02em; }

    /* Rejilla de las cuatro muestras de color */
    .muestreo { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

    /* Cada muestra de color: bloque de color con el hex centrado abajo */
    .muestra {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      height: 58px;
      border-radius: 16px;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65), 0 8px 18px rgba(59, 110, 166, 0.14);
    }

    /* Etiqueta blanca con el código #RRGGBB encima del color */
    .muestra__hex {
      margin-bottom: 8px;
      padding: 4px 9px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.82);
      color: #0f2d4a;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.76rem;
      font-weight: 700;
    }

    /* Botón principal: margin-top:auto lo empuja al fondo de la tarjeta */
    button {
      margin-top: 19px;
      margin-bottom: 20px;
      padding: 12px 14px;
      border: 0;
      border-radius: 14px;
      background: linear-gradient(110deg, #001491, #003772);
      box-shadow: 0 10px 22px rgba(59, 130, 246, 0.28);
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      font-size: 0.92rem;
      font-weight: 750;
      transition: transform 160ms ease, filter 160ms ease;
    }

    /* Estados del botón: hover (se eleva), active (vuelve a su sitio)
       y focus-visible (anillo de foco al navegar con el teclado) */
    button:hover { filter: brightness(1.06); transform: translateY(-2px); }
    button:active { transform: translateY(0); }
    button:focus-visible { outline: 3px solid #0f2d4a; outline-offset: 3px; }
  `;

  // CONSTRUCTOR: se ejecuta al crear cada instancia del componente.
  constructor() {
    super(); // obligatorio: llama al constructor de LitElement (herencia)
    this.paleta = []; // estado inicial reactivo (todavía sin colores)
  }

  // connectedCallback: el componente ya está conectado al DOM.
  connectedCallback() {
    super.connectedCallback();
    // Paleta automática inicial: solo la primera vez que se monta.
    // SI ESTA VACIA GENERAR PALETA
    if (this.paleta.length === 0) this.generarPaleta();
  }

  // Función flecha (campo de clase): conserva el "this" de la instancia.
  // Math.random() → color hexadecimal aleatorio de 6 cifras.
  //6 digitos, 0 si es que faltan
  colorAleatorio = () =>
    "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();

  /**
   * Genera los cuatro colores y notifica al resto de la aplicación.
   * Spread Operator: [...Array(4)] crea una NUEVA referencia de array,
   * imprescindible para que la propiedad reactiva detecte el cambio.
   */
  generarPaleta = () => {
    //SE CREARAN 4 hexa y se guardaran en el array paleta
    //[... expadir es decir undefined, undefined, undefined, undefined] 
    this.paleta = [...Array(4)].map(() => this.colorAleatorio());

    // EVENTO PERSONALIZADO que atraviesa el Shadow DOM:
    //   bubbles: true   → asciende por el árbol hasta el documento
    //                     (el panel lo recibe en el camino y
    //                     main.js lo vuelca al almacén compartido)
    //   composed: true  → cruza la frontera del Shadow DOM
    this.dispatchEvent(
      new CustomEvent("paleta-cambio", {
        detail: { colores: [...this.paleta] }, // los cuatro colores en detail
        bubbles: true,
        composed: true
      })
    );
  };

  render() {
    return html`
      <article class="tarjeta">
        <p class="marca">Paleta · 4 colores</p>
        <h2>Generador aleatorio</h2>

        <!-- Interpolación de plantilla + map() para pintar cada tarjeta -->
        <div class="muestreo">
          ${this.paleta.map(
            (color) => html`
              <div class="muestra" style="background-color: ${color}">
                <span class="muestra__hex">${color}</span>
              </div>
            `
          )}
        </div>

        <!-- Event Binding @click: texto exacto requerido por el enunciado -->
        <button type="button" @click=${this.generarPaleta}>Generar nueva paleta</button>
      </article>
    `;
  }
}

// REGISTRO del componente: a partir de aquí existe la etiqueta <generador-paletas>.
customElements.define("generador-paletas", GeneradorPaleta);
