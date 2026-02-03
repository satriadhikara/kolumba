import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionFn } from '@/server/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSessionFn()

    if (session) {
      // Authenticated - redirect to inbox
      throw redirect({ to: '/mail/$mailboxId', params: { mailboxId: 'inbox' } })
    } else {
      // Not authenticated - redirect to login
      throw redirect({ to: '/login' })
    }
  },
  component: () => null,
})
