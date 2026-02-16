import { Outlet, createFileRoute } from '@tanstack/react-router'
import { requireAuthFn } from '@/server/auth'
import { ErrorView } from '@/components/error-view'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await requireAuthFn()
    return { session }
  },
  errorComponent: AuthedError,
  component: AuthedLayout,
})

function AuthedLayout() {
  return <Outlet />
}

function AuthedError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorView error={error} reset={reset} />
}
