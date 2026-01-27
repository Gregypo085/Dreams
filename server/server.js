const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Song catalog (matching Dreams client)
const songs = [
    { id: 1, name: "Am", file: "1 Am.ogg" },
    { id: 2, name: "Cmaj6", file: "2 Cmaj6.ogg" },
    { id: 3, name: "Dm7 add11", file: "3 Dm7 add11.ogg" },
    { id: 4, name: "A#maj7", file: "4 A#maj7.ogg" },
    { id: 5, name: "Dm", file: "5 Dm.ogg" },
    { id: 6, name: "G#maj7", file: "6 G#maj7.ogg" },
    { id: 7, name: "Em9", file: "7 Em9.ogg" },
    { id: 8, name: "Cmaj9", file: "8 Cmaj9.ogg" },
    { id: 9, name: "Dm7", file: "9 Dm7.ogg" },
    { id: 10, name: "G#m7", file: "10 G#m7.ogg" },
    { id: 11, name: "Em#5", file: "11 Em#5.ogg" },
    { id: 12, name: "Cmaj7", file: "12 Cmaj7.ogg" },
    { id: 13, name: "Am9", file: "13 Am9.ogg" },
    { id: 14, name: "Fadd9", file: "14 Fadd9.ogg" },
    { id: 15, name: "D7(sus4)", file: "15 D7(sus4).ogg" },
    { id: 16, name: "Cadd11", file: "16 Cadd11.ogg" },
    { id: 17, name: "Cmaj7 add11", file: "17 Cmaj7 add11.ogg" },
    { id: 18, name: "Am7", file: "18 Am7.ogg" },
    { id: 19, name: "Em", file: "19 Em.ogg" },
    { id: 20, name: "Cmaj", file: "20 Cmaj.ogg" },
    { id: 21, name: "A#", file: "21 A#.ogg" }
];

// Play counts for weighted random selection (simple version - resets on server restart)
const playCounts = {};
songs.forEach(song => playCounts[song.id] = 0);

// Audio directory path
const AUDIO_DIR = path.join(__dirname, '..', 'audio', 'ogg');

// Weighted random selection (matching Dreams client algorithm)
function selectNextSong() {
    // Calculate weights: 1 / (playCount + 1)
    const weights = songs.map(song => {
        return {
            song,
            weight: 1 / (playCounts[song.id] + 1)
        };
    });

    // Calculate total weight
    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);

    // Random selection based on weights
    let random = Math.random() * totalWeight;
    for (const item of weights) {
        random -= item.weight;
        if (random <= 0) {
            playCounts[item.song.id]++;
            return item.song;
        }
    }

    // Fallback (should never reach here)
    playCounts[songs[0].id]++;
    return songs[0];
}

// Streaming endpoint
app.get('/stream', (req, res) => {
    console.log('🎵 New stream connection established');

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/opus');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Track if client disconnected
    let isClientConnected = true;

    req.on('close', () => {
        console.log('🔌 Client disconnected');
        isClientConnected = false;
    });

    // Function to stream a single chord with crossfade to next
    function streamChord(currentSong, nextSong) {
        if (!isClientConnected) return;

        const currentPath = path.join(AUDIO_DIR, currentSong.file);
        const nextPath = path.join(AUDIO_DIR, nextSong.file);

        console.log(`🎶 Playing: ${currentSong.name} → ${nextSong.name}`);

        // Create ffmpeg command for crossfading two songs
        // Song duration: 37s, Crossfade: 12s, Start crossfade at: 25s
        // This matches the Dreams website behavior
        const command = ffmpeg()
            .input(currentPath)
            .input(nextPath)
            .complexFilter([
                // Trim first song to full length (37s)
                '[0:a]atrim=0:37,asetpts=PTS-STARTPTS[a0]',
                // Trim second song to full length (37s)
                '[1:a]atrim=0:37,asetpts=PTS-STARTPTS[a1]',
                // Crossfade: start at 25s, duration 12s (matches website)
                '[a0][a1]acrossfade=d=12:c1=tri:c2=tri:o=1[out]'
            ])
            .outputOptions([
                '-map [out]',
                '-c:a libopus',
                '-b:a 128k',
                '-vbr on',
                '-f opus'
            ])
            .on('start', (cmd) => {
                console.log('FFmpeg command:', cmd);
            })
            .on('error', (err) => {
                if (isClientConnected) {
                    console.error('FFmpeg error:', err.message);
                }
            })
            .on('end', () => {
                if (isClientConnected) {
                    console.log('✓ Chunk completed, selecting next...');
                    // Select next chord and continue streaming
                    const followingSong = selectNextSong();
                    streamChord(nextSong, followingSong);
                }
            });

        // Pipe output to response
        command.pipe(res, { end: false });
    }

    // Start the infinite stream
    const firstSong = selectNextSong();
    const secondSong = selectNextSong();
    streamChord(firstSong, secondSong);
});

// Root endpoint - info page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dreams Streaming Server</title>
            <style>
                body { font-family: 'Share Tech Mono', monospace; background: #0a0a0a; color: #00ff88; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { color: #00ff88; }
                a { color: #00ff88; }
                code { background: #1a1a1a; padding: 2px 6px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>🎵 Dreams Streaming Server</h1>
            <p>Infinite generative chord progressions.</p>

            <h2>Endpoints</h2>
            <ul>
                <li><code>GET /stream</code> - Infinite audio stream (Opus format)</li>
                <li><code>GET /health</code> - Server health and statistics</li>
            </ul>

            <h2>Stats</h2>
            <p>Songs in catalog: ${songs.length}</p>
            <p>Total plays: ${Object.values(playCounts).reduce((a, b) => a + b, 0)}</p>

            <p><a href="https://dreams.gostnode.com" target="_blank">Visit Dreams</a> | <a href="https://gostnode.com" target="_blank">GostNode</a></p>
        </body>
        </html>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        songs: songs.length,
        playCounts: playCounts,
        totalPlays: Object.values(playCounts).reduce((a, b) => a + b, 0)
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎵 Dreams Streaming Server running on port ${PORT}`);
    console.log(`📡 Stream URL: http://localhost:${PORT}/stream`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);

    // Verify audio files exist
    console.log('\n🔍 Checking audio files...');
    const missingFiles = [];
    songs.forEach(song => {
        const filePath = path.join(AUDIO_DIR, song.file);
        if (!fs.existsSync(filePath)) {
            missingFiles.push(song.file);
        }
    });

    if (missingFiles.length > 0) {
        console.error('❌ Missing audio files:', missingFiles);
    } else {
        console.log('✅ All 21 audio files found');
    }
});
