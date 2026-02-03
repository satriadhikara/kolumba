import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { requireAuthFn } from '@/server/auth'
import type { SessionData } from '@/server/session'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await requireAuthFn()
    return { session }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  return <Outlet />
}
