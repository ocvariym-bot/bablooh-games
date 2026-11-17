import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  fetchLeaderboard,
  type GameId,
  type LeaderRow,
} from '../lib/leaderboard'
import { hapticLight, hapticSelect } from '../lib/telegram'

export type OpenGameId = GameId | 'ninja-react' | 'snake-react'

type Props = {
  onOpenGame: (id: OpenGameId, src?: string) => void
}

const GAMES: {
  id: GameId
  title: string
  desc: string
  file?: string
  icon: string
  iconClass?: string
  react?: 'ninja' | 'snake'
}[] = [
  {
    id: 'flappy',
    title: 'FLAPPY BABLOOH',
    desc: 'Пролетай между препятствиями',
    file: '/games/flappy.html',
    icon: '/characters/flappy-sprite.webp',
    iconClass: 'game-icon-img--flappy',
  },
  {
    id: 'eggs',
    title: 'EGGS BABLOOH',
    desc: 'Лови падающие яйца',
    file: '/games/eggs.html',
    icon: '/characters/eggs.webp',
  },
  {
    id: 'doodle',
    title: 'DOODLE BABLOOH',
    desc: 'Прыгай, пока не улетел в космос',
    file: '/games/doodle.html',
    icon: '/characters/doodle.webp',
    iconClass: 'game-icon-img--doodle',
  },
  {
    id: 'ninja',
    title: 'BABLOOH NINJA',
    desc: 'Он мне говорит, что у меня пылесоса нет!',
    react: 'ninja',
    icon: '/characters/ninja.webp',
  },
  {
    id: 'snake',
    title: 'SNAKE BABLOOH',
    desc: 'Ешь бутерброды и расти длиннее',
    react: 'snake',
    icon: '/characters/snake.webp',
    iconClass: 'game-icon-img--snake',
  },
]

const LABELS: Record<GameId, string> = {
  flappy: 'Flappy',
  eggs: 'Eggs',
  doodle: 'Doodle',
  ninja: 'Ninja',
  snake: 'Snake',
}

const NAMES: Record<GameId, string> = {
  flappy: 'Flappy Bablooh',
  eggs: 'Eggs Bablooh',
  doodle: 'Doodle Bablooh',
  ninja: 'Bablooh Ninja',
  snake: 'Snake Bablooh',
}

export function Home({ onOpenGame }: Props) {
  const [tab, setTab] = useState<GameId>('flappy')
  const [rows, setRows] = useState<LeaderRow[] | null>(null)
  const [status, setStatus] = useState('Загружаю рейтинг…')

  useEffect(() => {
    let cancelled = false
    setStatus('Загружаю рейтинг…')
    setRows(null)
    fetchLeaderboard(tab)
      .then((data) => {
        if (cancelled) return
        if (!data.length) {
          setRows([])
          setStatus(`В рейтинге «${NAMES[tab]}» пока нет результатов.`)
          return
        }
        setRows(data)
        setStatus('')
      })
      .catch(() => {
        if (!cancelled) {
          setRows(null)
          setStatus('Не удалось загрузить рейтинг. Попробуй позже.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [tab])

  return (
    <motion.main className="home" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <motion.div
        className="home-hero-cast"
        initial={{ y: 12 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {GAMES.map((g) => (
          <img
            key={g.icon}
            className={`home-hero-head${
              g.id === 'doodle'
                ? ' home-hero-head--doodle'
                : g.id === 'snake'
                  ? ' home-hero-head--snake'
                  : ''
            }`}
            src={g.icon}
            alt=""
            draggable={false}
          />
        ))}
      </motion.div>

      <motion.h1
        className="brand"
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        BABLOOH GAMES
      </motion.h1>
      <p className="subtitle">ТВОЯ ИГРОВАЯ ВСЕЛЕННАЯ В TELEGRAM</p>

      <section className="welcome">
        <strong>Выбирай игру!</strong>
        <p>Играй прямо здесь — ничего устанавливать не нужно.</p>
      </section>

      <section className="games">
        {GAMES.map((g) => (
          <motion.button
            key={g.id}
            type="button"
            className="game"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              hapticLight()
              if (g.react === 'ninja') onOpenGame('ninja-react')
              else if (g.react === 'snake') onOpenGame('snake-react')
              else onOpenGame(g.id, g.file)
            }}
          >
            <span className="emoji">
              <img
                className={`game-icon-img${g.iconClass ? ` ${g.iconClass}` : ''}`}
                src={g.icon}
                alt=""
                draggable={false}
              />
            </span>
            <span className="info">
              <b>{g.title}</b>
              <small>{g.desc}</small>
            </span>
            <span className="arrow">›</span>
          </motion.button>
        ))}
      </section>

      <section className="leaderboard">
        <strong>Рейтинг по играм</strong>
        <p className="leader-note">
          Выбери игру, чтобы увидеть лучших игроков именно в ней.
        </p>
        <div className="leader-tabs">
          {(Object.keys(LABELS) as GameId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'active' : ''}
              onClick={() => {
                hapticSelect()
                setTab(id)
              }}
            >
              {LABELS[id]}
            </button>
          ))}
        </div>
        <div className="leaderboard-list">
          {status && !rows?.length ? (
            status
          ) : (
            rows?.map((p, i) => (
              <div className="leader-row" key={`${p.display_name}-${i}`}>
                <span>
                  {i + 1}. {p.display_name}
                </span>
                <b>{Number(p.best_score).toLocaleString('ru-RU')}</b>
              </div>
            ))
          )}
        </div>
      </section>

      <p className="note">
        Рекорды игр сохраняются на устройстве и отправляются в глобальный рейтинг при игре в
        Telegram.
      </p>
    </motion.main>
  )
}
