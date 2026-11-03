# Saket Raja — Portfolio

A spatial "scrollytelling" portfolio: scrolling flies the camera along a 3D tunnel, glass portals play live reels of each build, and clicking a portal flies the camera through the glass into its case study (no page reload, deep-linkable at `#/work/<slug>`).

**Stack:** Vite · Three.js (custom GLSL shaders) · GSAP · Lenis

## Run
```bash
npm install
npm run dev      # local dev server
npm run build    # production build -> dist/
npm run preview  # serve the build
```
Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages). On Vercel, import the repo and it auto-detects Vite.

## Editing content
Everything (bio, projects, metrics, experience, skills, certifications) lives in `src/data.js`.

- **Real screen recordings:** drop `public/videos/drawfive.mp4` (16:10, muted, ~10–20 s loop, under 5 MB) and set `video: '/videos/drawfive.mp4'` on that project. It replaces the procedural reel in both the portal and the case study.
- **Photo:** `public/images/saket.jpg`.
- **Repo links:** add `{ label: 'View repository', url: '…' }` to a project's `links`.

## Files
| File | What it does |
|---|---|
| `src/world.js` | Three.js scene: tunnel, particles, gates, portal shaders, camera path and fly-in/out |
| `src/reels.js` | Procedural animated UI "videos" for each project |
| `src/templates.js` | All HTML markup (overlays, sections, case study) |
| `src/main.js` | Scroll mapping, overlays, cursor, loader, router and transitions |
| `src/style.css` | Design system and layout |

## Performance notes
The tunnel is GPU-bound, so the budget goes to what's on screen:
- **Adaptive resolution** (`World.adapt`): render scale starts at min(devicePixelRatio, 1.5) and steps down to 0.75 if frames exceed ~21 ms, then back up after 4 s of fast frames.
- **Reels** re-upload a texture whenever they redraw, so only the portal in front of the camera animates at 30 fps; distant ones tick at 8 fps (one per frame). Static window chrome is cached.
- **No rendering when covered**: WebGL stops once the content sections fully cover the canvas, and while a case study is open.
- **Shaders and textures are compiled during the preloader** (`World.warmup`) so portals don't hitch on first view.
- **CSS stays on the compositor**: overlays animate only `opacity`/`transform` (no `filter: blur`, blend modes, or animated grain).
- **One smoothing layer**: Lenis `lerp` smooths the scroll; the camera follows it tightly instead of easing again.
