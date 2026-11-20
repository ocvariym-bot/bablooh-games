import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowsLeftRight,
  faBomb,
  faBurst,
  faHammer,
  faInfinity,
  faRocket,
  faShuffle,
  faTrophy,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { START_MOVES, type SubmitStatus } from './matchMeta'

type Props = {
  show: boolean
  started: boolean
  tutorialStep: 0 | 1 | 2
  score: number
  best: number
  limited: boolean
  limitedPref: boolean
  movesUsed: number
  submitStatus: SubmitStatus
  reducedMotion: boolean | null
  moveTransition: Transition
  onModePref: (limited: boolean) => void
  onFinishTutorial: () => void
  onNextTutorial: () => void
  onPlay: () => void
}

export function MatchOverlay({
  show,
  started,
  tutorialStep,
  score,
  best,
  limited,
  limitedPref,
  movesUsed,
  submitStatus,
  reducedMotion,
  moveTransition,
  onModePref,
  onFinishTutorial,
  onNextTutorial,
  onPlay,
}: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="match-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.22 }}
        >
          <motion.div
            className="match-modal"
            initial={reducedMotion ? false : { opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={moveTransition}
          >
            {started ? (
              <>
                <span className="match-modal-icon" aria-hidden><FontAwesomeIcon icon={faTrophy} /></span>
                <h2>Отличная игра!</h2>
                <p>
                  Твой результат: <b>{score.toLocaleString('ru-RU')}</b> очков.<br />
                  Рекорд: {best.toLocaleString('ru-RU')}
                  {!limited ? <><br />Ходов: {movesUsed}</> : null}
                </p>
                <p className="match-submit-status" aria-live="polite">
                  {submitStatus === 'sending' ? 'Отправляем результат в рейтинг…'
                    : submitStatus === 'sent' ? 'Результат отправлен в общий рейтинг ✓'
                      : submitStatus === 'failed' ? 'Не удалось отправить результат. Рекорд сохранён на устройстве.'
                        : submitStatus === 'telegram-only' ? 'Для общего рейтинга открой игру в Telegram.'
                          : null}
                </p>
              </>
            ) : tutorialStep < 2 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tutorialStep}
                  className="match-howto"
                  initial={reducedMotion ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: reducedMotion ? 0 : 0.18 }}
                >
                  <span className="match-modal-icon" aria-hidden>
                    <FontAwesomeIcon icon={tutorialStep === 0 ? faArrowsLeftRight : faWandMagicSparkles} />
                  </span>
                  {tutorialStep === 0 ? (
                    <>
                      <h2>Как играть</h2>
                      <p>Меняй соседние лица местами — тапом или свайпом. Собери <b>три или больше</b> одинаковых в ряд.</p>
                      <ul className="match-howto-list">
                        <li>Тап по карточке → тап по соседней</li>
                        <li>Или свайпни в сторону соседа</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <h2>Бонусы и бусты</h2>
                      <ul className="match-howto-list match-howto-list--icons">
                        <li><FontAwesomeIcon icon={faBomb} /> 4 в ряд — бомба</li>
                        <li><FontAwesomeIcon icon={faRocket} /> 5 в ряд — ракета</li>
                        <li><FontAwesomeIcon icon={faBurst} /> T / L — крест</li>
                        <li><FontAwesomeIcon icon={faHammer} /> / <FontAwesomeIcon icon={faShuffle} /> — без хода</li>
                      </ul>
                      <p>Тап по бонусу на поле — активировать сразу (считается ходом).</p>
                    </>
                  )}
                  <div className="match-howto-dots" aria-hidden>
                    <span className={tutorialStep === 0 ? 'on' : ''} />
                    <span className={tutorialStep === 1 ? 'on' : ''} />
                  </div>
                  <div className="match-howto-actions">
                    <button type="button" className="match-howto-skip" onClick={onFinishTutorial}>Пропустить</button>
                    <motion.button
                      type="button"
                      className="match-play"
                      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                      onClick={onNextTutorial}
                    >
                      {tutorialStep === 0 ? 'Дальше' : 'К режиму'} <span>→</span>
                    </motion.button>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <>
                <span className="match-modal-icon" aria-hidden><FontAwesomeIcon icon={faWandMagicSparkles} /></span>
                <h2>Собери свою<br />команду!</h2>
                <p>Выбери режим и начинай.</p>
              </>
            )}
            {(started || tutorialStep >= 2) && (
              <>
                <div className="match-mode" role="group" aria-label="Режим ходов">
                  <button type="button" className={limitedPref ? 'active' : ''} aria-pressed={limitedPref} onClick={() => onModePref(true)}>
                    <b>{START_MOVES} ходов</b><small>классика</small>
                  </button>
                  <button type="button" className={!limitedPref ? 'active' : ''} aria-pressed={!limitedPref} onClick={() => onModePref(false)}>
                    <b><FontAwesomeIcon icon={faInfinity} /> без лимита</b><small>играй сколько хочешь</small>
                  </button>
                </div>
                <motion.button
                  className="match-play"
                  whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                  onClick={onPlay}
                >
                  {started ? 'Ещё раз' : 'Играть'} <span>→</span>
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
