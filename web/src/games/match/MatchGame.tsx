import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfinity } from '@fortawesome/free-solid-svg-icons'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  activateSpecial,
  findHint,
  freshBoard,
  getSpawnFaceCount,
  hammer,
  resetSpawnFaceCount,
  setSpawnFaceCount,
  shuffleBoard,
  swapBoard,
  trySwap,
  type Board,
  type DisplayBoard,
  type Frame,
  type Result,
} from './engine'
import { MatchBoard } from './MatchBoard'
import { MatchOverlay } from './MatchOverlay'
import { MatchToolbar } from './MatchToolbar'
import {
  BEST_KEY,
  HARD_MOVES_LEFT,
  HARD_MOVES_USED,
  HINTS_KEY,
  MODE_KEY,
  START_BOOSTERS,
  START_MOVES,
  TUTORIAL_KEY,
  readBest,
  readHintsOn,
  readLimitedPref,
  readTutorialDone,
  type Pos,
  type SubmitStatus,
  type ToolHelp,
} from './matchMeta'
import { hapticLight, hapticSelect } from '../../lib/telegram'
import { submitScore } from '../../lib/leaderboard'
import './match.css'

export function MatchGame() {
  const [board, setBoard] = useState<Board>(freshBoard)
  const [display, setDisplay] = useState<DisplayBoard>(board)
  const [highlighted, setHighlighted] = useState<number[]>([])
  const [selected, setSelected] = useState<Pos | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [moves, setMoves] = useState(START_MOVES)
  const [movesUsed, setMovesUsed] = useState(0)
  const [limited, setLimited] = useState(true)
  const [limitedPref, setLimitedPref] = useState(readLimitedPref)
  const [ended, setEnded] = useState(false)
  const [hammers, setHammers] = useState(START_BOOSTERS)
  const [shuffles, setShuffles] = useState(START_BOOSTERS)
  const [hammerMode, setHammerMode] = useState(false)
  const [toolHelp, setToolHelp] = useState<ToolHelp>(null)
  const [message, setMessage] = useState('Собери три одинаковых лица в ряд')
  const [started, setStarted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(null)
  const [hintIds, setHintIds] = useState<number[]>([])
  const [hintsOn, setHintsOn] = useState(readHintsOn)
  /** 0–1 = howto slides, 2 = mode + play. Skipped if already seen. */
  const [tutorialStep, setTutorialStep] = useState<0 | 1 | 2>(() => (readTutorialDone() ? 2 : 0))
  const busyRef = useRef(false)
  const generation = useRef(0)
  const submissionId = useRef(0)
  const scoreRef = useRef(0)
  const gameOver = started && (ended || (limited && moves <= 0))
  const canPlay = started && !gameOver
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    resetSpawnFaceCount()
    return () => { generation.current++ }
  }, [])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => {
    setHintIds([])
    if (!hintsOn || !canPlay || busy || hammerMode) return
    const wait = reducedMotion ? 4000 : 6500
    const timer = window.setTimeout(() => {
      const hint = findHint(board)
      if (!hint) return
      const [[r1, c1], [r2, c2]] = hint
      if (r1 === r2 && c1 === c2) setHintIds([board[r1][c1].id])
      else setHintIds([board[r1][c1].id, board[r2][c2].id])
    }, wait)
    return () => window.clearTimeout(timer)
  }, [hintsOn, canPlay, busy, hammerMode, board, selected, reducedMotion])
  useEffect(() => {
    if (!toolHelp) return
    const close = (e: PointerEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest('.match-tool-wrap')) return
      setToolHelp(null)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [toolHelp])

  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, reducedMotion ? 25 : ms))
  const playFrames = async (frames: Frame[], token: number) => {
    for (const frame of frames) {
      if (token !== generation.current) return false
      setDisplay(frame.board); setHighlighted(frame.highlighted); setMessage(frame.message)
      await delay(frame.duration)
    }
    return token === generation.current
  }
  const begin = () => { busyRef.current = true; setBusy(true); setSelected(null); setHintIds([]) }
  const finish = () => { busyRef.current = false; setBusy(false); setHighlighted([]) }
  const sendScore = (finalScore: number) => {
    if (!window.Telegram?.WebApp?.initData) {
      setSubmitStatus('telegram-only')
      return
    }
    setSubmitStatus('sending')
    const token = generation.current
    const submission = ++submissionId.current
    void submitScore('match', finalScore).then(ok => {
      if (token === generation.current && submission === submissionId.current) {
        setSubmitStatus(ok ? 'sent' : 'failed')
      }
    })
  }
  const endGame = (finalScore: number) => {
    setHammerMode(false)
    setSelected(null)
    setHintIds([])
    setEnded(true)
    if (limited) setMoves(0)
    if (finalScore > best) {
      setBest(finalScore)
      try { localStorage.setItem(BEST_KEY, String(finalScore)) } catch { /* storage unavailable */ }
    }
    sendScore(finalScore)
    setMessage('Игра завершена')
  }
  const setModePref = (nextLimited: boolean) => {
    hapticLight()
    setLimitedPref(nextLimited)
    try { localStorage.setItem(MODE_KEY, nextLimited ? '1' : '0') } catch { /* ignore */ }
  }
  const finishTutorial = () => {
    hapticLight()
    setTutorialStep(2)
    try { localStorage.setItem(TUTORIAL_KEY, '1') } catch { /* ignore */ }
  }
  const nextTutorial = () => {
    hapticLight()
    if (tutorialStep >= 1) finishTutorial()
    else setTutorialStep(1)
  }
  const toggleHints = () => {
    hapticLight()
    setHintsOn(on => {
      const next = !on
      try { localStorage.setItem(HINTS_KEY, next ? '1' : '0') } catch { /* ignore */ }
      if (!next) setHintIds([])
      setMessage(next ? 'Подсказки включены' : 'Подсказки выключены')
      return next
    })
  }
  const finishEarly = () => {
    if (!canPlay || busyRef.current) return
    hapticSelect()
    endGame(scoreRef.current)
  }
  const apply = async (result: Result, move: boolean) => {
    begin(); hapticSelect()
    const token = generation.current
    if (!(await playFrames(result.frames, token))) return
    setBoard(result.board); setDisplay(result.board)
    const nextScore = score + result.score
    setScore(nextScore)
    scoreRef.current = nextScore
    if (nextScore > best) { setBest(nextScore); try { localStorage.setItem(BEST_KEY, String(nextScore)) } catch { /* storage unavailable */ } }
    let unlockedHard = false
    let justEnded = false
    if (move) {
      const used = movesUsed + 1
      setMovesUsed(used)
      if (limited) {
        const nextMoves = moves - 1
        setMoves(nextMoves)
        justEnded = nextMoves <= 0
        if (getSpawnFaceCount() < 5 && nextMoves <= HARD_MOVES_LEFT) {
          setSpawnFaceCount(5)
          unlockedHard = true
        }
      } else if (getSpawnFaceCount() < 5 && used >= HARD_MOVES_USED) {
        setSpawnFaceCount(5)
        unlockedHard = true
      }
    }
    if (justEnded) {
      setEnded(true)
      sendScore(nextScore)
    }
    if (unlockedHard && !justEnded) setMessage('Сложнее: появился ниндзя! Собирай и его в ряд.')
    else if (result.shuffled) setMessage('Нет ходов — поле перемешано!')
    else if (result.combo > 1) setMessage(`Комбо ×${result.combo} · +${result.score} очков`)
    else setMessage(`+${result.score} очков`)
    finish()
  }
  const attempt = async (a: Pos, b: Pos) => {
    if (busyRef.current || Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return
    const result = trySwap(board, a, b)
    if (result) { void apply(result, true); return }
    begin()
    const token = generation.current
    const frames: Frame[] = [
      { board: swapBoard(board, a, b), highlighted: [], message: 'Проверяем ход…', duration: 280 },
      { board, highlighted: [], message: 'Нужен ряд из трёх — попробуй ещё!', duration: 320 },
    ]
    if (await playFrames(frames, token)) finish()
  }
  const detonate = (r: number, c: number) => {
    const result = activateSpecial(board, r, c)
    if (!result) return
    setSelected(null)
    void apply(result, true)
  }
  const choose = (r: number, c: number) => {
    if (!canPlay || busyRef.current) return
    // Boosters (hammer/shuffle) never spend a move — only swaps and special taps do.
    if (hammerMode) { setHammers(n => n - 1); setHammerMode(false); void apply(hammer(board, r, c), false); return }
    if (!selected) {
      if (board[r][c].special) { detonate(r, c); return }
      setSelected([r, c]); hapticLight(); return
    }
    if (selected[0] === r && selected[1] === c) {
      if (board[r][c].special) { detonate(r, c); return }
      setSelected(null); return
    }
    if (Math.abs(selected[0] - r) + Math.abs(selected[1] - c) !== 1) {
      if (board[r][c].special) { detonate(r, c); return }
      setSelected([r, c]); hapticLight(); return
    }
    void attempt(selected, [r, c])
  }
  const swipe = (a: Pos, b: Pos) => {
    if (!canPlay || hammerMode || busyRef.current) return
    if (b[0] < 0 || b[0] >= 7 || b[1] < 0 || b[1] >= 7) return
    void attempt(a, b)
  }
  const shuffle = async () => {
    if (busyRef.current || !shuffles || !canPlay) return
    begin(); setHammerMode(false); setShuffles(n => n - 1); hapticLight()
    const token = generation.current
    const next = shuffleBoard(board)
    if (await playFrames([{ board: next, highlighted: [], message: 'Перемешиваем карточки…', duration: 550 }], token)) {
      setBoard(next); setDisplay(next); setMessage('Поле перемешано!'); finish()
    }
  }
  const reset = () => {
    if (busyRef.current) return
    submissionId.current++; setSubmitStatus(null)
    resetSpawnFaceCount()
    const useLimited = limitedPref
    setLimited(useLimited)
    setEnded(false)
    setMovesUsed(0)
    const next = freshBoard()
    setBoard(next); setDisplay(next); setHighlighted([]); setHintIds([]); setScore(0)
    setMoves(START_MOVES)
    setHammers(START_BOOSTERS); setShuffles(START_BOOSTERS); setSelected(null); setHammerMode(false); setToolHelp(null)
    setMessage(useLimited ? `Собери три в ряд · ${START_MOVES} ходов` : 'Собери три в ряд · без лимита ходов')
    setStarted(true); hapticLight()
  }

  const movesLabel = limited ? moves.toLocaleString('ru-RU') : '∞'
  const toolsOff = !canPlay || busy
  const moveTransition = reducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 360, damping: 32, mass: 0.7 }
  const showOverlay = !started || (gameOver && !busy)

  return (
    <main className="match-page">
      <div className="match-heading">
        <span className="match-kicker">НОВАЯ ИГРА • 3 В РЯД</span>
        <h1>BABLOOH <span>MATCH</span></h1>
        <p>Знакомые лица. Большие комбинации.</p>
      </div>
      <div className="match-stats" aria-label="Счёт игры">
        <div>
          <span>ОЧКИ</span>
          <motion.strong key={score} initial={reducedMotion ? false : { scale: 1.18, color: '#ff9fdd' }} animate={{ scale: 1, color: '#ffffff' }} transition={{ duration: 0.3 }}>
            {score.toLocaleString('ru-RU')}
          </motion.strong>
        </div>
        <div>
          <span>ХОДЫ</span>
          <motion.strong key={limited ? moves : 'inf'} initial={reducedMotion ? false : { scale: 1.18, color: '#ff9fdd' }} animate={{ scale: 1, color: '#ffffff' }} transition={{ duration: 0.3 }}>
            {limited ? movesLabel : <FontAwesomeIcon icon={faInfinity} aria-label="без лимита" />}
          </motion.strong>
        </div>
        <div>
          <span>РЕКОРД</span>
          <motion.strong key={best} initial={reducedMotion ? false : { scale: 1.18, color: '#ff9fdd' }} animate={{ scale: 1, color: '#ffffff' }} transition={{ duration: 0.3 }}>
            {best.toLocaleString('ru-RU')}
          </motion.strong>
        </div>
      </div>
      <div className="match-stage">
        <MatchBoard
          display={display}
          selected={selected}
          hammerMode={hammerMode}
          busy={busy}
          highlighted={highlighted}
          hintIds={hintIds}
          reducedMotion={reducedMotion}
          moveTransition={moveTransition}
          onChoose={choose}
          onSwipe={swipe}
        />
        <MatchOverlay
          show={showOverlay}
          started={started}
          tutorialStep={tutorialStep}
          score={score}
          best={best}
          limited={limited}
          limitedPref={limitedPref}
          movesUsed={movesUsed}
          submitStatus={submitStatus}
          reducedMotion={reducedMotion}
          moveTransition={moveTransition}
          onModePref={setModePref}
          onFinishTutorial={finishTutorial}
          onNextTutorial={nextTutorial}
          onPlay={reset}
        />
      </div>
      <MatchToolbar
        hammers={hammers}
        shuffles={shuffles}
        hammerMode={hammerMode}
        toolHelp={toolHelp}
        hintsOn={hintsOn}
        toolsOff={toolsOff}
        message={message}
        reducedMotion={reducedMotion}
        onToolHelp={setToolHelp}
        onToggleHammer={() => { setToolHelp(null); setHammerMode(!hammerMode); setSelected(null); hapticLight() }}
        onShuffle={() => { setToolHelp(null); void shuffle() }}
        onToggleHints={toggleHints}
        onFinishEarly={finishEarly}
      />
    </main>
  )
}
