# Dreams

Infinite generative chord progressions with intelligent crossfading.

## Concept

Dreams creates an endless, evolving soundscape by seamlessly blending 21 unique chord textures. Each chord is a 37-second ambient piece designed to flow perfectly into any other chord through 8-second crossfades. Every song was composed with identical fade characteristics, allowing any chord to transition smoothly into any other chord.

## Features

- **Dual Source Crossfading**: Two audio sources alternate, creating seamless 8-second transitions
- **Weighted Random Selection**: Songs played recently are less likely to repeat, but never impossible
- **Persistent Play Counts**: localStorage tracks how often each chord has been played
- **37-Second Loops**: Each chord texture is carefully crafted to be interesting yet meditative
- **21 Unique Chords**: Diverse harmonic palette including major, minor, 7ths, 9ths, sus chords, and extensions
- **Perfect Flow**: Every chord transitions seamlessly into every other chord - no jarring cuts

## How It Works

1. **Playback**: Songs are 37 seconds long
2. **Crossfade Timing**: At 29 seconds, the next chord begins fading in (from 0 gain)
3. **8-Second Overlap**: Both chords play together from 29-37 seconds
4. **Volume Automation**: Current song fades out while next song fades in during overlap
5. **Weighted Selection**: Probability = 1 / (playCount + 1)
   - Never played: 100% weight
   - Played once: 50% weight
   - Played twice: 33% weight
   - And so on...

## Tech Stack

### Client (Web App)
- Pure vanilla JavaScript
- Web Audio API for dual-source crossfading
- localStorage for play count persistence
- Fully client-side, hosted on GitHub Pages

### Server (Streaming API)
- Node.js + Express
- FFmpeg for audio processing and crossfading
- HTTP streaming endpoint for Discord bot integration
- See `/server` directory for details

## Chord List

1. Am
2. Cmaj6
3. Dm7 add11
4. A#maj7
5. Dm
6. G#maj7
7. Em9
8. Cmaj9
9. Dm7
10. G#m7
11. Em#5
12. Cmaj7
13. Am9
14. Fadd9
15. D7(sus4)
16. Cadd11
17. Cmaj7 add11
18. Am7
19. Em
20. Cmaj
21. A#

## Development

```bash
# Run local server
python3 -m http.server 8000
```

Then open http://localhost:8000

## Streaming Server

The `/server` directory contains a Node.js streaming server that provides an HTTP audio stream for integrations (e.g., Discord bots).

**Features:**
- Infinite audio stream using FFmpeg
- Same weighted random selection as client
- 8-second crossfades between chords
- Opus format, 128kbps

**Deploy to Railway:**
See `/server/DEPLOY.md` for deployment instructions.

**Local development:**
```bash
cd server
npm install
npm start
```

Stream available at: `http://localhost:3000/stream`

## Roadmap

- [ ] Phase 2: Manual song selection grid
- [ ] Phase 2: Queue system with vertical display
- [ ] Visual feedback during crossfades
- [ ] Export/import play count data
- [ ] Reset play counts option

## License

A [GostNode](https://gostnode.com) project
