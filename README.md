# Multi-Screen Video Player (Proyecto "MultiVideo")

Una aplicación de escritorio para Windows, macOS y Linux capaz de detectar y gestionar múltiples pantallas para la reproducción simultánea y sincronizada de videos. Permite mapear archivos de video a pantallas específicas o a una cuadrícula (video wall), con configuraciones persistentes y un modo kiosco de arranque automático.

Desarrollado por **DNA+art / Hábitat de Ideas**.

## Características Principales

- **Detección de Pantallas**: Identifica automáticamente todas las pantallas conectadas, mostrando su ID, resolución y escala.
- **Identificación Visual**: Muestra un número grande en cada pantalla para un fácil reconocimiento físico.
- **Configuración por Video**:
  - Asignación de un archivo de video local a cada pantalla.
  - Opciones de reproducción: bucle, volumen, tiempo de inicio, modo de ajuste (`cover`/`contain`) y rotación (0/90/180/270).
- **Perfiles Persistentes**:
  - Guarda y carga configuraciones completas en archivos JSON.
  - Recuerda automáticamente el último perfil utilizado.
- **Controles de Reproducción**:
  - **Globales**: Play, Pausa y Reinicio para todos los videos simultáneamente.
  - **Individuales**: Silenciar/activar audio por pantalla.
- **Modo Kiosco y "A un clic"**:
  - Opción para arrancar automáticamente al iniciar sesión en el sistema operativo.
  - Modo de auto-reproducción que inicia los videos directamente con la última configuración guardada.
  - Las ventanas de reproducción se muestran a pantalla completa, sin bordes y con el cursor oculto.
- **Empaquetado Multiplataforma**: Configurado con `electron-builder` para generar instaladores para Windows, macOS y Linux.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- npm (normalmente incluido con Node.js)

## Cómo Empezar

1.  **Clona el repositorio**:
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

2.  **Instala las dependencias**:
    Este comando leerá el `package.json` e instalará Electron y las demás herramientas necesarias.
    ```bash
    npm install
    ```

## Desarrollo

Para ejecutar la aplicación en modo de desarrollo (con acceso a las herramientas de desarrollo, etc.), usa el siguiente comando:

```bash
npm start
```

## Compilación para Producción

El proyecto está configurado con `electron-builder` para crear los ejecutables e instaladores para cada plataforma.

Para compilar la aplicación para tu sistema operativo actual, ejecuta:

```bash
npm run build
```

Los archivos finales se encontrarán en el directorio `dist/`.

## Créditos

Este proyecto ha sido desarrollado y conceptualizado por:

-   **DNA+art**
-   **Hábitat de Ideas**
