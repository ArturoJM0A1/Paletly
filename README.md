# Paletly

Aplicación web minimalista construida con **JavaScript**, **Web Components** y **Lit**, con diseño Glassmorphism, sistema de enrutamiento de **Open Cells**. 

La aplicación funciona como un panel de control reactivo que genera paletas de colores hexadecimales aleatorias y sincroniza el tema visual en tiempo real a través de todos sus componentes mediante un almacén de estado global.

##  Ver demostración

[▶️ Ver video](https://youtu.be/ZZ3SoZH-MiE?si=-Dr_1Sm1BKZ7QGCU)
[🌐 Vercel](https://paletly-siete-componentes.vercel.app/)

## Características

* **Generador de paletas**: Crea esquemas de 4 colores aleatorios.
* **Historial**: Muestra el registro de paletas generadas (compartido entre todas las rutas).
* **Reloj local**: Hora actual y zona horaria del usuario.
* **Mapa interactivo**: Integración con Leaflet y OpenStreetMap para mostrar la ubicación y un radio de 500 m adaptado a la paleta activa.
* **Dashboard principal**: Coordina el Estado de la aplicación y lo publica al almacén compartido.
* **Componente BBVA**: `<bbva-componente>` (adaptado del ejemplo de BBVA) que se recolorea con la paleta activa y se ve **idéntico** dentro del panel y en su ruta aislada.
* **Menú vertical fijo**: Rail de iconos de Font Awesome a la izquierda, visible en todas las rutas, sin texto (solo iconos con tooltip y nombre accesible).
---

## Componentes del proyecto

La aplicación se divide en **siete** componentes, cada uno encapsulado en su propio Shadow DOM y en su propio archivo:

1. **`<app-panel-control>` (`app-panel-control.js`)**: Componente orquestador de la vista principal. Lee el estado global del almacén compartido, coordina a sus hijos y **publica su resultado de geolocalización** con el evento `ubicacion-actualizada` para que el resto de la app (p. ej. el mapa aislado) muestre exactamente lo mismo.
2. **`<generador-paletas>` (`generador-paletas.js`)**: Genera aleatoriamente cuatro códigos hexadecimales (`#RRGGBB`) al montarse o al pulsar su botón, y los notifica con el evento `paleta-cambio`.
3. **`<historial-paletas>` (`historial-paletas.js`)**: Renderiza la lista cronológica inversa de todas las paletas generadas. Dentro del panel recibe los datos por propiedad; en su ruta aislada los lee del almacén compartido (por eso nunca aparece vacío).
4. **`<reloj-usuario>` (`reloj-usuario.js`)**: Muestra la hora local en formato de 24 horas (actualizada cada segundo) y detecta la zona horaria mediante `Intl.DateTimeFormat`, que notifica con el evento `zona-horaria`.
5. **`<mapa-ubicacion-usuario>` (`mapa-ubicacion-usuario.js`)**: Dibuja un mapa interactivo con **Leaflet** y OpenStreetMap centrado en la ubicación del usuario. Usa **RxJS** (`interval`) para alternar cada 2 segundos entre un círculo y un cuadrado de 500 m coloreados con la paleta activa. Lee coordenadas, paleta y aviso de permiso del almacén compartido.
6. **`<bbva-componente>` (`bbva-componente.js`)**: Componente de identidad visual que adapta dinámicamente el degradado de su logotipo e icono con los 4 colores de la paleta vigente. Usa el `PageController` de Open Cells (navegación y hooks de página); en su ruta aislada pinta **exactamente el mismo HTML** que dentro del panel y toma los colores del almacén.
7. **`<app-menu>` (`app-menu.js`)**: Menú de navegación SPA en un **rail vertical fijo** al borde izquierdo (72 px, 60 px en móvil) con **solo iconos de Font Awesome** (sin texto): la etiqueta original se conserva como `title` (tooltip) y `aria-label` (accesibilidad). La ruta activa se resalta con el degradado de la paleta actual.

---

## Arquitectura y rutas

El enrutador (`routes.js`, framework **Open Cells**) gestiona tanto la vista unificada como el acceso aislado a cada componente, con carga perezosa (*lazy loading*) y enrutado por hash (`#!/`):

| Ruta (`path`) | Componente | Descripción |
| :--- | :--- | :--- |
| `#!/` | `<app-panel-control>` | **Vista principal.** Carga el panel coordinador junto con todos los componentes hijos. |
| `#!/generador-paletas` | `<generador-paletas>` | Herramienta aislada para crear paletas de colores. |
| `#!/historial-paletas` | `<historial-paletas>` | Vista independiente con el registro de paletas guardadas. |
| `#!/reloj-usuario` | `<reloj-usuario>` | Muestra la hora local del usuario de forma aislada. |
| `#!/mapa-ubicacion-usuario` | `<mapa-ubicacion-usuario>` | Visualiza la geolocalización leyendo el estado compartido (su ruta pide la ubicación una sola vez para toda la app). |
| `#!/bbva-componente` | `<bbva-componente>` | Logotipo BBVA aislado, con el mismo aspecto y centrado que en el panel. |

El menú `<app-menu>` vive **fuera** del contenedor de rutas (`#app-content`), por lo que el router no lo toca al cambiar de vista: permanece siempre visible.

---

## Arquitectura de comunicación

El flujo de datos combina un **almacén único** con el patrón estándar de *Data Down, Events Up*, más un puente de estilos hacia el documento exterior:

### 1. Almacén compartido (`estado-compartido.js`)
Fuente única de verdad de la aplicación: `paleta`, `historial`, `latitud`/`longitud`/`precision`, `estado` de la geolocalización y `zonaHoraria`. Los componentes solo **leen**, suscribiéndose en `connectedCallback` (`suscribir()`) y dándose de baja en `disconnectedCallback`. **Quién escribe:** exclusivamente `main.js` (punto de entrada de la app, que vuelca los eventos de abajo) y `solicitarUbicacion()` desde la ruta del mapa. Como `pruebas.html` no importa `main.js`, durante las pruebas el almacén queda intacto y los tests montan los componentes "en crudo".

### 2. Eventos hacia arriba (`CustomEvent`)
Los hijos notifican cambios atravesando el Shadow DOM con `bubbles: true` y `composed: true`:
* **`paleta-cambio`**: Emitido por `<generador-paletas>` con `detail: { colores }`. Lo captura `main.js` → almacén → todos los componentes (panel, historial, bbva, mapa…).
* **`zona-horaria`**: Emitido por `<reloj-usuario>` con `detail: { zona }`. Lo captura `main.js` → almacén → `<app-panel-control>`.
* **`ubicacion-actualizada`**: Emitido por `<app-panel-control>` con `detail: { latitud, longitud, precision, estado, mensajeEstado }` cuando la geolocalización resuelve. Lo captura `main.js` → almacén → `<mapa-ubicacion-usuario>` (el mapa aislado siempre muestra lo mismo que el panel, en cualquier dirección de navegación).

### 3. Propiedades hacia abajo (*Property Binding*)
Dentro de `<app-panel-control>` se distribuyen los datos reactivos con la sintaxis `.propiedad=${valor}` de Lit:
* `.historial` $\rightarrow$ `<historial-paletas>`
* `.paleta` $\rightarrow$ `<bbva-componente>` y `<mapa-ubicacion-usuario>`
* `.latitud`, `.longitud`, `.aviso` $\rightarrow$ `<mapa-ubicacion-usuario>`

### 4. Variables CSS hacia el documento global
El encabezado y el logotipo de `index.html` viven **fuera** de todo Shadow DOM, así que `main.js` publica los 4 colores actuales en `<html>` (`--paleta-1` a `--paleta-4`) con `setProperty()` cada vez que cambia la paleta (venga de la ruta que venga). El título exterior y el degradado del menú se recolorean automáticamente.

---

## Notas de implementación

* **Menú de solo iconos**: `<app-menu>` inyecta Font Awesome 6.5.2 por **duplicado con la misma URL** (una sola petición, en caché): la hoja en el `<head>` de `index.html` registra las fuentes `@font-face` en `document.fonts` (las `@font-face` de un Shadow DOM no se registran y los glifos saldrían invisibles), mientras que la hoja inyectada dentro del Shadow DOM aporta las reglas de clase (`::before { content }`), que no atraviesan el Shadow DOM. Iconos actuales: `fa-gauge-high`, `fa-palette`, `fa-clock-rotate-left`, `fa-clock`, `fa-map-location-dot`, `fa-swatchbook` (fáciles de cambiar en el array `RUTAS` de `app-menu.js`).
* **Vistas aisladas centradas como el panel**: `#app-content` tiene `min-width: 980px` (ancho mínimo de la rejilla del panel: 3 × 320 px + 2 × 10 px), de modo que el contenedor mide lo mismo en todas las rutas y cada vista aislada cae exactamente en la posición y el ancho de la columna central del panel (`width: max(320px, calc((100% - 20px) / 3))`). En pantallas menores de 760 px se libera ese mínimo para que la vista aislada se vea completa.
* **Import map con versiones exactas**: Open Cells (`@open-cells/core`, `page-controller`, etc.) se resuelve vía `esm.sh` con versiones fijas en `index.html` y `pruebas.html`, para que el navegador cargue una única instancia del router.
* **Sin build**: ESM puro, Lit 3 desde CDN y un archivo por componente, pensado para estudiarse tal cual.

---

## Ejecución y pruebas

Para evitar restricciones de CORS con módulos ESM, sirve la carpeta con un servidor local:

```bash
npx serve -l 4173 .
```

* **Aplicación:** `http://localhost:4173/`
* **Pruebas unitarias nativas (17 tests):** `http://localhost:4173/pruebas.html`

Las pruebas montan los componentes sin `main.js` ni el router, por lo que no se altera el almacén compartido durante su ejecución.

## Cambios futuros

Añadir envio a backend en Java y persistencia en bases de datos ya sea en SQL Server o MySQL 

### By: Arturo Juárez Monroy
