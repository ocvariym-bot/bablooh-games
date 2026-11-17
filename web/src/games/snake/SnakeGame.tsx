import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  H,
  SnakeEngine,
  W,
  type DirName,
  type HudSnapshot,
} from './engine'
import './snake.css'

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<SnakeEngine | null>(null)
  const swipeRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  })
  const [hud, setHud] = useState<HudSnapshot>({
    score: 0,
    best: Number(localStorage.getItem('babloohSnakeBest') || 0),
    state: 'ready',
    title: 'Готов?',
    desc: 'Веди Баблуха плавно по полю, ешь бутерброды с огурчиком и становись длиннее. Не врезайся в стены и в себя!',
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const engine = new SnakeEngine(canvas, setHud)
    engineRef.current = engine

    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, DirName> = {
        ArrowUp: 'up',
        KeyW: 'up',
        ArrowDown: 'down',
        KeyS: 'down',
        ArrowLeft: 'left',
        KeyA: 'left',
        ArrowRight: 'right',
        KeyD: 'right',
      }
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        engine.start()
        return
      }
      const dir = map[e.code]
      if (dir) {
        e.preventDefault()
        engine.queueDir(dir)
      }
    }

    const onDown = (e: PointerEvent) => {
      swipeRef.current = { x: e.clientX, y: e.clientY, active: true }
      canvas.setPointerCapture?.(e.pointerId)
    }
    const onUp = (e: PointerEvent) => {
      const s = swipeRef.current
      if (!s.active) return
      s.active = false
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      if (Math.hypot(dx, dy) < 18) return
      if (Math.abs(dx) > Math.abs(dy)) engine.queueDir(dx > 0 ? 'right' : 'left')
      else engine.queueDir(dy > 0 ? 'down' : 'up')
    }

    window.addEventListener('keydown', onKey)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', () => {
      swipeRef.current.active = false
    })

    return () => {
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      engine.destroy()
    }
  }, [])

  const showOverlay = hud.state !== 'playing'

  return (
    <main className="snake-page">
      <motion.h1
        className="snake-logo"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        SNAKE BABLOOH
      </motion.h1>
      <motion.p
        className="snake-tag"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 0.15 }}
      >
        СОБИРАЙ БУТЕРБРОДЫ — НЕ ВРЕЗАЙСЯ В СЕБЯ
      </motion.p>

      <div className="snake-frame">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          aria-label="Snake Bablooh"
        />
        <div className="snake-hud">
          <span>{hud.score}</span>
          <span>РЕКОРД: {hud.best}</span>
        </div>

        <AnimatePresence>
          {showOverlay && (
            <motion.div
              className="snake-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: 'auto' }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
              transition={{ duration: 0.18 }}
            >
              <motion.div
                className="snake-panel"
                initial={{ scale: 0.86, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                {hud.state === 'over' && (
                  <motion.img
                    className="snake-loss"
                    src="/games/game-over.webp"
                    alt="Баблух проиграл"
                    draggable={false}
                    initial={{ scale: 0.85, rotate: -6, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                  />
                )}
                <h2>{hud.title}</h2>
                <p>{hud.desc}</p>
                <motion.button
                  type="button"
                  className="snake-btn"
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => engineRef.current?.start()}
                >
                  {hud.state === 'over' ? 'Ещё раз' : 'Играть'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="snake-pad" aria-label="Управление">
        {(
          [
            ['u', 'up', '↑'],
            ['l', 'left', '←'],
            ['r', 'right', '→'],
            ['d', 'down', '↓'],
          ] as const
        ).map(([cls, dir, label]) => (
          <motion.button
            key={dir}
            type="button"
            className={cls}
            aria-label={dir}
            whileTap={{ scale: 0.92 }}
            onPointerDown={(e) => {
              e.preventDefault()
              engineRef.current?.queueDir(dir)
            }}
          >
            {label}
          </motion.button>
        ))}
      </div>

      <p className="snake-hint">Свайп / стрелки / WASD / кнопки внизу</p>
    </main>
  )
}
