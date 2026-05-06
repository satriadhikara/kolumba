import { createFileRoute } from '@tanstack/react-router'
import { getEmailFn, getMailboxesFn, markAsReadFn } from '@/server/jmap'
import { MessageView } from '@/components/mail/message-view'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorView } from '@/components/error-view'

export const Route = createFileRoute('/_authed/mail/$mailboxId/$messageId')({
  loader: async ({ params }) => {
    const [email, mailboxes] = await Promise.all([
      getEmailFn({ data: { emailId: params.messageId } }),
      getMailboxesFn(),
    ])

    if (!email) {
      throw new Error('Email not found')
    }

    // Find the current mailbox
    const mailbox = mailboxes.find(
      (m) => m.id === params.mailboxId || m.id === params.mailboxId,
    )
    const isTrash = mailbox?.role === 'trash'

    // Mark as read
    if (!email.keywords['$seen']) {
      await markAsReadFn({ data: { emailId: params.messageId } })
    }

    return { email, isTrash }
  },
  pendingComponent: MessageDetailPending,
  errorComponent: MessageDetailError,
  component: MessageDetailRoute,
})

function MessageDetailRoute() {
  const { email, isTrash } = Route.useLoaderData()

  return <MessageView email={email} isTrash={isTrash} />
}

function MessageDetailPending() {
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar skeleton — floating pill style */}
      <div className="px-4 py-2 shrink-0">
        <div className="flex items-center gap-1 bg-muted/40 rounded-full w-fit px-2 py-1">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-18 rounded-full" />
          <div className="w-px h-5 bg-border/50 mx-1" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Skeleton className="h-8 w-3/4 mb-6" />
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageDetailError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return <ErrorView error={error} reset={reset} />
}
