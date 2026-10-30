import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AppWindow,
  ChevronLeft,
  Copy,
  Download,
  Globe,
  ImagePlus,
  Laptop,
  Monitor,
  Plus,
  Smartphone,
  Square,
  Tablet,
  X,
} from 'lucide-react'
import {
  DEVICE_COLORS,
  DEVICE_FRAMES,
  autoScale,
  layout,
  makeDemo,
  maxScale,
  render,
  type ColorKey,
  type FrameId,
  type Options,
  type Ratio,
  type Source,
  type Tilt,
} from './render'

const FRAMES: { id: FrameId; name: string; icon: ReactNode }[] = [
  { id: 'none', name: '无边框', icon: <Square size={18} /> },
  { id: 'browser', name: '浏览器', icon: <Globe size={18} /> },
  { id: 'mac', name: 'Mac 窗口', icon: <AppWindow size={18} /> },
  { id: 'phone', name: '手机', icon: <Smartphone size={18} /> },
  { id: 'tablet', name: '平板', icon: <Tablet size={18} /> },
  { id: 'laptop', name: '笔记本', icon: <Laptop size={18} /> },
  { id: 'monitor', name: '显示器', icon: <Monitor size={18} /> },
]

const GRADIENTS: { name: string; colors: [string, string] }[] = [
  { name: '晨雾', colors: ['#a1c4fd', '#c2e9fb'] },
  { name: '蜜桃', colors: ['#ffecd2', '#fcb69f'] },
  { name: '紫霞', colors: ['#a18cd1', '#fbc2eb'] },
  { name: '薄荷', colors: ['#d4fc79', '#96e6a1'] },
  { name: '海洋', colors: ['#4facfe', '#00f2fe'] },
  { name: '落日', colors: ['#fa709a', '#fee140'] },
  { name: '葡萄', colors: ['#667eea', '#764ba2'] },
  { name: '极光', colors: ['#43e97b', '#38f9d7'] },
  { name: '夜空', colors: ['#0f2027', '#2c5364'] },
  { name: '石墨', colors: ['#232526', '#414345'] },
]

const SOLIDS = ['#ffffff', '#f2f2f7', '#fde68a', '#111111']
const RATIOS: { id: Ratio; name: string }[] = [
  { id: 'auto', name: '自动' },
  { id: '1:1', name: '1:1' },
  { id: '3:4', name: '3:4' },
  { id: '4:3', name: '4:3' },
  { id: '9:16', name: '9:16' },
  { id: '16:9', name: '16:9' },
]
const TILTS: [Tilt, string][] = [
  ['none', '无'],
  ['left', '左转'],
  ['right', '右转'],
  ['back', '后仰'],
  ['iso', '等距'],
]
const SHADOWS = ['无', '柔和', '中等', '强烈']
const SCALES = ['auto', '1', '2', '3', '4'] as const
type ScaleChoice = (typeof SCALES)[number]
const MAX_SHOTS = 4

const DEFAULTS: Options = {
  frame: 'phone',
  theme: 'light',
  color: 'graphite',
  landscape: false,
  island: true,
  fit: 'cover',
  url: 'example.com',
  title: '我的应用',
  radius: 12,
  bgKind: 'gradient',
  gradient: GRADIENTS[2].colors,
  angle: 135,
  solid: '#f2f2f7',
  padding: 12,
  shadow: 2,
  ratio: 'auto',
  tilt: 'none',
  tiltAngle: 25,
  capTitle: '',
  capSub: '',
  capPos: 'top',
  capColor: 'auto',
  capSize: 100,
}

const STORE_KEY = 'shotframe:opts:v1'

function loadOptions(): Options {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    /* storage unavailable */
  }
  return DEFAULTS
}

function loadImage(file: Blob): Promise<Source> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve({ el: img, w: img.naturalWidth, h: img.naturalHeight, url })
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('unreadable'))
    }
    img.src = url
  })
}

