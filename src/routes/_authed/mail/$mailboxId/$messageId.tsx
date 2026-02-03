import { createFileRoute } from '@tanstack/react-router'
import { getEmailFn, markAsReadFn } from '@/server/jmap'
import { MessageView } from '@/components/mail/message-view'

export const Route = createFileRoute('/_authed/mail/$mailboxId/$messageId')({
  loader: async ({ params }) => {
    const email = await getEmailFn({ data: { emailId: params.messageId } })

    if (!email) {
      throw new Error('Email not found')
    }

    // Mark as read
    if (!email.keywords['$seen']) {
      await markAsReadFn({ data: { emailId: params.messageId } })
    }

    return { email }
  },
  component: MessageDetailRoute,
})

function MessageDetailRoute() {
  const { email } = Route.useLoaderData()

  return <MessageView email={email} />
}
