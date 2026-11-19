// Archivo: reloj-usuario.js — componente <reloj-usuario> de Paletly.
// Extraído de app.js (ahora hay UN archivo por componente) para
// facilitar su estudio: el código del componente es IDÉNTICO al
// original; solo cambia que los imports viven ahora en este archivo.
//
// Lit 3 desde CDN (misma URL en los 6 archivos = un solo módulo
// compartido): LitElement (clase base), html (plantillas) y
// css (estilos encapsulados dentro del Shadow DOM).
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";

// =========================================================
// 3) <reloj-usuario>
//    Responsabilidad: hora local de 24 horas + zona horaria.
// =========================================================
class RelojUsuario extends LitElement {
  static properties = {
    hora: { type: String },         // String: "14:05:09"
    zonaHoraria: { type: String }   // String: "Europe/Madrid"
  };

  static styles = css`
    :host { display: block; height: 100%; }

    .tarjeta {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 220px;
      padding: 19px;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.55);
      box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      margin: 8px;
    }

    /* Etiqueta pequeña en mayúsculas (cabecera de la tarjeta) */
    .marca {
      color: #2b6cb0;
      font-size: 0.7rem;
      font-weight: 760;
      letter-spacing: 0.14em;
       
    }

    /* Título de la tarjeta */
    h2 { margin: 8px 0 4px; color: #0f2d4a; font-size: 1.35rem; letter-spacing: -0.02em; }

    /* cifras tabulares para que los dígitos no "bailen" */
    .hora {
      margin: 6px 0 0;
      color: #0f2d4a;
      font-size: clamp(2.1rem, 7vw, 3rem);
      font-weight: 780;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.03em;
    }

    /* Píldora con la zona horaria detectada (p. ej. Europe/Madrid) */
    .zona {
      display: inline-flex;
      align-self: flex-start;
      margin-top: 14px;
      padding: 7px 13px;
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 999px;
      background: rgba(147, 197, 253, 0.3);
      color: #1d5b96;
      font-size: 0.8rem;
      font-weight: 650;
    }
  `;

  constructor() {
    super();
    this.hora = "--:--:--"; // hora provisional hasta la primera lectura
    // API internacional: zona horaria configurada en el navegador.
    this.zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  // connectedCallback: se ejecuta al insertar el componente en el DOM.
  connectedCallback() {
    super.connectedCallback();
    this.actualizarHora(); // primera lectura inmediata

    // setInterval(): UN solo temporizador por instancia, cada segundo.
    // Al cambiar "hora" (propiedad reactiva) Lit vuelve a renderizar.
    this.temporizador = setInterval(() => this.actualizarHora(), 1000);

    // Comunica la zona horaria al panel principal (evento compuesto).
    this.dispatchEvent(
      new CustomEvent("zona-horaria", {
        detail: { zona: this.zonaHoraria },
        bubbles: true,
        composed: true
      })
    );
  }

  // disconnectedCallback: se ejecuta al quitar el componente del DOM.
  // Limpiamos el intervalo para evitar temporizadores huérfanos.
  disconnectedCallback() {
    clearInterval(this.temporizador);
    super.disconnectedCallback();
  }

  actualizarHora() {
    const ahora = new Date(); // Date → hora local del usuario
    // hourCycle "h23": formato de 24 horas (evita "24:00" a medianoche).
    this.hora = ahora.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
  }

  render() {
    return html`
      <article class="tarjeta">
        <p class="marca">Reloj · hora local</p>
        <h2>Tu hora ahora</h2>
        <p class="hora">${this.hora}</p>
        <!-- Property Binding string + zona horaria detectada -->
        <span class="zona">${this.zonaHoraria}</span>
      </article>
    `;
  }
}

// REGISTRO del componente: existe la etiqueta <reloj-usuario>.
customElements.define("reloj-usuario", RelojUsuario);
