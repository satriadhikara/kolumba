import { createFileRoute } from '@tanstack/react-router'
import { getEmailFn, getMailboxesFn, markAsReadFn } from '@/server/jmap'
import { MessageView } from '@/components/mail/message-view'

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
  component: MessageDetailRoute,
})

function MessageDetailRoute() {
  const { email, isTrash } = Route.useLoaderData()

  return <MessageView email={email} isTrash={isTrash} />
}
