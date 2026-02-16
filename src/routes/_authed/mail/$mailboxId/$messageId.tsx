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
      {/* Toolbar skeleton */}
      <div className="h-12 border-b flex items-center gap-1 px-4 shrink-0">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-16 ml-2" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <div className="flex-1" />
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-6" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
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
