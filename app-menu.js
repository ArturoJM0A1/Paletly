// =========================================================
// ARCHIVO: app-menu.js — <app-menu> · MENÚ DE NAVEGACIÓN SPA
// =========================================================
// Menú visible en TODAS las rutas. Vive en index.html FUERA de
// #app-content, de modo que el router no lo toca al cambiar de
// vista (solo monta/desmonta el contenido de ese contenedor).
//
// Usa PageController de Open Cells:
//
//   · this.pageController.subscribe('__oc_app', cb)
//       → el canal de contexto de la aplicación publica en CADA
//         navegación { currentPage, fromPage, currentRoute }.
//         Con ello se resalta el enlace de la ruta activa.
//
//   · this.navigate('nombre-ruta')
//       → navegación SPA: cambia el hash de la URL sin recargar
//         la página y el router de Open Cells cambia de vista.
//
// Los <a href="#!/..."> son enlaces REALES además de botones:
// si el usuario los guarda en marcadores o abre uno en otra
// pestaña, la URL ya apunta a la ruta correcta.
// =========================================================
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";
import { PageController } from '@open-cells/page-controller';

// name   → nombre de la ruta en routes.js (lo recibe navigate()).
// href   → hash real de la URL (lo que ve el navegador).
// icono  → clase de Font Awesome 6 (SOLO icono, sin texto visible;
//          la etiqueta se conserva como title/aria-label para que
//          el enlace siga siendo accesible y con tooltip).
// etiqueta → texto original: solo se usa como tooltip y nombre
//          accesible del enlace.
const RUTAS = [
  { name: 'home', etiqueta: 'Panel', href: '#!/', icono: 'fa-solid fa-gauge-high' },
  { name: 'generador-paletas', etiqueta: 'Generador', href: '#!/generador-paletas', icono: 'fa-solid fa-palette' },
  { name: 'historial-paletas', etiqueta: 'Historial', href: '#!/historial-paletas', icono: 'fa-solid fa-clock-rotate-left' },
  { name: 'reloj-usuario', etiqueta: 'Reloj', href: '#!/reloj-usuario', icono: 'fa-solid fa-clock' },
  { name: 'mapa-ubicacion-usuario', etiqueta: 'Mapa', href: '#!/mapa-ubicacion-usuario', icono: 'fa-solid fa-map-location-dot' },
  { name: 'bbva-componente', etiqueta: 'Logo BBVA', href: '#!/bbva-componente', icono: 'fa-solid fa-swatchbook' },
];

// Hoja de estilos de Font Awesome (iconos). OJO: este menú vive en
// un Shadow DOM, y los estilos del documento NO entran aquí (igual
// que con Leaflet en <mapa-ubicacion-usuario>), así que la hoja se
// inyecta DENTRO del Shadow Root en firstUpdated().
const FA_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';

// Canal de contexto de la app (prefijo `__oc` = canal de Open Cells).
// Lo publica el Bridge en cada navegación con el nombre de la página.
const CANAL_CONTEXTO = '__oc_app';

class AppMenu extends LitElement {
  // Propiedad reactiva: al cambiar, Lit vuelve a ejecutar render()
  // y repinta el aria-current de los enlaces.
  static properties = {
    rutaActual: { type: String }, // nombre de la ruta activa ('home', ...)
  };

  // Estilos encapsulados (Shadow DOM), mismas "tarjeta de cristal"
  // y variables --paleta-1..4 que el resto de la aplicación.
  static styles = css`
    /* =========================================================
       RAIL VERTICAL FIJO AL BORDE IZQUIERDO
       ---------------------------------------------------------
       El menú vive FUERA de #app-content, así que el router no lo
       toca al cambiar de vista: este position:fixed lo mantiene
       siempre visible mientras el usuario navega.
       ========================================================= */
    :host {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 4; /* por encima de la cabecera (z-index: 3) */
      display: flex;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 100vh;  /* altura completa de la ventana… */
      height: 100dvh; /* …sin la barra del navegador en móvil */
    }

    nav {
      display: flex;
      flex-direction: column; /* VERTICAL: iconos de arriba a abajo */
      gap: 10px;
      padding: 14px 8px;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-left: 0; /* pegado al borde: la "costura" queda fuera */
      border-radius: 0 26px 26px 0;
      background: rgba(255, 255, 255, 0.55);
      box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
    }

    /* Cada opción: SOLO el icono (el texto es el tooltip y el
       nombre accesible, declarados en render()). */
    a {
      display: grid;
      place-content: center;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      color: #2b6cb0;
      font-size: 1.2rem; /* tamaño del icono de Font Awesome */
      text-decoration: none;
      transition: background-color 160ms ease, color 160ms ease,
        transform 160ms ease, box-shadow 160ms ease;
    }

    a:hover {
      background: rgba(56, 189, 248, 0.18);
      transform: translateX(2px);
    }

    a:focus-visible {
      outline: 2px solid #38bdf8;
      outline-offset: 2px;
    }

    /* Ruta activa: degradado con los colores de la paleta actual.
       Si aún no hay paleta (rutas aisladas), respaldos azules. */
    a[aria-current='page'] {
      color: #ffffff;
      background: linear-gradient(120deg,
          var(--paleta-1, #2b6cb0) 0%,
          var(--paleta-2, #38bdf8) 55%,
          var(--paleta-3, #7dd3fc) 100%);
      box-shadow: 0 8px 18px rgba(59, 110, 166, 0.25);
    }

    @media (max-width: 560px) {
      :host { width: 60px; }
      a { width: 40px; height: 40px; font-size: 1.05rem; }
    }
  `;

