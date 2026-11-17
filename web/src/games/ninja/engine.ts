import { createSvgElement } from '../../components/characters/mountSvg'
import { submitScore } from '../../lib/leaderboard'
import {
  hapticError,
  hapticHeavy,
  hapticMedium,
  hapticRigid,
  hapticSoft,
  hapticSuccess,
} from '../../lib/telegram'

export const W = 440
export const H = 700

/** Vacuum sprites for Ninja targets */
export const NINJA_HEAD_SRCS = [
  '/characters/vacuum-canister.webp',
  '/characters/vacuum-stick.webp',
  '/characters/vacuum-robot.webp',
] as const

/** Distinct gold turbo vacuum (multi-slice bonus) */
export const NINJA_FRENZY_SRC = '/characters/vacuum-turbo.webp'

export type GameState = 'ready' | 'playing' | 'over'

type ObjType = 'head' | 'bonus' | 'bomb' | 'frenzy'

type Flying = {
  id: number
  type: ObjType
  imageIndex: number
  x: number
  y: number
  vx: number
  vy: number
  r: number
  size: number
  rot: number
  vr: number
  hit: boolean
  /** Freeze & multi-slice bonus target */
  frenzyActive?: boolean
  frenzyTime?: number
  frenzyHits?: number
  lastFrenzyHit?: number
}

type Half = {
  id: number
  x: number
  y: number
  size: number
  imageIndex: number
  rot: number
  angle: number
  side: -1 | 1
  vx: number
  vy: number
  vr: number
  life: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  color: string
}

type TrailPoint = { x: number; y: number; life: number }

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export type HudSnapshot = {
  score: number
  missed: number
  best: number
  state: GameState
  title: string
  desc: string
  frenzyLabel?: string
}

type SpriteNode = {
  root: HTMLDivElement
  kind: 'full' | 'half'
}

export class NinjaEngine {
  score = 0
  missed = 0
  best = Number(localStorage.getItem('babloohNinjaBest') || 0)
  state: GameState = 'ready'
  title = 'Готов резать?'
  desc =
    'Проводи пальцем по пылесосам — обычный, вертикальный и робот. Золотой турбо-пылесос можно рубить много раз подряд. Не пропусти три штуки и не задень бомбу!'

  private objects: Flying[] = []
  private halves: Half[] = []
  private particles: Particle[] = []
  private trail: TrailPoint[] = []
  private last = 0
  private spawnClock = 0
  private pointerDown = false
  private prevPointer: { x: number; y: number } | null = null
  private shake = 0
  private slowBoost = 0
  private raf = 0
  private nextId = 1
  private canvas: HTMLCanvasElement
  private layer: HTMLElement
  private sprites = new Map<number, SpriteNode>()
  private onHud: (h: HudSnapshot) => void
  private activeFrenzyLabel = ''

  constructor(
    canvas: HTMLCanvasElement,
    layer: HTMLElement,
    onHud: (h: HudSnapshot) => void,
  ) {
    this.canvas = canvas
    this.layer = layer
    this.onHud = onHud
    this.emitHud()
    this.drawCanvas()
  }

  private emitHud() {
    this.onHud({
      score: this.score,
      missed: this.missed,
      best: this.best,
      state: this.state,
      title: this.title,
      desc: this.desc,
      frenzyLabel: this.activeFrenzyLabel || undefined,
    })
  }

  start() {
    hapticSoft()
    this.clearSprites()
    this.score = 0
    this.missed = 0
    this.objects = []
    this.halves = []
    this.particles = []
    this.trail = []
    this.spawnClock = 0
    this.shake = 0
    this.slowBoost = 0
    this.activeFrenzyLabel = ''
    this.state = 'playing'
    this.emitHud()
    this.spawn()
    this.last = performance.now()
    cancelAnimationFrame(this.raf)
    this.raf = requestAnimationFrame((t) => this.loop(t))
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    this.clearSprites()
    this.state = 'ready'
  }

