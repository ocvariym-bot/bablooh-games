export const SIZE = 7
export type Special = 'bomb' | 'rocket-h' | 'rocket-v' | 'cross' | null
export type Tile = { id: number; face: number; special: Special }
export type Board = Tile[][]
export type DisplayBoard = (Tile | null)[][]
export type Frame = { board: DisplayBoard; highlighted: number[]; message: string; duration: number }
export type Result = { board: Board; score: number; combo: number; created: Special; blasts: number; shuffled: boolean; frames: Frame[] }
type Run = { cells: [number, number][] }
let nextId = 0
/** How many face types new tiles can spawn (4 early, 5 mid/late). */
let spawnFaceCount = 4
export const FACE_COUNT_MAX = 5
export function getSpawnFaceCount() {
  return spawnFaceCount
}
export function setSpawnFaceCount(n: number) {
  spawnFaceCount = Math.max(4, Math.min(FACE_COUNT_MAX, Math.floor(n)))
}
export function resetSpawnFaceCount() {
  spawnFaceCount = 4
}
const tile = (): Tile => ({
  id: ++nextId,
  face: Math.floor(Math.random() * spawnFaceCount),
  special: null,
})
const copy = (b: Board): Board => b.map(row => row.map(t => ({ ...t })))
const snapshot = (b: DisplayBoard): DisplayBoard => b.map(row => row.map(t => (t ? { ...t } : null)))

const isHorizontal = (run: Run) => run.cells.every(([r]) => r === run.cells[0][0])

export function runs(board: Board): Run[] {
  const result: Run[] = []
  for (let axis = 0; axis < 2; axis++)
    for (let line = 0; line < SIZE; line++) {
      let start = 0
      const at = (i: number): [number, number] => (axis === 0 ? [line, i] : [i, line])
      while (start < SIZE) {
        let end = start + 1
        const [r, c] = at(start)
        while (end < SIZE) {
          const [rr, cc] = at(end)
          if (board[rr][cc].face !== board[r][c].face) break
          end++
        }
        if (end - start >= 3)
          result.push({ cells: Array.from({ length: end - start }, (_, i) => at(start + i)) })
        start = end
      }
    }
  return result
}

function swap(b: Board, a: [number, number], z: [number, number]) {
  const tmp = b[a[0]][a[1]]
  b[a[0]][a[1]] = b[z[0]][z[1]]
  b[z[0]][z[1]] = tmp
}
export function swapBoard(board: Board, a: [number, number], b: [number, number]) {
  const next = copy(board)
  swap(next, a, b)
  return next
}
export function hasMoves(board: Board): boolean {
  return findHint(board) !== null
}

/** First valid swap, or a special to tap. */
export function findHint(
  board: Board,
): [[number, number], [number, number]] | null {
  const b = copy(board)
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
      ]) {
        if (r + dr >= SIZE || c + dc >= SIZE) continue
        swap(b, [r, c], [r + dr, c + dc])
        const yes = runs(b).length > 0
        swap(b, [r, c], [r + dr, c + dc])
        if (yes) return [
          [r, c],
          [r + dr, c + dc],
        ]
      }
    }
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c].special) return [
        [r, c],
        [r, c],
      ]
    }
  return null
}
export function freshBoard(): Board {
  let board: Board
  do {
    board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, tile))
    for (let r = 0; r < SIZE; r++)
      for (let c = 0; c < SIZE; c++) {
        while (
          (c >= 2 &&
            board[r][c].face === board[r][c - 1].face &&
            board[r][c].face === board[r][c - 2].face) ||
          (r >= 2 &&
            board[r][c].face === board[r - 1][c].face &&
            board[r][c].face === board[r - 2][c].face)
        )
          board[r][c] = tile()
      }
  } while (!hasMoves(board))
  return board
}
export function shuffleBoard(board: Board): Board {
  const tiles = board.flat().map(t => ({ ...t }))
  for (let tries = 0; tries < 2000; tries++) {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[tiles[i], tiles[j]] = [tiles[j], tiles[i]]
    }
    const candidate = Array.from({ length: SIZE }, (_, r) => tiles.slice(r * SIZE, (r + 1) * SIZE))
    if (!runs(candidate).length && hasMoves(candidate)) return candidate
  }
  return freshBoard()
}

function findCrossCell(found: Run[], preferred?: [number, number]): [number, number] | null {
  const hCells = new Set<string>()
  const vCells = new Set<string>()
  for (const run of found) {
    const bucket = isHorizontal(run) ? hCells : vCells
    for (const [r, c] of run.cells) bucket.add(`${r},${c}`)
  }
  if (preferred) {
    const key = `${preferred[0]},${preferred[1]}`
    if (hCells.has(key) && vCells.has(key)) return preferred
  }
  for (const key of hCells) {
    if (!vCells.has(key)) continue
    const [r, c] = key.split(',').map(Number)
    return [r, c]
  }
  return null
}

function expand(board: Board, positions: Set<string>) {
  const queue = [...positions]
  const triggered = new Set<Exclude<Special, null>>()
  for (let i = 0; i < queue.length; i++) {
    const [r, c] = queue[i].split(',').map(Number)
    const special = board[r][c].special
    const add = (rr: number, cc: number) => {
      const k = `${rr},${cc}`
      if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && !positions.has(k)) {
        positions.add(k)
        queue.push(k)
      }
    }
    if (special) triggered.add(special)
    if (special === 'bomb')
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) add(r + dr, c + dc)
    if (special === 'rocket-h') for (let cc = 0; cc < SIZE; cc++) add(r, cc)
    if (special === 'rocket-v') for (let rr = 0; rr < SIZE; rr++) add(rr, c)
    if (special === 'cross') {
      for (let cc = 0; cc < SIZE; cc++) add(r, cc)
      for (let rr = 0; rr < SIZE; rr++) add(rr, c)
    }
  }
  return triggered
}

