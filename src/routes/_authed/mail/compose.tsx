import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getIdentitiesFn, getEmailFn } from '@/server/jmap'
import { Compose } from '@/components/mail/compose'
import type { Email } from '@/lib/jmap/types'

type ComposeSearch = {
  replyTo?: string
  replyAll?: boolean
  forward?: string
}

export const Route = createFileRoute('/_authed/mail/compose')({
  validateSearch: (search: Record<string, unknown>): ComposeSearch => ({
    replyTo: search.replyTo as string | undefined,
    replyAll: search.replyAll === true || search.replyAll === 'true',
    forward: search.forward as string | undefined,
  }),

  loaderDeps: ({ search }) => ({
    replyTo: search.replyTo,
    replyAll: search.replyAll,
    forward: search.forward,
  }),

  loader: async ({ deps }) => {
    const identities = await getIdentitiesFn()

    let originalEmail: Email | null = null

    // Load original email for reply/forward
    if (deps.replyTo) {
      originalEmail = await getEmailFn({ data: { emailId: deps.replyTo } })
    } else if (deps.forward) {
      originalEmail = await getEmailFn({ data: { emailId: deps.forward } })
    }

    return {
      identities,
      originalEmail,
      mode: deps.replyTo
        ? deps.replyAll
          ? 'replyAll'
          : 'reply'
        : deps.forward
          ? 'forward'
          : 'new',
    }
  },
  component: ComposeRoute,
})

function ComposeRoute() {
  const navigate = useNavigate()
  const { identities, originalEmail, mode } = Route.useLoaderData()

  const handleClose = () => {
    navigate({ to: '/mail/$mailboxId', params: { mailboxId: 'inbox' } })
  }

  return (
    <Compose
      identities={identities}
      originalEmail={originalEmail}
      mode={mode as 'new' | 'reply' | 'replyAll' | 'forward'}
      onClose={handleClose}
    />
  )
}
