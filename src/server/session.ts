/**
 * Session Management
 * Handles secure HTTP-only cookie sessions for JMAP authentication
 */

import { useSession } from '@tanstack/react-start/server'

/**
 * Session data stored in HTTP-only cookie
 * Credentials never reach the browser
 */
export type SessionData = {
  /** The base JMAP server URL (e.g., https://mail.example.com) */
  jmapUrl: string
  /** The JMAP API endpoint from session discovery */
  jmapApiUrl: string
  /** The primary mail account ID */
  accountId: string
  /** Base64 encoded credentials for Basic auth */
  accessToken: string
  /** Username for display purposes */
  username: string
}

const SESSION_SECRET = process.env.SESSION_SECRET

if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  console.warn(
    'Warning: SESSION_SECRET should be at least 32 characters for security',
  )
}

/**
 * Get the application session
 * Session data is stored server-side in an encrypted HTTP-only cookie
 */
export function useAppSession() {
  return useSession<SessionData>({
    name: 'kolumba-session',
    password: SESSION_SECRET || 'development-secret-change-in-production!!',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  })
}

/**
 * Check if session has valid authentication data
 */
export function isSessionValid(
  data: Partial<SessionData>,
): data is SessionData {
  return !!(
    data.jmapUrl &&
    data.jmapApiUrl &&
    data.accountId &&
    data.accessToken &&
    data.username
  )
}
