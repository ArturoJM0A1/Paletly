// =========================================================
// ARCHIVO: estado-compartido.js — ALMACÉN GLOBAL DE LA APP
// =========================================================
// ¿Por qué existe este archivo?
//
// Con el router de Open Cells CADA RUTA monta su propio
// componente (y el router mantiene las páginas visitadas en el
// DOM, en caché). Si el estado siguiera viviendo SOLO dentro de
// <app-panel-control>, las vistas aisladas no se enterarían de
// nada:
//
//   · <generador-paletas> genera una paleta → nadie la guarda.
//   · <historial-paletas> se pintaría SIEMPRE vacío.
//   · <mapa-ubicacion-usuario> no tendría coordenadas.
//   · <azul-componente> no sabría qué colores pintar.
//
// Este módulo es un "store" mínimo (patrón observable), sin
// dependencias y con UNA sola instancia (los módulos ESM se
// cachean en el navegador):
//
//   estado              → objeto con los datos compartidos.
//   suscribir(oyente)   → da de alta un oyente y lo llama YA
//                         MISMO con el estado actual (sincronía
//                         inicial); devuelve la función de baja.
//   actualizar(cambios) → cambia campos y avisa a TODOS los
//                         oyentes.
//   registrarPaleta()   → guarda la paleta activa y la añade al
//                         historial (la más reciente, primero).
//   solicitarUbicacion()→ pide la ubicación UNA sola vez para
//                         toda la app y guarda el resultado.
//
// QUIÉN ESCRIBE en el almacén (clave para las pruebas):
//   · main.js (SOLO se carga en index.html) escucha los eventos
//     'paleta-cambio' y 'zona-horaria' en el documento y los
//     vuelca aquí.
//   · solicitarUbicacion(), llamada desde routes.js.
//   · Los componentes NUNCA escriben aquí: solo leen.
//
//   → pruebas.html NO importa main.js ni routes.js, así que
//     durante las pruebas el almacén queda INTACTO en sus
//     valores iniciales y los tests siguen montando componentes
//     "en crudo", exactamente como hasta ahora.
//
// QUIÉN LEE: los componentes, con suscribir() en
// connectedCallback y la función de baja en disconnectedCallback.
// =========================================================

// ---------------------------------------------------------
// 1. ESTADO INICIAL
//    Mismos valores por defecto que usaba <app-panel-control>,
//    de modo que un componente recién montado ve lo mismo con o
//    sin almacén.
// ---------------------------------------------------------
export const estado = {
  paleta: ["#93c5fd", "#7dd3fc", "#bfdbfe", "#e0f2fe"],
  historial: [], // Array de arrays: 4 colores por paleta generada
  latitud: null,
  longitud: null,
  precision: null, // precisión en metros (± m); null sin ubicación
  estado: "cargando", // "cargando" | "ok" | "error"
  mensajeEstado: "Solicitando permiso de ubicación…",
  zonaHoraria: "Detectando…"
};

// Conjunto de oyentes: Set evita duplicados y permite borrar rápido.
const oyentes = new Set();

// Avisa a TODOS los oyentes pasándoles el estado completo.
function notificar() {
  oyentes.forEach((oyente) => oyente(estado));
}

// ---------------------------------------------------------
// 2. suscribir(oyente) → alta + sincronía inmediata + baja
// ---------------------------------------------------------
// El oyente se ejecuta UNA vez nada más suscribirse con el estado
// actual: así cada componente arranca ya con los datos que haya
// (por ejemplo, entrar en /historial-paletas después de haber
// generado paletas en otra ruta).
// Devuelve la función para darse de baja (unsubscribe).
// ---------------------------------------------------------
export function suscribir(oyente) {
  oyentes.add(oyente);
  oyente(estado);
  return () => oyentes.delete(oyente);
}

// ---------------------------------------------------------
// 3. actualizar(cambios) → fusión superficial + notificación
// ---------------------------------------------------------
export function actualizar(cambios) {
  Object.assign(estado, cambios);
  notificar();
}

// ---------------------------------------------------------
// 4. registrarPaleta(colores) → paleta activa + historial
// ---------------------------------------------------------
// Spread crea arrays NUEVOS sin mutar los anteriores: Lit detecta
// el cambio de referencia y repinta a los suscriptores.
// ---------------------------------------------------------
export function registrarPaleta(colores) {
  estado.paleta = [...colores];
  // La más reciente PRIMERO, igual que hacía <app-panel-control>.
  estado.historial = [[...colores], ...estado.historial];
  notificar();
}

// ---------------------------------------------------------
// 5. solicitarUbicacion() → UNA petición para toda la app
// ---------------------------------------------------------
// Misma lógica y MISMOS textos que <app-panel-control>, pero aquí
// es compartida: la usa la ruta del mapa para que esa vista
// aislada también tenga coordenadas. Guardia doble:
//   · no se pide dos veces a la vez,
//   · no se pide si el almacén ya tiene ubicación.
// ---------------------------------------------------------
let ubicacionEnCurso = false;

export async function solicitarUbicacion() {
  if (ubicacionEnCurso || estado.latitud !== null) return;
  if (!navigator.geolocation) {
    actualizar({
      estado: "error",
      mensajeEstado: "Este navegador no admite la geolocalización."
    });
    return;
  }

  ubicacionEnCurso = true;
  try {
    const posicion = await new Promise((resolver, rechazar) =>
      navigator.geolocation.getCurrentPosition(resolver, rechazar, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    );

    const precision = posicion.coords.accuracy ?? null;
    actualizar({
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      precision,
      estado: "ok",
      mensajeEstado:
        precision !== null && precision > 5000
          ? "Ubicación aproximada: el navegador la estima por IP (VPN, proxy o red corporativa)."
          : "Ubicación detectada correctamente."
    });
  } catch (error) {
    // Códigos estándar: 1 permiso denegado, 2 no disponible, 3 tiempo agotado.
    actualizar({
      latitud: null,
      longitud: null,
      precision: null,
      estado: "error",
      mensajeEstado:
        error.code === 1
          ? "Permiso de ubicación denegado: actívalo en el candado de la barra de direcciones y pulsa «Reintentar ubicación»."
          : error.code === 2
            ? "No se pudieron determinar las coordenadas."
            : error.code === 3
              ? "Se agotó el tiempo esperando la ubicación; inténtalo de nuevo."
              : "No se pudo obtener la ubicación."
    });
  } finally {
    ubicacionEnCurso = false;
  }
}
