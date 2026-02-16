import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { Email } from '@/lib/jmap/types'
import { getEmailFn, getIdentitiesFn } from '@/server/jmap'
import { Compose } from '@/components/mail/compose'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorView } from '@/components/error-view'

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
  pendingComponent: ComposePending,
  errorComponent: ComposeError,
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

function ComposePending() {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b flex items-center px-4 shrink-0 gap-2">
        <Skeleton className="h-8 w-16" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8" />
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* To field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* CC/BCC */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Editor */}
          <div className="space-y-2 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function ComposeError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorView error={error} reset={reset} />
}
