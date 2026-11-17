
const SUPABASE_URL = 'https://pxjuqmjtlbfhfsullwdu.supabase.co'
const SUPABASE_KEY = 'sb_publishable_rlLNGhYLo8CRwXpaHh5kEw_ozuW1_D0'

export type GameId = 'flappy' | 'eggs' | 'doodle' | 'ninja' | 'snake'

export type LeaderRow = {
  display_name: string
  game_id: string
  best_score: number
}

type SubmitScoreResponse = {
  success?: boolean
  error?: string
}

export async function fetchLeaderboard(
  gameId: GameId,
): Promise<LeaderRow[]> {
  const url =
    `${SUPABASE_URL}/rest/v1/leaderboard` +
    `?select=display_name,game_id,best_score` +
    `&game_id=eq.${encodeURIComponent(gameId)}` +
    `&order=best_score.desc` +
    `&limit=50`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(
      'BABLOOH leaderboard loading failed:',
      gameId,
      response.status,
      errorText,
    )
    throw new Error(`Не удалось загрузить рейтинг: ${response.status}`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    console.error('BABLOOH leaderboard: неверный формат ответа', data)
    throw new Error('Сервер вернул неверный формат рейтинга')
  }

  return data as LeaderRow[]
}

export async function submitScore(
  gameId: GameId,
  score: number,
): Promise<boolean> {
  try {
    const initData = window.Telegram?.WebApp?.initData || ''

    if (!initData) {
      console.warn(
        'BABLOOH: Telegram initData отсутствует. Результат не отправлен.',
      )
      return false
    }

    const safeScore = Math.max(0, Math.floor(Number(score) || 0))

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/submit-score`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({
          initData,
          gameId,
          score: safeScore,
        }),
      },
    )

    const responseText = await response.text()

    if (!response.ok) {
      console.error(
        'BABLOOH score submit failed:',
        gameId,
        response.status,
        responseText,
      )
      return false
    }

    let result: SubmitScoreResponse = {}

    if (responseText) {
      try {
        result = JSON.parse(responseText) as SubmitScoreResponse
      } catch {
        console.error(
          'BABLOOH: сервер вернул некорректный ответ:',
          responseText,
        )
        return false
      }
    }

    if (result.success === false || result.error) {
      console.error('BABLOOH score rejected:', gameId, result)
      return false
    }

    console.log(
      `BABLOOH: результат игры ${gameId} отправлен. Очки: ${safeScore}`,
    )

    return true
  } catch (error) {
    console.error('BABLOOH score submit error:', gameId, error)
    return false
  }
}
