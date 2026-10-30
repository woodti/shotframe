export type FrameId = 'none' | 'browser' | 'mac' | 'phone' | 'tablet' | 'laptop' | 'monitor'
export type Ratio = 'auto' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
export type BgKind = 'gradient' | 'solid' | 'transparent' | 'blur'
export type ColorKey = 'graphite' | 'silver' | 'gold' | 'blue'
export type Tilt = 'none' | 'left' | 'right' | 'back' | 'iso'

export interface Options {
  frame: FrameId
  theme: 'light' | 'dark'
  color: ColorKey
  landscape: boolean
  island: boolean
  fit: 'cover' | 'contain'
  url: string
  title: string
  radius: number
  bgKind: BgKind
  gradient: [string, string]
  angle: number
  solid: string
  padding: number
  shadow: number
  ratio: Ratio
  tilt: Tilt
  tiltAngle: number
  capTitle: string
  capSub: string
  capPos: 'top' | 'bottom'
  capColor: string
  capSize: number
}

export interface Source {
  el: CanvasImageSource
  w: number
  h: number
  url?: string
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface Mockup {
  w: number
  h: number
  screen: Rect
  screenRadius: number | number[]
  screenFill: string
  shape(ctx: CanvasRenderingContext2D): void
  body(ctx: CanvasRenderingContext2D): void
  overlay?(ctx: CanvasRenderingContext2D): void
}

export const DEVICE_COLORS: Record<ColorKey, { name: string; edge: string; light: string; dark: string }> = {
  graphite: { name: '石墨', edge: '#3a3a3c', light: '#6e6f73', dark: '#232326' },
  silver: { name: '银色', edge: '#d4d5d9', light: '#eceef1', dark: '#a3a5aa' },
  gold: { name: '沙金', edge: '#c8b49a', light: '#e2d3bd', dark: '#9c8a72' },
  blue: { name: '深蓝', edge: '#4a5a72', light: '#7385a0', dark: '#2a3546' },
}

export const DEVICE_FRAMES: FrameId[] = ['phone', 'tablet', 'laptop', 'monitor']

const FONT = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif'
const MAX_PIXELS = 16_000_000

function windowFrame(src: Source, o: Options, mac: boolean): Mockup {
  const W = 1200
  const H = Math.round((W * src.h) / src.w)
  const bar = mac ? 40 : 52
  const R = mac ? 12 : 14
  const dark = o.theme === 'dark'
  return {
    w: W,
    h: H + bar,
    screen: { x: 0, y: bar, w: W, h: H },
    screenRadius: [0, 0, R, R],
    screenFill: dark ? '#1e1f22' : '#ffffff',
    shape(ctx) {
      ctx.beginPath()
      ctx.roundRect(0, 0, W, H + bar, R)
    },
    body(ctx) {
      ctx.beginPath()
      ctx.roundRect(0, 0, W, H + bar, R)
      ctx.fillStyle = dark ? '#2b2d31' : mac ? '#ebebed' : '#f1f2f4'
      ctx.fill()

      const lr = mac ? 6.5 : 7
      const gap = mac ? 20 : 22
      const start = mac ? 20 : 24
      ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
        ctx.beginPath()
        ctx.arc(start + i * gap, bar / 2, lr, 0, Math.PI * 2)
        ctx.fillStyle = c
        ctx.fill()
      })

      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      if (mac) {
        ctx.font = `600 14px ${FONT}`
        ctx.fillStyle = dark ? '#d4d4d8' : '#4b5563'
        ctx.fillText(fitText(ctx, o.title, W - 240), W / 2, bar / 2 + 1)
      } else {
        const px = 120
        const pw = W - px * 2
        ctx.beginPath()
        ctx.roundRect(px, (bar - 30) / 2, pw, 30, 15)
        ctx.fillStyle = dark ? '#1e1f22' : '#ffffff'
        ctx.fill()
        ctx.font = `14px ${FONT}`
        ctx.fillStyle = dark ? '#a1a1aa' : '#6b7280'
        ctx.fillText(fitText(ctx, o.url, pw - 40), W / 2, bar / 2 + 1)
      }

      ctx.fillStyle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
      ctx.fillRect(0, bar - 1, W, 1)
    },
    overlay(ctx) {
      ctx.beginPath()
      ctx.roundRect(0.5, 0.5, W - 1, H + bar - 1, R)
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
      ctx.lineWidth = 1
      ctx.stroke()
    },
  }
}

