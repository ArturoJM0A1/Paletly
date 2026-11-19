# Paletly

Aplicación web minimalista construida con **Web Components** y **Lit**, con diseño Glassmorphism y componentes independientes que se comunican mediante eventos y propiedades. No requiere compilación ni claves de API.

## Características

* **Generador de paletas**: Crea esquemas de 4 colores aleatorios.
* **Historial**: Muestra el registro de paletas generadas.
* **Reloj local**: Hora actual y zona horaria del usuario.
* **Mapa interactivo**: Integración con Leaflet y OpenStreetMap para mostrar la ubicación y un radio de 500m adaptado a la paleta activa.
* **Dashboard principal**: Coordina el estado global de la aplicación.
* **Componente BBVA**: `<bbva-componente>` (adaptado del ejemplo de BBVA) que recibe la paleta activa por propiedades y se recolorea con sus 4 colores.

## 🧩 Componentes del proyecto

La aplicación se divide en seis componentes encapsulados en su propio Shadow DOM:

1. **`<app-panel-control>` (`app-panel-control.js`)**: Componente orquestador. Administra el estado global compartido (paleta activa, historial, coordenadas de geolocalización y zona horaria) y coordina a sus componentes hijos.
2. **`<generador-paletas>` (`generador-paletas.js`)**: Genera aleatoriamente cuatro códigos hexadecimales (`#RRGGBB`) al montarse o al pulsar su botón.
3. **`<historial-paletas>` (`historial-paletas.js`)**: Renderiza la lista cronológica inversa de todas las paletas generadas junto con sus códigos hexadecimales.
4. **`<reloj-usuario>` (`reloj-usuario.js`)**: Muestra la hora local en formato de 24 horas (actualizada cada segundo) y detecta la zona horaria del navegador mediante `Intl.DateTimeFormat`.
5. **`<mapa-ubicacion-usuario>` (`mapa-ubicacion-usuario.js`)**: Dibuja un mapa interactivo con **Leaflet** y OpenStreetMap centrado en la ubicación del usuario. Usa **RxJS** (`interval`) para alternar cada 7 segundos entre un círculo y un cuadrado de 500 m coloreados con la paleta activa.
6. **`<bbva-componente>` (`bbva-componente.js`)**: Componente de identidad visual que adapta dinámicamente el degradado de su logotipo e icono con los 4 colores de la paleta vigente.

---

## 🔄 Arquitectura de comunicación

El flujo de datos sigue el patrón estándar de **datos hacia abajo y eventos hacia arriba** (*Data Down, Events Up*), además de un puente de estilos para el documento exterior:

### 1. Eventos hacia arriba (`CustomEvent`)
Los componentes hijos notifican cambios de estado al padre atravesando la frontera del Shadow DOM mediante eventos con `bubbles: true` y `composed: true`:
* **`paleta-cambio`**: Emitido por `<generador-paletas>` con `detail: { colores }`. `<app-panel-control>` lo captura para actualizar la paleta activa y añadir una copia al historial.
* **`zona-horaria`**: Emitido por `<reloj-usuario>` al montarse con `detail: { zona }`. `<app-panel-control>` lo captura para mostrarlo en el panel de estado.

### 2. Propiedades hacia abajo (*Property Binding*)
`<app-panel-control>` mantiene la única fuente de verdad y distribuye los datos reactivos hacia sus hijos usando la sintaxis `.propiedad=${valor}` de Lit:
* `.historial` $\rightarrow$ `<historial-paletas>`
* `.paleta` $\rightarrow$ `<bbva-componente>` y `<mapa-ubicacion-usuario>`
* `.latitud`, `.longitud`, `.aviso` $\rightarrow$ `<mapa-ubicacion-usuario>`

### 3. Variables CSS hacia el documento global
Dado que el encabezado y el logotipo de `index.html` viven **fuera** del Shadow DOM de `<app-panel-control>`, el panel publica los 4 colores actuales en `:root` (`--paleta-1` a `--paleta-4`) mediante `document.documentElement.style.setProperty()`. De este modo, el título y el logotipo exterior se recolorean automáticamente sin manipular el DOM directamente.

---

## Uso rápido

1. Descarga el repositorio.
2. Abre `index.html` directamente en tu navegador o mediante un servidor local.

## 🚀 Ejecución y pruebas

Para evitar restricciones de CORS con módulos ESM, sirve la carpeta con un servidor local:

```bash
npx serve -l 4173 .
```

* **Aplicación:** `http://localhost:4173/index.html`
* **Pruebas unitarias nativas (17 tests):** `http://localhost:4173/pruebas.html`