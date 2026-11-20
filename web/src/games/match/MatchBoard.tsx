import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { useRef } from 'react'
import type { DisplayBoard } from './engine'
import { faces, labels, specialIcon, specialLabel, type Pos } from './matchMeta'

type Props = {
  display: DisplayBoard
  selected: Pos | null
  hammerMode: boolean
  busy: boolean
  highlighted: number[]
  hintIds: number[]
  reducedMotion: boolean | null
  moveTransition: Transition
  onChoose: (r: number, c: number) => void
  onSwipe: (a: Pos, b: Pos) => void
}

export function MatchBoard({
  display,
  selected,
  hammerMode,
  busy,
  highlighted,
  hintIds,
  reducedMotion,
  moveTransition,
  onChoose,
  onSwipe,
}: Props) {
  const pointer = useRef<{ x: number; y: number; r: number; c: number } | null>(null)
  const skipClick = useRef(false)

  return (
    <div className="match-board" role="grid" aria-label="Игровое поле 7 на 7" aria-busy={busy}>
      <AnimatePresence initial={false}>
        {display.flatMap((row, r) => row.map((t, c) => t && (
          <motion.button
            key={t.id}
            layout
            type="button"
            role="gridcell"
            style={{ gridRow: r + 1, gridColumn: c + 1 }}
            className={`match-tile face-${t.face}${t.face === 4 ? ' face-hard' : ''}${selected?.[0] === r && selected[1] === c ? ' selected' : ''}${hammerMode ? ' hammer-target' : ''}${highlighted.includes(t.id) ? ' clearing' : ''}${hintIds.includes(t.id) ? ' hint' : ''}`}
            aria-label={`Ряд ${r + 1}, столбец ${c + 1}: ${labels[t.face]}${t.special ? specialLabel(t.special) : ''}`}
            aria-selected={selected?.[0] === r && selected[1] === c}
            aria-disabled={busy}
            initial={reducedMotion ? false : { opacity: 0, scale: 0.65, y: -14 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: highlighted.includes(t.id) ? 1.08 : selected?.[0] === r && selected[1] === c ? 0.92 : 1,
              filter: highlighted.includes(t.id) ? 'brightness(1.35)' : 'brightness(1)',
            }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.25, rotate: 12 }}
            transition={{
              layout: moveTransition,
              opacity: { duration: reducedMotion ? 0 : 0.22 },
              scale: { duration: reducedMotion ? 0 : 0.2 },
              filter: { duration: reducedMotion ? 0 : 0.18 },
              rotate: { duration: reducedMotion ? 0 : 0.22 },
            }}
            whileHover={!busy && !reducedMotion ? { scale: 1.05 } : undefined}
            whileTap={!busy && !reducedMotion ? { scale: 0.9 } : undefined}
            onPointerDown={e => { pointer.current = { x: e.clientX, y: e.clientY, r, c } }}
            onPointerUp={e => {
              const p = pointer.current
              pointer.current = null
              if (!p) return
              const dx = e.clientX - p.x
              const dy = e.clientY - p.y
              if (Math.hypot(dx, dy) > 18) {
                skipClick.current = true
                onSwipe(
                  [p.r, p.c],
                  Math.abs(dx) > Math.abs(dy)
                    ? [p.r, p.c + (dx > 0 ? 1 : -1)]
                    : [p.r + (dy > 0 ? 1 : -1), p.c],
                )
                setTimeout(() => { skipClick.current = false }, 100)
              }
            }}
            onPointerCancel={() => { pointer.current = null }}
            onClick={() => {
              if (skipClick.current) { skipClick.current = false; return }
              onChoose(r, c)
            }}
          >
            <img src={`/games/match/${faces[t.face]}.webp`} alt="" draggable={false} />
            {t.face === 4 && <span className="match-hard-badge" aria-hidden>!</span>}
            <AnimatePresence>
              {t.special && (
                <motion.span
                  key={t.special}
                  className={`match-special${t.special === 'bomb' ? ' match-special--bomb' : ''}${t.special === 'rocket-h' ? ' match-special--rocket' : ''}${t.special === 'rocket-v' ? ' match-special--vert' : ''}${t.special === 'cross' ? ' match-special--cross' : ''}`}
                  aria-hidden="true"
                  initial={reducedMotion ? false : { scale: 0, rotate: -30 }}
                  animate={{ scale: highlighted.includes(t.id) ? 1.3 : 1, rotate: t.special === 'rocket-v' ? 90 : 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 19 }}
                >
                  <FontAwesomeIcon icon={specialIcon(t.special)} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )))}
      </AnimatePresence>
    </div>
  )
}
