// =========================================================
// ARCHIVO: routes.js — CONFIGURACIÓN DE RUTAS (Open Cells)
// =========================================================
// El router de Open Cells asocia un `path` de la URL con una
// etiqueta (web component). Al entrar en una ruta ocurren 2 cosas:
//
//   1. `action()` ejecuta el import DINÁMICO del archivo que
//      registra la etiqueta (customElements.define). Es carga
//      perezosa: solo se descarga el componente que se va a ver.
//      Si la etiqueta ya está registrada, el import sale de caché
//      y action() no vuelve a hacer nada relevante.
//   2. El router crea la etiqueta y la monta dentro del nodo
//      indicado en `mainNode` (`#app-content`, en index.html).
//
// OJO · ENRUTADO POR HASH: por defecto Open Cells usa el hash de la
// URL, así que en el navegador la ruta `/generador-paletas` se ve
// como `#!/generador-paletas`. El valor de `path` es SIEMPRE el
// tramo que va después de `#!/` (sin el prefijo).
//
// Campos de cada ruta:
//   path      → patrón de URL. OBLIGATORIO. La aplicación arranca
//               siempre en `/`, así que esa ruta debe existir.
//   name      → nombre de la ruta: es con el que se navega en
//               programa con this.navigate('name').
//   component → etiqueta a montar. Si no se indica, el router
//               asume `${name}-page`, así que aquí se pone siempre
//               el nombre real de la etiqueta.
//   action    → función asíncrona previa al render (carga del módulo).
//   notFound  → (opcional) marca la ruta 404.
// =========================================================

// ---------------------------------------------------------
// 1. RUTA RAÍZ → la vista original completa
// ---------------------------------------------------------
// solicitarUbicacion() vive en estado-compartido.js: pide la
// ubicación UNA sola vez para toda la app y la guarda en el
// almacén, de modo que la vista aislada del mapa también la
// tenga (y el panel, si se monta después, la lea de ahí).
// ---------------------------------------------------------
import { solicitarUbicacion } from './estado-compartido.js';

export const routes = [
  {
    path: '/',
    name: 'home',
    // <app-panel-control> es el componente padre/coordinador: montarlo
    // a sí mismo muestra la aplicación entera con los 5 hijos dentro.
    component: 'app-panel-control',
    action: async () => {
      // app.js importa los seis componentes; el panel necesita que sus
      // cinco hijos estén registrados antes de renderizarlos.
      await import('./app.js');
    },
  },

  // ---------------------------------------------------------
  // 2. RUTAS INDIVIDUALES → vistas aisladas de UN componente
  // ---------------------------------------------------------
  {
    path: '/generador-paletas',
    name: 'generador-paletas',
    component: 'generador-paletas',
    action: async () => {
      await import('./generador-paletas.js');
    },
  },

  {
    path: '/historial-paletas',
    name: 'historial-paletas',
    component: 'historial-paletas',
    action: async () => {
      await import('./historial-paletas.js');
    },
  },

  {
    path: '/reloj-usuario',
    name: 'reloj-usuario',
    component: 'reloj-usuario',
    action: async () => {
      await import('./reloj-usuario.js');
    },
  },

  {
    path: '/mapa-ubicacion-usuario',
    name: 'mapa-ubicacion-usuario',
    component: 'mapa-ubicacion-usuario',
    action: async () => {
      await import('./mapa-ubicacion-usuario.js');
      // La ubicación es un dato de la app, no del panel: aquí se
      // pide (sin await, para no demorar la navegación) y el
      // componente la recibe por su suscripción al almacén.
      solicitarUbicacion();
    },
  },

  {
    path: '/azul-componente',
    name: 'azul-componente',
    component: 'azul-componente',
    action: async () => {
      await import('./azul-componente.js');
    },
  },
];
