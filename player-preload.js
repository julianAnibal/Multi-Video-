const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('playerAPI', {
  // Lifecycle
  onVideoInit: (callback) => ipcRenderer.on('video:init', (_event, config) => callback(config)),

  // Controls
  onVideoPlay: (callback) => ipcRenderer.on('video:play', () => callback()),
  onVideoPause: (callback) => ipcRenderer.on('video:pause', () => callback()),
  onVideoRestart: (callback) => ipcRenderer.on('video:restart', () => callback()),
  onToggleMute: (callback) => ipcRenderer.on('video:toggle-mute', () => callback()),
  onVolumeUp: (callback) => ipcRenderer.on('video:volume-up', () => callback()),
  onVolumeDown: (callback) => ipcRenderer.on('video:volume-down', () => callback()),
  exitPlayback: () => ipcRenderer.send('playback:exit'),
  stopOnePlayback: (screenId) => ipcRenderer.send('playback:stop-one', screenId),
});