  private clearSprites() {
    for (const node of this.sprites.values()) node.root.remove()
    this.sprites.clear()
    this.layer.replaceChildren()
  }

  private finish(reason: string) {
    if (this.state !== 'playing') return
    if (reason.includes('бомб')) hapticHeavy()
    else hapticError()
    void submitScore('ninja', this.score)
    this.state = 'over'
    if (this.score > this.best) {
      this.best = this.score
      localStorage.setItem('babloohNinjaBest', String(this.best))
    }
    this.title = reason || 'Игра окончена!'
    this.desc = `Твой результат: ${this.score}. Рекорд: ${this.best}. Попробуешь ещё раз?`
    this.emitHud()
  }

  private spawn() {
    const roll = Math.random()
    const bomb = roll < 0.15
    const frenzy = !bomb && roll < 0.24
    const bonus = !bomb && !frenzy && Math.random() < 0.14
    const type: ObjType = bomb ? 'bomb' : frenzy ? 'frenzy' : bonus ? 'bonus' : 'head'
    const size = bomb ? rand(52, 64) : frenzy ? rand(150, 168) : rand(118, 148)
    const high = Math.random() < 0.45
    const vy = high ? rand(-18.5, -14.2) : rand(-14.8, -11.2)
    const x = rand(90, W - 90)
    const towardCenter = x < W / 2 ? rand(0.2, 2.0) : rand(-2.0, -0.2)
    const vx = towardCenter + rand(-0.6, 0.6)
    const obj: Flying = {
      id: this.nextId++,
      type,
      imageIndex: Math.floor(Math.random() * NINJA_HEAD_SRCS.length),
      x,
      y: H + size,
      vx,
      vy,
      r: size * (frenzy ? 0.48 : 0.42),
      size,
      rot: rand(-0.45, 0.45),
      vr: rand(-0.05, 0.05),
      hit: false,
      frenzyHits: 0,
      frenzyTime: 0,
      lastFrenzyHit: 0,
    }
    this.objects.push(obj)
    this.mountFull(obj)
    if (type === 'frenzy') this.clearNonFrenzyObjects()
  }

  private createHeadImg(imageIndex: number, src?: string) {
    const img = document.createElement('img')
    img.src = src || NINJA_HEAD_SRCS[imageIndex % NINJA_HEAD_SRCS.length]!
    img.alt = ''
    img.draggable = false
    img.className = 'ninja-head-img'
    return img
  }

  private hasFrenzyOnField() {
    return this.objects.some((o) => o.type === 'frenzy' && !o.hit)
  }

  /** Clear bombs/other targets so turbo mode is safe */
  private clearNonFrenzyObjects() {
    const keep: Flying[] = []
    for (const o of this.objects) {
      if (o.type === 'frenzy' && !o.hit) {
        keep.push(o)
        continue
      }
      this.removeSprite(o.id)
    }
    this.objects = keep
  }

  private mountFull(o: Flying) {
    const root = document.createElement('div')
    root.className = 'ninja-sprite'
    root.dataset.id = String(o.id)
    if (o.type === 'bomb') {
      root.appendChild(createSvgElement('bomb'))
    } else if (o.type === 'frenzy') {
      root.appendChild(this.createHeadImg(o.imageIndex, NINJA_FRENZY_SRC))
    } else {
      root.appendChild(this.createHeadImg(o.imageIndex))
    }
    if (o.type === 'bonus') {
      const ring = document.createElement('div')
      ring.className = 'ninja-bonus-ring'
      ring.textContent = '+3'
      root.appendChild(ring)
    }
    if (o.type === 'frenzy') {
      const ring = document.createElement('div')
      ring.className = 'ninja-frenzy-ring'
      ring.dataset.role = 'frenzy-ring'
      ring.textContent = 'ТУРБО'
      root.appendChild(ring)
      root.classList.add('ninja-sprite--frenzy')
    }
    this.layer.appendChild(root)
    this.sprites.set(o.id, { root, kind: 'full' })
    this.placeFull(o)
  }