  constructor() {
    super();

    // Estado inicial: la app siempre arranca en la ruta '/'.
    this.rutaActual = 'home';

    // PageController (Open Cells): extiende a ElementController y da
    // acceso a navigate, publish, subscribe y getCurrentRoute, más
    // los hooks onPageEnter/onPageLeave (aquí no se usan: el menú no
    // es una página del router, solo un elemento fijo).
    this.pageController = new PageController(this);

    // Alias para poder llamar this.navigate(...) como en la
    // documentación de Open Cells. navigate recibe el NAME de la
    // ruta (no el path) y un objeto opcional de parámetros.
    this.navigate = (pagina, params) => this.pageController.navigate(pagina, params);

    // El callback debe ir ligado al componente: si no, `this` dentro
    // del callback no sería la instancia y requestUpdate() fallaría.
    this.manejarContexto = this.manejarContexto.bind(this);
  }

  connectedCallback() {
    super.connectedCallback(); // ← obligatorio: ejecuta los controllers

    // Suscripción al contexto de la app. Si el router aún no está
    // arrancado, Open Cells encola la petición y la ejecuta al
    // inicializar (window.cellsBridgeQueue), así que no hay carreras.
    this.pageController.subscribe(CANAL_CONTEXTO, this.manejarContexto);
  }

  disconnectedCallback() {
    // Dejar de escuchar: si no, Open Cells conservaría una
    // suscripción con referencia a un nodo ya desconectado.
    this.pageController.unsubscribe(CANAL_CONTEXTO);
    super.disconnectedCallback();
  }

  // Open Cells envía evt.detail = { value: { currentPage, ... } },
  // así que el argumento recibido es { value }.
  manejarContexto({ value }) {
    const pagina = value && value.currentPage;
    if (pagina && pagina !== this.rutaActual) {
      this.rutaActual = pagina; // ← cambia la propiedad → Lit repinta
    }
  }

  // Clic en un enlace: se cancela el salto nativo (#hash) y se
  // navega con Open Cells. El resultado es idéntico (misma URL),
  // pero sin recargar la página.
  irA(nombreRuta, evento) {
    evento.preventDefault();
    this.navigate(nombreRuta);
  }

  // firstUpdated(): se ejecuta UNA sola vez, después del primer
  // render. Aquí se inyecta la hoja de estilos de Font Awesome
  // DENTRO del Shadow Root (los estilos del documento no entran
  // en un Shadow DOM, igual que Leaflet en <mapa-ubicacion-usuario>).
  // El <link> se crea solo si aún no está, para no duplicarlo.
  firstUpdated(cambio) {
    super.firstUpdated(cambio);
    if (!this.renderRoot.querySelector('link[data-fa]')) {
      const enlace = document.createElement('link');
      enlace.rel = 'stylesheet';
      enlace.href = FA_CSS;
      enlace.setAttribute('data-fa', '');
      this.renderRoot.appendChild(enlace);
    }
  }

  // Menú SOLO de iconos: cada opción pinta <i class="fa-solid ...">.
  // El texto original se conserva en title (tooltip al pasar el
  // ratón) y en aria-label (nombre accesible para lectores de
  // pantalla), así que el enlace sigue siendo comprensible sin
  // texto visible.
  render() {
    return html`
      <nav aria-label="Navegación principal">
        ${RUTAS.map(
          (ruta) => html`
            <a
              href=${ruta.href}
              title=${ruta.etiqueta}
              aria-label=${ruta.etiqueta}
              aria-current=${this.rutaActual === ruta.name ? 'page' : undefined}
              @click=${(evento) => this.irA(ruta.name, evento)}
            >
              <i class=${ruta.icono} aria-hidden="true"></i>
            </a>
          `
        )}
      </nav>
    `;
  }
}

// REGISTRO: a partir de aquí existe la etiqueta <app-menu>.
customElements.define('app-menu', AppMenu);
