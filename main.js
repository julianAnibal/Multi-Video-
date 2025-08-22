const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let configWindow;
const playerWindows = new Map();
let isExiting = false;

function createConfigWindow() {
  // Create the browser window.
  configWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  configWindow.loadFile('index.html');

  // Open the DevTools.
  // configWindow.webContents.openDevTools();
}

function launchPlayback(screenConfigs) {
    screenConfigs.forEach(config => {
        if (!config.videoPath) {
            return; // Skip screens without a video file
        }

        const playerWindow = new BrowserWindow({
            x: config.bounds.x,
            y: config.bounds.y,
            width: config.bounds.width,
            height: config.bounds.height,
            frame: false,
            fullscreen: true,
            kiosk: true,
            webPreferences: {
                preload: path.join(__dirname, 'player-preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
            }
        });

        playerWindow.loadFile('player.html');

        playerWindow.webContents.on('did-finish-load', () => {
            playerWindow.webContents.send('video:init', config);
        });

        playerWindow.on('closed', () => {
            playerWindows.delete(config.screenId);
        });

        playerWindows.set(config.screenId, playerWindow);
    });
}

const isAutoPlay = process.argv.includes('--autoplay');

app.whenReady().then(async () => {
    if (isAutoPlay) {
        console.log('Autoplay mode detected.');
        try {
            const settingsRaw = fs.readFileSync(settingsPath, 'utf-8');
            const settings = JSON.parse(settingsRaw);
            if (settings && settings.lastProfilePath && fs.existsSync(settings.lastProfilePath)) {
                const profileRaw = fs.readFileSync(settings.lastProfilePath, 'utf-8');
                const profile = JSON.parse(profileRaw);
                launchPlayback(profile);
            } else {
                // If autoplay fails, maybe open config window as a fallback?
                createConfigWindow();
            }
        } catch (error) {
            console.error('Failed to autoplay:', error);
            createConfigWindow(); // Fallback to config window on error
        }
    } else {
        createConfigWindow();
    }

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            if (isAutoPlay && playerWindows.size > 0) {
                // Don't reopen config window if players are active
                return;
            }
            createConfigWindow();
        }
    });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Send screen information to the renderer process
ipcMain.handle('get-screens', () => {
    return screen.getAllDisplays();
});

// Handle request to identify screens
ipcMain.on('identify-screens', () => {
    const displays = screen.getAllDisplays();
    displays.forEach((display, index) => {
        const { x, y, width, height } = display.bounds;
        const identificationWindow = new BrowserWindow({
            x: x + width / 2 - 150,
            y: y + height / 2 - 100,
            width: 300,
            height: 200,
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        });
        identificationWindow.loadURL(`data:text/html,
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:rgba(0,0,0,0.5);border-radius:15px;">
                <h1 style="color:white;font-size:100px;font-family:sans-serif;">${index + 1}</h1>
            </body>
        `);

        setTimeout(() => {
            if (!identificationWindow.isDestroyed()) {
                identificationWindow.close();
            }
        }, 3000); // Close after 3 seconds
    });
});

// Handle file dialog
ipcMain.handle('dialog:openFile', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Videos', extensions: ['mp4', 'mov', 'mkv', 'avi', 'webm'] }
        ]
    });
    if (canceled) {
        return null;
    } else {
        return filePaths[0];
    }
});

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function saveSettings(settings) {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

// Handle saving a profile
ipcMain.handle('profile:save', async (event, profile) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Profile',
        defaultPath: 'profile.json',
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (!canceled && filePath) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
            saveSettings({ lastProfilePath: filePath });
            return { success: true, path: filePath };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    return { success: false };
});

// --- Global Playback Controls ---
function broadcastToPlayers(channel) {
    console.log(`Broadcasting '${channel}' to all players.`);
    for (const player of playerWindows.values()) {
        player.webContents.send(channel);
    }
}

ipcMain.on('controls:play-all', () => broadcastToPlayers('video:play'));
ipcMain.on('controls:pause-all', () => broadcastToPlayers('video:pause'));
ipcMain.on('controls:restart-all', () => broadcastToPlayers('video:restart'));
ipcMain.on('controls:volume-up', () => broadcastToPlayers('video:volume-up'));
ipcMain.on('controls:volume-down', () => broadcastToPlayers('video:volume-down'));

ipcMain.on('app:quit', () => {
    app.quit();
});

ipcMain.on('controls:toggle-mute', (event, screenId) => {
    const player = playerWindows.get(screenId);
    if (player) {
        player.webContents.send('video:toggle-mute');
    }
});

ipcMain.on('playback:exit', () => {
    if (isExiting) return;
    isExiting = true;

    broadcastToPlayers('video:pause');
    for (const player of playerWindows.values()) {
        player.setKiosk(false);
        player.setFullScreen(false);
    }

    if (configWindow) {
        configWindow.focus();
        configWindow.webContents.send('playback:state-changed', { active: false });
    }

    setTimeout(() => {
        isExiting = false;
    }, 1000);
});

ipcMain.on('playback:stop-one', (event, screenId) => {
    const player = playerWindows.get(screenId);
    if (player) {
        player.close();
        playerWindows.delete(screenId);
    }
});

// Handle starting playback
ipcMain.on('playback:start', (event, screenConfigs) => {
    if (configWindow) {
        configWindow.webContents.send('playback:state-changed', { active: true });
    }
    launchPlayback(screenConfigs);
});

// Handle loading a profile
ipcMain.handle('profile:load', async (event, filePath) => {
    let finalPath = filePath;

    if (!finalPath) {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: 'Load Profile',
            properties: ['openFile'],
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });
        if (canceled || filePaths.length === 0) {
            return { success: false };
        }
        finalPath = filePaths[0];
    }

    try {
        const data = fs.readFileSync(finalPath, 'utf-8');
        saveSettings({ lastProfilePath: finalPath });
        return { success: true, profile: JSON.parse(data), path: finalPath };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// --- Settings ---
ipcMain.handle('settings:load', () => {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
    return null;
});

ipcMain.handle('settings:get-auto-launch-status', () => {
    return app.getLoginItemSettings().openAtLogin;
});

ipcMain.on('settings:set-auto-launch', (event, enabled) => {
    const appPath = app.getPath('exe');
    app.setLoginItemSettings({
        openAtLogin: enabled,
        path: appPath,
        args: [
            '--autoplay'
        ]
    });
});
