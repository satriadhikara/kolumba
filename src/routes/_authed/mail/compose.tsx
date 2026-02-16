import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Email } from '@/lib/jmap/types'
import { getEmailFn, getIdentitiesFn } from '@/server/jmap'
import { Compose } from '@/components/mail/compose'

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

  loaderDeps: ({ search }: { search: ComposeSearch }) => search,

  loader: async ({ deps }: { deps: ComposeSearch }) => {
    const identities = await getIdentitiesFn()

    let originalEmail: Email | null = null

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
  errorComponent: ({ error }) => {
    console.error('Compose route error:', error)
    return (
      <div className="p-4">
        <h2>Error loading compose</h2>
        <p>{error?.message || String(error)}</p>
      </div>
    )
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
