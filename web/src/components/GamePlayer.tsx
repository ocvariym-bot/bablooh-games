import { motion } from 'framer-motion'
import { NinjaGame } from '../games/ninja/NinjaGame'

type Props = {
  mode: 'iframe' | 'ninja'
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
        onClick={onBack}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        ← Все игры
      </motion.button>

      {mode === 'ninja' ? (
        <div className="player-react">
          <NinjaGame />
        </div>
      ) : (
        <iframe className="game-frame" title="Игра" src={src} allow="fullscreen" />
      )}
    </motion.section>
  )
}
