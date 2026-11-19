// Archivo: app-panel-control.js — componente <app-panel-control> de Paletly.
// Extraído de app.js (ahora hay UN archivo por componente) para
// facilitar su estudio: el código del componente es IDÉNTICO al
// original; solo cambia que los imports viven ahora en este archivo.
//
// Lit 3 desde CDN (misma URL en los 6 archivos = un solo módulo
// compartido): LitElement (clase base), html (plantillas) y
// css (estilos encapsulados dentro del Shadow DOM).
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";

// =========================================================
// 6) <app-panel-control>
//    Responsabilidad: estado general y coordinación.
//    Escucha los eventos de sus hijos y les pasa datos por propiedades.
// =========================================================
class PanelPrincipal extends LitElement {
  // Estado compartido: paleta, ubicación, zona horaria, historial y mensaje.
  static properties = {
    paleta: { type: Array },
    historial: { type: Array },        // Array de arrays: 4 colores por paleta
    latitud: { type: Number },
    longitud: { type: Number },
    zonaHoraria: { type: String },
    estado: { type: String },           // "cargando" | "ok" | "error"
    mensajeEstado: { type: String },
    precision: { type: Number }         // Number: precisión en metros (± m)
  };

  static styles = css`
    /* width:100% → el host ocupa toda la fila de la rejilla exterior
       (.pagina usa justify-items:center, que si no lo encogería) y así
       la rejilla interna puede repartir sus dos columnas. */
    :host { display: block; width: 100%; }

    /* CSS Grid: las tarjetas en dos columnas y el mapa a lo ancho.
       Con minmax(340px, 1fr) y un contenedor de 1040px caben siempre
       dos columnas de ~509px; en móvil pasa a una sola columna.
       Al añadir <bbva-componente> la rejilla reparte sola el
       hueco extra (auto-fit), sin que haya que tocar este CSS. */
    .rejilla {
      display: grid;
      grid-template-columns: repeat(3, minmax(320px, 1fr));
      gap: 10px;
      width: min(100%, 1090px);
      margin: 0 auto;
    }

    .ancho-completo { grid-column: 1 / -1; } /* el mapa ocupa todo el ancho */

    /* Panel de estado: tarjeta de cristal con el mensaje general */
    .estado {
      padding: 12px 14px;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.55);
      box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    /* Cabecera del panel: punto de estado + texto en mayúsculas */
    .estado__titulo {
      display: flex;
      align-items: center;
      gap: 9px;
      margin: 0 0 10px;
      color: #2b6cb0;
      font-size: 0.7rem;
      font-weight: 760;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    /* Punto de estado: Boolean Binding ?encendido → atributo presente/ausente */
    .punto {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #94a3b8;
      box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.2);
    }
    .punto[encendido] { background: #22c55e; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2); }

    /* Textos del panel: los párrafos del estado y sus resaltados */
    .estado p { margin: 0 0 8px; color: #40617f; font-size: 0.9rem; line-height: 1.6; }
    .estado p:last-of-type { margin-bottom: 0; } /* sin margen inferior en el último */
    .estado strong { color: #0f2d4a; font-weight: 650; }

    /* Botón de reintento de la geolocalización (aparece solo si falló) */
    .boton-reintento {
      margin-top: 14px;
      padding: 10px 16px;
      border: 1px solid rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      background: linear-gradient(110deg, #60a5fa, #7dd3fc);
      box-shadow: 0 8px 18px rgba(59, 130, 246, 0.25);
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      font-size: 0.85rem;
      font-weight: 720;
      transition: transform 160ms ease, filter 160ms ease;
    }
    .boton-reintento:hover { filter: brightness(1.06); transform: translateY(-1px); }
    .boton-reintento:active { transform: translateY(0); }
    .boton-reintento:focus-visible { outline: 3px solid #0f2d4a; outline-offset: 2px; }

    /* Muestras de la paleta activa compartida */
    .estado__paleta { display: flex; gap: 8px; margin-top: 12px; }
    .punto-color {
      width: 26px;
      height: 26px;
      border: 2px solid #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(59, 110, 166, 0.22);
    }
  `;

