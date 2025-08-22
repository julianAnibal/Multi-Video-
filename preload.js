const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Config
  getScreens: () => ipcRenderer.invoke('get-screens'),
  identifyScreens: () => ipcRenderer.send('identify-screens'),

  // Dialogs and Profiles
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveProfile: (profile) => ipcRenderer.invoke('profile:save', profile),
  loadProfile: (filePath) => ipcRenderer.invoke('profile:load', filePath),

  // Settings
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  getAutoLaunchStatus: () => ipcRenderer.invoke('settings:get-auto-launch-status'),
  setAutoLaunch: (enabled) => ipcRenderer.send('settings:set-auto-launch', enabled),

  // Playback
  startPlayback: (config) => ipcRenderer.send('playback:start', config),

  // Control Panel
  onPanelInit: (callback) => ipcRenderer.on('panel:init', (_event, activeScreens) => callback(activeScreens)),
  playAll: () => ipcRenderer.send('controls:play-all'),
  pauseAll: () => ipcRenderer.send('controls:pause-all'),
  restartAll: () => ipcRenderer.send('controls:restart-all'),
  toggleMute: (screenId) => ipcRenderer.send('controls:toggle-mute', screenId),
  volumeUp: () => ipcRenderer.send('controls:volume-up'),
  volumeDown: () => ipcRenderer.send('controls:volume-down'),
  quitApp: () => ipcRenderer.send('app:quit'),
  onPlaybackStateChanged: (callback) => ipcRenderer.on('playback:state-changed', (_event, state) => callback(state)),
});
