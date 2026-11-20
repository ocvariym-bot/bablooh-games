import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBomb,
  faBurst,
  faCircleInfo,
  faEyeSlash,
  faFlagCheckered,
  faHammer,
  faLightbulb,
  faRocket,
  faShuffle,
} from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from 'framer-motion'
import { HARD_MOVES_LEFT, HARD_MOVES_USED, START_BOOSTERS, type ToolHelp } from './matchMeta'
import { hapticLight } from '../../lib/telegram'

type Props = {
  hammers: number
  shuffles: number
  hammerMode: boolean
  toolHelp: ToolHelp
  hintsOn: boolean
  toolsOff: boolean
  message: string
  reducedMotion: boolean | null
  onToolHelp: (next: ToolHelp | ((prev: ToolHelp) => ToolHelp)) => void
  onToggleHammer: () => void
  onShuffle: () => void
  onToggleHints: () => void
  onFinishEarly: () => void
}

export function MatchToolbar({
  hammers,
  shuffles,
  hammerMode,
  toolHelp,
  hintsOn,
  toolsOff,
  message,
  reducedMotion,
  onToolHelp,
  onToggleHammer,
  onShuffle,
  onToggleHints,
  onFinishEarly,
}: Props) {
  return (
    <>
      <p className="match-message" aria-live="polite">
        <motion.span
          key={hammerMode ? 'hammer' : message}
          initial={reducedMotion ? false : { opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {hammerMode
            ? <>Выбери лицо — убрать без хода <FontAwesomeIcon icon={faHammer} /></>
            : message}
        </motion.span>
      </p>
      <div className="match-tools">
        <div className="match-tool-wrap">
          <motion.button
            type="button"
            className={`match-tool${hammerMode ? ' active' : ''}`}
            whileHover={reducedMotion ? undefined : { scale: 1.02 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            disabled={toolsOff || !hammers}
            onClick={onToggleHammer}
          >
            <motion.span
              className="match-tool-icon"
              animate={hammerMode && !reducedMotion ? { rotate: [0, -18, 12, 0] } : { rotate: 0 }}
              transition={{ duration: 0.45 }}
            >
              <FontAwesomeIcon icon={faHammer} />
            </motion.span>
            <b>Молоток</b>
            <small>{hammers}/{START_BOOSTERS} · без хода</small>
          </motion.button>
          <button
            type="button"
            className={`match-tool-info${toolHelp === 'hammer' ? ' open' : ''}`}
            aria-label="Что делает молоток"
            aria-expanded={toolHelp === 'hammer'}
            onClick={e => {
              e.stopPropagation()
              hapticLight()
              onToolHelp(h => h === 'hammer' ? null : 'hammer')
            }}
          >
            <FontAwesomeIcon icon={faCircleInfo} />
          </button>
          <AnimatePresence>
            {toolHelp === 'hammer' && (
              <motion.div
                className="match-tool-tip"
                role="tooltip"
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                Убери одно любое лицо с поля. Ход не тратится — удобно, когда мешает «лишняя» карточка.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="match-tool-wrap">
          <motion.button
            type="button"
            className="match-tool"
            whileHover={reducedMotion ? undefined : { scale: 1.02 }}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            disabled={toolsOff || !shuffles}
            onClick={onShuffle}
          >
            <span className="match-tool-icon"><FontAwesomeIcon icon={faShuffle} /></span>
            <b>Перемешать</b>
            <small>{shuffles}/{START_BOOSTERS} · без хода</small>
          </motion.button>
          <button
            type="button"
            className={`match-tool-info${toolHelp === 'shuffle' ? ' open' : ''}`}
            aria-label="Что делает перемешивание"
            aria-expanded={toolHelp === 'shuffle'}
            onClick={e => {
              e.stopPropagation()
              hapticLight()
              onToolHelp(h => h === 'shuffle' ? null : 'shuffle')
            }}
          >
            <FontAwesomeIcon icon={faCircleInfo} />
          </button>
          <AnimatePresence>
            {toolHelp === 'shuffle' && (
              <motion.div
                className="match-tool-tip match-tool-tip--right"
                role="tooltip"
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: reducedMotion ? 0 : 0.18 }}
              >
                Перетасуй все карточки на поле. Ход не тратится — спасает, когда нет удобных троек.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="match-extra">
        <motion.button
          type="button"
          className={hintsOn ? 'active' : ''}
          whileHover={reducedMotion ? undefined : { scale: 1.02 }}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          onClick={onToggleHints}
          aria-pressed={hintsOn}
        >
          <span className="match-tool-icon"><FontAwesomeIcon icon={hintsOn ? faLightbulb : faEyeSlash} /></span>
          <b>Подсказки</b>
          <small>{hintsOn ? 'вкл · ~6.5с' : 'выкл'}</small>
        </motion.button>
        <motion.button
          type="button"
          className="match-finish"
          whileHover={reducedMotion ? undefined : { scale: 1.02 }}
          whileTap={reducedMotion ? undefined : { scale: 0.96 }}
          disabled={toolsOff}
          onClick={onFinishEarly}
        >
          <span className="match-tool-icon"><FontAwesomeIcon icon={faFlagCheckered} /></span>
          <b>Завершить</b>
          <small>сохранить счёт</small>
        </motion.button>
      </div>
      <p className="match-help">
        Тап по бонусу <FontAwesomeIcon icon={faBomb} /> / <FontAwesomeIcon icon={faRocket} /> / <FontAwesomeIcon icon={faBurst} /> — активировать сразу (ход)<br />
        Молоток и перемешивание — бусты, ход не тратят<br />
        4 в ряд — бомба · 5 гориз./верт. — ракета · T/L — крест<br />
        Ниндзя (!): с {HARD_MOVES_LEFT} ходов в лимите · после {HARD_MOVES_USED} ходов без лимита
      </p>
    </>
  )
}
