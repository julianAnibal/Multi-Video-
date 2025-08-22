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
  - **Globales**: Play, Pausa y Reinicio para todos los videos simultáneamente, accesibles desde la ventana principal.
  - **Individuales**: Silenciar/activar audio por pantalla.
  - **Salida de Kiosco/Pantalla Completa**: Presiona `Esc` o `Q` para pausar todos los videos y salir del modo kiosco/pantalla completa, regresando a la ventana de configuración.
  - **Detener Video Individual**: Pasa el cursor sobre cualquier video en reproducción y haz clic en el botón "ESC VIDEO" que aparece para cerrar esa ventana de video específica.
- **Modo Kiosco y "A un clic"**:
  - Las ventanas de reproducción se muestran a pantalla completa, sin bordes y con el cursor oculto.
  - **Auto-lanzamiento**: Opción para arrancar automáticamente al iniciar sesión en el sistema operativo, cargando el último perfil utilizado.
  - **Modo Auto-reproducción**: Inicia los videos directamente con el flag `--autoplay`.

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

## Uso de la Aplicación

1.  **Iniciar la aplicación**:
    ```bash
    npm start
    ```
2.  **Configurar pantallas**:
    - La aplicación detectará automáticamente tus pantallas.
    - Haz clic en "Identify Screens" para ver un número en cada pantalla y facilitar su identificación.
    - Para cada pantalla, haz clic en "Select Video" para elegir un archivo de video.
    - Ajusta las opciones de reproducción (bucle, volumen, etc.) según tus necesidades.
3.  **Guardar/Cargar perfiles**:
    - Haz clic en "Save Profile" para guardar tu configuración actual en un archivo JSON.
    - Haz clic en "Load Profile" para cargar una configuración previamente guardada.
4.  **Iniciar Reproducción**:
    - Una vez configurado, haz clic en "Start Playback". Las ventanas de video se abrirán en modo kiosco/pantalla completa.
5.  **Controlar la Reproducción**:
    - Usa los botones "Play All", "Pause All", "Restart All", "Volume +" y "Volume -" en la ventana principal para controlar todos los videos.
    - Para detener un video individual, pasa el cursor sobre él y haz clic en "ESC VIDEO".
    - Para salir del modo kiosco/pantalla completa y pausar todos los videos, presiona `Esc` o `Q`.
6.  **Auto-lanzamiento**:
    - Marca la casilla "Launch on startup" para que la aplicación se inicie automáticamente con el último perfil cargado al encender tu sistema.

## Compilación para Producción

El proyecto está configurado con `electron-builder` para crear los ejecutables e instaladores para cada plataforma.

Para compilar la aplicación para **todas las plataformas** (Windows, macOS y Linux), ejecuta:

```bash
npm run build -- -mwl
```

Los archivos finales se encontrarán en el directorio `dist/`.

## Licencia

Este proyecto está bajo la licencia ISC. Consulta el archivo `LICENSE` para más detalles.

## Créditos

Este proyecto ha sido desarrollado y conceptualizado por:

-   **DNA+art**
-   **Hábitat de Ideas**