function phoneFrame(o: Options): Mockup {
  const land = o.landscape
  const sw = land ? 844 : 390
  const sh = land ? 390 : 844
  const bz = 13
  const ring = 3.5
  const btn = 4
  const R = 68
  const bw = sw + bz * 2
  const bh = sh + bz * 2
  const ox = land ? 0 : btn
  const oy = land ? btn : 0
  const c = DEVICE_COLORS[o.color]
  // [side, offset along the long edge, length]; side -1 is left in portrait, bottom in landscape
  const buttons: [number, number, number][] = [
    [-1, 150, 30],
    [-1, 215, 58],
    [-1, 290, 58],
    [1, 245, 92],
  ]
  return {
    w: bw + (land ? 0 : btn * 2),
    h: bh + (land ? btn * 2 : 0),
    screen: { x: ox + bz, y: oy + bz, w: sw, h: sh },
    screenRadius: 55,
    screenFill: '#000000',
    shape(ctx) {
      ctx.beginPath()
      ctx.roundRect(ox, oy, bw, bh, R)
    },
    body(ctx) {
      ctx.fillStyle = c.dark
      for (const [side, at, len] of buttons) {
        ctx.beginPath()
        if (land) ctx.roundRect(ox + at, side < 0 ? oy + bh - 2 : 0, len, btn + 2, 2)
        else ctx.roundRect(side < 0 ? 0 : ox + bw - 2, oy + at, btn + 2, len, 2)
        ctx.fill()
      }
      metalBody(ctx, ox, oy, bw, bh, R, ring, c)
    },
    overlay(ctx) {
      if (!o.island) return
      ctx.beginPath()
      if (land) ctx.roundRect(ox + bz + 11, oy + bz + sh / 2 - 55, 32, 110, 16)
      else ctx.roundRect(ox + bz + sw / 2 - 55, oy + bz + 11, 110, 32, 16)
      ctx.fillStyle = '#000000'
      ctx.fill()
    },
  }
}

