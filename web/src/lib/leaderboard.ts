const SUPABASE_URL = 'https://pxjuqmjtlbfhfsullwdu.supabase.co'
const SUPABASE_KEY = 'sb_publishable_rlLNGhYLo8CRwXpaHh5kEw_ozuW1_D0'

export type GameId = 'flappy' | 'eggs' | 'doodle' | 'ninja' | 'snake'

export type LeaderRow = {
  display_name: string
  game_id: string
  best_score: number
}

export async function fetchLeaderboard(gameId: GameId): Promise<LeaderRow[]> {
  const url = `${SUPABASE_URL}/rest/v1/leaderboard?select=display_name,game_id,best_score&game_id=eq.${encodeURIComponent(gameId)}&order=best_score.desc&limit=50`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function submitScore(gameId: GameId, score: number) {
  try {
    const initData = window.Telegram?.WebApp?.initData || ''
    if (!initData) {
      console.warn('Telegram initData отсутствует: результат не отправлен')
      return false
    }
    const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({
        initData,
        gameId,
        score: Math.max(0, Math.floor(score)),
      }),
    })
    const text = await response.text()
    if (!response.ok) {
      console.error('BABLOOH score submit failed:', gameId, response.status, text)
      return false
    }
    return true
  } catch (error) {
    console.error('BABLOOH score submit error:', gameId, error)
    return false
  }
}
