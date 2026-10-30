export type FrameId = 'none' | 'browser' | 'mac' | 'win' | 'phone' | 'android' | 'tablet' | 'laptop' | 'monitor'
export type Ratio = 'auto' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
export type BgKind = 'gradient' | 'mesh' | 'solid' | 'transparent' | 'blur'
export type ColorKey = 'graphite' | 'silver' | 'gold' | 'blue'
export type Tilt = 'none' | 'left' | 'right' | 'back' | 'iso'
export type Pattern = 'none' | 'dots' | 'grid' | 'lines' | 'waves'
export type Arrange = 'row' | 'stagger' | 'fan'
export type CapFont = 'sans' | 'serif' | 'kai'

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
  mesh: number
  solid: string
  pattern: Pattern
  grain: boolean
  padding: number
  shadow: number
  ratio: Ratio
  arrange: Arrange
  tilt: Tilt
  tiltAngle: number
  capTitle: string
  capSub: string
  capBadge: string
  capPos: 'top' | 'bottom'
  capColor: string
  capSize: number
  capFont: CapFont
  capHl: 'block' | 'color'
  capAccent: string
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
  body(ctx: CanvasRenderingContext2D): void
  overlay?(ctx: CanvasRenderingContext2D): void
}

export const DEVICE_COLORS: Record<ColorKey, { name: string; edge: string; light: string; dark: string }> = {
  graphite: { name: '石墨', edge: '#3a3a3c', light: '#6e6f73', dark: '#232326' },
  silver: { name: '银色', edge: '#d4d5d9', light: '#eceef1', dark: '#a3a5aa' },
  gold: { name: '沙金', edge: '#c8b49a', light: '#e2d3bd', dark: '#9c8a72' },
  blue: { name: '深蓝', edge: '#4a5a72', light: '#7385a0', dark: '#2a3546' },
}

/** Four colors each: the base fill, then three soft light blobs. */
export const MESHES: { name: string; colors: [string, string, string, string] }[] = [
  { name: '晚霞', colors: ['#fde2e4', '#fb7185', '#f59e0b', '#a78bfa'] },
  { name: '奶油', colors: ['#fff7ed', '#fdba74', '#f9a8d4', '#c4b5fd'] },
  { name: '薄荷', colors: ['#ecfeff', '#5eead4', '#93c5fd', '#fde68a'] },
  { name: '极光', colors: ['#0f172a', '#22d3ee', '#a855f7', '#22c55e'] },
  { name: '莓果', colors: ['#1e1b4b', '#ec4899', '#6366f1', '#f97316'] },
  { name: '深海', colors: ['#020617', '#0ea5e9', '#1d4ed8', '#14b8a6'] },
]

export const DEVICE_FRAMES: FrameId[] = ['phone', 'android', 'tablet', 'laptop', 'monitor']
export const WINDOW_FRAMES: FrameId[] = ['browser', 'mac', 'win']

const FONT = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif'
const CAP_FONTS: Record<CapFont, string> = {
  sans: FONT,
  serif: '"Songti SC", "Noto Serif SC", "Source Han Serif SC", STSong, SimSun, serif',
  kai: '"Kaiti SC", STKaiti, KaiTi, BiauKai, serif',
}
const MAX_PIXELS = 16_000_000

