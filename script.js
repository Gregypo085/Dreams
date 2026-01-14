// Dreams - Generative Chord Progression Engine
class DreamsEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;

        // Dual sources for crossfading
        this.sourceA = { buffer: null, source: null, gain: null, isPlaying: false };
        this.sourceB = { buffer: null, source: null, gain: null, isPlaying: false };
        this.currentSource = null;

        // Song catalog
        this.songs = [
            { id: 1, name: "Am", file: "audio/ogg/1 Am.ogg" },
            { id: 2, name: "Cmaj6", file: "audio/ogg/2 Cmaj6.ogg" },
            { id: 3, name: "Dm7 add11", file: "audio/ogg/3 Dm7 add11.ogg" },
            { id: 4, name: "A#maj7", file: "audio/ogg/4 A#maj7.ogg" },
            { id: 5, name: "Dm", file: "audio/ogg/5 Dm.ogg" },
            { id: 6, name: "G#maj7", file: "audio/ogg/6 G#maj7.ogg" },
            { id: 7, name: "Em9", file: "audio/ogg/7 Em9.ogg" },
            { id: 8, name: "Cmaj9", file: "audio/ogg/8 Cmaj9.ogg" },
            { id: 9, name: "Dm7", file: "audio/ogg/9 Dm7.ogg" },
            { id: 10, name: "G#m7", file: "audio/ogg/10 G#m7.ogg" },
            { id: 11, name: "Em#5", file: "audio/ogg/11 Em#5.ogg" },
            { id: 12, name: "Cmaj7", file: "audio/ogg/12 Cmaj7.ogg" },
            { id: 13, name: "Am9", file: "audio/ogg/13 Am9.ogg" },
            { id: 14, name: "Fadd9", file: "audio/ogg/14 Fadd9.ogg" },
            { id: 15, name: "D7(sus4)", file: "audio/ogg/15 D7(sus4).ogg" },
            { id: 16, name: "Cadd11", file: "audio/ogg/16 Cadd11.ogg" },
            { id: 17, name: "Cmaj7 add11", file: "audio/ogg/17 Cmaj7 add11.ogg" },
            { id: 18, name: "Am7", file: "audio/ogg/18 Am7.ogg" },
            { id: 19, name: "Em", file: "audio/ogg/19 Em.ogg" },
            { id: 20, name: "Cmaj", file: "audio/ogg/20 Cmaj.ogg" },
            { id: 21, name: "A#", file: "audio/ogg/21 A#.ogg" }
        ];

        this.buffers = {}; // Stores loaded audio buffers
        this.playCounts = this.loadPlayCounts();

        this.isPlaying = false;
        this.currentSongId = null;
        this.nextSongId = null;

        // Timing constants (in seconds)
        this.songDuration = 37;
        this.crossfadeDuration = 12;
        this.crossfadeStart = this.songDuration - this.crossfadeDuration; // 25 seconds
    }

    // Initialize Web Audio Context
    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);

        // Create gain nodes for both sources
        this.sourceA.gain = this.audioContext.createGain();
        this.sourceA.gain.gain.value = 0;
        this.sourceA.gain.connect(this.masterGain);

        this.sourceB.gain = this.audioContext.createGain();
        this.sourceB.gain.gain.value = 0;
        this.sourceB.gain.connect(this.masterGain);

        this.currentSource = this.sourceA;
    }

    // Load play counts from localStorage
    loadPlayCounts() {
        const saved = localStorage.getItem('dreams_play_counts');
        if (saved) {
            return JSON.parse(saved);
        }
        // Initialize all songs with 0 play count
        const counts = {};
        this.songs.forEach(song => {
            counts[song.id] = 0;
        });
        return counts;
    }

    // Save play counts to localStorage
    savePlayCounts() {
        localStorage.setItem('dreams_play_counts', JSON.stringify(this.playCounts));
    }

    // Load all audio files
    async loadAllSongs() {
        updateStatus('Loading songs...');

        const loadPromises = this.songs.map(song => this.loadSong(song));
        const results = await Promise.all(loadPromises);

        const allLoaded = results.every(result => result === true);

        if (allLoaded) {
            updateStatus('Ready to play');
            return true;
        } else {
            updateStatus('Error loading some songs. Check console.');
            return false;
        }
    }

    // Load individual song
    async loadSong(song) {
        try {
            const response = await fetch(song.file);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.buffers[song.id] = audioBuffer;
            return true;
        } catch (error) {
            console.error(`Error loading ${song.name}:`, error);
            return false;
        }
    }

    // Weighted random selection
    selectNextSong(excludeId) {
        // Calculate weights for all songs (except excluded)
        const candidates = this.songs.filter(song => song.id !== excludeId);

        // Weight = 1 / (playCount + 1)
        const weights = candidates.map(song => ({
            song,
            weight: 1 / (this.playCounts[song.id] + 1)
        }));

        // Calculate total weight
        const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);

        // Random selection based on weights
        let random = Math.random() * totalWeight;

        for (const item of weights) {
            random -= item.weight;
            if (random <= 0) {
                return item.song;
            }
        }

        // Fallback (should never reach here)
        return candidates[0];
    }

    // Play a song on a specific source
    playSong(songId, source, updateUI = false) {
        const song = this.songs.find(s => s.id === songId);
        const buffer = this.buffers[songId];

        if (!buffer) {
            console.error(`Buffer not loaded for song ${songId}`);
            return;
        }

        console.log(`[playSong] Starting song: ${song.name} (ID: ${songId})`);

        // Stop existing source if playing
        if (source.source) {
            try {
                source.source.stop();
            } catch (e) {
                // Source may have already stopped
            }
        }

        // Create new source
        source.source = this.audioContext.createBufferSource();
        source.source.buffer = buffer;
        source.source.connect(source.gain);
        source.source.start(0);
        source.isPlaying = true;

        // Increment play count
        this.playCounts[songId]++;
        this.savePlayCounts();

        // Update UI only if requested (for initial song)
        if (updateUI) {
            updateNowPlaying(song.name);
        }

        // Schedule crossfade
        console.log(`[playSong] Scheduling crossfade for ${song.name} in ${this.crossfadeStart} seconds`);
        setTimeout(() => {
            console.log(`[playSong] Crossfade timer fired for ${song.name}. isPlaying: ${this.isPlaying}`);
            if (this.isPlaying) {
                this.startCrossfade(source, songId);
            } else {
                console.log('[playSong] Crossfade cancelled - not playing');
            }
        }, this.crossfadeStart * 1000);
    }

    // Start crossfade to next song
    startCrossfade(currentSource, currentSongId) {
        console.log(`[startCrossfade] Starting crossfade from song ID: ${currentSongId}`);

        // Determine which source to use for the next song
        const nextSource = currentSource === this.sourceA ? this.sourceB : this.sourceA;
        const sourceName = nextSource === this.sourceA ? 'sourceA' : 'sourceB';
        console.log(`[startCrossfade] Next song will play on ${sourceName}`);

        // Select and queue next song
        const nextSongId = this.selectNextSong(currentSongId).id;
        const nextSong = this.songs.find(s => s.id === nextSongId);
        console.log(`[startCrossfade] Selected next song: ${nextSong.name} (ID: ${nextSongId})`);

        // Update "Coming Next" display
        updateNextSong(nextSong.name);

        // Start playing next song (silent - starts at 0 gain)
        this.playSong(nextSongId, nextSource, false);

        // Crossfade
        const now = this.audioContext.currentTime;
        const fadeDuration = this.crossfadeDuration;
        console.log(`[startCrossfade] Starting ${fadeDuration}s crossfade at time ${now}`);

        // Fade out current
        currentSource.gain.gain.cancelScheduledValues(now);
        currentSource.gain.gain.setValueAtTime(1.0, now);
        currentSource.gain.gain.linearRampToValueAtTime(0.0, now + fadeDuration);

        // Fade in next
        nextSource.gain.gain.cancelScheduledValues(now);
        nextSource.gain.gain.setValueAtTime(0.0, now);
        nextSource.gain.gain.linearRampToValueAtTime(1.0, now + fadeDuration);

        // Update current source, song, and UI after crossfade completes
        setTimeout(() => {
            console.log(`[startCrossfade] Crossfade complete. Updating state.`);
            currentSource.isPlaying = false;
            this.currentSource = nextSource;
            this.currentSongId = nextSongId;

            // Update "Now Playing" after crossfade completes
            updateNowPlaying(nextSong.name);

            // Select and display what will come after this
            const afterNext = this.selectNextSong(nextSongId);
            updateNextSong(afterNext.name);
            console.log(`[startCrossfade] Next up: ${afterNext.name}`);
        }, fadeDuration * 1000);
    }

    // Set master volume
    setMasterVolume(volume) {
        const currentTime = this.audioContext.currentTime;
        this.masterGain.gain.cancelScheduledValues(currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, currentTime);
        this.masterGain.gain.linearRampToValueAtTime(volume, currentTime + 0.1);
    }

    // Start playback
    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;

        // Select first song randomly
        const firstSong = this.selectNextSong(null);
        this.currentSongId = firstSong.id;
        this.currentSource = this.sourceA;

        // Select and display next song
        const nextSong = this.selectNextSong(this.currentSongId);
        updateNextSong(nextSong.name);

        // Play first song with fade in
        this.playSong(this.currentSongId, this.currentSource, true);
        const now = this.audioContext.currentTime;
        this.currentSource.gain.gain.setValueAtTime(0, now);
        this.currentSource.gain.gain.linearRampToValueAtTime(1.0, now + 2);

        updateStatus('Playing...');
    }

    // Stop playback
    stop() {
        if (!this.isPlaying) return;

        this.isPlaying = false;

        // Fade out both sources
        const now = this.audioContext.currentTime;

        if (this.sourceA.source) {
            this.sourceA.gain.gain.cancelScheduledValues(now);
            this.sourceA.gain.gain.setValueAtTime(this.sourceA.gain.gain.value, now);
            this.sourceA.gain.gain.linearRampToValueAtTime(0, now + 2);
            setTimeout(() => {
                if (this.sourceA.source) this.sourceA.source.stop();
            }, 2000);
        }

        if (this.sourceB.source) {
            this.sourceB.gain.gain.cancelScheduledValues(now);
            this.sourceB.gain.gain.setValueAtTime(this.sourceB.gain.gain.value, now);
            this.sourceB.gain.gain.linearRampToValueAtTime(0, now + 2);
            setTimeout(() => {
                if (this.sourceB.source) this.sourceB.source.stop();
            }, 2000);
        }

        updateStatus('Stopped');
        updateNowPlaying('—');
        updateNextSong('—');
    }
}

// Global engine instance
const engine = new DreamsEngine();

// UI Helper Functions
function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function updateNowPlaying(songName) {
    document.getElementById('currentSong').textContent = songName;
}

function updateNextSong(songName) {
    document.getElementById('nextSong').textContent = songName;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Play/Pause Button
    const playPauseBtn = document.getElementById('playPause');
    playPauseBtn.addEventListener('click', async () => {
        if (!engine.audioContext) {
            engine.init();
            await engine.loadAllSongs();
        }

        if (!engine.isPlaying) {
            engine.start();
            playPauseBtn.textContent = 'Stop';
            playPauseBtn.classList.add('playing');
        } else {
            engine.stop();
            playPauseBtn.textContent = 'Play';
            playPauseBtn.classList.remove('playing');
        }
    });

    // Master Volume
    const masterVolume = document.getElementById('masterVolume');
    const masterVolumeValue = document.getElementById('masterVolumeValue');
    masterVolume.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (engine.audioContext) {
            engine.setMasterVolume(value);
        }
        masterVolumeValue.textContent = `${Math.round(value * 100)}%`;
    });

    updateStatus('Click Play to begin your journey');
});
