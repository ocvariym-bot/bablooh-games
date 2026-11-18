import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { freshBoard, hammer, shuffleBoard, swapBoard, trySwap, type Board, type DisplayBoard, type Frame, type Result } from './engine'
import { hapticLight, hapticSelect } from '../../lib/telegram'
import { submitScore } from '../../lib/leaderboard'
import './match.css'

const faces = ['person1', 'person2', 'donkey', 'person3']
const labels = ['лицо 1', 'лицо 2', 'ослик', 'лицо 3']
const BEST_KEY = 'babloohMatchBest'
type Pos = [number, number]
function readBest() { try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 } }

export function MatchGame() {
  const [board, setBoard] = useState<Board>(freshBoard)
  const [display, setDisplay] = useState<DisplayBoard>(board)
  const [highlighted, setHighlighted] = useState<number[]>([])
  const [selected, setSelected] = useState<Pos | null>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const [moves, setMoves] = useState(30)
  const [hammers, setHammers] = useState(2)
  const [shuffles, setShuffles] = useState(2)
  const [hammerMode, setHammerMode] = useState(false)
  const [message, setMessage] = useState('Собери три одинаковых лица в ряд')
  const [started, setStarted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'sending' | 'sent' | 'failed' | 'telegram-only' | null>(null)
  const busyRef = useRef(false)
  const generation = useRef(0)
  const submissionId = useRef(0)
  const pointer = useRef<{ x: number; y: number; r: number; c: number } | null>(null)
  const skipClick = useRef(false)
  const reducedMotion = useReducedMotion()
  useEffect(() => () => { generation.current++ }, [])
  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, reducedMotion ? 25 : ms))
  const playFrames = async (frames: Frame[], token: number) => {
    for (const frame of frames) {
      if (token !== generation.current) return false
      setDisplay(frame.board); setHighlighted(frame.highlighted); setMessage(frame.message)
      await delay(frame.duration)
    }
    return token === generation.current
  }
  const begin = () => { busyRef.current = true; setBusy(true); setSelected(null) }
  const finish = () => { busyRef.current = false; setBusy(false); setHighlighted([]) }
  const apply = async (result: Result, move: boolean) => {
    begin(); hapticSelect()
    const token = generation.current
    if (!(await playFrames(result.frames, token))) return
    setBoard(result.board); setDisplay(result.board)
    const nextScore = score + result.score
    setScore(nextScore)
    if (nextScore > best) { setBest(nextScore); try { localStorage.setItem(BEST_KEY, String(nextScore)) } catch { /* storage unavailable */ } }
    if (move) setMoves(m => m - 1)
    if (move && moves === 1) {
      if (!window.Telegram?.WebApp?.initData) setSubmitStatus('telegram-only')
      else {
        setSubmitStatus('sending')
        const submission = ++submissionId.current
        void submitScore('match', nextScore).then(ok => {
          if (token === generation.current && submission === submissionId.current) setSubmitStatus(ok ? 'sent' : 'failed')
        })
      }
    }
    if (result.shuffled) setMessage('Нет ходов — поле перемешано!')
    else if (result.combo > 1) setMessage(`Комбо ×${result.combo} · +${result.score} очков`)
    else setMessage(`+${result.score} очков`)
    finish()
  }
  const attempt = async (a: Pos, b: Pos) => {
    if (busyRef.current || Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]) !== 1) return
    const result = trySwap(board, a, b)
    if (result) { void apply(result, true); return }
    begin()
    const token = generation.current
    const frames: Frame[] = [
      {board:swapBoard(board,a,b),highlighted:[],message:'Проверяем ход…',duration:260},
      {board,highlighted:[],message:'Нужен ряд из трёх — попробуй ещё!',duration:300},
    ]
    if (await playFrames(frames, token)) finish()
  }
  const choose = (r: number, c: number) => {
    if (!started || moves <= 0 || busyRef.current) return
    if (hammerMode) { setHammers(n => n-1); setHammerMode(false); void apply(hammer(board,r,c),false); return }
    if (!selected) { setSelected([r,c]); hapticLight(); return }
    if (selected[0] === r && selected[1] === c) { setSelected(null); return }
    if (Math.abs(selected[0]-r)+Math.abs(selected[1]-c)!==1) { setSelected([r,c]); hapticLight(); return }
    void attempt(selected,[r,c])
  }
  const swipe = (a: Pos, b: Pos) => {
    if (!started || moves <= 0 || hammerMode || busyRef.current) return
    if (b[0]<0 || b[0]>=7 || b[1]<0 || b[1]>=7) return
    void attempt(a,b)
  }
  const shuffle = async () => {
    if (busyRef.current || !shuffles) return
    begin(); setHammerMode(false); setShuffles(n=>n-1); hapticLight()
    const token=generation.current, next=shuffleBoard(board)
    if (await playFrames([{board:next, highlighted:[], message:'Перемешиваем карточки 🔀',duration:550}],token)) {
      setBoard(next); setDisplay(next); setMessage('Поле перемешано!'); finish()
    }
  }
  const reset = () => {
    if (busyRef.current) return
    submissionId.current++; setSubmitStatus(null)
    const next=freshBoard(); setBoard(next); setDisplay(next); setHighlighted([]); setScore(0); setMoves(30); setHammers(2); setShuffles(2); setSelected(null); setHammerMode(false); setMessage('Собери три одинаковых лица в ряд'); setStarted(true); hapticLight()
  }
  const moveTransition = reducedMotion ? {duration:0} : {type:'spring' as const, stiffness:360, damping:32, mass:0.7}
  return <main className="match-page">
    <div className="match-heading"><span className="match-kicker">НОВАЯ ИГРА • 3 В РЯД</span><h1>BABLOOH <span>MATCH</span></h1><p>Знакомые лица. Большие комбинации.</p></div>
    <div className="match-stats" aria-label="Счёт игры">
      {([['ОЧКИ',score],['ХОДЫ',moves],['РЕКОРД',best]] as const).map(([label,value])=><div key={label}><span>{label}</span><motion.strong key={value} initial={reducedMotion?false:{scale:1.18,color:'#ff9fdd'}} animate={{scale:1,color:'#ffffff'}} transition={{duration:.3}}>{value.toLocaleString('ru-RU')}</motion.strong></div>)}
    </div>
    <div className="match-stage">
      <div className="match-board" role="grid" aria-label="Игровое поле 7 на 7" aria-busy={busy}>
        <AnimatePresence initial={false}>
          {display.flatMap((row,r)=>row.map((t,c)=>t && <motion.button key={t.id} layout type="button" role="gridcell" style={{gridRow:r+1,gridColumn:c+1}} className={`match-tile face-${t.face}${selected?.[0]===r&&selected[1]===c?' selected':''}${hammerMode?' hammer-target':''}${highlighted.includes(t.id)?' clearing':''}`} aria-label={`Ряд ${r+1}, столбец ${c+1}: ${labels[t.face]}${t.special === 'bomb' ? ', бомба' : t.special === 'rocket' ? ', ракета' : ''}`} aria-selected={selected?.[0]===r&&selected[1]===c} aria-disabled={busy} initial={reducedMotion?false:{opacity:0,scale:.65,y:-14}} animate={{opacity:1,y:0,scale:highlighted.includes(t.id)?1.08:selected?.[0]===r&&selected[1]===c?.92:1,filter:highlighted.includes(t.id)?'brightness(1.35)':'brightness(1)'}} exit={reducedMotion?{opacity:0}:{opacity:0,scale:.25,rotate:12}} transition={{layout:moveTransition,opacity:{duration:reducedMotion?0:.22},scale:{duration:reducedMotion?0:.2},filter:{duration:reducedMotion?0:.18},rotate:{duration:reducedMotion?0:.22}}} whileHover={!busy && !reducedMotion?{scale:1.05}:undefined} whileTap={!busy && !reducedMotion?{scale:.9}:undefined}
            onPointerDown={e=>{pointer.current={x:e.clientX,y:e.clientY,r,c}}} onPointerUp={e=>{const p=pointer.current;pointer.current=null;if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;if(Math.hypot(dx,dy)>18){skipClick.current=true;swipe([p.r,p.c],Math.abs(dx)>Math.abs(dy)?[p.r,p.c+(dx>0?1:-1)]:[p.r+(dy>0?1:-1),p.c]);setTimeout(()=>{skipClick.current=false},100)}}} onPointerCancel={()=>{pointer.current=null}} onClick={()=>{if(skipClick.current){skipClick.current=false;return}choose(r,c)}}>
            <img src={`/games/match/${faces[t.face]}.webp`} alt="" draggable={false}/><AnimatePresence>{t.special && <motion.span key={t.special} className="match-special" aria-hidden="true" initial={reducedMotion?false:{scale:0,rotate:-30}} animate={{scale:highlighted.includes(t.id)?1.3:1,rotate:0}} exit={{scale:0}} transition={{type:'spring',stiffness:400,damping:19}}>{t.special==='bomb'?'💣':'🚀'}</motion.span>}</AnimatePresence>
          </motion.button>))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {(!started || (started && moves<=0 && !busy)) && <motion.div className="match-overlay" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reducedMotion?0:.22}}><motion.div className="match-modal" initial={reducedMotion?false:{opacity:0,scale:.9,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.95}} transition={moveTransition}><span className="match-modal-icon">{started?'🏆':'✨'}</span>{started?<><h2>Отличная игра!</h2><p>Твой результат: <b>{score.toLocaleString('ru-RU')}</b> очков.<br/>Рекорд: {best.toLocaleString('ru-RU')}</p><p className="match-submit-status" aria-live="polite">{submitStatus==='sending'?'Отправляем результат в рейтинг…':submitStatus==='sent'?'Результат отправлен в общий рейтинг ✓':submitStatus==='failed'?'Не удалось отправить результат. Рекорд сохранён на устройстве.':submitStatus==='telegram-only'?'Для общего рейтинга открой игру в Telegram.':null}</p></>:<><h2>Собери свою<br/>команду!</h2><p>Меняй соседние лица местами и собирай три или больше в ряд.</p></>}<motion.button whileHover={reducedMotion?undefined:{scale:1.04}} whileTap={reducedMotion?undefined:{scale:.96}} onClick={reset}>{started?'Ещё раз':'Играть'} <span>→</span></motion.button></motion.div></motion.div>}
      </AnimatePresence>
    </div>
    <p className="match-message" aria-live="polite"><motion.span key={hammerMode?'hammer':message} initial={reducedMotion?false:{opacity:0,y:5}} animate={{opacity:1,y:0}} transition={{duration:.2}}>{hammerMode?'Выбери лицо, чтобы убрать его 🔨':message}</motion.span></p>
    <div className="match-tools"><motion.button whileHover={reducedMotion?undefined:{scale:1.02}} whileTap={reducedMotion?undefined:{scale:.96}} disabled={!started || moves<=0 || !hammers || busy} className={hammerMode?'active':''} onClick={()=>{setHammerMode(!hammerMode);setSelected(null);hapticLight()}}><motion.span animate={hammerMode && !reducedMotion?{rotate:[0,-18,12,0]}:{rotate:0}} transition={{duration:.45}}>🔨</motion.span><b>Молоток</b><small>{hammers} осталось</small></motion.button><motion.button whileHover={reducedMotion?undefined:{scale:1.02}} whileTap={reducedMotion?undefined:{scale:.96}} disabled={!started || moves<=0 || !shuffles || busy} onClick={()=>void shuffle()}><span>🔀</span><b>Перемешать</b><small>{shuffles} осталось</small></motion.button></div>
    <p className="match-help">4 в ряд — 💣 бомба 3×3 · 5 в ряд — 🚀 ракета по строке<br/>Соедини бонус в ряд, чтобы его активировать.</p>
  </main>
}
