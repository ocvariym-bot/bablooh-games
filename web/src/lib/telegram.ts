declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void
        expand: () => void
        setHeaderColor?: (color: string) => void
        setBackgroundColor?: (color: string) => void
        initData?: string
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