function tabletFrame(o: Options): Mockup {
  const land = o.landscape
  const sw = land ? 1180 : 820
  const sh = land ? 820 : 1180
  const bz = 24
  const R = 44
  const bw = sw + bz * 2
  const bh = sh + bz * 2
  const c = DEVICE_COLORS[o.color]
  return {
    w: bw,
    h: bh,
    screen: { x: bz, y: bz, w: sw, h: sh },
    screenRadius: 20,
    screenFill: '#000000',
    shape(ctx) {
      ctx.beginPath()
      ctx.roundRect(0, 0, bw, bh, R)
    },
    body(ctx) {
      metalBody(ctx, 0, 0, bw, bh, R, 3, c)
      ctx.beginPath()
      ctx.arc(bw / 2, bz / 2, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#1c2330'
      ctx.fill()
    },
  }
}

function laptopFrame(o: Options): Mockup {
  const sw = 1280
  const sh = 800
  const side = 22
  const top = 30
  const bottom = 34
  const lidW = sw + side * 2
  const lidH = sh + top + bottom
  const baseW = Math.round(lidW * 1.16)
  const baseH = 24
  const lx = (baseW - lidW) / 2
  const c = DEVICE_COLORS[o.color]
  return {
    w: baseW,
    h: lidH + baseH,
    screen: { x: lx + side, y: top, w: sw, h: sh },
    screenRadius: 6,
    screenFill: '#000000',
    shape(ctx) {
      ctx.beginPath()
      ctx.roundRect(lx, 0, lidW, lidH, [26, 26, 6, 6])
      ctx.roundRect(0, lidH, baseW, baseH, [3, 3, 18, 18])
    },
    body(ctx) {
      ctx.beginPath()
      ctx.roundRect(lx, 0, lidW, lidH, [26, 26, 6, 6])
      ctx.fillStyle = c.edge
      ctx.fill()
      ctx.beginPath()
      ctx.roundRect(lx + 3, 3, lidW - 6, lidH - 6, [23, 23, 4, 4])
      ctx.fillStyle = '#0b0b0c'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(lx + lidW / 2, top / 2, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#1c2330'
      ctx.fill()

      const g = ctx.createLinearGradient(0, lidH, 0, lidH + baseH)
      g.addColorStop(0, c.light)
      g.addColorStop(1, c.dark)
      ctx.beginPath()
      ctx.roundRect(0, lidH, baseW, baseH, [3, 3, 18, 18])
      ctx.fillStyle = g
      ctx.fill()
      ctx.beginPath()
      ctx.roundRect(baseW / 2 - 110, lidH, 220, 9, [0, 0, 9, 9])
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fill()
    },
  }
}

function monitorFrame(o: Options): Mockup {
  const sw = 1600
  const sh = 900
  const bz = 18
  const bw = sw + bz * 2
  const bh = sh + bz * 2
  const neckW = 200
  const neckH = 150
  const footW = 460
  const footH = 20
  const c = DEVICE_COLORS[o.color]
  return {
    w: bw,
    h: bh + neckH + footH,
    screen: { x: bz, y: bz, w: sw, h: sh },
    screenRadius: 4,
    screenFill: '#000000',
    shape(ctx) {
      ctx.beginPath()
      ctx.roundRect(0, 0, bw, bh, 20)
      ctx.rect(bw / 2 - neckW / 2, bh - 10, neckW, neckH + 10)
      ctx.roundRect(bw / 2 - footW / 2, bh + neckH, footW, footH, [6, 6, 10, 10])
    },
    body(ctx) {
      const neck = ctx.createLinearGradient(bw / 2 - neckW / 2, 0, bw / 2 + neckW / 2, 0)
      neck.addColorStop(0, c.dark)
      neck.addColorStop(0.5, c.light)
      neck.addColorStop(1, c.dark)
      ctx.fillStyle = neck
      ctx.fillRect(bw / 2 - neckW / 2, bh - 10, neckW, neckH + 12)
      const foot = ctx.createLinearGradient(0, bh + neckH, 0, bh + neckH + footH)
      foot.addColorStop(0, c.light)
      foot.addColorStop(1, c.dark)
      ctx.beginPath()
      ctx.roundRect(bw / 2 - footW / 2, bh + neckH, footW, footH, [6, 6, 10, 10])
      ctx.fillStyle = foot
      ctx.fill()

      ctx.beginPath()
      ctx.roundRect(0, 0, bw, bh, 20)
      ctx.fillStyle = c.edge
      ctx.fill()
      ctx.beginPath()
      ctx.roundRect(3, 3, bw - 6, bh - 6, 17)
      ctx.fillStyle = '#0b0b0c'
      ctx.fill()
    },
  }
}

function plainFrame(src: Source, o: Options): Mockup {
  const W = 1200
  const H = Math.round((W * src.h) / src.w)
  const r = (o.radius * W) / 400
  return {
    w: W,
    h: H,
    screen: { x: 0, y: 0, w: W, h: H },
    screenRadius: r,
    screenFill: '',
    shape(ctx) {
      ctx.beginPath()
      ctx.roundRect(0, 0, W, H, r)
    },
    body() {},
  }
}

function metalBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  ring: number,
  c: { edge: string; light: string; dark: string },
) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, c.light)
  g.addColorStop(0.5, c.edge)
  g.addColorStop(1, c.dark)
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fillStyle = g
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(x + ring, y + ring, w - ring * 2, h - ring * 2, r - ring)
  ctx.fillStyle = '#050505'
  ctx.fill()
}

function fitText(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text
  let t = text
  while (t.length > 1 && ctx.measureText(t + '…').width > max) t = t.slice(0, -1)
  return t + '…'
}

function buildMockup(src: Source, o: Options): Mockup {
  switch (o.frame) {
    case 'browser':
      return windowFrame(src, o, false)
    case 'mac':
      return windowFrame(src, o, true)
    case 'phone':
      return phoneFrame(o)
    case 'tablet':
      return tabletFrame(o)
    case 'laptop':
      return laptopFrame(o)
    case 'monitor':
      return monitorFrame(o)
    default:
      return plainFrame(src, o)
  }
}

const ISO = { a: Math.cos(Math.PI / 6), b: 0.5 }

interface Item {
  src: Source
  m: Mockup
  w: number
  h: number
}

interface Line {
  text: string
  size: number
  weight: number
  y: number
}

