import { Link, useParams } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  StarIcon,
  Delete02Icon,
  Archive02Icon,
  MailOpen01Icon,
  MailIcon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { JMAPKeywords, type EmailListItem } from '@/lib/jmap/types'
import {
  markAsReadFn,
  markAsUnreadFn,
  toggleStarFn,
  deleteEmailFn,
  archiveEmailFn,
} from '@/server/jmap'
import { useRouter } from '@tanstack/react-router'

interface MessageListItemProps {
  email: EmailListItem
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isThisYear = date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (isThisYear) {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getSenderDisplay(from: EmailListItem['from']): string {
  if (!from || from.length === 0) return 'Unknown'
  const sender = from[0]
  return sender.name || sender.email
}

function getInitials(from: EmailListItem['from']): string {
  const name = getSenderDisplay(from)
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function MessageListItem({ email }: MessageListItemProps) {
  const router = useRouter()
  const params = useParams({ from: '/_authed/mail/$mailboxId' })
  const isRead = email.keywords[JMAPKeywords.SEEN]
  const isStarred = email.keywords[JMAPKeywords.FLAGGED]

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleStarFn({ data: { emailId: email.id, starred: !isStarred } })
    router.invalidate()
  }

  const handleToggleRead = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isRead) {
      await markAsUnreadFn({ data: { emailId: email.id } })
    } else {
      await markAsReadFn({ data: { emailId: email.id } })
    }
    router.invalidate()
  }

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await archiveEmailFn({ data: { emailId: email.id } })
    router.invalidate()
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteEmailFn({ data: { emailId: email.id } })
    router.invalidate()
  }

  return (
    <Link
      to="/mail/$mailboxId/$messageId"
      params={{ mailboxId: params.mailboxId, messageId: email.id }}
      className={cn(
        'group relative flex gap-3 px-4 py-3 border-b transition-colors',
        'hover:bg-muted/50',
        !isRead && 'bg-accent/5',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-medium',
          isRead
            ? 'bg-muted text-muted-foreground'
            : 'bg-primary text-primary-foreground',
        )}
      >
        {getInitials(email.from)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn('truncate', !isRead && 'font-semibold')}>
            {getSenderDisplay(email.from)}
          </span>
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {formatDate(email.receivedAt)}
          </span>
        </div>

        <div
          className={cn(
            'truncate text-sm',
            !isRead ? 'text-foreground font-medium' : 'text-foreground',
          )}
        >
          {email.subject || '(No subject)'}
        </div>

        <div className="group-hover:hidden truncate text-sm text-muted-foreground">
          {email.preview}
        </div>

        <div className="hidden group-hover:flex gap-1">
          <button
            onClick={handleToggleStar}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'hover:bg-background',
              isStarred && 'text-yellow-500',
            )}
            title={isStarred ? 'Unstar' : 'Star'}
          >
            <HugeiconsIcon
              icon={StarIcon}
              className={cn('h-4 w-4', isStarred && 'fill-current')}
            />
          </button>

          <button
            onClick={handleToggleRead}
            className="p-1.5 rounded-md hover:bg-background transition-colors"
            title={isRead ? 'Mark as unread' : 'Mark as read'}
          >
            <HugeiconsIcon
              icon={isRead ? MailIcon : MailOpen01Icon}
              className="h-4 w-4"
            />
          </button>

          <button
            onClick={handleArchive}
            className="p-1.5 rounded-md hover:bg-background transition-colors"
            title="Archive"
          >
            <HugeiconsIcon icon={Archive02Icon} className="h-4 w-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 rounded-md hover:bg-background hover:text-destructive transition-colors"
            title="Delete"
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}
