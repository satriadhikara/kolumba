import { Outlet, createFileRoute } from '@tanstack/react-router'
import { getEmailsFn, getMailboxesFn } from '@/server/jmap'
import { MessageList } from '@/components/mail/message-list'

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
