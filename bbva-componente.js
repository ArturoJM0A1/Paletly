// Archivo: bbva-componente.js — componente <bbva-componente> de Paletly.
// Extraído de app.js (ahora hay UN archivo por componente) para
// facilitar su estudio: el código del componente es IDÉNTICO al
// original; solo cambia que los imports viven ahora en este archivo.
//
// Lit 3 desde CDN (misma URL en los 6 archivos = un solo módulo
// compartido): LitElement (clase base), html (plantillas) y
// css (estilos encapsulados dentro del Shadow DOM).
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";

// =========================================================
// 5) <bbva-componente>
//    Componente adaptado del ejemplo de BBVA que se pidió
//    incorporar a la aplicación.
//    Responsabilidad: mostrar el logo "BBVA" junto a un mensaje
//    y RECOLOREARSE con la paleta activa que le envía
//    <app-panel-control> mediante Property Binding (.paleta).
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

    /* Respaldo por atributo: <bbva-componente ?oculto> lo oculta.
       Es el boolean binding ?atributo trabajando sobre el HOST. */
    :host([hidden]) { display: none; }

    /* Tarjeta de cristal: mismo aspecto que el resto de tarjetas */
    .tarjeta {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 313px;
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
         La variable --paleta-1 la publica <app-panel-control> sobre
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

    /* Icono de cells en clippath: se pinta con el degradado de la paleta activa */
    .cellsicon {
    width: 40px;
    height: 40px;
    clip-path: polygon(69.71% 0%, 80.46% 0.64%, 88.6% 4.82%, 94.79% 11.9%, 98.05% 22.51%, 96.42% 32.8%, 76.87% 75.56%, 67.43% 87.14%, 53.42% 94.86%, 45.6% 96.46%, 35.83% 96.46%, 21.17% 91.96%, 10.1% 83.28%, 5.54% 77.17%, 1.63% 68.81%, 0% 60.77%, 0% 51.77%, 8.14% 53.7%, 8.14% 53.7%, 9.45% 65.59%, 15.31% 76.53%, 23.45% 83.6%, 33.88% 87.78%, 47.56% 87.78%, 59.93% 82.32%, 68.4% 73.31%, 87.3% 32.8%, 89.58% 25.4%, 88.93% 19.29%, 81.11% 20.9%, 81.11% 20.9%, 81.11% 27.33%, 76.55% 31.83%, 70.36% 31.83%, 65.8% 27.97%, 65.8% 20.26%, 71.01% 16.08%, 76.55% 16.4%, 81.11% 20.9%, 88.93% 19.29%, 85.34% 13.18%, 78.18% 8.68%, 71.99% 8.04%, 64.5% 10.29%, 25.08% 27.97%, 28.99% 34.73%, 28.99% 34.73%, 37.13% 32.15%, 46.25% 32.48%, 55.37% 36.66%, 45.28% 49.52%, 45.28% 49.52%, 40.07% 48.23%, 36.16% 49.52%, 33.88% 51.77%, 32.57% 57.23%, 36.16% 63.02%, 41.69% 64.31%, 47.56% 60.77%, 48.86% 55.63%, 47.56% 51.77%, 45.28% 49.52%, 55.37% 36.66%, 61.56% 43.09%, 64.82% 50.8%, 65.15% 60.13%, 60.91% 70.42%, 55.05% 76.21%, 46.25% 80.06%, 36.81% 80.39%, 28.01% 77.17%, 20.52% 70.42%, 16.61% 61.74%, 16.61% 50.8%, 20.85% 41.8%, 28.99% 34.73%, 25.08% 27.97%, 20.2% 31.19%, 12.38% 40.19%, 8.14% 53.7%, 0% 51.77%, 1.63% 43.73%, 4.89% 36.33%, 14.01% 25.4%, 21.17% 20.58%, 63.52% 1.61%);
    display: inline-block;
    margin-left: 8px;
  `;

  // CONSTRUCTOR: se ejecuta al crear cada instancia de la etiqueta.
  constructor() {
    super(); // obligatorio: llama al constructor de LitElement (herencia)
    this.message = ":)";
    // Estado inicial: aún sin paleta; la pinta el dashboard al montarse.
    this.paleta = [];
  }

  render() {
    // Los 4 colores llegan desde <app-panel-control> con .paleta=${...}.
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
        <p class="marca">Componente · BBVA</p>

        <!--
          Estilo en línea con interpolación (alternativa simple al
          directivo styleMap de Lit, aquí sin importar directivas):
          · background-color → 1er color: respaldo con fundido
          · background-image → degradado con los 4 colores de la paleta
        -->
        <h1>
          <span style="background-color: ${c1}; background-image: ${degradado}">BBVA</span>
          <div class="cellsicon" style="background-image: ${degradado};"></div>
        </h1>

        <!-- Interpolación + join(): los colores recibidos en texto -->
        <p class="paleta-texto">
          Paleta recibida: ${this.paleta.length === 4 ? this.paleta.join(" · ") : "aún sin paleta"}
        </p>
                  ${this.message} 

      </article>
    `;
  }
}

// REGISTRO del componente: a partir de aquí existe la etiqueta <bbva-componente>.
customElements.define("bbva-componente", BbvaWebComponent);