  private updateFrenzyRing(o: Flying) {
    const node = this.sprites.get(o.id)
    if (!node) return
    const ring = node.root.querySelector('[data-role="frenzy-ring"]')
    if (!ring) return
    const hits = o.frenzyHits || 0
    ring.textContent = hits > 0 ? `×${hits}` : 'ТУРБО'
  }

  private endFrenzy(o: Flying) {
    o.hit = true
    this.activeFrenzyLabel = ''
    this.burst(o.x, o.y, '#ffe36b', 28)
    this.burst(o.x, o.y, '#ff8bcf', 14)
    this.shake = Math.max(this.shake, 8)
    this.removeSprite(o.id)
    this.emitHud()
  }

  private mountHalf(h: Half) {
    const root = document.createElement('div')
    root.className = 'ninja-sprite ninja-half'
    root.dataset.id = String(h.id)
    root.style.clipPath = h.side < 0 ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)'
    root.appendChild(this.createHeadImg(h.imageIndex))
    this.layer.appendChild(root)
    this.sprites.set(h.id, { root, kind: 'half' })
    this.placeHalf(h)
  }

  private placeFull(o: Flying) {
    const node = this.sprites.get(o.id)
    if (!node) return
    const s = o.type === 'bomb' ? o.size * 1.35 : o.size
    node.root.style.left = `${((o.x - s / 2) / W) * 100}%`
    node.root.style.top = `${((o.y - s / 2) / H) * 100}%`
    node.root.style.width = `${(s / W) * 100}%`
    node.root.style.height = `${(s / H) * 100}%`
    node.root.style.transform = `rotate(${o.rot}rad)`
  }

  private placeHalf(h: Half) {
    const node = this.sprites.get(h.id)
    if (!node) return
    const s = h.size
    node.root.style.left = `${((h.x - s / 2) / W) * 100}%`
    node.root.style.top = `${((h.y - s / 2) / H) * 100}%`
    node.root.style.width = `${(s / W) * 100}%`
    node.root.style.height = `${(s / H) * 100}%`
    node.root.style.opacity = String(Math.min(1, h.life / 18))
    node.root.style.transform = `rotate(${h.rot}rad)`
  }

  private removeSprite(id: number) {
    const node = this.sprites.get(id)
    if (!node) return
    node.root.remove()
    this.sprites.delete(id)
  }

  private burst(x: number, y: number, color: string, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2)
      const s = rand(1.5, 5)
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(18, 34),
        max: 34,
        size: rand(2, 5),
        color,
      })
    }
  }

  private splitHead(o: Flying, dx: number, dy: number) {
    o.hit = true
    this.score += o.type === 'bonus' ? 3 : 1
    if (o.type === 'bonus') {
      this.slowBoost = 180
      hapticSuccess()
    } else hapticMedium()
    this.emitHud()
    this.burst(o.x, o.y, o.type === 'bonus' ? '#ffe36b' : '#ff8bcf', 17)
    this.burst(o.x, o.y, '#fff0a8', 8)
    const angle = Math.atan2(dy, dx)
    this.removeSprite(o.id)
    const left: Half = {
      id: this.nextId++,
      x: o.x,
      y: o.y,
      size: o.size,
      imageIndex: o.imageIndex,
      rot: o.rot,
      angle,
      side: -1,
      vx: o.vx - 2.2,
      vy: o.vy - 1.1,
      vr: -0.095,
      life: 52,
    }
    const right: Half = {
      id: this.nextId++,
      x: o.x,
      y: o.y,
      size: o.size,
      imageIndex: o.imageIndex,
      rot: o.rot,
      angle,
      side: 1,
      vx: o.vx + 2.2,
      vy: o.vy - 1.1,
      vr: 0.095,
      life: 52,
    }
    this.halves.push(left, right)
    this.mountHalf(left)
    this.mountHalf(right)
  }

  private pointSegmentDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    const dx = x2 - x1
    const dy = y2 - y1
    const l = dx * dx + dy * dy
    if (!l) return Math.hypot(px - x1, py - y1)
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l))
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
  }

  private slice(x1: number, y1: number, x2: number, y2: number) {
    if (Math.hypot(x2 - x1, y2 - y1) < 5) return
    const now = performance.now()
    for (const o of this.objects) {
      if (o.hit) continue
      if (this.pointSegmentDistance(o.x, o.y, x1, y1, x2, y2) < o.r + 9) {
        if (o.type === 'bomb') {
          o.hit = true
          this.burst(o.x, o.y, '#ffb347', 30)
          this.shake = 18
          this.removeSprite(o.id)
          this.finish('БА-БАХ! Ты задел бомбу 💣')
          return
        }
        if (o.type === 'frenzy') {
          this.hitFrenzy(o, now)
          continue
        }
        this.splitHead(o, x2 - x1, y2 - y1)
      }
    }
  }

  private hitFrenzy(o: Flying, now: number) {
    if (!o.frenzyActive) {
      o.frenzyActive = true
      o.frenzyTime = 170
      o.vx = 0
      o.vy = 0
      o.vr = 0.035
      o.x = Math.max(o.size / 2 + 8, Math.min(W - o.size / 2 - 8, o.x))
      o.y = Math.max(o.size / 2 + 40, Math.min(H * 0.55, o.y))
      this.clearNonFrenzyObjects()
      const node = this.sprites.get(o.id)
      node?.root.classList.add('ninja-sprite--frenzy-active')
      this.activeFrenzyLabel = 'ТУРБО! Руби!'
      this.shake = Math.max(this.shake, 6)
      hapticSuccess()
    }
    if (now - (o.lastFrenzyHit || 0) < 95) return
    o.lastFrenzyHit = now
    o.frenzyHits = (o.frenzyHits || 0) + 1
    this.score += 1
    hapticRigid()
    this.burst(o.x, o.y, '#ffe36b', 10)
    this.burst(o.x + rand(-12, 12), o.y + rand(-12, 12), '#fff0a8', 6)
    this.updateFrenzyRing(o)
    this.activeFrenzyLabel = `ТУРБО ×${o.frenzyHits}`
    this.emitHud()
  }

  private coords(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect()
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    }
  }

  onPointerDown = (e: PointerEvent) => {
    e.preventDefault()
    if (this.state !== 'playing') return
    this.pointerDown = true
    this.prevPointer = this.coords(e)
    this.trail.push({ ...this.prevPointer, life: 12 })
    try {
      this.canvas.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }

  onPointerMove = (e: PointerEvent) => {
    if (!this.pointerDown || this.state !== 'playing') return
    e.preventDefault()
    const p = this.coords(e)
    if (this.prevPointer) this.slice(this.prevPointer.x, this.prevPointer.y, p.x, p.y)
    this.trail.push({ ...p, life: 12 })
    this.prevPointer = p
  }

  onPointerUp = () => {
    this.pointerDown = false
    this.prevPointer = null
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    const palettes = [
      ['#44204e', '#2b1738', '#1e142d'],
      ['#7a3568', '#48234f', '#251b3e'],
      ['#254c70', '#24345c', '#17203d'],
      ['#101d3c', '#11152f', '#080d20'],
    ]
    const phase = Math.min(this.score / 12, palettes.length - 1)
    const idx = Math.min(Math.floor(phase), palettes.length - 2)
    const t = phase - idx
    const mix = (a: string, b: string, tt: number) => {
      const A = parseInt(a.slice(1), 16)
      const B = parseInt(b.slice(1), 16)
      const r = Math.round(((A >> 16) & 255) + ((((B >> 16) & 255) - ((A >> 16) & 255)) * tt))
      const g = Math.round(((A >> 8) & 255) + ((((B >> 8) & 255) - ((A >> 8) & 255)) * tt))
      const bb = Math.round((A & 255) + (((B & 255) - (A & 255)) * tt))
      return `rgb(${r},${g},${bb})`
    }
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, mix(palettes[idx][0], palettes[idx + 1][0], t))
    bg.addColorStop(0.55, mix(palettes[idx][1], palettes[idx + 1][1], t))
    bg.addColorStop(1, mix(palettes[idx][2], palettes[idx + 1][2], t))
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    for (let i = 0; i < 32; i++) {
      const x = (i * 137 + 29) % W
      const y = (i * 191 + 17) % H
      ctx.fillStyle = '#ffffff35'
      ctx.beginPath()
      ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#ff8bd422'
    ctx.fillRect(0, H - 8, W, 8)
  }

  private drawCanvas() {
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return
    ctx.save()
    let shakeX = 0
    let shakeY = 0
    if (this.shake > 0) {
      shakeX = rand(-this.shake, this.shake)
      shakeY = rand(-this.shake, this.shake)
      ctx.translate(shakeX, shakeY)
      this.shake *= 0.82
    }
    this.layer.style.transform =
      this.shake > 0.5 ? `translate(${shakeX}px, ${shakeY}px)` : 'translate(0, 0)'

    this.drawBackground(ctx)
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max)
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    if (this.trail.length > 1) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (let i = 1; i < this.trail.length; i++) {
        ctx.strokeStyle = `rgba(255,245,255,${(i / this.trail.length) * 0.9})`
        ctx.lineWidth = 2 + (i / this.trail.length) * 8
        ctx.beginPath()
        ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y)
        ctx.lineTo(this.trail[i].x, this.trail[i].y)
        ctx.stroke()
      }
    }
    ctx.restore()
  }

  private syncVectors() {
    for (const o of this.objects) {
      if (!o.hit) this.placeFull(o)
    }
    for (const h of this.halves) this.placeHalf(h)
  }

  private loop(t: number) {
    if (this.state !== 'playing') return
    let dt = Math.min((t - this.last) / 16.67, 2)
    this.last = t
    if (this.slowBoost > 0) {
      this.slowBoost = Math.max(0, this.slowBoost - dt)
      dt *= 0.55
    }
    this.spawnClock += dt
    if (
      !this.hasFrenzyOnField() &&
      this.spawnClock > Math.max(27, 58 - this.score * 0.32)
    ) {
      this.spawn()
      if (Math.random() < Math.min(0.34, 0.08 + this.score * 0.006)) this.spawn()
      this.spawnClock = 0
    } else if (this.hasFrenzyOnField()) {
      this.spawnClock = 0
    }
    for (const o of this.objects) {
      if (o.type === 'frenzy' && o.frenzyActive) {
        o.frenzyTime = Math.max(0, (o.frenzyTime || 0) - dt)
        o.rot += o.vr * dt
        if ((o.frenzyTime || 0) <= 0) this.endFrenzy(o)
        continue
      }
      o.x += o.vx * dt
      o.y += o.vy * dt
      o.vy += 0.27 * dt
      o.rot += o.vr * dt
    }
    this.objects = this.objects.filter((o) => {
      if (o.hit) return false
      if (o.y > H + o.size) {
        this.removeSprite(o.id)
        if (o.type === 'head' || o.type === 'bonus') {
          this.missed++
          this.emitHud()
          if (this.missed >= 3) this.finish('Три цели пропущены!')
        }
        return false
      }
      return true
    })
    for (const h of this.halves) {
      h.x += h.vx * dt
      h.y += h.vy * dt
      h.vy += 0.28 * dt
      h.rot += h.vr * dt
      h.life -= dt
    }
    this.halves = this.halves.filter((h) => {
      if (h.life > 0) return true
      this.removeSprite(h.id)
      return false
    })
    for (const p of this.particles) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.12 * dt
      p.life -= dt
    }
    this.particles = this.particles.filter((p) => p.life > 0)
    for (const p of this.trail) p.life -= dt
    this.trail = this.trail.filter((p) => p.life > 0)
    if (this.shake < 0.5) this.shake = 0
    this.syncVectors()
    this.drawCanvas()
    if (this.state === 'playing') this.raf = requestAnimationFrame((nt) => this.loop(nt))
  }
}
