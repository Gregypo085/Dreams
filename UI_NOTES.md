# UI State Notes

## Original UI (Before Album Art Background)

**Backup File**: `style-original.css`

### Original Design:
- **Background**: Purple gradient (`linear-gradient(135deg, #0f0a1a 0%, #1a0f2e 100%)`)
- **Color Scheme**:
  - Dark purple/blue base (#0f0a1a)
  - Accent color: Purple (#9b7fd5)
  - Text: Light lavender (#e6e1f0)
- **Layout**: Clean, minimalist with centered content
- **Cards**: Semi-transparent dark purple cards with glowing borders
- **Typography**: Share Tech Mono (monospace)

### Key Features:
- Glowing purple accents on buttons and text
- Box shadows with purple glow
- Smooth animations and transitions
- Responsive design for mobile

## Current UI (With Album Art Background)

**Date Modified**: January 14, 2026

### Changes:
- **Background**: Album art image ("Art/TV in Bed 3000x3000.png")
  - Full coverage, centered, fixed position
  - Semi-transparent dark overlay (50% opacity) for text readability
- All other styling remains the same

### To Revert:
```bash
cd "/Users/greg/code/Dreams"
cp style-original.css style.css
git add style.css
git commit -m "Revert to original gradient background"
git push
```

### Album Art Details:
- **File**: Art/TV in Bed 3000x3000.png
- **Size**: 3000x3000px (36MB)
- **Format**: PNG

## Notes:
- Original purple theme works well standalone
- Album art version ties the visual to the music project
- Dark overlay ensures text remains readable over the image
- Both versions maintain the same card/button styling
