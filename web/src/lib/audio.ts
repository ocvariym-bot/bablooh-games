const STORAGE_MUTE = 'babloohSoundMuted'
const STORAGE_VOL = 'babloohSoundVolume'

export type MusicTrack = 'doodle' | 'ninja' | null

const TRACKS: Record<Exclude<MusicTrack, null>, string> = {
  doodle: '/audio/doodle.mp3',
  ninja: '/audio/ninja.mp3',
}

function loadMuted() {
  return localStorage.getItem(STORAGE_MUTE) === '1'
}

function loadVolume() {
  const v = Number(localStorage.getItem(STORAGE_VOL))
  if (Number.isFinite(v) && v >= 0 && v <= 1) return v
  return 0.55
}

class AudioManager {
  private audio = new Audio()
  private current: MusicTrack = null
  private muted = loadMuted()
  private volume = loadVolume()
  private unlocked = false
  private listeners = new Set<() => void>()

  constructor() {
    this.audio.loop = true
    this.audio.preload = 'auto'
    this.applyGain()
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  private emit() {
    for (const fn of this.listeners) fn()
  }

  getMuted() {
    return this.muted
  }

  getVolume() {
    return this.volume
  }

  getTrack() {
    return this.current
  }

  /** Call from a user gesture so mobile browsers allow playback */
  unlock() {
    this.unlocked = true
    if (!this.muted && this.current) void this.playCurrent()
  }

  setMuted(muted: boolean) {
    this.muted = muted
    localStorage.setItem(STORAGE_MUTE, muted ? '1' : '0')
    this.applyGain()
    if (muted) this.audio.pause()
    else if (this.current) void this.playCurrent()
    this.emit()
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    localStorage.setItem(STORAGE_VOL, String(this.volume))
    if (this.volume <= 0.001) this.setMuted(true)
    else if (this.muted) this.setMuted(false)
    else this.applyGain()
    this.emit()
  }

  setTrack(track: MusicTrack) {
    if (track === this.current) {
      if (!this.muted && this.unlocked && this.audio.paused) void this.playCurrent()
      return
    }
    this.current = track
    this.audio.pause()
    if (!track) {
      this.audio.removeAttribute('src')
      this.audio.load()
      this.emit()
      return
    }
    this.audio.src = TRACKS[track]
    this.audio.loop = true
    this.audio.currentTime = 0
    this.applyGain()
    if (!this.muted && this.unlocked) void this.playCurrent()
    this.emit()
  }

  private applyGain() {
    this.audio.volume = this.muted ? 0 : this.volume
  }

  private async playCurrent() {
    if (!this.current || this.muted) return
    try {
      this.applyGain()
      await this.audio.play()
    } catch {
      /* autoplay blocked until unlock */
    }
  }
}

export const audioManager = new AudioManager()

export function musicForView(view: {
  kind: string
  gameId?: string
}): MusicTrack {
  if (view.kind === 'ninja') return 'ninja'
  if (view.kind === 'iframe' && view.gameId === 'doodle') return 'doodle'
  return null
}
