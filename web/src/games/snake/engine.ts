import { submitScore } from '../../lib/leaderboard'
import { hapticError, hapticMedium, hapticSoft } from '../../lib/telegram'

export const W = 420
export const H = 420
export const COLS = 14
export const ROWS = 14
export const CELL = W / COLS

export type DirName = 'up' | 'down' | 'left' | 'right'

export type HudSnapshot = {
  score: number
  best: number
  state: 'ready' | 'playing' | 'over'
  title: string
  desc: string
}

type Pt = { x: number; y: number }
type Dir = { x: number; y: number; name: DirName }

const DIRS: Record<DirName, Dir> = {
  up: { x: 0, y: -1, name: 'up' },
  down: { x: 0, y: 1, name: 'down' },
  left: { x: -1, y: 0, name: 'left' },
  right: { x: 1, y: 0, name: 'right' },
}

const OPP: Record<DirName, DirName> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function cellCenter(cx: number, cy: number): Pt {
  return { x: (cx + 0.5) * CELL, y: (cy + 0.5) * CELL }
}

export class SnakeEngine {
  private ctx: CanvasRenderingContext2D
  private onHud: (h: HudSnapshot) => void
  private headImg = new Image()
  private foodImg = new Image()
  private raf = 0
  private last = 0
  private alive = true

  private state: HudSnapshot['state'] = 'ready'
  private score = 0
  private best = Number(localStorage.getItem('babloohSnakeBest') || 0)
  private dir: Dir = DIRS.right
  private queued: DirName | null = null
  private head: Pt = { x: 0, y: 0 }
  private path: Pt[] = []
  private segCount = 3
  private food: Pt | null = null
  private speed = 5.2
  private time = 0
  private turnLock = false

