import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { CharacterSvg } from '../../components/characters/CharacterSvg'
import { H, NINJA_HEAD_SRCS, NinjaEngine, W, type HudSnapshot } from './engine'
import './ninja.css'

export function NinjaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<NinjaEngine | null>(null)
  const [hud, setHud] = useState<HudSnapshot>({
    score: 0,
    missed: 0,
    best: Number(localStorage.getItem('babloohNinjaBest') || 0),
    state: 'ready',
    title: 'Готов резать?',
    desc: 'Проводи пальцем по пылесосам. Золотой турбо-пылесос можно рубить много раз подряд — каждый удар в счёт. Не пропусти три штуки и не задень бомбу!',
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const layer = layerRef.current
    if (!canvas || !layer) return
    const engine = new NinjaEngine(canvas, layer, setHud)
    engineRef.current = engine
    canvas.addEventListener('pointerdown', engine.onPointerDown)
    canvas.addEventListener('pointermove', engine.onPointerMove)
    canvas.addEventListener('pointerup', engine.onPointerUp)
    canvas.addEventListener('pointercancel', engine.onPointerUp)
    canvas.addEventListener('lostpointercapture', engine.onPointerUp)
    return () => {
      canvas.removeEventListener('pointerdown', engine.onPointerDown)
      canvas.removeEventListener('pointermove', engine.onPointerMove)
      canvas.removeEventListener('pointerup', engine.onPointerUp)
      canvas.removeEventListener('pointercancel', engine.onPointerUp)
      canvas.removeEventListener('lostpointercapture', engine.onPointerUp)
      engine.destroy()
    }
  }, [])

  const showOverlay = hud.state !== 'playing'

  return (
    <main className="ninja-page">
      <motion.h1
        className="ninja-logo"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        BABLOOH NINJA
      </motion.h1>
      <motion.p
        className="ninja-tag"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 0.15 }}
      >
        РЕЖЬ ПЫЛЕСОСЫ, НО НЕ ТРОГАЙ БОМБЫ
      </motion.p>

      <div className="ninja-frame">
        <canvas
          ref={canvasRef}
          id="ninja-canvas"
          width={W}
          height={H}
          aria-label="BABLOOH Ninja"
        />
        <div ref={layerRef} className="ninja-vectors" aria-hidden />
        <div className="ninja-hud">
          <span>⚔️ {hud.score}</span>
          <span>❌ {hud.missed} / 3</span>
          {hud.frenzyLabel ? (
            <span className="ninja-hud-frenzy">{hud.frenzyLabel}</span>
          ) : (
            <span>РЕКОРД: {hud.best}</span>
          )}
        </div>

        <AnimatePresence>
          {showOverlay && (
            <motion.div
              className="ninja-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, pointerEvents: 'auto' }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
              transition={{ duration: 0.18 }}
            >
              <motion.div
                className="ninja-panel"
                initial={{ scale: 0.86, y: 24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              >
                {hud.state === 'over' && (
                  <motion.img
                    className="ninja-loss"
                    src="/characters/ninja-loss.webp"
                    alt="Баблух проиграл"
                    width={108}
                    height={108}
                    draggable={false}
                    initial={{ scale: 0.85, rotate: -6, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 16 }}
                  />
                )}
                {hud.state === 'ready' && (
                  <div className="ninja-cast">
                    {NINJA_HEAD_SRCS.map((src) => (
                      <img key={src} className="ninja-cast-head" src={src} alt="" draggable={false} />
                    ))}
                    <CharacterSvg variant="bomb" size={52} animate={false} />
                  </div>
                )}
                <h2>{hud.title}</h2>
                <p>{hud.desc}</p>
                <motion.button
                  type="button"
                  className="ninja-btn"
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

      <p className="ninja-hint">
        Пылесос = +1. Турбо (золотой) = руби много раз. 3 пропуска — конец!
      </p>
    </main>
  )
}
