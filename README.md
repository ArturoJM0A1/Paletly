# Paletly

Aplicación web minimalista construida con **Web Components** y **Lit**, con diseño Glassmorphism y componentes independientes que se comunican mediante eventos y propiedades. No requiere compilación ni claves de API.

## Características

* **Generador de paletas**: Crea esquemas de 4 colores aleatorios.
* **Historial**: Muestra el registro de paletas generadas.
* **Reloj local**: Hora actual y zona horaria del usuario.
* **Mapa interactivo**: Integración con Leaflet y OpenStreetMap para mostrar la ubicación y un radio de 500m adaptado a la paleta activa.
* **Dashboard principal**: Coordina el estado global de la aplicación.
* **Componente BBVA**: `<bbva-web-component>` (adaptado del ejemplo de BBVA) que recibe la paleta activa por propiedades y se recolorea con sus 4 colores.

## Tecnologías

* [Lit](https://lit.dev/) (v3)
* [Leaflet](https://leafletjs.com/) & OpenStreetMap
* Web Components nativos (Custom Elements, Shadow DOM)
* CSS Moderno (Glassmorphism, CSS Grid)

## Uso rápido

1. Descarga el repositorio.
2. Abre `index.html` directamente en tu navegador o mediante un servidor local.