import { motion } from 'framer-motion'
import { NinjaGame } from '../games/ninja/NinjaGame'
import { MatchGame } from '../games/match/MatchGame'
import { SnakeGame } from '../games/snake/SnakeGame'
import { hapticLight } from '../lib/telegram'

type Props = {
  mode: 'iframe' | 'ninja' | 'snake' | 'match'
  src?: string
  onBack: () => void
}

export function GamePlayer({ mode, src, onBack }: Props) {
  return (
    <motion.section
      className="player"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.button
        type="button"
        className="back-btn"
        onClick={() => {
          hapticLight()
          onBack()
        }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        ← Все игры
      </motion.button>

      {mode === 'ninja' || mode === 'snake' || mode === 'match' ? (
        <div className="player-react">
          {mode === 'ninja' ? <NinjaGame /> : mode === 'snake' ? <SnakeGame /> : <MatchGame />}
        </div>
      ) : (
        <iframe className="game-frame" title="Игра" src={src} allow="fullscreen" />
      )}
    </motion.section>
  )
}
