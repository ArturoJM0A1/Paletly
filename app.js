// =========================================================
// PALETLY · CÓDIGO DE LA APLICACIÓN (módulo ESM, sin build)
// =========================================================
// Importado por index.html (la aplicación) y por pruebas.html (las pruebas),
// de modo que el código se escribe UNA sola vez y se reutiliza.
//
// Conceptos base del proyecto:
// · HERENCIA        → class X extends LitElement
// · CONSTRUCTOR     → constructor() con super(); inicializa el estado
// · INSTANCIAS      → cada etiqueta <...> es un objeto creado por el navegador
// · REGISTRO        → customElements.define("etiqueta", Clase)
// · ENCAPSULAMIENTO → Shadow DOM: HTML/CSS internos aislados por Lit
// · REACTIVIDAD     → static properties: al cambiar una propiedad, Lit
//                      vuelve a ejecutar render() y actualiza solo lo necesario
// =========================================================
    import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";
    // RxJS (programación reactiva con Observables) desde CDN, sin build.
    // Se usa interval(): emite un número cada X milisegundos, ideal para
    // tareas periódicas limpias (suscripción + cancelación explícita).
    import { interval } from "https://cdn.jsdelivr.net/npm/rxjs@7.8.1/+esm";

    // =========================================================
    // 1) <palette-generator>
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
        :host { display: block; height: 100%; }

        /* Tarjeta de cristal (Glassmorphism) */
        .tarjeta {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.55);
          box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .marca {
          color: #2b6cb0;
          font-size: 0.7rem;
          font-weight: 760;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h2 { margin: 8px 0 16px; color: #0f2d4a; font-size: 1.35rem; letter-spacing: -0.02em; }

        /* Rejilla de las cuatro muestras de color */
        .muestreo { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

        .muestra {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: 88px;
          border-radius: 16px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65), 0 8px 18px rgba(59, 110, 166, 0.14);
        }

        .muestra__hex {
          margin-bottom: 8px;
          padding: 4px 9px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.8);
          color: #0f2d4a;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.76rem;
          font-weight: 700;
        }

        button {
          margin-top: auto;
          padding: 14px 18px;
          border: 0;
          border-radius: 14px;
          background: linear-gradient(110deg, #60a5fa, #7dd3fc);
          box-shadow: 0 10px 22px rgba(59, 130, 246, 0.28);
          color: #ffffff;
          cursor: pointer;
          font: inherit;
          font-size: 0.92rem;
          font-weight: 750;
          transition: transform 160ms ease, filter 160ms ease;
        }

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
        if (this.paleta.length === 0) this.generarPaleta();
      }

      // Función flecha (campo de clase): conserva el "this" de la instancia.
      // Math.random() → color hexadecimal aleatorio de 6 cifras.
      colorAleatorio = () =>
        "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();

      /**
       * Genera los cuatro colores y notifica al resto de la aplicación.
       * Spread Operator: [...Array(4)] crea una NUEVA referencia de array,
       * imprescindible para que la propiedad reactiva detecte el cambio.
       */
      generarPaleta = () => {
        this.paleta = [...Array(4)].map(() => this.colorAleatorio());

        // EVENTO PERSONALIZADO que atraviesa el Shadow DOM:
        //   bubbles: true   → asciende por el árbol hasta <app-dashboard>
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

    // REGISTRO del componente: a partir de aquí existe la etiqueta <palette-generator>.
    customElements.define("palette-generator", GeneradorPaleta);

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
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.55);
          box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .marca {
          color: #2b6cb0;
          font-size: 0.7rem;
          font-weight: 760;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h2 { margin: 8px 0 4px; color: #0f2d4a; font-size: 1.35rem; letter-spacing: -0.02em; }

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

        /* Barra de scroll del historial: 3 px, azul celeste translúcido.
           Los estilos del documento NO llegan al Shadow DOM, así que aquí
           hay que declarar la barra otra vez para que sea consistente. */
        .lista::-webkit-scrollbar { width: 3px; height: 3px; }
        .lista::-webkit-scrollbar-track { background: rgba(125, 211, 252, 0.18); }
        .lista::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.65);
          border-radius: 999px;
        }
        .lista { scrollbar-width: thin; scrollbar-color: rgba(56, 189, 248, 0.65) rgba(125, 211, 252, 0.18); }

        .entrada {
          display: grid;
          gap: 8px;
          padding: 11px 13px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.5);
        }

        .entrada__indice {
          color: #2b6cb0;
          font-size: 0.68rem;
          font-weight: 760;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* Las 4 muestras de cada paleta guardada */
        .entrada__colores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }

        .celda {
          height: 32px;
          border-radius: 8px;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
        }

        .entrada__hex {
          color: #40617f;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.66rem;
          line-height: 1.5;
          word-break: break-all;
        }

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
                          <span class="entrada__indice">Paleta ${this.historial.length - indice}</span>

                          <!-- Muestra visual de los 4 colores guardados -->
                          <div class="entrada__colores">
                            ${paleta.map(
                              (color) => html`<span class="celda" style="background-color:${color}" title="${color}"></span>`
                            )}
                          </div>

                          <!-- Los 4 valores en texto (hex) para poder copiarlos -->
                          <code class="entrada__hex">${paleta.join(" · ")}</code>
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

    // =========================================================
    // 3) <user-clock>
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
          height: 100%;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.55);
          box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .marca {
          color: #2b6cb0;
          font-size: 0.7rem;
          font-weight: 760;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

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
        this.hora = "--:--:--";
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

    customElements.define("user-clock", RelojUsuario);

    // =========================================================
    // 4) <user-location-map>
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

        .marca {
          color: #2b6cb0;
          font-size: 0.7rem;
          font-weight: 760;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h2 { margin: 8px 0 16px; color: #0f2d4a; font-size: 1.35rem; letter-spacing: -0.02em; }

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

        .coordenadas {
          margin: 14px 0 0;
          color: #40617f;
          font-size: 0.86rem;
          line-height: 1.6;
        }

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

    customElements.define("user-location-map", UbicacionMapa);

    // =========================================================
    // 5) <app-dashboard>
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

        /* CSS Grid: 4 tarjetas en dos columnas (2×2) y el mapa a lo ancho.
           Con minmax(340px, 1fr) y un contenedor de 1040px caben siempre
           dos columnas de ~509px; en móvil pasa a una sola columna. */
        .rejilla {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 22px;
          width: min(100%, 1040px);
          margin: 0 auto;
        }

        .ancho-completo { grid-column: 1 / -1; } /* el mapa ocupa todo el ancho */

        .estado {
          padding: 22px 24px;
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.55);
          box-shadow: 0 18px 40px rgba(59, 110, 166, 0.16), inset 0 1px 0 #ffffff;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

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

        .estado p { margin: 0 0 8px; color: #40617f; font-size: 0.9rem; line-height: 1.6; }
        .estado p:last-of-type { margin-bottom: 0; }
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
            <palette-generator></palette-generator>

            <!-- Historial: recibe el registro por propiedad (.historial) -->
            <palette-history .historial=${this.historial}></palette-history>

            <!-- Hijo independiente: detecta y muestra su propia hora local -->
            <user-clock></user-clock>

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
            <user-location-map
              class="ancho-completo"
              .latitud=${this.latitud}
              .longitud=${this.longitud}
              .paleta=${this.paleta}
              .aviso=${this.mensajeEstado}
            ></user-location-map>
          </div>
        `;
      }
    }

    // REGISTRO del componente principal.
    customElements.define("app-dashboard", PanelPrincipal);
  