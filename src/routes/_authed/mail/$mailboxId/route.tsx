import { Outlet, createFileRoute } from '@tanstack/react-router'
import { getEmailsFn, getMailboxesFn } from '@/server/jmap'
import { MessageList } from '@/components/mail/message-list'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorView } from '@/components/error-view'

export const Route = createFileRoute('/_authed/mail/$mailboxId')({
  loader: async ({ params }) => {
    // Get the parent route's mailboxes
    const mailboxes = await getMailboxesFn()

    // Resolve mailbox ID from param
    let mailboxId = params.mailboxId

    // If "inbox" is used, find the actual inbox mailbox ID
    if (mailboxId === 'inbox') {
      const inbox = mailboxes.find((m) => m.role === 'inbox')
      if (inbox) {
        mailboxId = inbox.id
      }
    }

    // Find the current mailbox
    const mailbox = mailboxes.find(
      (m) => m.id === mailboxId || m.id === params.mailboxId,
    )

    // Fetch emails for this mailbox
    const { emails, total } = await getEmailsFn({
      data: { mailboxId, limit: 50 },
    })

    return {
      mailbox,
      mailboxId,
      emails,
      total,
    }
  },
  pendingComponent: MailboxPending,
  errorComponent: MailboxError,
  component: MailboxRoute,
})

function MailboxRoute() {
  const { mailbox, emails, total } = Route.useLoaderData()
  const isTrash = mailbox?.role === 'trash'

  return (
    <div className="flex flex-1 min-w-0">
      {/* Message list */}
      <div className="w-80 border-r flex flex-col shrink-0 lg:w-96">
        <div className="h-12 border-b flex items-center px-4 shrink-0">
          <h2 className="font-medium truncate">{mailbox?.name || 'Mailbox'}</h2>
          <span className="ml-2 text-sm text-muted-foreground">{total}</span>
        </div>
        <MessageList emails={emails} isTrash={isTrash} />
      </div>

      {/* Message detail (or empty state) */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

function MailboxPending() {
  return (
    <div className="flex flex-1 min-w-0">
      <div className="w-80 border-r flex flex-col shrink-0 lg:w-96">
        <div className="h-12 border-b flex items-center px-4 shrink-0 gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 border-b">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

function MailboxError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-1 min-w-0">
      <div className="w-80 border-r flex flex-col shrink-0 lg:w-96">
        <div className="h-12 border-b flex items-center px-4 shrink-0">
          <Skeleton className="h-5 w-24" />
        </div>
        <ErrorView error={error} reset={reset} />
      </div>
      <div className="flex-1 min-w-0" />
    </div>
  )
}
