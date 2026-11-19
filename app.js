// =========================================================
// PALETLY · PUNTO DE ENTRADA (módulo ESM, sin build)
// =========================================================
// Importado por index.html (la aplicación) y por pruebas.html
// (las pruebas), de modo que el código se escribe UNA sola vez
// y se reutiliza: importar ESTE archivo equivale a cargar la
// aplicación completa.
//
// =========================================================
// ESTRUCTURA: UN ARCHIVO POR COMPONENTE
// =========================================================
//   app.js                 → este índice: solo explica y hace
//                            los imports de los 6 componentes
//   generador-paletas.js   → <generador-paletas>   generador aleatorio
//   historial-paletas.js     → <historial-paletas>     historial de paletas
//   reloj-usuario.js          → <reloj-usuario>          reloj + zona horaria
//   user-location-map.js   → <user-location-map>   mapa Leaflet + RxJS
//   bbva-web-component.js  → <bbva-web-component>  logo BBVA con paleta
//   app-dashboard.js       → <app-dashboard>       panel principal
//   pruebas.html           → 17 pruebas (importan este mismo app.js)
//
// Conceptos base del proyecto (aplicados en los 6 archivos):
// · HERENCIA        → class X extends LitElement
// · CONSTRUCTOR     → constructor() con super(); inicializa el estado
// · INSTANCIAS      → cada etiqueta <...> es un objeto creado por el navegador
// · REGISTRO        → customElements.define("etiqueta", Clase)
// · ENCAPSULAMIENTO → Shadow DOM: HTML/CSS internos aislados por Lit
// · REACTIVIDAD     → static properties: al cambiar una propiedad, Lit
//                      vuelve a ejecutar render() y actualiza solo lo necesario
// =========================================================

// Los imports estáticos de ESM se ejecutan ANTES de que el navegador
// procese el HTML (los módulos se diferían por defecto), así que
// cuando <app-dashboard> se monta, todos los customElements.define()
// ya se han ejecutado y el navegador puede instanciar cada etiqueta.
//
// Cada archivo importa Lit de la MISMA URL del CDN: el navegador
// descarga el módulo UNA sola vez y los 6 comparten la misma clase
// (por eso no hay conflictos al registrar las etiquetas).
import "./generador-paletas.js"; //genera colores
import "./historial-paletas.js"; //historial de paletas
import "./reloj-usuario.js"; //hora
import "./user-location-map.js"; //mapa
import "./bbva-web-component.js"; //logo BBVA
import "./app-dashboard.js"; //Componente padre, cordinador
