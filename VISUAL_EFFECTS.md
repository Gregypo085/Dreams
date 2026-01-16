# Visual Effects Reference

This file documents the visual effects that have been created for Dreams. They are currently disabled due to performance concerns, but can be easily re-enabled.

## Available Effects

### 1. Cascading Water Ripples (Color Gradient Bands)
**Performance**: Light
**Visual**: Colorful horizontal bands that cascade down the screen

**To enable**: Uncomment lines 50-71 in `style.css`:
```css
/* Water ripple effect */
main::before {
    content: '';
    position: fixed;
    top: -100%;
    left: 0;
    width: 500%;
    height: 800%;
    background:
        repeating-linear-gradient(
            180deg,
            transparent 0%,
            rgba(172, 253, 245, 0.5) 30%,
            rgba(0, 4, 87, 0.384) 50%,
            rgba(174, 0, 255, 0.5) 70%,
            transparent 100%
        );
    background-size: 100% 600px;
    animation: ripple 5s linear infinite;
    z-index: 0;
    pointer-events: none;
    mix-blend-mode: overlay;
}
```

**Customization**:
- Speed: Change `animation: ripple 5s` (lower = faster)
- Colors: Modify the `rgba()` values
- Size: Change `background-size: 100% 600px` (larger = bigger ripples)
- Thickness: Adjust the gradient percentages (30%, 50%, 70%)

---

### 2. SVG Displacement Map (Water Warping Effect)
**Performance**: HEAVY (CPU/GPU intensive)
**Visual**: Realistic water-like warping/distortion of the background

**To enable**:

1. Add SVG filter to `index.html` (after `<body>` tag):
```html
<!-- SVG Filter for water displacement effect -->
<svg style="position: absolute; width: 0; height: 0;">
    <defs>
        <filter id="water-displacement" color-interpolation-filters="sRGB" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse">
            <feTurbulence
                type="fractalNoise"
                baseFrequency="0.001 0.002"
                numOctaves="2"
                seed="1"
                result="turbulence">
                <animate
                    id="waterAnimation"
                    attributeName="baseFrequency"
                    dur="40s"
                    values="0.001 0.002; 0.002 0.001; 0.001 0.002"
                    repeatCount="indefinite"/>
            </feTurbulence>
            <feGaussianBlur in="turbulence" stdDeviation="3" result="smoothNoise"/>
            <feDisplacementMap in="SourceGraphic" in2="smoothNoise" scale="30" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
            <feGaussianBlur in="displaced" stdDeviation="0.5" result="finalSmooth"/>
        </filter>
    </defs>
</svg>
```

2. Apply filter in `style.css` (line 47, modify `body::before`):
```css
body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('Art/TV%20in%20Bed%203000x3000.png') center/cover no-repeat fixed;
    z-index: -2;
    filter: url(#water-displacement) blur(1px);
}
```

**Customization**:
- **Ripple size**: Change `baseFrequency` (lower = bigger waves)
  - `0.001 0.002` = very large
  - `0.01 0.02` = medium
  - `0.05 0.1` = small
- **Warp intensity**: Change `scale="30"` (higher = more warping)
- **Smoothness**: Adjust `stdDeviation` values (higher = smoother but more blurry)
- **Speed**: Change `dur="40s"` (lower = faster)

**Performance Optimization** (optional):
Add idle detection to `script.js` to pause when inactive:
```javascript
// Add at end of script.js
(function() {
    let idleTimer;
    const idleDelay = 5000; // 5 seconds

    function pauseAnimation() {
        document.body.classList.add('idle');
    }

    function resumeAnimation() {
        document.body.classList.remove('idle');
        clearTimeout(idleTimer);
        idleTimer = setTimeout(pauseAnimation, idleDelay);
    }

    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resumeAnimation, true);
    });

    resumeAnimation();
})();
```

Then add to `style.css`:
```css
body.idle::before {
    filter: none;
    transition: filter 0.5s ease;
}
```

---

### 3. Combined Effects
You can layer both effects by enabling both #1 and #2.

**To apply displacement to the gradient ripples** (not just background):
Add to line 71 in `style.css`:
```css
main::before {
    /* ... existing gradient code ... */
    filter: url(#water-displacement);
}
```

---

## Current State

**Active Effects**: None (clean background only)
**Date Disabled**: January 16, 2026
**Reason**: Performance/CPU usage too high on Mac

**Files modified**:
- `index.html` - SVG filter removed
- `style.css` - Filter applications removed, gradient ripple commented out
- `script.js` - Idle detection removed

---

## Notes

- The gradient ripples (#1) are lightweight and can run continuously
- The displacement effect (#2) is very CPU/GPU intensive - use sparingly or with idle detection
- Both effects look best at night or in dark mode
- Test on different devices - mobile may struggle with displacement
