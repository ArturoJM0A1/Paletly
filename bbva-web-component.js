// Archivo: bbva-web-component.js — componente <bbva-web-component> de Paletly.
// Extraído de app.js (ahora hay UN archivo por componente) para
// facilitar su estudio: el código del componente es IDÉNTICO al
// original; solo cambia que los imports viven ahora en este archivo.
//
// Lit 3 desde CDN (misma URL en los 6 archivos = un solo módulo
// compartido): LitElement (clase base), html (plantillas) y
// css (estilos encapsulados dentro del Shadow DOM).
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";

// =========================================================
// 5) <bbva-web-component>
//    Componente adaptado del ejemplo de BBVA que se pidió
//    incorporar a la aplicación.
//    Responsabilidad: mostrar el logo "BBVA" junto a un mensaje
//    y RECOLOREARSE con la paleta activa que le envía
//    <app-dashboard> mediante Property Binding (.paleta).
//
//    Adaptaciones respecto al código original que se entregó:
//    · import → el original importaba del paquete npm 'lit-element'
//      (eso obliga a paso de compilación); aquí se reutiliza el
//      Lit 3 ya importado al inicio del módulo desde CDN, igual
//      que el resto de componentes del proyecto (sin build).
//    · @property() → el decorador exige Babel/TypeScript; sin
//      compilación se usa static properties, que produce EXACTA-
//      MENTE el mismo efecto reactivo y además es el patrón de
//      todo el proyecto (coherencia de estudio).
//    · static get styles() → se pasa al campo estático
//      static styles = css`...`, la forma recomendada por Lit 3.
//    · color de fondo fijo "blue" → ahora son los 4 colores de la
//      paleta activa, así que cambia de color con la paleta.
//    · Se envuelve en la tarjeta de cristal del resto de la app
//      para que encaje visualmente en la rejilla del dashboard.
// =========================================================
class BbvaWebComponent extends LitElement {
  // Propiedad reactiva: Lit observa sus cambios y vuelve a ejecutar
  // render() actualizando solo lo necesario (diffing).
  static properties = {
    message: { type: String }, // String: texto que acompaña al logo
    paleta: { type: Array }    // Array: los 4 colores hexadecimales activos
  };

  // Estilos encapsulados en el Shadow DOM: no se filtran al exterior
  // ni entran estilos ajenos (Glassmorphism, igual que el resto).
  static styles = css`
    /* El host (la etiqueta) ocupa toda la fila de la rejilla */
    :host { display: block; height: 100%; }

    /* Respaldo por atributo: <bbva-web-component ?oculto> lo oculta.
       Es el boolean binding ?atributo trabajando sobre el HOST. */
    :host([hidden]) { display: none; }

    /* Tarjeta de cristal: mismo aspecto que el resto de tarjetas */
    .tarjeta {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      padding: 24px;
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

    h1 {
      margin: 8px 0 4px;
      font-family: sans-serif;
      font-size: 1rem;
      /* =========================================================
         COLOR DEL TÍTULO MEDIANTE VARIABLE CSS
         ---------------------------------------------------------
         Las variables CSS HEREDAN hasta dentro del Shadow DOM
         (a diferencia de los selectores, que NO entran aquí).
         La variable --paleta-1 la publica <app-dashboard> sobre
         <html> con setProperty(): por eso este título también
         se recolorea solo cuando cambia la paleta.
         rgb(37, 37, 38) es el color fijo del original (respaldo).
         ========================================================= */
      color: var(--paleta-1, rgb(37, 37, 38));
    }

    h1 span {
      display: inline-block;
      color: #ffffff;      /* texto blanco: legible sobre cualquier color */
      /* Respaldo sólido (el "blue" del original): lo sustituye el
         degradado de la paleta, que se inyecta con style en línea
         dentro de render() */
      background-color: blue;
      font-size: 2rem;
      padding: 0.25em;
      /* Solo el color SÓLIDO se interpola con fundido; los degradados
         (background-image) no son transicionables en CSS: cambian de
         golpe al generarse una paleta nueva. */
      transition: background-color 400ms ease;
    }

    /* Los 4 colores recibidos, en texto, para ver en pantalla
       qué ha llegado por Property Binding (útil al estudiar) */
    .paleta-texto {
      margin: 10px 0 0;
      color: #40617f;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.72rem;
      line-height: 1.5;
      word-break: break-all;
    }
  `;

  // CONSTRUCTOR: se ejecuta al crear cada instancia de la etiqueta.
  constructor() {
    super(); // obligatorio: llama al constructor de LitElement (herencia)
    // Mensaje por defecto: el original decía 'use Web Components 🚀HJ'
    // (la "HJ" eran teclas sobrantes); se limpia el texto.
    this.message = "Use Web Components 🚀";
    // Estado inicial: aún sin paleta; la pinta el dashboard al montarse.
    this.paleta = [];
  }

  render() {
    // Los 4 colores llegan desde <app-dashboard> con .paleta=${...}.
    // Si todavía no hay paleta completa, se usan los azules por
    // defecto para que el logo nunca quede sin color.
    const [c1, c2, c3, c4] =
      this.paleta.length === 4
        ? this.paleta
        : ["#60a5fa", "#38bdf8", "#7dd3fc", "#bae6fd"];

    // Degradado con los 4 colores ACTUALES. Cadena calculada en cada
    // render: al generar una paleta nueva cambia this.paleta → Lit
    // vuelve a ejecutar render() → cambia este string → el logo se
    // recolorea solo, sin tocar el Shadow DOM a mano.
    const degradado = `linear-gradient(120deg, ${c1} 0%, ${c2} 33%, ${c3} 66%, ${c4} 100%)`;

    return html`
      <article class="tarjeta">
        <p class="marca">Componente · BBVA adaptado</p>

        <!--
          Estilo en línea con interpolación (alternativa simple al
          directivo styleMap de Lit, aquí sin importar directivas):
          · background-color → 1er color: respaldo con fundido
          · background-image → degradado con los 4 colores de la paleta
        -->
        <h1>
          <span style="background-color: ${c1}; background-image: ${degradado}">BBVA</span>
          ${this.message}
        </h1>

        <!-- Interpolación + join(): los colores recibidos en texto -->
        <p class="paleta-texto">
          Paleta recibida: ${this.paleta.length === 4 ? this.paleta.join(" · ") : "aún sin paleta"}
        </p>
      </article>
    `;
  }
}

// REGISTRO del componente: a partir de aquí existe la etiqueta <bbva-web-component>.
customElements.define("bbva-web-component", BbvaWebComponent);