  constructor(canvas: HTMLCanvasElement, onHud: (h: HudSnapshot) => void) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2d context unavailable')
    this.ctx = ctx
    this.onHud = onHud
    this.headImg.src = '/games/milan-snake.webp'
    this.foodImg.src = '/games/sandwich.svg'
    this.foodImg.onload = () => this.render(this.time)
    this.resetBoard()
    this.pushHud()
    this.render(0)
    this.raf = requestAnimationFrame(this.frame)
  }

  start = () => {
    if (this.state === 'playing') return
    hapticSoft()
    this.resetBoard()
    this.state = 'playing'
    this.last = performance.now()
    this.pushHud()
  }

  queueDir = (name: DirName) => {
    if (this.state === 'ready') {
      this.start()
    }
    if (this.state !== 'playing') return
    if (OPP[this.dir.name] === name) return
    if (this.queued && OPP[this.queued] === name) return
    this.queued = name
  }

  destroy = () => {
    this.alive = false
    cancelAnimationFrame(this.raf)
  }

  private resetBoard() {
    this.score = 0
    this.speed = 5.2
    this.segCount = 3
    this.dir = DIRS.right
    this.queued = null
    this.turnLock = false
    this.time = 0
    const cx = Math.floor(COLS / 2)
    const cy = Math.floor(ROWS / 2)
    this.head = cellCenter(cx, cy)
    this.path = []
    for (let i = 0; i < 40; i++) {
      this.path.push({ x: this.head.x - i * 2, y: this.head.y })
    }
    this.placeFood()
  }

  private pushHud(over = false) {
    this.onHud({
      score: this.score,
      best: this.best,
      state: this.state,
      title: over ? 'Игра окончена!' : 'Готов?',
      desc: over
        ? `Твой результат: ${this.score}. Попробуешь вырасти ещё длиннее?`
        : 'Веди Баблуха плавно по полю, ешь бутерброды с огурчиком и становись длиннее. Не врезайся в стены и в себя!',
    })
  }

  private placeFood() {
    const body = this.sampleBody()
    let guard = 0
    while (guard++ < 200) {
      const x = Math.floor(Math.random() * COLS)
      const y = Math.floor(Math.random() * ROWS)
      const c = cellCenter(x, y)
      const hitBody = body.some((b) => dist(b, c) < CELL * 0.7)
      if (!hitBody) {
        this.food = c
        return
      }
    }
    this.food = cellCenter(1, 1)
  }

  private pointAlong(distance: number): Pt {
    if (!this.path.length) return { ...this.head }
    let left = distance
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i]
      const b = this.path[i + 1]
      const d = dist(a, b)
      if (d < 1e-6) continue
      if (d >= left) {
        const t = left / d
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
      }
      left -= d
    }
    return { ...this.path[this.path.length - 1] }
  }

  private sampleBody(): Pt[] {
    const pts: Pt[] = []
    const spacing = CELL * 0.9
    for (let i = 0; i < this.segCount; i++) {
      pts.push(this.pointAlong(i * spacing))
    }
    return pts
  }

  private tryTurn() {
    if (!this.queued || this.turnLock) return
    const gx = Math.round(this.head.x / CELL - 0.5)
    const gy = Math.round(this.head.y / CELL - 0.5)
    const center = cellCenter(gx, gy)
    if (dist(this.head, center) > CELL * 0.18) return
    const next = DIRS[this.queued]
    if (OPP[this.dir.name] === next.name) {
      this.queued = null
      return
    }
    this.head = { ...center }
    this.dir = next
    this.queued = null
    this.turnLock = true
  }

  private end() {
    if (this.state !== 'playing') return
    this.state = 'over'
    hapticError()
    void submitScore('snake', this.score)
    this.best = Math.max(this.best, this.score)
    localStorage.setItem('babloohSnakeBest', String(this.best))
    this.pushHud(true)
  }

  private frame = (t: number) => {
    if (!this.alive) return
    const dt = Math.min((t - (this.last || t)) / 1000, 0.04)
    this.last = t
    if (this.state === 'playing') this.update(dt)
    this.time += dt
    this.render(this.time)
    this.raf = requestAnimationFrame(this.frame)
  }

  private update(dt: number) {
    this.tryTurn()
    const step = this.speed * CELL * dt
    this.head.x += this.dir.x * step
    this.head.y += this.dir.y * step

    // unlock turn after leaving cell center
    const gx = Math.round(this.head.x / CELL - 0.5)
    const gy = Math.round(this.head.y / CELL - 0.5)
    if (dist(this.head, cellCenter(gx, gy)) > CELL * 0.28) this.turnLock = false

    this.path.unshift({ ...this.head })
    const maxPath = this.segCount * CELL + CELL * 4
    let len = 0
    let cut = this.path.length
    for (let i = 1; i < this.path.length; i++) {
      len += dist(this.path[i - 1], this.path[i])
      if (len > maxPath) {
        cut = i + 1
        break
      }
    }
    if (cut < this.path.length) this.path.length = cut

    // walls
    const pad = CELL * 0.28
    if (
      this.head.x < pad ||
      this.head.y < pad ||
      this.head.x > W - pad ||
      this.head.y > H - pad
    ) {
      this.end()
      return
    }

    const body = this.sampleBody()
    for (let i = 3; i < body.length; i++) {
      if (dist(this.head, body[i]) < CELL * 0.36) {
        this.end()
        return
      }
    }

    if (this.food && dist(this.head, this.food) < CELL * 0.42) {
      this.score += 1
      this.segCount += 1
      this.speed = Math.min(9.2, 5.2 + this.score * 0.12)
      hapticMedium()
      this.placeFood()
      this.pushHud()
    }
  }

  private render(time: number) {
    const ctx = this.ctx
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#3a1d45')
    g.addColorStop(1, '#1a0f22')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = '#ffffff0c'
    ctx.lineWidth = 1
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL, 0)
      ctx.lineTo(i * CELL, H)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL)
      ctx.lineTo(W, i * CELL)
      ctx.stroke()
    }

    if (this.food) {
      const pulse = 1 + Math.sin(time * 5) * 0.08
      const fx = this.food.x
      const fy = this.food.y
      const glow = ctx.createRadialGradient(fx, fy, 2, fx, fy, CELL * 0.9)
      glow.addColorStop(0, '#ffe08a55')
      glow.addColorStop(1, '#ffe08a00')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(fx, fy, CELL * 0.9 * pulse, 0, Math.PI * 2)
      ctx.fill()

      ctx.save()
      ctx.translate(fx, fy)
      ctx.scale(pulse, pulse)
      const size = CELL * 1.05
      if (this.foodImg.complete && this.foodImg.naturalWidth) {
        ctx.drawImage(this.foodImg, -size / 2, -size / 2, size, size)
      } else {
        ctx.fillStyle = '#6FBF3F'
        ctx.beginPath()
        ctx.ellipse(0, 2, size * 0.28, size * 0.14, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#F0B15F'
        ctx.beginPath()
        ctx.ellipse(0, -4, size * 0.32, size * 0.2, 0, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    const body = this.sampleBody()
    // soft ribbon under segments
    if (body.length > 1) {
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#ff54c855'
      ctx.lineWidth = CELL * 0.72
      ctx.beginPath()
      ctx.moveTo(body[0].x, body[0].y)
      for (let i = 1; i < body.length; i++) ctx.lineTo(body[i].x, body[i].y)
      ctx.stroke()
    }

    for (let i = body.length - 1; i >= 1; i--) {
      const t = i / (body.length || 1)
      const r = 255 - Math.floor(t * 70)
      const gch = 84 + Math.floor(t * 40)
      const b = 200 - Math.floor(t * 50)
      const rad = CELL * (0.38 - t * 0.06)
      ctx.beginPath()
      ctx.arc(body[i].x, body[i].y, rad, 0, Math.PI * 2)
      ctx.fillStyle = `rgb(${r},${gch},${b})`
      ctx.fill()
      ctx.strokeStyle = '#ffffff28'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    if (body[0]) {
      const rad = CELL * 0.5
      ctx.beginPath()
      ctx.arc(body[0].x, body[0].y, rad, 0, Math.PI * 2)
      ctx.fillStyle = '#1a0f20'
      ctx.fill()
      if (this.headImg.complete && this.headImg.naturalWidth) {
        ctx.save()
        ctx.translate(body[0].x, body[0].y)
        ctx.beginPath()
        ctx.arc(0, 0, rad * 0.96, 0, Math.PI * 2)
        ctx.clip()
        const s = rad * 2.15
        ctx.drawImage(this.headImg, -s / 2, -s / 2, s, s)
        ctx.restore()
        ctx.beginPath()
        ctx.arc(body[0].x, body[0].y, rad * 0.96, 0, Math.PI * 2)
        ctx.strokeStyle = '#ff54c8aa'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  }
}
