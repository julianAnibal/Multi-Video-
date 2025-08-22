document.addEventListener('DOMContentLoaded', () => {
    const activeScreensList = document.getElementById('active-screens');
    const playAllBtn = document.getElementById('play-all');
    const pauseAllBtn = document.getElementById('pause-all');
    const restartAllBtn = document.getElementById('restart-all');
    const volumeUpBtn = document.getElementById('volume-up');
    const volumeDownBtn = document.getElementById('volume-down');
    const quitBtn = document.getElementById('quit-app');

    // --- Global Controls ---
    playAllBtn.addEventListener('click', () => window.electronAPI.playAll());
    pauseAllBtn.addEventListener('click', () => window.electronAPI.pauseAll());
    restartAllBtn.addEventListener('click', () => window.electronAPI.restartAll());
    volumeUpBtn.addEventListener('click', () => window.electronAPI.volumeUp());
    volumeDownBtn.addEventListener('click', () => window.electronAPI.volumeDown());
    quitBtn.addEventListener('click', () => window.electronAPI.quitApp());

    // --- Individual Controls (via delegation) ---
    activeScreensList.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('mute-btn')) {
            const screenItem = target.closest('.screen-control-item');
            const screenId = screenItem.dataset.screenId;
            if (screenId) {
                console.log(`Toggling mute for screen ${screenId}`);
                window.electronAPI.toggleMute(screenId);
                // Toggle button text for feedback
                target.textContent = target.textContent === 'Mute' ? 'Unmute' : 'Mute';
            }
        }
    });

    // --- Panel Initialization ---
    window.electronAPI.onPanelInit((activeScreens) => {
        console.log('Control panel initialized with screens:', activeScreens);
        if (!activeScreensList) return;

        activeScreensList.innerHTML = ''; // Clear list

        activeScreens.forEach((screenConfig, index) => {
            const item = document.createElement('li');
            item.className = 'screen-control-item';
            item.setAttribute('data-screen-id', screenConfig.screenId);

            const screenName = document.createElement('span');
            screenName.textContent = `Screen ${index + 1}: ${screenConfig.videoPath.split(/[\\/]/).pop()}`;

            const controls = document.createElement('div');
            const muteButton = document.createElement('button');
            muteButton.textContent = 'Mute';
            muteButton.className = 'mute-btn';
            controls.appendChild(muteButton);

            item.appendChild(screenName);
            item.appendChild(controls);
            activeScreensList.appendChild(item);
        });
    });
});
