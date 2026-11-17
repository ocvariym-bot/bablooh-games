import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { audioManager } from '../lib/audio'
import { hapticLight, hapticSelect } from '../lib/telegram'

export function SoundControl() {
  const [muted, setMuted] = useState(audioManager.getMuted())
  const [volume, setVolume] = useState(audioManager.getVolume())
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const unsub = audioManager.subscribe(() => {
      setMuted(audioManager.getMuted())
      setVolume(audioManager.getVolume())
    })
    return () => {
      unsub()
    }
  }, [])

  const unlockAndTogglePanel = () => {
    audioManager.unlock()
    hapticLight()
    setOpen((v) => !v)
  }

  const toggleMute = () => {
    audioManager.unlock()
    hapticSelect()
    audioManager.setMuted(!audioManager.getMuted())
  }

  return (
    <div className="sound-control">
      <motion.button
        type="button"
        className="sound-btn"
        aria-label={muted ? 'Включить звук' : 'Звук'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={unlockAndTogglePanel}
      >
        <img
          src={muted || volume <= 0 ? '/icons/sound-off.svg' : '/icons/sound-on.svg'}
          alt=""
          width={40}
          height={40}
          draggable={false}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="sound-panel"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
          >
            <button type="button" className="sound-mute" onClick={toggleMute}>
              {muted ? 'Включить' : 'Выключить'}
            </button>
            <label className="sound-volume">
              <span>Громкость</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(volume * 100)}
                onChange={(e) => {
                  audioManager.unlock()
                  audioManager.setVolume(Number(e.target.value) / 100)
                }}
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
