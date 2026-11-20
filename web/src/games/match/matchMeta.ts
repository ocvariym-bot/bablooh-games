import { faBomb, faBurst, faRocket } from '@fortawesome/free-solid-svg-icons'
import type { Special } from './engine'

export const faces = ['person1', 'person2', 'donkey', 'person3', 'ninja-loss'] as const
export const labels = ['лицо 1', 'лицо 2', 'ослик', 'лицо 3', 'ниндзя'] as const
/** After this many moves left (limited mode), a 5th face starts spawning. */
export const HARD_MOVES_LEFT = 20
/** In endless mode, unlock ninja after this many moves used. */
export const HARD_MOVES_USED = 10
export const START_MOVES = 30
export const START_BOOSTERS = 2
export const BEST_KEY = 'babloohMatchBest'
export const HINTS_KEY = 'babloohMatchHints'
export const MODE_KEY = 'babloohMatchLimited'
export const TUTORIAL_KEY = 'babloohMatchTutorial'

export type Pos = [number, number]
export type SpecialKind = Exclude<Special, null>
export type SubmitStatus = 'sending' | 'sent' | 'failed' | 'telegram-only' | null
export type ToolHelp = 'hammer' | 'shuffle' | null

export function readBest() {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 }
}
export function readHintsOn() {
  try {
    const v = localStorage.getItem(HINTS_KEY)
    if (v === null) return true
    return v === '1'
  } catch {
    return true
  }
}
export function readLimitedPref() {
  try {
    const v = localStorage.getItem(MODE_KEY)
    if (v === null) return true
    return v === '1'
  } catch {
    return true
  }
}
export function readTutorialDone() {
  try { return localStorage.getItem(TUTORIAL_KEY) === '1' } catch { return false }
}
export function specialLabel(s: SpecialKind) {
  if (s === 'bomb') return ', бомба'
  if (s === 'rocket-h') return ', ракета по строке'
  if (s === 'rocket-v') return ', ракета по столбцу'
  return ', крест'
}
export function specialIcon(s: SpecialKind) {
  if (s === 'bomb') return faBomb
  if (s === 'cross') return faBurst
  return faRocket
}
