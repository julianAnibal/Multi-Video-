document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video-player');
    const escButton = document.getElementById('esc-button');
    let startAt = 0; // To store the start time for restarts
    let screenId = null;

    // 1. One-time setup when the player window is initialized
    window.playerAPI.onVideoInit((config) => {
        console.log('Initializing player with config:', config);

        screenId = config.screenId;
        startAt = config.startAt || 0;

        video.src = config.videoPath;
        video.volume = config.volume;
        video.loop = config.loop;
        video.style.objectFit = config.fit;
        video.style.transform = `rotate(${config.rotation}deg)`;

        video.addEventListener('loadedmetadata', () => {
            video.currentTime = startAt;
        });

        video.addEventListener('error', (e) => {
            console.error('Video Error:', e);
            document.body.innerHTML = `<div style="color: red; text-align: center; padding-top: 40vh;">Failed to load video: ${config.videoPath}</div>`;
        });

        // The video has `autoplay` so it will start playing automatically
    });

    // 2. Listen for global playback controls
    window.playerAPI.onVideoPlay(() => {
        console.log('Received play command');
        video.play().catch(e => console.error("Play command failed:", e));
    });

    window.playerAPI.onVideoPause(() => {
        console.log('Received pause command');
        video.pause();
    });

    window.playerAPI.onVideoRestart(() => {
        console.log('Received restart command');
        video.currentTime = startAt;
        video.play().catch(e => console.error("Restart command failed:", e));
    });

    window.playerAPI.onToggleMute(() => {
        console.log('Received toggle mute command');
        video.muted = !video.muted;
    });

    const VOLUME_STEP = 0.1; // 10% volume change

    window.playerAPI.onVolumeUp(() => {
        console.log('Received volume up command');
        video.volume = Math.min(1.0, video.volume + VOLUME_STEP);
    });

    window.playerAPI.onVolumeDown(() => {
        console.log('Received volume down command');
        video.volume = Math.max(0.0, video.volume - VOLUME_STEP);
    });

    // Listen for Escape or Q to exit
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'q') {
            window.playerAPI.exitPlayback();
        }
    });

    // Show/hide ESC button on hover
    document.body.addEventListener('mouseenter', () => {
        escButton.style.display = 'block';
    });

    document.body.addEventListener('mouseleave', () => {
        escButton.style.display = 'none';
    });

    escButton.addEventListener('click', () => {
        if (screenId) {
            window.playerAPI.stopOnePlayback(screenId);
        }
    });
});