let measurer: CanvasRenderingContext2D | null = null
function measureCtx() {
  return (measurer ??= document.createElement('canvas').getContext('2d')!)
}

const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`

function perspective(len: number, size: number, t: number) {
  const D = size * 2.4
  const k = (u: number) => D / (D + u * Math.sin(t))
  const x = (u: number) => u * Math.cos(t) * k(u)
  return { k, x, kMax: Math.max(k(-len / 2), k(len / 2)), span: x(len / 2) - x(-len / 2) }
}

/** Signed rotation: positive pushes the right (or bottom) edge away from the viewer. */
function tiltRad(o: Options) {
  const t = (o.tiltAngle * Math.PI) / 180
  return o.tilt === 'right' ? t : -t
}

const isoDepth = (m: Mockup) => Math.min(m.w, m.h) * 0.035

function tiltSize(m: Mockup, o: Options) {
  const t = tiltRad(o)
  const size = Math.max(m.w, m.h)
  if (o.tilt === 'left' || o.tilt === 'right') {
    const p = perspective(m.w, size, t)
    return { w: p.span, h: m.h * p.kMax }
  }
  if (o.tilt === 'back') {
    const p = perspective(m.h, size, t)
    return { w: m.w * p.kMax, h: p.span }
  }
  if (o.tilt === 'iso') return { w: ISO.a * (m.w + m.h), h: ISO.b * (m.w + m.h) + isoDepth(m) }
  return { w: m.w, h: m.h }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const ch of para) {
      const next = line + ch
      if (line && ctx.measureText(next).width > maxW) {
        // Break English at the last space, CJK anywhere.
        const sp = line.lastIndexOf(' ')
        if (ch !== ' ' && sp > 0) {
          out.push(line.slice(0, sp))
          line = line.slice(sp + 1) + ch
        } else {
          out.push(line)
          line = ch === ' ' ? '' : ch
        }
      } else line = next
    }
    out.push(line)
  }
  return out
}

export function layout(srcs: Source[], o: Options) {
  const items: Item[] = srcs.map((src) => {
    const m = buildMockup(src, o)
    return { src, m, ...tiltSize(m, o) }
  })
  const n = items.length
  const sumW = items.reduce((s, i) => s + i.w, 0)
  const gap = (sumW / n) * 0.1
  const rowW = sumW + gap * (n - 1)
  const rowH = Math.max(...items.map((i) => i.h))
  const ref = (rowW + rowH) / 2
  const pad = (o.padding / 100) * ref

  const lines: Line[] = []
  let capW = 0
  let capH = 0
  const title = o.capTitle.trim()
  const sub = o.capSub.trim()
  if (title || sub) {
    const ctx = measureCtx()
    const T = ref * 0.075 * (o.capSize / 100)
    const maxW = rowW + pad
    const add = (text: string, size: number, weight: number, lh: number) => {
      ctx.font = font(weight, size)
      for (const l of wrap(ctx, text, maxW)) {
        lines.push({ text: l, size, weight, y: capH })
        capW = Math.max(capW, ctx.measureText(l).width)
        capH += size * lh
      }
    }
    if (title) add(title, T, 800, 1.22)
    if (title && sub) capH += T * 0.3
    if (sub) add(sub, T * 0.5, 500, 1.45)
  }
  const capGap = capH ? ref * 0.055 : 0

  const contentW = Math.max(rowW, capW)
  const contentH = rowH + capH + capGap
  let cw = contentW + pad * 2
  let ch = contentH + pad * 2
  if (o.ratio !== 'auto') {
    const [a, b] = o.ratio.split(':').map(Number)
    const r = a / b
    if (cw / ch < r) cw = ch * r
    else ch = cw / r
  }
  const top = (ch - contentH) / 2
  const capTop = o.capPos === 'top' ? top : top + rowH + capGap
  const rowTop = o.capPos === 'top' ? top + capH + capGap : top
  return { items, cw, ch, gap, rowW, rowH, rowTop, lines, capTop }
}

/** Scale at which the screenshots keep roughly their own resolution, capped to a canvas size every browser accepts. */
export function autoScale(srcs: Source[], o: Options) {
  const L = layout(srcs, o)
  const s = Math.min(4, Math.max(1, ...L.items.map((i) => i.src.w / i.m.screen.w)))
  return Math.min(s, Math.sqrt(MAX_PIXELS / (L.cw * L.ch)))
}

export function maxScale(srcs: Source[], o: Options) {
  const { cw, ch } = layout(srcs, o)
  return Math.sqrt(MAX_PIXELS / (cw * ch))
}

export function render(canvas: HTMLCanvasElement, srcs: Source[], o: Options, scale: number) {
  const L = layout(srcs, o)
  const { cw, ch } = L
  canvas.width = Math.max(1, Math.round(cw * scale))
  canvas.height = Math.max(1, Math.round(ch * scale))
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.clearRect(0, 0, cw, ch)
  ctx.imageSmoothingQuality = 'high'
  drawBackground(ctx, cw, ch, srcs[0], o)

  if (L.lines.length) {
    ctx.save()
    ctx.fillStyle = captionColor(o)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    if (o.bgKind === 'blur') {
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 12 * scale
    }
    for (const l of L.lines) {
      ctx.font = font(l.weight, l.size)
      ctx.fillText(l.text, cw / 2, L.capTop + l.y)
    }
    ctx.restore()
  }

  let x = (cw - L.rowW) / 2
  for (const it of L.items) {
    const img = warp(renderFlat(it, o, scale), it, o, scale)
    ctx.save()
    if (o.shadow > 0) {
      const u = (it.w + it.h) / 2000
      const [blur, off, alpha] = [
        [24, 8, 0.18],
        [56, 20, 0.28],
        [100, 36, 0.4],
      ][o.shadow - 1]
      // Shadows are not affected by the transform, so scale them by hand.
      ctx.shadowColor = `rgba(0,0,0,${alpha})`
      ctx.shadowBlur = blur * u * scale
      ctx.shadowOffsetY = off * u * scale
    }
    ctx.drawImage(img, x, L.rowTop + (L.rowH - it.h) / 2, img.width / scale, img.height / scale)
    ctx.restore()
    x += it.w + L.gap
  }
}

function newCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(w))
  c.height = Math.max(1, Math.ceil(h))
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  return { c, ctx }
}

function renderFlat(it: Item, o: Options, scale: number) {
  const { m, src } = it
  const { c, ctx } = newCanvas(m.w * scale, m.h * scale)
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  m.body(ctx)
  const s = m.screen
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(s.x, s.y, s.w, s.h, m.screenRadius)
  ctx.clip()
  if (m.screenFill) {
    ctx.fillStyle = m.screenFill
    ctx.fillRect(s.x, s.y, s.w, s.h)
  }
  drawImageIn(ctx, src, s, o.frame === 'none' || o.frame === 'browser' || o.frame === 'mac' ? 'cover' : o.fit)
  ctx.restore()
  m.overlay?.(ctx)
  return c
}

/** Canvas 2D has no perspective transform, so tilts are drawn as thin strips, each scaled by its depth. */
function warp(flat: HTMLCanvasElement, it: Item, o: Options, scale: number) {
  if (o.tilt === 'none') return flat
  const { m } = it
  const { c, ctx } = newCanvas(it.w * scale, it.h * scale)
  const t = tiltRad(o)
  const size = Math.max(m.w, m.h)

  if (o.tilt === 'left' || o.tilt === 'right') {
    const p = perspective(m.w, size, t)
    const x0 = p.x(-m.w / 2)
    const n = Math.max(1, Math.ceil(flat.width / 2))
    const sw = flat.width / n
    for (let i = 0; i < n; i++) {
      const u0 = -m.w / 2 + (i * m.w) / n
      const u1 = u0 + m.w / n
      const dh = m.h * p.k((u0 + u1) / 2)
      const dx = (p.x(u0) - x0) * scale
      const dw = (p.x(u1) - p.x(u0)) * scale
      ctx.drawImage(flat, i * sw, 0, sw, flat.height, dx, ((it.h - dh) / 2) * scale, dw + 0.6, dh * scale)
    }
  } else if (o.tilt === 'back') {
    const p = perspective(m.h, size, t)
    const y0 = p.x(-m.h / 2)
    const n = Math.max(1, Math.ceil(flat.height / 2))
    const sh = flat.height / n
    for (let i = 0; i < n; i++) {
      const v0 = -m.h / 2 + (i * m.h) / n
      const v1 = v0 + m.h / n
      const dw = m.w * p.k((v0 + v1) / 2)
      const dy = (p.x(v0) - y0) * scale
      const dh = (p.x(v1) - p.x(v0)) * scale
      ctx.drawImage(flat, 0, i * sh, flat.width, sh, ((it.w - dw) / 2) * scale, dy, dw * scale, dh + 0.6)
    }
  } else {
    // Lying flat, seen from above at an isometric angle; stacked silhouettes give it thickness.
    const { c: sil, ctx: sctx } = newCanvas(flat.width, flat.height)
    sctx.drawImage(flat, 0, 0)
    sctx.globalCompositeOperation = 'source-in'
    sctx.fillStyle = DEVICE_FRAMES.includes(o.frame) ? DEVICE_COLORS[o.color].dark : o.theme === 'dark' ? '#18181b' : '#a1a1aa'
    sctx.fillRect(0, 0, sil.width, sil.height)
    const depth = isoDepth(m)
    const steps = Math.max(1, Math.min(40, Math.ceil(depth * scale)))
    const iso = (off: number) =>
      ctx.setTransform(ISO.a * scale, ISO.b * scale, -ISO.a * scale, ISO.b * scale, ISO.a * m.h * scale, off * scale)
    for (let s = steps; s >= 1; s--) {
      iso((depth * s) / steps)
      ctx.drawImage(sil, 0, 0, m.w, m.h)
    }
    iso(0)
    ctx.drawImage(flat, 0, 0, m.w, m.h)
  }
  return c
}

function captionColor(o: Options) {
  if (o.capColor !== 'auto') return o.capColor
  if (o.bgKind === 'blur') return '#ffffff'
  if (o.bgKind === 'transparent') return '#111111'
  const colors = o.bgKind === 'solid' ? [o.solid] : o.gradient
  const lum =
    colors.reduce((s, hex) => {
      const n = parseInt(hex.slice(1), 16)
      return s + (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
    }, 0) / colors.length
  return lum < 0.55 ? '#ffffff' : '#111111'
}

function drawImageIn(ctx: CanvasRenderingContext2D, src: Source, s: Rect, fit: 'cover' | 'contain') {
  const ir = src.w / src.h
  const sr = s.w / s.h
  let dw: number
  let dh: number
  if (fit === 'cover' ? ir > sr : ir < sr) {
    dh = s.h
    dw = dh * ir
  } else {
    dw = s.w
    dh = dw / ir
  }
  const dx = s.x + (s.w - dw) / 2
  // Long screenshots stay pinned to the top, like a real screen.
  const dy = fit === 'cover' && dh > s.h ? s.y : s.y + (s.h - dh) / 2
  ctx.drawImage(src.el, dx, dy, dw, dh)
}

function drawBackground(ctx: CanvasRenderingContext2D, cw: number, ch: number, src: Source, o: Options) {
  if (o.bgKind === 'transparent') return
  if (o.bgKind === 'solid') {
    ctx.fillStyle = o.solid
    ctx.fillRect(0, 0, cw, ch)
    return
  }
  if (o.bgKind === 'blur') {
    // Blur on a small fixed-size canvas, then stretch it: same look at any export scale.
    // Browsers without ctx.filter still get a softer, downscaled version.
    const small = document.createElement('canvas')
    small.width = 160
    small.height = Math.max(1, Math.round((160 * ch) / cw))
    const sx = small.getContext('2d')!
    sx.filter = 'blur(7px)'
    const k = Math.max(small.width / src.w, small.height / src.h) * 1.25
    sx.drawImage(src.el, (small.width - src.w * k) / 2, (small.height - src.h * k) / 2, src.w * k, src.h * k)
    ctx.drawImage(small, 0, 0, cw, ch)
    ctx.fillStyle = 'rgba(0,0,0,0.12)'
    ctx.fillRect(0, 0, cw, ch)
    return
  }
  const a = (o.angle * Math.PI) / 180
  const dx = Math.sin(a)
  const dy = -Math.cos(a)
  const len = Math.abs(cw * dx) + Math.abs(ch * dy)
  const g = ctx.createLinearGradient(cw / 2 - (dx * len) / 2, ch / 2 - (dy * len) / 2, cw / 2 + (dx * len) / 2, ch / 2 + (dy * len) / 2)
  g.addColorStop(0, o.gradient[0])
  g.addColorStop(1, o.gradient[1])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, cw, ch)
}

export function makeDemo(portrait: boolean): Source {
  const w = portrait ? 1179 : 2400
  const h = portrait ? 2556 : 1500
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const x = c.getContext('2d')!
  const u = w / (portrait ? 390 : 1200)
  x.fillStyle = '#f5f6fa'
  x.fillRect(0, 0, w, h)
  x.textBaseline = 'alphabetic'

  if (portrait) {
    const g = x.createLinearGradient(0, 0, w, h * 0.32)
    g.addColorStop(0, '#6366f1')
    g.addColorStop(1, '#a855f7')
    x.fillStyle = g
    x.fillRect(0, 0, w, h * 0.32)
    x.fillStyle = '#ffffff'
    x.font = `700 ${34 * u}px ${FONT}`
    x.fillText('截图套壳', 24 * u, 150 * u)
    x.font = `${15 * u}px ${FONT}`
    x.globalAlpha = 0.9
    x.fillText('拖入、粘贴或点击上传你的截图', 24 * u, 182 * u)
    x.globalAlpha = 1
    const colors = ['#f97316', '#10b981', '#3b82f6', '#ec4899', '#eab308']
    for (let i = 0; i < 5; i++) {
      const y = h * 0.32 + 20 * u + i * 104 * u
      x.fillStyle = '#ffffff'
      x.beginPath()
      x.roundRect(16 * u, y, w - 32 * u, 88 * u, 18 * u)
      x.fill()
      x.fillStyle = colors[i]
      x.beginPath()
      x.roundRect(32 * u, y + 20 * u, 48 * u, 48 * u, 14 * u)
      x.fill()
      x.fillStyle = '#d4d6de'
      x.beginPath()
      x.roundRect(96 * u, y + 26 * u, 150 * u, 12 * u, 6 * u)
      x.fill()
      x.fillStyle = '#e8e9ef'
      x.beginPath()
      x.roundRect(96 * u, y + 50 * u, 220 * u, 10 * u, 5 * u)
      x.fill()
    }
  } else {
    x.fillStyle = '#1f2433'
    x.fillRect(0, 0, 220 * u, h)
    for (let i = 0; i < 7; i++) {
      x.fillStyle = i === 0 ? '#6366f1' : '#343a4d'
      x.beginPath()
      x.roundRect(24 * u, (40 + i * 46) * u, (i === 0 ? 172 : 120 - (i % 3) * 18) * u, 26 * u, 8 * u)
      x.fill()
    }
    x.fillStyle = '#1f2433'
    x.font = `700 ${36 * u}px ${FONT}`
    x.fillText('截图套壳', 264 * u, 92 * u)
    x.fillStyle = '#6b7280'
    x.font = `${16 * u}px ${FONT}`
    x.fillText('拖入、粘贴或点击上传你的截图，一键套上设备边框', 264 * u, 126 * u)
    const colors = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#0ea5e9', '#eab308']
    const cw = (1200 - 264 - 40 - 48) / 3
    for (let i = 0; i < 6; i++) {
      const cx = (264 + (i % 3) * (cw + 24)) * u
      const cy = (170 + Math.floor(i / 3) * 290) * u
      x.fillStyle = '#ffffff'
      x.beginPath()
      x.roundRect(cx, cy, cw * u, 266 * u, 16 * u)
      x.fill()
      x.fillStyle = colors[i]
      x.globalAlpha = 0.85
      x.beginPath()
      x.roundRect(cx, cy, cw * u, 150 * u, [16 * u, 16 * u, 0, 0])
      x.fill()
      x.globalAlpha = 1
      x.fillStyle = '#d4d6de'
      x.beginPath()
      x.roundRect(cx + 20 * u, cy + 176 * u, cw * 0.6 * u, 14 * u, 7 * u)
      x.fill()
      x.fillStyle = '#e8e9ef'
      x.beginPath()
      x.roundRect(cx + 20 * u, cy + 206 * u, cw * 0.8 * u, 11 * u, 5 * u)
      x.fill()
    }
  }
  return { el: c, w, h }
}