export default function App() {
  const [opts, setOpts] = useState<Options>(loadOptions)
  const [shots, setShots] = useState<Source[]>([])
  const [scaleChoice, setScaleChoice] = useState<ScaleChoice>('auto')
  const [toast, setToast] = useState('')
  const [dragging, setDragging] = useState(false)
  const [stage, setStage] = useState({ w: 0, h: 0 })
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const addRef = useRef<HTMLInputElement>(null)

  const portraitDemo = useMemo(() => makeDemo(true), [])
  const landscapeDemo = useMemo(() => makeDemo(false), [])
  const demoPortrait = (opts.frame === 'phone' || opts.frame === 'tablet') && !opts.landscape
  const srcs = useMemo(
    () => (shots.length ? shots : [demoPortrait ? portraitDemo : landscapeDemo]),
    [shots, demoPortrait, portraitDemo, landscapeDemo],
  )

  const set = <K extends keyof Options>(key: K, value: Options[K]) => setOpts((o) => ({ ...o, [key]: value }))

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(opts))
    } catch {
      /* storage unavailable */
    }
  }, [opts])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2200)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setStage({ w: entry.contentRect.width, h: entry.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const exportScale = useMemo(() => {
    if (scaleChoice === 'auto') return autoScale(srcs, opts)
    return Math.min(Number(scaleChoice), maxScale(srcs, opts))
  }, [scaleChoice, srcs, opts])

  const { cw, ch } = useMemo(() => layout(srcs, opts), [srcs, opts])
  const outW = Math.round(cw * exportScale)
  const outH = Math.round(ch * exportScale)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !stage.w || !stage.h) return
    const fit = Math.min((stage.w - 32) / cw, (stage.h - 32) / ch)
    const dpr = window.devicePixelRatio || 1
    render(canvas, srcs, opts, fit * dpr)
    canvas.style.width = `${cw * fit}px`
    canvas.style.height = `${ch * fit}px`
  }, [srcs, opts, stage, cw, ch])

  const addFiles = useCallback(
    async (files: (File | null | undefined)[], append: boolean) => {
      const images = files.filter((f): f is File => !!f && f.type.startsWith('image/'))
      if (!images.length) return setToast('请选择图片文件')
      const results = await Promise.allSettled(images.map(loadImage))
      const loaded = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
      if (!loaded.length) return setToast('图片读取不了，换成 PNG 或 JPG 试试')
      const base = append ? shots : []
      if (!append) shots.forEach((s) => s.url && URL.revokeObjectURL(s.url))
      const next = [...base, ...loaded]
      if (next.length > MAX_SHOTS) setToast(`最多 ${MAX_SHOTS} 张，多出的已忽略`)
      else if (loaded.length < images.length) setToast('有图片读取失败，已跳过')
      setShots(next.slice(0, MAX_SHOTS))
      if (!append) {
        const first = loaded[0]
        setOpts((o) => (o.frame === 'phone' || o.frame === 'tablet' ? { ...o, landscape: first.w > first.h } : o))
      }
    },
    [shots],
  )

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? []).filter((i) => i.type.startsWith('image/'))
      if (items.length) {
        e.preventDefault()
        addFiles(
          items.map((i) => i.getAsFile()),
          false,
        )
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [addFiles])

  const removeShot = (i: number) => {
    const s = shots[i]
    if (s.url) URL.revokeObjectURL(s.url)
    setShots(shots.filter((_, j) => j !== i))
  }

  const moveLeft = (i: number) => {
    const next = [...shots]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    setShots(next)
  }

  const exportCanvas = () => {
    const c = document.createElement('canvas')
    render(c, srcs, opts, exportScale)
    return c
  }

  const download = () => {
    exportCanvas().toBlob((blob) => {
      if (!blob) return setToast('导出失败，试试调低清晰度')
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `shotframe-${Date.now()}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    }, 'image/png')
  }

  const copy = async () => {
    try {
      const c = exportCanvas()
      const blob = new Promise<Blob>((resolve, reject) =>
        c.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/png'),
      )
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setToast('已复制到剪贴板')
    } catch {
      setToast('当前浏览器不支持复制图片，请用下载')
    }
  }

  const isWindow = opts.frame === 'browser' || opts.frame === 'mac'
  const isDevice = DEVICE_FRAMES.includes(opts.frame)

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo" />
          <div>
            <strong>截图套壳</strong>
            <span className="tagline">给截图加上手机、电脑边框和背景，图片只在本地处理</span>
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={16} /> 上传截图
          </button>
          <button className="btn" onClick={copy}>
            <Copy size={16} /> 复制
          </button>
          <button className="btn primary" onClick={download}>
            <Download size={16} /> 下载 PNG
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []), false)
              e.target.value = ''
            }}
          />
          <input
            ref={addRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(Array.from(e.target.files ?? []), true)
              e.target.value = ''
            }}
          />
        </div>
      </header>

      <main className="workspace">
        <section
          className={`stage${dragging ? ' dragging' : ''}`}
          ref={stageRef}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(Array.from(e.dataTransfer.files), false)
          }}
        >
          <canvas ref={canvasRef} className={opts.bgKind === 'transparent' ? 'checker' : ''} />
          {!shots.length && (
            <button className="hint" onClick={() => fileRef.current?.click()}>
              拖入图片、<kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>V</kbd> 粘贴，或点这里上传（可多选）
            </button>
          )}
          {dragging && <div className="drop">松开即可替换截图</div>}
        </section>

        <aside className="panel">
          <Group title={`截图 ${shots.length}/${MAX_SHOTS}`}>
            <div className="thumbs">
              {shots.map((s, i) => (
                <div className="thumb" key={s.url}>
                  <img src={s.url} alt={`截图 ${i + 1}`} />
                  <div className="thumb-actions">
                    {i > 0 && (
                      <button title="往前移" onClick={() => moveLeft(i)}>
                        <ChevronLeft size={14} />
                      </button>
                    )}
                    <button title="删除" onClick={() => removeShot(i)}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {shots.length < MAX_SHOTS && (
                <button className="thumb add" onClick={() => addRef.current?.click()}>
                  <Plus size={18} />
                  <span>添加</span>
                </button>
              )}
            </div>
            <p className="meta">多张截图会并排拼成一张图；拖入或粘贴会替换当前截图</p>
          </Group>

          <Group title="边框">
            <div className="frames">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  className={`frame${opts.frame === f.id ? ' on' : ''}`}
                  onClick={() => set('frame', f.id)}
                >
                  {f.icon}
                  <span>{f.name}</span>
                </button>
              ))}
            </div>

            {isWindow && (
              <>
                <Row label="主题">
                  <Segment
                    value={opts.theme}
                    items={[
                      ['light', '浅色'],
                      ['dark', '深色'],
                    ]}
                    onChange={(v) => set('theme', v)}
                  />
                </Row>
                {opts.frame === 'browser' ? (
                  <Row label="网址">
                    <input className="text" value={opts.url} onChange={(e) => set('url', e.target.value)} />
                  </Row>
                ) : (
                  <Row label="标题">
                    <input className="text" value={opts.title} onChange={(e) => set('title', e.target.value)} />
                  </Row>
                )}
              </>
            )}

            {isDevice && (
              <>
                <Row label="颜色">
                  <div className="swatches">
                    {(Object.keys(DEVICE_COLORS) as ColorKey[]).map((k) => (
                      <button
                        key={k}
                        title={DEVICE_COLORS[k].name}
                        className={`swatch${opts.color === k ? ' on' : ''}`}
                        style={{ background: `linear-gradient(135deg, ${DEVICE_COLORS[k].light}, ${DEVICE_COLORS[k].dark})` }}
                        onClick={() => set('color', k)}
                      />
                    ))}
                  </div>
                </Row>
                {(opts.frame === 'phone' || opts.frame === 'tablet') && (
                  <Row label="方向">
                    <Segment
                      value={opts.landscape ? 'l' : 'p'}
                      items={[
                        ['p', '竖屏'],
                        ['l', '横屏'],
                      ]}
                      onChange={(v) => set('landscape', v === 'l')}
                    />
                  </Row>
                )}
                {opts.frame === 'phone' && (
                  <Row label="灵动岛">
                    <Segment
                      value={opts.island ? 'y' : 'n'}
                      items={[
                        ['y', '显示'],
                        ['n', '隐藏'],
                      ]}
                      onChange={(v) => set('island', v === 'y')}
                    />
                  </Row>
                )}
                <Row label="填充">
                  <Segment
                    value={opts.fit}
                    items={[
                      ['cover', '铺满屏幕'],
                      ['contain', '完整显示'],
                    ]}
                    onChange={(v) => set('fit', v)}
                  />
                </Row>
              </>
            )}

            {opts.frame === 'none' && (
              <Row label={`圆角 ${opts.radius}`}>
                <input type="range" min={0} max={40} value={opts.radius} onChange={(e) => set('radius', +e.target.value)} />
              </Row>
            )}
          </Group>

          <Group title="3D 倾斜">
            <Segment value={opts.tilt} items={TILTS} onChange={(v) => set('tilt', v)} />
            {(opts.tilt === 'left' || opts.tilt === 'right' || opts.tilt === 'back') && (
              <Row label={`角度 ${opts.tiltAngle}°`}>
                <input
                  type="range"
                  min={10}
                  max={40}
                  value={opts.tiltAngle}
                  onChange={(e) => set('tiltAngle', +e.target.value)}
                />
              </Row>
            )}
          </Group>

          <Group title="标题文字">
            <textarea
              className="text area"
              rows={2}
              placeholder="主标题，回车换行（留空则不显示）"
              value={opts.capTitle}
              onChange={(e) => set('capTitle', e.target.value)}
            />
            <input
              className="text"
              placeholder="副标题（可选）"
              value={opts.capSub}
              onChange={(e) => set('capSub', e.target.value)}
            />
            {(opts.capTitle.trim() || opts.capSub.trim()) && (
              <>
                <Row label="位置">
                  <Segment
                    value={opts.capPos}
                    items={[
                      ['top', '截图上方'],
                      ['bottom', '截图下方'],
                    ]}
                    onChange={(v) => set('capPos', v)}
                  />
                </Row>
                <Row label={`字号 ${opts.capSize}%`}>
                  <input
                    type="range"
                    min={60}
                    max={160}
                    step={5}
                    value={opts.capSize}
                    onChange={(e) => set('capSize', +e.target.value)}
                  />
                </Row>
                <Row label="颜色">
                  <div className="custom">
                    {[
                      ['auto', '自动'],
                      ['#ffffff', '白'],
                      ['#111111', '黑'],
                    ].map(([v, name]) => (
                      <button key={v} className={`chip${opts.capColor === v ? ' on' : ''}`} onClick={() => set('capColor', v)}>
                        {name}
                      </button>
                    ))}
                    <input
                      type="color"
                      value={opts.capColor === 'auto' ? '#111111' : opts.capColor}
                      onChange={(e) => set('capColor', e.target.value)}
                    />
                  </div>
                </Row>
              </>
            )}
          </Group>

          <Group title="背景">
            <div className="swatches wrap">
              {GRADIENTS.map((g) => {
                const on = opts.bgKind === 'gradient' && opts.gradient[0] === g.colors[0] && opts.gradient[1] === g.colors[1]
                return (
                  <button
                    key={g.name}
                    title={g.name}
                    className={`swatch${on ? ' on' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})` }}
                    onClick={() => setOpts((o) => ({ ...o, bgKind: 'gradient', gradient: g.colors }))}
                  />
                )
              })}
              {SOLIDS.map((c) => (
                <button
                  key={c}
                  title="纯色"
                  className={`swatch${opts.bgKind === 'solid' && opts.solid === c ? ' on' : ''}`}
                  style={{ background: c }}
                  onClick={() => setOpts((o) => ({ ...o, bgKind: 'solid', solid: c }))}
                />
              ))}
              <button
                title="模糊原图"
                className={`swatch blurswatch${opts.bgKind === 'blur' ? ' on' : ''}`}
                onClick={() => set('bgKind', 'blur')}
              />
              <button
                title="透明"
                className={`swatch checker${opts.bgKind === 'transparent' ? ' on' : ''}`}
                onClick={() => set('bgKind', 'transparent')}
              />
            </div>
            <Row label="自定义">
              <div className="custom">
                <input
                  type="color"
                  value={opts.gradient[0]}
                  onChange={(e) => setOpts((o) => ({ ...o, bgKind: 'gradient', gradient: [e.target.value, o.gradient[1]] }))}
                />
                <input
                  type="color"
                  value={opts.gradient[1]}
                  onChange={(e) => setOpts((o) => ({ ...o, bgKind: 'gradient', gradient: [o.gradient[0], e.target.value] }))}
                />
                <span className="sep">纯色</span>
                <input
                  type="color"
                  value={opts.solid}
                  onChange={(e) => setOpts((o) => ({ ...o, bgKind: 'solid', solid: e.target.value }))}
                />
              </div>
            </Row>
            {opts.bgKind === 'gradient' && (
              <Row label={`角度 ${opts.angle}°`}>
                <input type="range" min={0} max={360} step={5} value={opts.angle} onChange={(e) => set('angle', +e.target.value)} />
              </Row>
            )}
          </Group>

          <Group title="布局">
            <Row label="比例">
              <div className="chips">
                {RATIOS.map((r) => (
                  <button key={r.id} className={`chip${opts.ratio === r.id ? ' on' : ''}`} onClick={() => set('ratio', r.id)}>
                    {r.name}
                  </button>
                ))}
              </div>
            </Row>
            <Row label={`留白 ${opts.padding}%`}>
              <input type="range" min={0} max={30} value={opts.padding} onChange={(e) => set('padding', +e.target.value)} />
            </Row>
            <Row label="阴影">
              <Segment
                value={String(opts.shadow)}
                items={SHADOWS.map((s, i) => [String(i), s] as [string, string])}
                onChange={(v) => set('shadow', Number(v))}
              />
            </Row>
          </Group>

          <Group title="导出">
            <Row label="清晰度">
              <div className="chips">
                {SCALES.map((s) => (
                  <button key={s} className={`chip${scaleChoice === s ? ' on' : ''}`} onClick={() => setScaleChoice(s)}>
                    {s === 'auto' ? '跟随原图' : `${s}x`}
                  </button>
                ))}
              </div>
            </Row>
            <p className="meta">
              输出 {outW} × {outH} px{shots.length ? '' : '（当前是示例图）'}
            </p>
            <button className="reset" onClick={() => setOpts(DEFAULTS)}>
              恢复默认设置
            </button>
          </Group>
        </aside>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="group">
      <h3>{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="row">
      <span className="label">{label}</span>
      <div className="control">{children}</div>
    </div>
  )
}

function Segment<T extends string>({
  value,
  items,
  onChange,
}: {
  value: T
  items: [T, string][]
  onChange: (v: T) => void
}) {
  return (
    <div className="segment">
      {items.map(([v, label]) => (
        <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  )
}