function windowFrame(src: Source, o: Options): Mockup {
  const kind = o.frame
  const W = 1200
  const H = Math.round((W * src.h) / src.w)
  const bar = kind === 'mac' ? 40 : kind === 'win' ? 38 : 52
  const R = kind === 'win' ? 8 : kind === 'mac' ? 12 : 14
  const dark = o.theme === 'dark'
  const ink = dark ? '#d4d4d8' : '#3f3f46'
  return {
    w: W,
    h: H + bar,
    screen: { x: 0, y: bar, w: W, h: H },
    screenRadius: [0, 0, R, R],
    screenFill: dark ? '#1e1f22' : '#ffffff',
    body(ctx) {
      ctx.beginPath()
      ctx.roundRect(0, 0, W, H + bar, R)
      ctx.fillStyle = dark ? (kind === 'win' ? '#202020' : '#2b2d31') : kind === 'win' ? '#f3f3f3' : kind === 'mac' ? '#ebebed' : '#f1f2f4'
      ctx.fill()
      ctx.textBaseline = 'middle'

      if (kind === 'win') {
        const g = ctx.createLinearGradient(14, 11, 30, 27)
        g.addColorStop(0, '#60a5fa')
        g.addColorStop(1, '#6366f1')
        ctx.beginPath()
        ctx.roundRect(14, bar / 2 - 8, 16, 16, 4)
        ctx.fillStyle = g
        ctx.fill()
        ctx.textAlign = 'left'
        ctx.font = `13px ${FONT}`
        ctx.fillStyle = ink
        ctx.fillText(fitText(ctx, o.title, W - 220), 40, bar / 2 + 1)
        // minimize, maximize, close
        ctx.strokeStyle = ink
        ctx.lineWidth = 1.2
        const cy = bar / 2
        const cx = [W - 115, W - 69, W - 23]
        ctx.beginPath()
        ctx.moveTo(cx[0] - 5, cy)
        ctx.lineTo(cx[0] + 5, cy)
        ctx.rect(cx[1] - 5, cy - 5, 10, 10)
        ctx.moveTo(cx[2] - 5, cy - 5)
        ctx.lineTo(cx[2] + 5, cy + 5)
        ctx.moveTo(cx[2] + 5, cy - 5)
        ctx.lineTo(cx[2] - 5, cy + 5)
        ctx.stroke()
      } else {
        const mac = kind === 'mac'
        const lr = mac ? 6.5 : 7
        const gap = mac ? 20 : 22
        const start = mac ? 20 : 24
        ;['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
          ctx.beginPath()
          ctx.arc(start + i * gap, bar / 2, lr, 0, Math.PI * 2)
          ctx.fillStyle = c
          ctx.fill()
        })
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
  const android = o.frame === 'android'
  const land = o.landscape
  const sw = land ? 844 : 390
  const sh = land ? 390 : 844
  const bz = android ? 10 : 13
  const ring = android ? 2.5 : 3.5
  const btn = 4
  const R = android ? 46 : 68
  const bw = sw + bz * 2
  const bh = sh + bz * 2
  const ox = land ? 0 : btn
  const oy = land ? btn : 0
  const c = DEVICE_COLORS[o.color]
  // [side, offset along the long edge, length]; side -1 is left in portrait, bottom in landscape
  const buttons: [number, number, number][] = android
    ? [
        [1, 180, 90],
        [1, 300, 46],
      ]
    : [
        [-1, 150, 30],
        [-1, 215, 58],
        [-1, 290, 58],
        [1, 245, 92],
      ]
  return {
    w: bw + (land ? 0 : btn * 2),
    h: bh + (land ? btn * 2 : 0),
    screen: { x: ox + bz, y: oy + bz, w: sw, h: sh },
    screenRadius: android ? 36 : 55,
    screenFill: '#000000',
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
      if (android) {
        if (land) ctx.arc(ox + bz + 22, oy + bz + sh / 2, 10, 0, Math.PI * 2)
        else ctx.arc(ox + bz + sw / 2, oy + bz + 22, 10, 0, Math.PI * 2)
      } else if (land) ctx.roundRect(ox + bz + 11, oy + bz + sh / 2 - 55, 32, 110, 16)
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
    case 'mac':
    case 'win':
      return windowFrame(src, o)
    case 'phone':
    case 'android':
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

interface Placed extends Item {
  cx: number
  cy: number
  rot: number
}

interface Line {
  text: string
  hl: boolean[]
  size: number
  weight: number
  y: number
}

let measurer: CanvasRenderingContext2D | null = null
function measureCtx() {
  return (measurer ??= document.createElement('canvas').getContext('2d')!)
}

const capFont = (o: Options, weight: number, size: number) => `${weight} ${size}px ${CAP_FONTS[o.capFont]}`

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

const contrastInk = (hex: string) => (luminance(hex) > 0.6 ? '#111111' : '#ffffff')

/** Rough brightness of the background, used to pick caption and pattern colors. */
function bgLuminance(o: Options) {
  if (o.bgKind === 'transparent') return 1
  if (o.bgKind === 'blur') return 0.4
  if (o.bgKind === 'solid') return luminance(o.solid)
  if (o.bgKind === 'mesh') {
    const c = MESHES[o.mesh % MESHES.length].colors
    return (luminance(c[0]) * 3 + luminance(c[1]) + luminance(c[2]) + luminance(c[3])) / 6
  }
  return (luminance(o.gradient[0]) + luminance(o.gradient[1])) / 2
}

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

/** `**word**` marks highlighted text. */
function parseRich(text: string) {
  let plain = ''
  const hl: boolean[] = []
  let on = false
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '*' && text[i + 1] === '*') {
      on = !on
      i++
      continue
    }
    plain += text[i]
    hl.push(on)
  }
  return { plain, hl }
}

/** Line ranges into `s`; English breaks at the last space, CJK anywhere. */
function wrapRanges(ctx: CanvasRenderingContext2D, s: string, maxW: number) {
  const out: [number, number][] = []
  let start = 0
  for (;;) {
    let nl = s.indexOf('\n', start)
    if (nl < 0) nl = s.length
    let ls = start
    for (let i = start; i < nl; i++) {
      if (i > ls && ctx.measureText(s.slice(ls, i + 1)).width > maxW) {
        const sp = s.lastIndexOf(' ', i - 1)
        if (s[i] !== ' ' && sp > ls) {
          out.push([ls, sp])
          ls = sp + 1
        } else {
          out.push([ls, i])
          ls = s[i] === ' ' ? i + 1 : i
        }
      }
    }
    out.push([ls, nl])
    if (nl >= s.length) return out
    start = nl + 1
  }
}

function place(items: Item[], o: Options) {
  const n = items.length
  const avgW = items.reduce((s, i) => s + i.w, 0) / n
  const maxH = Math.max(...items.map((i) => i.h))
  const mid = (n - 1) / 2
  let placed: Placed[]
  if (o.arrange === 'fan' && n > 1) {
    placed = items.map((it, i) => ({
      ...it,
      cx: (i - mid) * avgW * 0.62,
      cy: Math.abs(i - mid) * maxH * 0.06,
      rot: ((i - mid) * 7 * Math.PI) / 180,
    }))
    // Outer cards first so the middle one sits on top.
    placed = placed.map((p, i) => ({ p, d: Math.abs(i - mid) })).sort((a, b) => b.d - a.d).map((x) => x.p)
  } else {
    const gap = avgW * 0.1
    let x = 0
    placed = items.map((it, i) => {
      const p = { ...it, cx: x + it.w / 2, cy: o.arrange === 'stagger' && n > 1 ? (i % 2 ? 1 : -1) * maxH * 0.06 : 0, rot: 0 }
      x += it.w + gap
      return p
    })
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of placed) {
    const c = Math.abs(Math.cos(p.rot))
    const s = Math.abs(Math.sin(p.rot))
    const ex = (c * p.w + s * p.h) / 2
    const ey = (s * p.w + c * p.h) / 2
    minX = Math.min(minX, p.cx - ex)
    maxX = Math.max(maxX, p.cx + ex)
    minY = Math.min(minY, p.cy - ey)
    maxY = Math.max(maxY, p.cy + ey)
  }
  return { placed, w: maxX - minX, h: maxY - minY, ox: -minX, oy: -minY }
}

export function layout(srcs: Source[], o: Options) {
  const items: Item[] = srcs.map((src) => {
    const m = buildMockup(src, o)
    return { src, m, ...tiltSize(m, o) }
  })
  const group = place(items, o)
  const ref = (group.w / Math.sqrt(items.length) + group.h) / 2
  const pad = (o.padding / 100) * ref

  const lines: Line[] = []
  let badge: { text: string; size: number; y: number } | null = null
  let capW = 0
  let capH = 0
  const title = o.capTitle.trim()
  const sub = o.capSub.trim()
  const badgeText = o.capBadge.trim()
  if (title || sub || badgeText) {
    const ctx = measureCtx()
    const T = ref * 0.075 * (o.capSize / 100)
    const maxW = group.w + pad
    if (badgeText) {
      const size = T * 0.34
      badge = { text: badgeText, size, y: 0 }
      ctx.font = capFont(o, 700, size)
      capW = ctx.measureText(badgeText).width + size * 1.6
      capH += size * 1.8 + T * 0.35
    }
    const add = (text: string, size: number, weight: number, lh: number) => {
      const { plain, hl } = parseRich(text)
      ctx.font = capFont(o, weight, size)
      for (const [a, b] of wrapRanges(ctx, plain, maxW)) {
        const t = plain.slice(a, b)
        lines.push({ text: t, hl: hl.slice(a, b), size, weight, y: capH })
        capW = Math.max(capW, ctx.measureText(t).width)
        capH += size * lh
      }
    }
    if (title) add(title, T, 800, 1.28)
    if (title && sub) capH += T * 0.25
    if (sub) add(sub, T * 0.5, 500, 1.45)
  }
  const capGap = capH ? ref * 0.055 : 0

  const contentW = Math.max(group.w, capW)
  const contentH = group.h + capH + capGap
  let cw = contentW + pad * 2
  let ch = contentH + pad * 2
  if (o.ratio !== 'auto') {
    const [a, b] = o.ratio.split(':').map(Number)
    const r = a / b
    if (cw / ch < r) cw = ch * r
    else ch = cw / r
  }
  const top = (ch - contentH) / 2
  const capTop = o.capPos === 'top' ? top : top + group.h + capGap
  const groupTop = o.capPos === 'top' ? top + capH + capGap : top
  return { items, group, groupLeft: (cw - group.w) / 2, groupTop, cw, ch, lines, badge, capTop }
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
  if (o.bgKind !== 'transparent') {
    drawPattern(ctx, cw, ch, o)
    // Noise reads much stronger on dark colors.
    if (o.grain) drawGrain(ctx, canvas, scale, bgLuminance(o) < 0.4 ? 0.07 : 0.15)
  }

  const ink = o.capColor === 'auto' ? (bgLuminance(o) < 0.55 ? '#ffffff' : '#111111') : o.capColor
  ctx.save()
  ctx.textBaseline = 'top'
  if (o.bgKind === 'blur') {
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 12 * scale
  }
  if (L.badge) {
    const b = L.badge
    ctx.font = capFont(o, 700, b.size)
    const w = ctx.measureText(b.text).width + b.size * 1.6
    const h = b.size * 1.8
    ctx.beginPath()
    ctx.roundRect(cw / 2 - w / 2, L.capTop + b.y, w, h, h / 2)
    ctx.fillStyle = o.capAccent
    ctx.fill()
    ctx.fillStyle = contrastInk(o.capAccent)
    ctx.textAlign = 'center'
    ctx.fillText(b.text, cw / 2, L.capTop + b.y + (h - b.size) / 2 + b.size * 0.04)
  }
  ctx.textAlign = 'left'
  for (const l of L.lines) drawRichLine(ctx, l, cw / 2, L.capTop + l.y, ink, o)
  ctx.restore()

  for (const p of L.group.placed) {
    const img = warp(renderFlat(p, o, scale), p, o, scale)
    ctx.save()
    ctx.translate(L.groupLeft + L.group.ox + p.cx, L.groupTop + L.group.oy + p.cy)
    ctx.rotate(p.rot)
    if (o.shadow > 0) {
      const u = (p.w + p.h) / 2000
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
    ctx.drawImage(img, -p.w / 2, -p.h / 2, img.width / scale, img.height / scale)
    ctx.restore()
  }
}

function drawRichLine(ctx: CanvasRenderingContext2D, l: Line, cx: number, y: number, ink: string, o: Options) {
  ctx.font = capFont(o, l.weight, l.size)
  const runs: { text: string; hl: boolean; w: number }[] = []
  for (let i = 0; i < l.text.length; ) {
    let j = i
    while (j < l.text.length && l.hl[j] === l.hl[i]) j++
    const text = l.text.slice(i, j)
    runs.push({ text, hl: l.hl[i], w: ctx.measureText(text).width })
    i = j
  }
  // Highlight blocks get breathing room on both sides.
  const pad = o.capHl === 'block' ? l.size * 0.14 : 0
  let x = cx - runs.reduce((s, r) => s + r.w + (r.hl ? pad * 2 : 0), 0) / 2
  for (const r of runs) {
    if (r.hl && o.capHl === 'block') {
      ctx.save()
      ctx.shadowColor = 'transparent'
      ctx.beginPath()
      ctx.roundRect(x + pad * 0.3, y - l.size * 0.06, r.w + pad * 1.4, l.size * 1.2, l.size * 0.16)
      ctx.fillStyle = o.capAccent
      ctx.fill()
      ctx.restore()
      ctx.fillStyle = contrastInk(o.capAccent)
    } else ctx.fillStyle = r.hl ? o.capAccent : ink
    ctx.fillText(r.text, x + (r.hl ? pad : 0), y)
    x += r.w + (r.hl ? pad * 2 : 0)
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
  drawImageIn(ctx, src, s, DEVICE_FRAMES.includes(o.frame) ? o.fit : 'cover')
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
  if (o.bgKind === 'mesh') {
    const [base, ...blobs] = MESHES[o.mesh % MESHES.length].colors
    ctx.fillStyle = base
    ctx.fillRect(0, 0, cw, ch)
    const spots = [
      [0.12, 0.18],
      [0.9, 0.3],
      [0.42, 0.98],
    ]
    const r = Math.max(cw, ch) * 0.72
    blobs.forEach((color, i) => {
      const x = (o.mesh % 2 ? 1 - spots[i][0] : spots[i][0]) * cw
      const y = spots[i][1] * ch
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, color)
      g.addColorStop(1, color + '00')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, cw, ch)
    })
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

function drawPattern(ctx: CanvasRenderingContext2D, cw: number, ch: number, o: Options) {
  if (o.pattern === 'none') return
  const dark = bgLuminance(o) < 0.55
  const sp = Math.max(cw, ch) / 48
  ctx.save()
  ctx.fillStyle = ctx.strokeStyle = dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)'
  ctx.beginPath()
  if (o.pattern === 'dots') {
    const r = sp * 0.09
    for (let y = sp / 2; y < ch; y += sp)
      for (let x = sp / 2; x < cw; x += sp) {
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, Math.PI * 2)
      }
    ctx.fill()
  } else if (o.pattern === 'grid') {
    for (let x = sp; x < cw; x += sp) ctx.rect(x, 0, sp * 0.04, ch)
    for (let y = sp; y < ch; y += sp) ctx.rect(0, y, cw, sp * 0.04)
    ctx.fill()
  } else if (o.pattern === 'lines') {
    ctx.lineWidth = sp * 0.06
    for (let d = -ch; d < cw; d += sp * 0.8) {
      ctx.moveTo(d, ch)
      ctx.lineTo(d + ch, 0)
    }
    ctx.stroke()
  } else {
    ctx.lineWidth = sp * 0.1
    ctx.strokeStyle = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
    const amp = ch * 0.035
    for (let k = 1; k <= 7; k++) {
      const base = (ch * k) / 8
      ctx.moveTo(0, base)
      for (let x = 0; x <= cw; x += sp / 2) ctx.lineTo(x, base + Math.sin((x / cw) * Math.PI * 3 + k) * amp)
    }
    ctx.stroke()
  }
  ctx.restore()
}

let noise: HTMLCanvasElement | null = null
function drawGrain(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scale: number, alpha: number) {
  if (!noise) {
    noise = document.createElement('canvas')
    noise.width = noise.height = 160
    const nctx = noise.getContext('2d')!
    const img = nctx.createImageData(160, 160)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    nctx.putImageData(img, 0, 0)
  }
  const pattern = ctx.createPattern(noise, 'repeat')
  if (!pattern) return
  // Grain lives in device pixels so it stays fine-grained at every export size.
  const k = Math.max(1, scale / 2)
  pattern.setTransform(new DOMMatrix([k, 0, 0, k, 0, 0]))
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.globalCompositeOperation = 'overlay'
  ctx.globalAlpha = alpha
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
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
