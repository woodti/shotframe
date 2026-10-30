<div align="center">

# ShotFrame

Wrap screenshots in phone, tablet, laptop and browser frames, add backgrounds, captions and 3D tilt, and export a crisp PNG.
**Runs entirely in your browser — no uploads, no sign-up, no API key.**

[Try it online](https://woodti.github.io/shotframe/) · [中文](./README.md)

![ShotFrame demo](./docs/demo.gif)

</div>

> The interface is currently in Chinese; an English UI is planned.

## Features

- **One-click styles**: 12 presets (mesh glow, paper, blueprint, magazine, isometric stage…) with live thumbnails of your own screenshot
- **9 frames**: none (adjustable corner radius), browser, macOS window, Windows window, phone (dynamic island), Android (punch-hole), tablet, laptop, monitor — light/dark themes, 4 device colors, portrait/landscape
- **Backgrounds**: 6 multi-color mesh gradients, 10 gradients, solid colors, blurred screenshot, transparent; optional dots / grid / lines / waves pattern and film grain
- **Captions**: badge + title + subtitle; wrap words in `**double asterisks**` to highlight them (block or color); sans / serif / kai fonts; above or below the screenshot — great for App Store screenshots and social posts
- **Multiple screenshots**: up to 4, side by side, staggered or fanned out
- **3D tilt**: turn left, turn right, lean back (true perspective), plus an isometric view with device thickness
- **Export**: download PNG or copy to clipboard, at the screenshot's original resolution by default
- Drag & drop, paste (Ctrl/⌘ + V) or multi-select upload; settings are remembered

## Run locally

Requires Node.js 20+.

```bash
git clone https://github.com/woodti/shotframe.git
cd shotframe
npm install
npm run dev
```

## Deploy

`npm run build` outputs static files to `dist/` that work on any static host (asset paths are relative, so subdirectories are fine).

- **GitHub Pages**: fork, set Settings → Pages → Source to *GitHub Actions*, and every push to `main` deploys (see `.github/workflows/pages.yml`)
- **Vercel / Netlify / Cloudflare Pages**: import the repo, build command `npm run build`, output directory `dist`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/woodti/shotframe)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/woodti/shotframe)

## How it works

- Vite + React + TypeScript, no other runtime dependencies (icons from lucide-react)
- Every device frame is an original Canvas drawing of a generic device shape — no vendor mockup assets
- Canvas 2D has no perspective transform, so 3D tilt slices the image into thin strips and scales each by its depth
- Rendering engine: [`src/render.ts`](./src/render.ts); UI: [`src/App.tsx`](./src/App.tsx)

## Disclaimer

iPhone, iPad and MacBook are trademarks of Apple Inc. This project is not affiliated with Apple; the frames are generic device shapes.

## License

[MIT](./LICENSE)
