# Dreams Streaming Server

Server-side audio streaming endpoint for the Dreams Discord bot.

## How It Works

This server:
1. Implements Dreams' weighted random selection algorithm
2. Crossfades 21 chord samples using ffmpeg
3. Streams infinite audio via HTTP (Opus format)
4. Discord bot consumes this stream and plays it in voice channels

## Requirements

- Node.js 16+
- ffmpeg with libopus support

### Installing ffmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Verify installation:**
```bash
ffmpeg -version | grep libopus
```

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Run the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Endpoints

### `GET /stream`
Infinite audio stream of Dreams chord progressions.

- **Format:** Opus
- **Bitrate:** 128kbps
- **Crossfade:** 8 seconds (starting at 29s of each 37s chord)
- **Selection:** Weighted random (matches client algorithm)

Example:
```bash
curl http://localhost:3000/stream > dreams.opus
```

### `GET /health`
Health check endpoint with play count statistics.

Example response:
```json
{
  "status": "ok",
  "songs": 21,
  "playCounts": {
    "1": 5,
    "2": 3,
    ...
  }
}
```

## Integration with Discord Bot

The Discord bot at `/Users/greg/code/DiscordBot` will connect to this stream endpoint and pipe the audio to Discord voice channels.

## Audio Files

The server expects OGG files in `/Users/greg/code/Dreams/audio/ogg/`:
- 21 chord textures (37 seconds each)
- OGG Vorbis format
- Stereo, 44.1kHz recommended

## Deployment

For production deployment:

1. Set `PORT` environment variable
2. Ensure ffmpeg is installed on the server
3. Consider using PM2 or similar for process management
4. Use reverse proxy (nginx) for HTTPS

Example with PM2:
```bash
pm2 start server.js --name dreams-stream
pm2 save
pm2 startup
```

## Technical Details

### Crossfading Algorithm

- **Song duration:** 37 seconds
- **Crossfade duration:** 8 seconds
- **Crossfade start:** 29 seconds
- **Crossfade curve:** Triangular (tri)
- **Output after crossfade:** 29 + 8 = 37 seconds per chunk

### Weighted Random Selection

Matches client implementation:
```
weight = 1 / (playCount + 1)

Examples:
- Never played: 100% weight
- Played once: 50% weight
- Played twice: 33% weight
```

Play counts reset when server restarts (can be persisted to database if needed).

## Troubleshooting

**"FFmpeg not found" error:**
- Install ffmpeg: `brew install ffmpeg` (macOS) or `apt install ffmpeg` (Linux)

**"Missing audio files" error:**
- Ensure all 21 OGG files exist in `../audio/ogg/`
- Check file names match exactly (including special characters)

**Stream disconnects:**
- Normal behavior when client disconnects
- Server will stop processing for that client

**Audio quality issues:**
- Adjust bitrate in server.js: `-b:a 128k`
- Ensure source OGG files are high quality

## License

A [GostNode](https://gostnode.com) project
