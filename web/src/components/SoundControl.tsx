import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { audioManager } from '../lib/audio'
import { hapticLight, hapticSelect } from '../lib/telegram'

const TIP_KEY = 'babloohSoundTipHidden'

function loadTipHidden() {
  try {
    return localStorage.getItem(TIP_KEY) === '1'
  } catch {
    return false
  }
}

export function SoundControl() {
  const [muted, setMuted] = useState(audioManager.getMuted())
  const [volume, setVolume] = useState(audioManager.getVolume())
  const [open, setOpen] = useState(false)
  const [tipOpen, setTipOpen] = useState(() => !loadTipHidden())
  const [dontShowAgain, setDontShowAgain] = useState(true)

  useEffect(() => {
    const unsub = audioManager.subscribe(() => {
      setMuted(audioManager.getMuted())
      setVolume(audioManager.getVolume())
    })
    return () => {
      unsub()
    }
  }, [])

  const dismissTip = (persist: boolean) => {
    hapticLight()
    if (persist) {
      try {
        localStorage.setItem(TIP_KEY, '1')
      } catch {
        /* ignore */
      }
    }
    setTipOpen(false)
    window.dispatchEvent(new Event('bablooh-sound-tip-closed'))
  }

  const unlockAndTogglePanel = () => {
    audioManager.unlock()
    hapticLight()
    if (tipOpen) dismissTip(dontShowAgain)
    setOpen((v) => !v)
  }

  const toggleMute = () => {
    audioManager.unlock()
    hapticSelect()
    audioManager.setMuted(!audioManager.getMuted())
  }

  return (
    <div className={`sound-control${tipOpen ? ' sound-control--tip' : ''}`}>
      <motion.button
        type="button"
        className={`sound-btn${tipOpen ? ' sound-btn--pulse' : ''}`}
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

      <AnimatePresence>
        {tipOpen && (
          <>
            <motion.button
              type="button"
              className="sound-tip-scrim"
              aria-label="Закрыть подсказку"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dismissTip(dontShowAgain)}
            />
            <motion.div
              className="sound-tip"
              role="dialog"
              aria-labelledby="sound-tip-title"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            >
              <div className="sound-tip-arrow" aria-hidden />
              <p id="sound-tip-title" className="sound-tip-title">
                Новое: кнопка звука
              </p>
              <p className="sound-tip-text">
                Справа сверху можно выключить музыку или крутить громкость.
              </p>
              <label className="sound-tip-check">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                />
                <span>Больше не показывать</span>
              </label>
              <div className="sound-tip-actions">
                <button
                  type="button"
                  className="sound-tip-secondary"
                  onClick={() => dismissTip(false)}
                >
                  Позже
                </button>
                <button
                  type="button"
                  className="sound-tip-primary"
                  onClick={() => dismissTip(dontShowAgain)}
                >
                  Понятно
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
