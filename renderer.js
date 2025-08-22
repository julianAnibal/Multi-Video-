document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const screenList = document.getElementById('screen-list');
    const identifyButton = document.getElementById('identify');
    const loadProfileButton = document.getElementById('load-profile');
    const saveProfileButton = document.getElementById('save-profile');
    const startPlaybackButton = document.getElementById('start-playback');
    const autoLaunchCheckbox = document.getElementById('auto-launch');
    const playbackControls = document.getElementById('playback-controls');
    const playAllBtn = document.getElementById('play-all');
    const pauseAllBtn = document.getElementById('pause-all');
    const restartAllBtn = document.getElementById('restart-all');
    const volumeUpBtn = document.getElementById('volume-up');
    const volumeDownBtn = document.getElementById('volume-down');
    const quitBtn = document.getElementById('quit-app');

    // --- Global State ---
    let screenConfigs = [];
    let detectedScreens = [];

    // --- Utility Functions ---
    const timeToSeconds = (timeStr) => {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        if (parts.length === 3) {
            return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
        }
        return 0;
    };

    const secondsToTime = (seconds) => {
        const s = Math.floor(seconds || 0);
        const h = Math.floor(s / 3600).toString().padStart(2, '0');
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(s % 60).toString().padStart(2, '0');
        return `${h}:${m}:${secs}`;
    };

    const renderUI = () => {
        screenList.innerHTML = ''; // Clear previous list
        detectedScreens.forEach((screen, index) => {
             // Find the config for this screen, or create a default one
            let config = screenConfigs.find(c => c.screenId === screen.id);
            if (!config) {
                config = {
                    screenId: screen.id,
                    bounds: screen.bounds,
                    videoPath: null, loop: false, volume: 0.8, startAt: 0, fit: 'contain', rotation: 0
                };
            }
            // Ensure config is in the array for later updates
            const configIndex = screenConfigs.findIndex(c => c.screenId === screen.id);
            if (configIndex === -1) {
                screenConfigs.push(config);
            }

            const item = document.createElement('li');
            item.className = 'screen-item';
            item.setAttribute('data-screen-index', index); // Use index for easy access
            item.setAttribute('data-screen-id', screen.id);

            item.innerHTML = `
                <h3>Screen ${index + 1} <span style="font-weight:normal; font-size: 14px; color: #6c757d;">(ID: ${screen.id} | ${screen.size.width}x${screen.size.height})</span></h3>
                <div class="config-grid">
                    <div class="config-item" style="grid-column: 1 / -1;">
                        <label>Video File</label>
                        <button class="select-video-btn">Select Video</button>
                        <p class="filepath" id="filepath-${index}">${config.videoPath || 'No file selected.'}</p>
                    </div>
                    <div class="config-item"><label>Loop</label><input type="checkbox" id="loop-${index}" data-config-key="loop" ${config.loop ? 'checked' : ''}></div>
                    <div class="config-item"><label>Volume</label><input type="range" id="volume-${index}" min="0" max="100" value="${(config.volume || 0.8) * 100}" data-config-key="volume"></div>
                    <div class="config-item"><label>Start At (hh:mm:ss)</label><input type="text" id="start-at-${index}" value="${secondsToTime(config.startAt)}" data-config-key="startAt"></div>
                    <div class="config-item"><label>Fit Mode</label><select id="fit-${index}" data-config-key="fit"><option value="contain" ${config.fit === 'contain' ? 'selected' : ''}>Contain</option><option value="cover" ${config.fit === 'cover' ? 'selected' : ''}>Cover</option></select></div>
                    <div class="config-item"><label>Rotation</label><select id="rotation-${index}" data-config-key="rotation"><option value="0" ${config.rotation == 0 ? 'selected' : ''}>0°</option><option value="90" ${config.rotation == 90 ? 'selected' : ''}>90°</option><option value="180" ${config.rotation == 180 ? 'selected' : ''}>180°</option><option value="270" ${config.rotation == 270 ? 'selected' : ''}>270°</option></select></div>
                </div>
            `;
            screenList.appendChild(item);
        });
    };

    const updateConfigValue = (screenIndex, key, value) => {
        const screenId = detectedScreens[screenIndex].id;
        let config = screenConfigs.find(c => c.screenId === screenId);
        if (!config) {
            // This case should ideally not happen if renderUI works correctly
            config = { screenId };
            screenConfigs.push(config);
        }
        config[key] = value;
        console.log(`Updated config for screen ${screenId}:`, config);
    };

    // --- Event Listeners ---
    identifyButton.addEventListener('click', () => window.electronAPI.identifyScreens());
    startPlaybackButton.addEventListener('click', () => {
        const activeScreenIds = detectedScreens.map(s => s.id);
        const configsForActiveScreens = screenConfigs.filter(c => activeScreenIds.includes(c.screenId));
        window.electronAPI.startPlayback(configsForActiveScreens);
    });
    playAllBtn.addEventListener('click', () => window.electronAPI.playAll());
    pauseAllBtn.addEventListener('click', () => window.electronAPI.pauseAll());
    restartAllBtn.addEventListener('click', () => window.electronAPI.restartAll());
    volumeUpBtn.addEventListener('click', () => window.electronAPI.volumeUp());
    volumeDownBtn.addEventListener('click', () => window.electronAPI.volumeDown());
    quitBtn.addEventListener('click', () => window.electronAPI.quitApp());
    autoLaunchCheckbox.addEventListener('change', (event) => {
        window.electronAPI.setAutoLaunch(event.target.checked);
    });
    saveProfileButton.addEventListener('click', async () => {
        const result = await window.electronAPI.saveProfile(screenConfigs);
        if (result.success) alert(`Profile saved to ${result.path}`);
        else if (result.message) alert(`Error saving profile: ${result.message}`);
    });
    loadProfileButton.addEventListener('click', async () => {
        const result = await window.electronAPI.loadProfile();
        if (result.success) {
            screenConfigs = result.profile;
            renderUI(); // Re-render with loaded data
            alert('Profile loaded successfully.');
        } else if (result.message) {
            alert(`Error loading profile: ${result.message}`);
        }
    });

    screenList.addEventListener('click', async (event) => {
        if (event.target.classList.contains('select-video-btn')) {
            const item = event.target.closest('.screen-item');
            const index = parseInt(item.dataset.screenIndex, 10);
            const filePath = await window.electronAPI.openFile();
            if (filePath) {
                updateConfigValue(index, 'videoPath', filePath);
                document.getElementById(`filepath-${index}`).textContent = filePath;
            }
        }
    });

    screenList.addEventListener('input', (event) => {
        const target = event.target;
        if (target.dataset.configKey) {
            const item = target.closest('.screen-item');
            const index = parseInt(item.dataset.screenIndex, 10);
            const key = target.dataset.configKey;
            let value = target.value;

            if (target.type === 'checkbox') value = target.checked;
            else if (key === 'volume') value = parseFloat(target.value) / 100;
            else if (key === 'startAt') value = timeToSeconds(target.value);
            else if (target.tagName === 'SELECT') value = isNaN(Number(value)) ? value : Number(value);

            updateConfigValue(index, key, value);
        }
    });

    // --- Initial Load ---
    const initializeApp = async () => {
        detectedScreens = await window.electronAPI.getScreens();
        if (!detectedScreens || detectedScreens.length === 0) {
            screenList.innerHTML = '<li>No screens detected.</li>';
            return;
        }

        // Load settings and set up UI state
        const settings = await window.electronAPI.loadSettings();
        if (settings && settings.lastProfilePath) {
            console.log('Loading last profile:', settings.lastProfilePath);
            const result = await window.electronAPI.loadProfile(settings.lastProfilePath);
            if (result.success) {
                screenConfigs = result.profile;
            } else {
                console.error('Failed to auto-load last profile.');
            }
        }

        const isAutoLaunchEnabled = await window.electronAPI.getAutoLaunchStatus();
        autoLaunchCheckbox.checked = isAutoLaunchEnabled;

        renderUI();
    };

    initializeApp();

    window.electronAPI.onPlaybackStateChanged(({ active }) => {
        if (active) {
            playbackControls.style.display = 'flex';
            startPlaybackButton.style.display = 'none';
        } else {
            playbackControls.style.display = 'none';
            startPlaybackButton.style.display = 'block';
        }
    });
});
