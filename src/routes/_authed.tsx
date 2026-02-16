import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { SessionData } from '@/server/session'
import { requireAuthFn } from '@/server/auth'

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
