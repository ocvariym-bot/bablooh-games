import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { GamePlayer } from './components/GamePlayer'
import { Home, type OpenGameId } from './components/Home'
import { SoundControl } from './components/SoundControl'
import { audioManager, musicForView } from './lib/audio'
import type { GameId } from './lib/leaderboard'
import { getTelegram, initTelegram } from './lib/telegram'

type View =
  | { kind: 'home' }
  | { kind: 'iframe'; gameId: GameId; src: string }
  | { kind: 'ninja' }
  | { kind: 'snake' }
  | { kind: 'match' }

export default function App() {
  const [view, setView] = useState<View>({ kind: 'home' })

  useEffect(() => {
    initTelegram()
  }, [])

  useEffect(() => {
    const track = musicForView(
      view.kind === 'iframe'
        ? { kind: view.kind, gameId: view.gameId }
        : { kind: view.kind },
    )
    audioManager.setTrack(track)
  }, [view])

  useEffect(() => {
    const tg = getTelegram()
    if (!tg) return
    const onBack = () => setView({ kind: 'home' })
    if (view.kind === 'home') tg.BackButton.hide()
    else {
      tg.BackButton.show()
      tg.BackButton.onClick(onBack)
    }
    return () => {
      tg.BackButton.offClick?.(onBack)
    }
  }, [view.kind])

  return (
    <div className="app-shell">
      <SoundControl />
      <AnimatePresence mode="wait">
        {view.kind === 'home' ? (
          <Home
            key="home"
            onOpenGame={(id: OpenGameId, src) => {
              audioManager.unlock()
              if (id === 'match-react') setView({ kind: 'match' })
              else if (id === 'ninja-react') setView({ kind: 'ninja' })
              else if (id === 'snake-react') setView({ kind: 'snake' })
              else if (src) setView({ kind: 'iframe', gameId: id, src })
            }}
          />
        ) : (
          <GamePlayer
            key="player"
            mode={
              view.kind === 'match'
                ? 'match'
                : view.kind === 'ninja'
                ? 'ninja'
                : view.kind === 'snake'
                  ? 'snake'
                  : 'iframe'
            }
            src={view.kind === 'iframe' ? view.src : undefined}
            onBack={() => setView({ kind: 'home' })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
