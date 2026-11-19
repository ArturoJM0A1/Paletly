// Archivo: mapa-ubicacion-usuario.js — componente <mapa-ubicacion-usuario> de Paletly.
// Extraído de app.js (ahora hay UN archivo por componente) para
// facilitar su estudio: el código del componente es IDÉNTICO al
// original; solo cambia que los imports viven ahora en este archivo.
//
// Lit 3 desde CDN (misma URL en los 6 archivos = un solo módulo
// compartido): LitElement (clase base), html (plantillas) y
// css (estilos encapsulados dentro del Shadow DOM).
import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";
//
// RxJS (programación reactiva con Observables) desde CDN, sin build.
// Se usa interval(): emite un número cada X milisegundos, ideal para
// tareas periódicas limpias (suscripción + cancelación explícita).
import { interval } from "https://cdn.jsdelivr.net/npm/rxjs@7.8.1/+esm";

// =========================================================
// 4) <mapa-ubicacion-usuario>
//    Responsabilidad: pintar las coordenadas sobre OpenStreetMap
//    (Leaflet) con un marcador y una forma de 500 m coloreada con
//    la paleta activa. Cada 7 segundos, mediante un Observable de
//    RxJS, la forma alterna entre CÍRCULO y CUADRADO.
//    No necesita clave de API.
// =========================================================
class UbicacionMapa extends LitElement {
  // Tipos: Number (coordenadas), Array (paleta), String (mensaje y forma).
  // "mensaje" debe ser reactivo: se cambia dentro de updated() y sin ello
  // el aviso del DOM no se volvería a pintar (error detectado por las pruebas).
  // "forma" también es reactiva: la alterna un Observable de RxJS y debe
  // repintar el texto "círculo/cuadrado de 500 m" en el Shadow DOM.
  static properties = {
    latitud: { type: Number },
    longitud: { type: Number },
    paleta: { type: Array },
    aviso: { type: String },   // String: estado de permiso recibido del padre
    mensaje: { type: String }, // String: carga / error del propio mapa
    forma: { type: String }    // String: "círculo" | "cuadrado" (alterna cada 7 s)
  };

  static styles = css`
    /* El host es relativo para que el aviso (.aviso) pueda
       superponerse al mapa con position:absolute */
    :host { display: block; position: relative; }

    .tarjeta {
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.85);
      border-radius: 24px;
      /* Sin backdrop-filter aquí: un desenfoque de cristal sobre el lienzo
         del mapa hace que los tiles se rastericen a menor resolución y el
         mapa se vea borroso. Se mantiene el efecto cristal con el fondo
         blanco translúcido. */
      background: rgba(255, 255, 255, 0.72);
      box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
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
    h2 { margin: 8px 0 16px; color: #0f2d4a; font-size: 1.35rem; letter-spacing: -0.02em; }

    /* Contenedor del mapa: Leaflet pinta aquí dentro.
       position:relative hace de referencia al aviso absoluto. */
    .mapa {
      position: relative;
      height: clamp(300px, 45vh, 430px);
      border-radius: 18px;
      overflow: hidden;
      background: linear-gradient(180deg, #dbf1ff, #f0faff);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.85);
    }

    /* Aviso de carga / error / permiso denegado (superpuesto al mapa).
       Sin blur: solo se muestra cuando aún no hay mapa, y así el texto
       siempre se ve nítido. */
    .aviso {
      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      margin: 0;
      padding: 20px;
      background: rgba(255, 255, 255, 0.88);
      color: #1d5b96;
      font-size: 0.92rem;
      line-height: 1.6;
      text-align: center;
    }

    /* El atributo [hidden] lo pone el boolean binding ?oculto;
       el estilo de autor gana al de usuario, así que lo reforzamos. */
    .aviso[hidden] { display: none; }

    /* Coordenadas + tipo de forma visible, bajo el mapa */
    .coordenadas {
      margin: 14px 0 0;
      color: #40617f;
      font-size: 0.86rem;
      line-height: 1.6;
    }

    /* Los números en cifras tabulares: no "bailan" al cambiar */
    .coordenadas strong { color: #0f2d4a; font-variant-numeric: tabular-nums; }
  `;

