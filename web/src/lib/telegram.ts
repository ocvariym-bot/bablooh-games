declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void
        expand: () => void
        setHeaderColor?: (color: string) => void
        setBackgroundColor?: (color: string) => void
        initData?: string
        HapticFeedback?: {
          impactOccurred: (
            style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft',
          ) => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (cb: () => void) => void
          offClick?: (cb: () => void) => void
        }
      }
    }
  }
}

export function initTelegram() {
  const tg = window.Telegram?.WebApp
  if (!tg) return null
  tg.ready()
  tg.expand()
  try {
    tg.setHeaderColor?.('#24142d')
    tg.setBackgroundColor?.('#24142d')
  } catch {
    /* ignore */
  }
  return tg
}

export function getTelegram() {
  return window.Telegram?.WebApp ?? null
}

function haptic() {
  return window.Telegram?.WebApp?.HapticFeedback
}

/** Soft tap — UI buttons, menu open */
export function hapticLight() {
  try {
    haptic()?.impactOccurred('light')
  } catch {
    /* ignore */
  }
}

/** Medium — slice hit, food eaten, land */
export function hapticMedium() {
  try {
    haptic()?.impactOccurred('medium')
  } catch {
    /* ignore */
  }
}

/** Heavy — bomb, death, hard fail */
export function hapticHeavy() {
  try {
    haptic()?.impactOccurred('heavy')
  } catch {
    /* ignore */
  }
}

/** Soft thump — spring / trampoline / boost start */
export function hapticSoft() {
  try {
    haptic()?.impactOccurred('soft')
  } catch {
    /* ignore */
  }
}

/** Rigid click — turbo frenzy hit */
export function hapticRigid() {
  try {
    haptic()?.impactOccurred('rigid')
  } catch {
    /* ignore */
  }
}

export function hapticSuccess() {
  try {
    haptic()?.notificationOccurred('success')
  } catch {
    /* ignore */
  }
}

export function hapticError() {
  try {
    haptic()?.notificationOccurred('error')
  } catch {
    /* ignore */
  }
}

export function hapticSelect() {
  try {
    haptic()?.selectionChanged()
  } catch {
    /* ignore */
  }
}
