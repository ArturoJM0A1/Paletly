// =========================================================
// ARCHIVO: main.js — PUNTO DE ENTRADA DE LA APP CON ROUTER
// =========================================================
// Lo carga index.html en lugar de app.js:
//
//   · app.js     → índice de componentes (lo siguen usando
//                  pruebas.html y la ruta `/`); NO arranca router.
//   · main.js    → ESTE archivo: arranca Open Cells con las rutas.
//
// Por qué no importar aquí los componentes de forma estática:
// cada ruta los carga con su propio `action()` (import dinámico),
// de modo que al abrir `#!/mapa-ubicacion-usuario` solo se
// descarga el módulo del mapa (y no los otros cinco).
//
// Orden de ejecución (módulos ESM):
//   1. Se resuelven los imports estáticos: app-menu.js registra
//      <app-menu> y routes.js define las rutas.
//   2. Se ejecuta startApp(): el router lee la URL actual
//      (`#!/...` o `/`), casa la ruta, ejecuta su action() y
//      monta la etiqueta dentro de #app-content.
// =========================================================
import { startApp } from '@open-cells/core';
import './app-menu.js';
import { routes } from './routes.js';
import { suscribir, registrarPaleta, actualizar } from './estado-compartido.js';

// =========================================================
// PUENTE DE EVENTOS GLOBALES → ALMACÉN COMPARTIDO
// =========================================================
// <generador-paletas> y <reloj-usuario> avisan con eventos que
// BUBBLEAN hasta el documento ('paleta-cambio', 'zona-horaria').
// Aquí, en el punto de entrada de la app, se capturan y se vuelcan
// al almacén compartido: así la paleta generada en la ruta
// /generador-paletas (u otra vista aislada) llega a TODOS los
// componentes, estén o no montados en el panel.
//
// OJO: pruebas.html NO importa main.js, así que estas líneas no
// se ejecutan en los tests (el almacén queda intacto ahí).
// =========================================================
document.addEventListener('paleta-cambio', (evento) => {
  registrarPaleta(evento.detail.colores);
});

document.addEventListener('zona-horaria', (evento) => {
  actualizar({ zonaHoraria: evento.detail.zona });
});

// El panel publica sus RESULTADOS de geolocalización con este
// evento (bubbles + composed → llega al documento desde cualquier
// ruta). Así la ubicación queda en el almacén y el mapa aislado
// (/mapa-ubicacion-usuario) siempre muestra lo mismo que la
// tarjeta de estado del panel, en cualquier dirección de la
// navegación.
document.addEventListener('ubicacion-actualizada', (evento) => {
  actualizar(evento.detail);
});

// =========================================================
// VARIABLES CSS --paleta-1..4 SOBRE <html>
// =========================================================
// El logotipo y el título de index.html viven FUERA de todo
// Shadow DOM: no pueden recibir propiedades de Lit, pero sí leen
// variables CSS heredadas. Se publican aquí (y no solo en el
// panel) para que también se recoloreen cuando se genera una
// paleta en una ruta aislada, sin haber visitado jamás '/'.
// suscribir() ejecuta el oyente inmediatamente con la paleta
// actual, así que la cabecera nace coloreada.
// =========================================================
suscribir((compartido) => {
  compartido.paleta.forEach((color, indice) => {
    document.documentElement.style.setProperty(`--paleta-${indice + 1}`, color);
  });
});

// startApp(options):
//   routes    → arreglo de rutas (routes.js)
//   mainNode  → id del elemento de index.html donde el router
//               monta la página activa. DEBE existir en el DOM
//               antes de ejecutar startApp (por eso el script
//               es type="module" al final del body).
startApp({
  routes,
  mainNode: 'app-content',
});