  constructor() {
    super();
    // Valor inicial compartido hasta que el generador emita su primera paleta.
    this.paleta = ["#93c5fd", "#7dd3fc", "#bfdbfe", "#e0f2fe"];
    // Registro de paletas: la más reciente primero (empieza vacío).
    this.historial = [];
    this.latitud = null;
    this.longitud = null;
    this.zonaHoraria = "Detectando…";
    this.estado = "cargando";
    this.mensajeEstado = "Solicitando permiso de ubicación…";
    this.precision = null;   // precisión en metros; null hasta tener ubicación
    this.ubicacionPedida = false;
  }

  // connectedCallback: los oyentes se registran ANTES de que Lit cree
  // los hijos (que se montan en el primer render, posterior a este método).
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("paleta-cambio", this.manejarPaleta);
    this.addEventListener("zona-horaria", this.manejarZona);
    this.pedirUbicacion();
  }

  // disconnectedCallback: se retiran los oyentes para no dejar basura.
  disconnectedCallback() {
    this.removeEventListener("paleta-cambio", this.manejarPaleta);
    this.removeEventListener("zona-horaria", this.manejarZona);
    super.disconnectedCallback();
  }

  // firstUpdated(): se ejecuta UNA sola vez, después del primer render.
  // Publica ya la paleta inicial para que el logotipo nazca coloreado.
  firstUpdated() {
    this.publicarPaleta();
  }

  /**
   * updated(): se ejecuta DESPUÉS de cada render del componente.
   * Cuando cambia la paleta se publican sus cuatro colores como variables
   * CSS sobre <html>. Es el puente con el logotipo del encabezado, que
   * vive en el documento principal y FUERA de cualquier Shadow DOM: allí
   * no llegan las propiedades de Lit, pero sí las variables CSS heredadas.
   */
  updated(propiedadesAnteriores) {
    if (propiedadesAnteriores.has("paleta")) this.publicarPaleta();
  }

  // Recorre los cuatro colores y los escribe con setProperty().
  // El logotipo los lee con var(--paleta-1) y cambia de color solo,
  // sin manipular su nodo (Lit/JS no deben tocar lo que el CSS gobierna).
  publicarPaleta() {
    this.paleta.forEach((color, indice) => {
      document.documentElement.style.setProperty(`--paleta-${indice + 1}`, color);
    });
  }

  // Funciones flecha como campos: mantienen el "this" de la instancia.
  manejarPaleta = (evento) => {
    const colores = evento.detail.colores; // los 4 colores recibidos

    // Nueva referencia (spread) → propiedad reactiva → los hijos se actualizan.
    this.paleta = [...colores];

    // HISTORIAL: se guarda una copia de los 4 valores de cada paleta.
    // Se coloca al inicio ([nueva, ...anteriores]) para que la más reciente
    // aparezca primero; Spread crea un array NUEVO sin mutar el anterior,
    // que es lo que permite a Lit detectar el cambio y re-renderizar.
    this.historial = [[...colores], ...this.historial];
  };

  manejarZona = (evento) => {
    this.zonaHoraria = evento.detail.zona;
  };

  // Promesa que envuelve la API de geolocalización para usar async/await.
  obtenerPosicion = () =>
    new Promise((resolver, rechazar) => {
      navigator.geolocation.getCurrentPosition(resolver, rechazar, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });

  /**
   * Solicita la ubicación real. NO se inventan coordenadas:
   * si el usuario deniega el permiso, se muestra el error correspondiente.
   */
  async pedirUbicacion() {
    if (this.ubicacionPedida) return; // evita solicitudes simultáneas
    this.ubicacionPedida = true;
    this.estado = "cargando";
    this.mensajeEstado = "Solicitando permiso de ubicación…";

    if (!navigator.geolocation) {
      this.estado = "error";
      this.mensajeEstado = "Este navegador no admite la geolocalización.";
      return;
    }

    try {
      const posicion = await this.obtenerPosicion();
      this.latitud = posicion.coords.latitude;
      this.longitud = posicion.coords.longitude;

      // Precisión en metros (coords.accuracy). Si es enorme, el navegador
      // está estimando la posición por IP (VPN, proxy o red corporativa)
      // en lugar de una posición real precisa: útil para diagnosticar
      // por qué el mapa no coincide con la ubicación esperada.
      this.precision = posicion.coords.accuracy ?? null;
      this.estado = "ok";
      this.mensajeEstado =
        this.precision !== null && this.precision > 5000
          ? "Ubicación aproximada: el navegador la estima por IP (VPN, proxy o red corporativa)."
          : "Ubicación detectada correctamente.";
    } catch (error) {
      // Códigos estándar: 1 permiso denegado, 2 no disponible, 3 tiempo agotado.
      this.estado = "error";
      this.precision = null;
      this.mensajeEstado =
        error.code === 1
          ? "Permiso de ubicación denegado: actívalo en el candado de la barra de direcciones y pulsa «Reintentar ubicación»."
          : error.code === 2
            ? "No se pudieron determinar las coordenadas."
            : error.code === 3
              ? "Se agotó el tiempo esperando la ubicación; inténtalo de nuevo."
              : "No se pudo obtener la ubicación.";
    }
  }

  /**
   * Vuelve a solicitar la ubicación. El navegador solo muestra el diálogo
   * de permiso una vez: si se denegó (o falló por tiempo), sin este
   * reintento la aplicación no podría volver a pedirla en toda la sesión.
   */
  reintentarUbicacion = () => {
    this.ubicacionPedida = false; // desbloquea la única solicitud en curso
    this.pedirUbicacion();
  };

  render() {
    return html`
      <div class="rejilla">
        <!-- Fuente de la paleta: al generar avisa con "paleta-cambio" -->
        <generador-paletas></generador-paletas>

        <!-- Historial: recibe el registro por propiedad (.historial) -->
        <historial-paletas .historial=${this.historial}></historial-paletas>

        <!-- Hijo independiente: detecta y muestra su propia hora local -->
        <reloj-usuario></reloj-usuario>

        <!--
          Componente BBVA adaptado: recibe la paleta ACTIVA por
          Property Binding (.paleta=valor). Al pulsar «Generar nueva
          paleta» el dashboard cambia this.paleta → Lit repinta a sus
          hijos → este componente se recolorea con los 4 colores.
          (Ojo: en un comentario DENTRO de una plantilla html no se
          debe escribir el símbolo de interpolación seguido de
          llaves, porque Lit lo trataría como código y fallaría.)
        -->
        <bbva-componente .paleta=${this.paleta}></bbva-componente>

        <!-- Estado compartido (ubicación + zona horaria + paleta activa) -->
        <section class="estado">
          <p class="estado__titulo">
            <span class="punto" ?encendido=${this.estado === "ok"}></span>
            Estado de la aplicación
          </p>
          <p aria-live="polite">${this.mensajeEstado}</p>

          <!-- Precisión en metros: diagnostica ubicación aproximada -->
          ${this.estado === "ok" && this.precision !== null
            ? html`<p>Precisión estimada: <strong>±${Math.round(this.precision)} m</strong></p>`
            : ""}

          <p>Zona horaria: <strong>${this.zonaHoraria}</strong></p>
          <div class="estado__paleta" aria-label="Paleta activa">
            ${this.paleta.map((color) => html`<span class="punto-color" style="background:${color}"></span>`)}
          </div>

          <!-- Solo aparece si falló la ubicación: permite volver a pedirla -->
          ${this.estado === "error"
            ? html`
                <button type="button" class="boton-reintento" @click=${this.reintentarUbicacion}>
                  Reintentar ubicación
                </button>
              `
            : ""}
        </section>

        <!-- Property Binding (.prop): el mapa recibe datos tipados del padre -->
        <mapa-ubicacion-usuario
          class="ancho-completo"
          .latitud=${this.latitud}
          .longitud=${this.longitud}
          .paleta=${this.paleta}
          .aviso=${this.mensajeEstado}
        ></mapa-ubicacion-usuario>
      </div>
    `;
  }
}

// REGISTRO del componente principal.
customElements.define("app-panel-control", PanelPrincipal);
