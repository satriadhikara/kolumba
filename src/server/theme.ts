import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

const THEME_COOKIE_NAME = 'kolumba-theme'

export type Theme = 'light' | 'dark'

export function getThemeFromCookie(): Theme {
  const cookie = getCookie(THEME_COOKIE_NAME)
  return cookie === 'dark' ? 'dark' : 'light'
}

export const setThemeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { theme: Theme }) => data)
  .handler(({ data }) => {
    setCookie(THEME_COOKIE_NAME, data.theme, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
    return { success: true }
  })