  constructor() {
    super();
    this.latitud = null;   // null = aún no hay permiso/coordenadas
    this.longitud = null;
    this.paleta = [];
    this.aviso = "Solicitando permiso de ubicación…";
    this.mensaje = ""; // mensajes propios del mapa (carga o error de Leaflet)
    this.forma = "círculo"; // estado inicial; lo alterna el Observable de RxJS
    // Campos NO reactivos: solo guardan referencias para no recrear nada.
    this.mapa = null;
    this.marcador = null;
    this.circulo = null;
    this.cuadrado = null;          // L.rectangle: la otra forma de 500 m
    this.suscripcionForma = null;  // suscripción de RxJS (se cancela al desconectar)
    this.pinn = null;
    this.libreriaLista = false;
    this.errorLibreria = false;
  }

  /**
   * firstUpdated(): se ejecuta UNA sola vez, después del primer render,
   * momento en el que el contenedor interno ya existe en el Shadow DOM.
   * Aquí inicializamos el mapa (una única vez para toda la vida útil).
   */
  async firstUpdated() {
    // Consulta de nodos dentro del Shadow Root (renderRoot) para ubicar
    // el contenedor que Leaflet usará como "lienzo".
    this.contenedorMapa = this.renderRoot.querySelector("#mapa");

    // Hoja de estilos de Leaflet DENTRO del Shadow DOM (nodo creado con
    // createElement + appendChild: Lit no gestiona este nodo).
    const estilos = document.createElement("link");
    estilos.rel = "stylesheet";
    estilos.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    this.renderRoot.appendChild(estilos);

    try {
      await this.esperarLeaflet(); // Promesa: espera al script con defer
      this.libreriaLista = true;
      this.crearMapa(); // pinta si ya llegaron las coordenadas
    } catch (error) {
      this.errorLibreria = true;
      this.mensaje = `No se pudo cargar OpenStreetMap: ${error.message}`;
    }
  }

  /**
   * updated(): se ejecuta DESPUÉS de cada render del componente.
   * Aquí reaccionamos a los cambios de propiedades sin reconstruir el mapa.
   */
  updated(propiedadesAnteriores) {
    // Aún no hay mapa: intentamos crearlo (si hay librería y coordenadas).
    if (!this.mapa) {
      this.crearMapa();
      if (!this.mapa && !this.errorLibreria && this.latitud !== null) {
        this.mensaje = "Preparando el mapa…";
      }
    }

    if (!this.mapa) return;

    // Coordenadas nuevas → reubicamos vista, marcador y AMBAS formas
    // (círculo y cuadrado) sin recrear el mapa.
    if (propiedadesAnteriores.has("latitud") || propiedadesAnteriores.has("longitud")) {
      const posicion = [this.latitud, this.longitud]; // Leaflet usa [lat, lng]
      this.mapa.setView(posicion, this.mapa.getZoom());
      this.marcador.setLatLng(posicion);
      if (this.circulo) this.circulo.setLatLng(posicion); // centro idéntico al del marcador
      if (this.cuadrado) this.cuadrado.setBounds(this.limites(posicion)); // mismo centro
    }

    // Paleta nueva → solo cambian los colores del círculo y del marcador.
    if (propiedadesAnteriores.has("paleta")) this.actualizarColores();
  }

  // disconnectedCallback: liberamos el mapa y sus recursos al retirarse.
  disconnectedCallback() {
    // RxJS: cancelar la suscripción detiene el intervalo de 7 s.
    // Sin esto, el Observable seguiría emitiendo sobre un mapa
    // ya destruido (fuga de memoria / errores en consola).
    if (this.suscripcionForma) {
      this.suscripcionForma.unsubscribe();
      this.suscripcionForma = null;
    }
    if (this.mapa) this.mapa.remove(); // Leaflet limpia tiles, eventos y nodos
    this.mapa = null;
    this.marcador = null;
    this.circulo = null;
    this.cuadrado = null;
    super.disconnectedCallback();
  }

