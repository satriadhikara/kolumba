/**
 * Authentication Server Functions
 * Handles login, logout, and session retrieval
 */

import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { useAppSession, isSessionValid, type SessionData } from './session'
import { discoverJMAPSession, JMAPClientError } from '@/lib/jmap/client'

/**
 * Login to JMAP server
 * Validates credentials by fetching JMAP session, then stores session data
 */
export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { jmapUrl: string; username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { jmapUrl, username, password } = data

    // Create Basic auth token
    const accessToken = btoa(`${username}:${password}`)

    try {
      // Discover JMAP session (validates credentials)
      const { session, apiUrl, accountId } = await discoverJMAPSession(
        jmapUrl,
        accessToken
      )

      // Store session data in secure cookie
      const appSession = await useAppSession()
      await appSession.update({
        jmapUrl,
        jmapApiUrl: apiUrl,
        accountId,
        accessToken,
        username: session.username || username,
      })

      return { success: true }
    } catch (error) {
      if (error instanceof JMAPClientError) {
        if (error.type === 'unauthorized') {
          return { error: 'Invalid username or password' }
        }
        return { error: error.description || error.type }
      }

      console.error('Login error:', error)
      return { error: 'Failed to connect to mail server' }
    }
  })

/**
 * Logout - clear session
 */
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  throw redirect({ to: '/login' })
})

/**
 * Get current session data
 * Returns null if not authenticated
 */
export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionData | null> => {
    const session = await useAppSession()

    if (!isSessionValid(session.data)) {
      return null
    }

    return session.data
  }
)

/**
 * Check if user is authenticated
 * Used in route beforeLoad to protect routes
 */
export const requireAuthFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SessionData> => {
    const session = await useAppSession()

    if (!isSessionValid(session.data)) {
      throw redirect({ to: '/login' })
    }

    return session.data
  }
)