function effectMessage(effects: Set<Exclude<Special, null>>, fallback: string) {
  if (effects.has('cross')) return 'Крест очищает ряд и столбец!'
  if (effects.has('rocket-h') && effects.has('rocket-v')) return 'Ракеты по строке и столбцу!'
  if (effects.has('bomb') && (effects.has('rocket-h') || effects.has('rocket-v')))
    return 'Бомба и ракета!'
  if (effects.has('bomb')) return 'Бомба взрывает соседние карточки!'
  if (effects.has('rocket-h')) return 'Ракета очищает строку!'
  if (effects.has('rocket-v')) return 'Ракета очищает столбец!'
  return fallback
}

function createdMessage(special: Special) {
  if (special === 'cross') return 'T/L-фигура — появился крест!'
  if (special === 'bomb') return 'Четыре в ряд — появилась бомба!'
  if (special === 'rocket-h') return 'Пять в ряд — ракета по строке!'
  if (special === 'rocket-v') return 'Пять в ряд — ракета по столбцу!'
  return null
}

function clear(board: Board, positions: Set<string>, frames: Frame[], message: string): number {
  const ids = [...positions].map(key => {
    const [r, c] = key.split(',').map(Number)
    return board[r][c].id
  })
  frames.push({ board: snapshot(board), highlighted: ids, message, duration: 380 })
  const empty: DisplayBoard = board.map((row, r) =>
    row.map((t, c) => (positions.has(`${r},${c}`) ? null : { ...t })),
  )
  frames.push({ board: empty, highlighted: [], message, duration: 260 })
  for (let c = 0; c < SIZE; c++) {
    const kept: Tile[] = []
    for (let r = SIZE - 1; r >= 0; r--) if (!positions.has(`${r},${c}`)) kept.push(board[r][c])
    while (kept.length < SIZE) kept.push(tile())
    for (let r = SIZE - 1; r >= 0; r--) board[r][c] = kept[SIZE - 1 - r]
  }
  frames.push({ board: snapshot(board), highlighted: [], message, duration: 340 })
  return positions.size
}

export function settle(
  board: Board,
  preferred?: [number, number],
  initial?: Set<string>,
  frames: Frame[] = [],
): Result {
  let score = 0
  let combo = 0
  let created: Special = null
  let blasts = 0
  if (initial) {
    const effects = expand(board, initial)
    if (effects.size) blasts++
    const text = effectMessage(effects, 'Молоток убирает карточку!')
    score += clear(board, initial, frames, text) * 10
  }
  for (let round = 0; round < 80; round++) {
    const found = runs(board)
    if (!found.length) break
    combo++
    const marked = new Set<string>()
    for (const run of found) for (const [r, c] of run.cells) marked.add(`${r},${c}`)
    const longest = found.reduce((a, b) => (b.cells.length > a.cells.length ? b : a))
    const crossCell = findCrossCell(found, preferred)
    let newSpecial: Special = null
    let placeAt: [number, number] | null = null

    if (crossCell && !board[crossCell[0]][crossCell[1]].special) {
      newSpecial = 'cross'
      placeAt = crossCell
    } else if (longest.cells.length >= 4) {
      const prefer = preferred
      const pos =
        prefer && longest.cells.some(([r, c]) => r === prefer[0] && c === prefer[1])
          ? prefer
          : longest.cells[Math.floor(longest.cells.length / 2)]
      if (!board[pos[0]][pos[1]].special) {
        newSpecial =
          longest.cells.length >= 5 ? (isHorizontal(longest) ? 'rocket-h' : 'rocket-v') : 'bomb'
        placeAt = pos
      }
    }

    if (newSpecial && placeAt) {
      const [r, c] = placeAt
      marked.delete(`${r},${c}`)
      board[r][c] = { ...board[r][c], special: newSpecial }
      created = newSpecial
    }

    const effects = expand(board, marked)
    if (effects.size) blasts++
    const text =
      effectMessage(effects, '') ||
      createdMessage(newSpecial) ||
      (combo > 1 ? `Комбо ×${combo}!` : 'Отлично! Совпадение ✨')
    score += clear(board, marked, frames, text) * 10 * combo
    preferred = undefined
  }
  let shuffled = false
  if (runs(board).length || !hasMoves(board)) {
    board = shuffleBoard(board)
    shuffled = true
    frames.push({
      board: snapshot(board),
      highlighted: [],
      message: 'Нет ходов — поле перемешано!',
      duration: 450,
    })
  }
  return { board, score, combo, created, blasts, shuffled, frames }
}
export function trySwap(board: Board, a: [number, number], b: [number, number]) {
  if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return null
  const next = swapBoard(board, a, b)
  if (!runs(next).length) return null
  const frames: Frame[] = [
    { board: snapshot(next), highlighted: [], message: 'Меняем карточки…', duration: 260 },
  ]
  return settle(next, b, undefined, frames)
}
export function hammer(board: Board, r: number, c: number) {
  return settle(copy(board), undefined, new Set([`${r},${c}`]))
}

/** Tap a bomb/rocket/cross to detonate it immediately (costs a move in the UI). */
export function activateSpecial(board: Board, r: number, c: number): Result | null {
  if (!board[r]?.[c]?.special) return null
  return settle(copy(board), undefined, new Set([`${r},${c}`]))
}