  // Promesa que resuelve cuando el script de Leaflet expone el global L.
  esperarLeaflet() {
    return new Promise((resolver, rechazar) => {
      let intentos = 0;
      const comprobar = () => {
        if (window.L?.map) return resolver(); // optional chaining
        if (intentos++ >= 40) return rechazar(new Error("la librería no cargó (revisa la conexión)"));
        setTimeout(comprobar, 250); // reintento cada 250 ms (máx. 10 s)
      };
      comprobar();
    });
  }

  // Crea mapa + marcador + círculo UNA sola vez (guardia anti-recreación).
  crearMapa() {
    const listo = this.libreriaLista && this.latitud !== null && this.longitud !== null;
    if (this.mapa || !listo) return;

    const posicion = [this.latitud, this.longitud];

    // L.map: instancia de Leaflet sobre el contenedor del Shadow DOM.
    this.mapa = L.map(this.contenedorMapa, {
      center: posicion,
      zoom: 15,           // nivel apropiado para ver ~500 m alrededor
      scrollWheelZoom: false // el scroll de la página no roba el zoom
    });

    // Capa de teselas de OpenStreetMap con atribución obligatoria.
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
    }).addTo(this.mapa);

    // Marcador personalizado: divIcon con un nodo creado con createElement
    // (Leaflet lo inserta en el mapa; los estilos en línea son suyos).
    this.pinn = document.createElement("div");
    this.pinn.setAttribute("aria-hidden", "true");
    this.pinn.style.cssText =
      "width:24px;height:24px;border:3px solid #ffffff;border-radius:50%;" +
      "box-shadow:0 3px 8px rgba(15,45,74,.45);";

    this.marcador = L.marker(posicion, {
      icon: L.divIcon({ className: "", html: this.pinn, iconSize: [24, 24], iconAnchor: [12, 12] }),
      title: "Tu ubicación",
      alt: "Tu ubicación"
    }).addTo(this.mapa);

    // Círculo geográfico de 500 m centrado en las coordenadas del usuario.
    this.circulo = L.circle(posicion, {
      radius: 500,
      weight: 2,
      fillOpacity: 0.16,   // relleno ligero
      opacity: 0.65        // borde ligero
    }).addTo(this.mapa);

    // Cuadrado de 500 m de semilado: MISMO centro y MISMO estilo que el
    // círculo, pero creado SIN addTo() → empieza fuera del mapa y solo
    // se muestra cuando el Observable de RxJS alterna la forma.
    this.cuadrado = L.rectangle(this.limites(posicion), {
      weight: 2,
      fillOpacity: 0.16,
      opacity: 0.65
    });

    // =====================================================
    // RXJS · ALTERNAR FORMA CADA 7 SEGUNDOS
    // -----------------------------------------------------
    // interval(7000) es un Observable que emite 0, 1, 2… cada
    // 7000 ms (como setInterval, pero cancelable de forma
    // limpia con unsubscribe()).
    //   indice+1 → la 1ª emisión (a los 7 s) pasa de 0 a 1 y
    //   muestra el cuadrado; la siguiente vuelve al círculo…
    //   alternando círculo ↔ cuadrado para siempre.
    // El parámetro "indice" es el valor emitido por RxJS.
    // =====================================================
    this.suscripcionForma = interval(7000).subscribe((indice) => {
      this.alternarForma(indice + 1);
    });

    this.actualizarColores(); // aplica la paleta activa actual
    this.mensaje = "";        // ya hay mapa: se oculta el aviso
  }

  /**
   * Devuelve los límites [[sur, oeste], [norte, este]] de un cuadrado
   * de 500 m de semilado (1000 × 1000 m, igual que el diámetro del
   * círculo) alrededor de la posición dada.
   * Fórmula: 1 grado de latitud ≈ 111 320 m; de longitud, ese mismo
   * valor multiplicado por el coseno de la latitud (se estrecha hacia
   * los polos).
   */
  limites(posicion) {
    const [lat, lng] = posicion;
    const metrosPorGradoLat = 111320;
    const metrosPorGradoLng = 111320 * Math.cos((lat * Math.PI) / 180);
    const desplazamientoLat = 500 / metrosPorGradoLat;
    const desplazamientoLng = 500 / metrosPorGradoLng;
    return [
      [lat - desplazamientoLat, lng - desplazamientoLng],
      [lat + desplazamientoLat, lng + desplazamientoLng]
    ];
  }

  /**
   * Alterna la forma visible: si se muestra el círculo se oculta el
   * cuadrado y viceversa. Se ejecuta con cada emisión de RxJS.
   * @param {number} indice - valor emitido por el Observable
   *                          (impar → cuadrado, par → círculo)
   */
  alternarForma = (indice) => {
    // Guardia: sin mapa (o sin Leaflet, como en las pruebas) no hay nada que alternar.
    if (!this.mapa || !this.circulo || !this.cuadrado) return;

    const mostrarCuadrado = indice % 2 !== 0;

    if (mostrarCuadrado) {
      this.mapa.removeLayer(this.circulo); // sale el círculo…
      this.cuadrado.addTo(this.mapa);      // …entra el cuadrado
      this.forma = "cuadrado";             // propiedad reactiva → repinta el texto
    } else {
      this.mapa.removeLayer(this.cuadrado);
      this.circulo.addTo(this.mapa);
      this.forma = "círculo";
    }

    // La capa recién añadida nace sin color: se le aplica la paleta actual.
    this.actualizarColores();
  };

  // Aplica la paleta al círculo, al cuadrado y al marcador SIN reconstruir el mapa.
  actualizarColores() {
    if (this.paleta.length < 4) return; // aún no hay paleta
    const [relleno, borde, pin, detalle] = this.paleta; // destructuring

    // Guards: sin librería (pruebas) o sin capas aún no hay nada que pintar.
    const estilo = { fillColor: relleno, color: borde };
    // setStyle(): actualiza cada capa in situ (mismo objeto, mismos tiles).
    if (this.circulo) this.circulo.setStyle(estilo);
    if (this.cuadrado) this.cuadrado.setStyle(estilo);
    // Detalles visuales del marcador con otros colores de la misma paleta.
    if (this.pinn) {
      this.pinn.style.backgroundColor = pin;
      this.pinn.style.borderColor = detalle;
    }
  }

  render() {
    const hayCoordenadas = this.latitud !== null && this.longitud !== null;
    // Prioridad: mensaje propio del mapa; si no, el estado de permiso del padre.
    const aviso = this.mensaje || (hayCoordenadas ? "" : this.aviso);
    return html`
      <article class="tarjeta">
        <p class="marca">Mapa · OpenStreetMap</p>
        <h2>Tu ubicación</h2>

        <!-- Contenedor del mapa: existe desde el primer render -->
        <div class="mapa" id="mapa"></div>

        <!-- Boolean Binding ?oculto: muestra el aviso solo si hay mensaje -->
        <p class="aviso" ?oculto=${aviso === ""}>${aviso}</p>

        <p class="coordenadas">
          ${hayCoordenadas
            ? html`Latitud <strong>${this.latitud.toFixed(4)}</strong> ·
                   Longitud <strong>${this.longitud.toFixed(4)}</strong> ·
                   ${this.forma} de 500 m`
            : "Sin coordenadas: acepta el permiso de ubicación para ver el mapa."}
        </p>
      </article>
    `;
  }
}

// REGISTRO del componente: existe la etiqueta <mapa-ubicacion-usuario>.
customElements.define("mapa-ubicacion-usuario", UbicacionMapa);
