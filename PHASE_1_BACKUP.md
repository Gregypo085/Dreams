# Phase 1 Backup

**Date**: January 14, 2026
**Git Tag**: `v1.0-phase1`

## How to Restore Phase 1

### Method 1: Using Git Tag (Recommended)
```bash
cd "/Users/greg/code/Dreams"
git checkout v1.0-phase1
```

### Method 2: Using Backup Files
```bash
cd "/Users/greg/code/Dreams"
cp index-phase1.html index.html
cp script-phase1.js script.js
cp style-phase1.css style.css
git add .
git commit -m "Revert to Phase 1"
git push
```

## Phase 1 Features

✅ **21 Chord Progressions** - Full catalog loaded and working
✅ **8-Second S-Curve Crossfades** - Smooth, musical transitions starting at 29s
✅ **Weighted Random Selection** - Songs played more recently are less likely to repeat
✅ **localStorage Persistence** - Play counts saved across sessions
✅ **Album Art Background** - TV IN BED artwork with 15% overlay
✅ **Synthwave UI Colors** - Hot pink buttons, cyan sliders, white text
✅ **Infinite Playback** - Plays until user hits Stop
✅ **Never Repeats Current Song** - Smart exclusion in selection algorithm

## Backup Files

- `index-phase1.html` - Phase 1 HTML
- `script-phase1.js` - Phase 1 JavaScript
- `style-phase1.css` - Phase 1 CSS

## Technical Details

- **Song Duration**: 37 seconds
- **Crossfade Duration**: 8 seconds
- **Crossfade Start**: 29 seconds
- **Crossfade Type**: S-curve using `setTargetAtTime` with time constant of `duration/3`
- **Selection Algorithm**: `weight = 1 / (playCount + 1)`

## Phase 2 Plans

- Song selection grid showing all 21 chords
- Queue system (vertical scrollable list)
- Click to manually queue songs
- Visual indication of currently playing song in grid
