import { MessageListItem } from './message-list-item'
import type { EmailListItem } from '@/lib/jmap/types'

interface MessageListProps {
  emails: Array<EmailListItem>
}

export function MessageList({ emails }: MessageListProps) {
  if (emails.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No emails</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {emails.map((email) => (
        <MessageListItem key={email.id} email={email} />
      ))}
    </div>
  )
}
