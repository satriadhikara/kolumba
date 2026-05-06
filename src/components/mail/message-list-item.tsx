import {
  Link,
  useParams,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Archive02Icon,
  Delete02Icon,
  MailIcon,
  MailOpen01Icon,
  StarIcon,
} from '@hugeicons/core-free-icons'
import { toast } from 'sonner'
import type { EmailListItem } from '@/lib/jmap/types'
import { cn } from '@/lib/utils'
import { JMAPKeywords } from '@/lib/jmap/types'
import {
  archiveEmailFn,
  deleteEmailFn,
  markAsReadFn,
  markAsUnreadFn,
  toggleStarFn,
} from '@/server/jmap'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

interface MessageListItemProps {
  email: EmailListItem
  isTrash?: boolean
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
  const sender = from[0]!
  return sender.name || sender.email
}

export function MessageListItem({ email, isTrash }: MessageListItemProps) {
  const router = useRouter()
  const params = useParams({ from: '/_authed/mail/$mailboxId' })
  const currentMessageId = useRouterState({
    select: (state) => {
      const msgMatch = state.matches.find(
        (m) => m.routeId === '/_authed/mail/$mailboxId/$messageId',
      )
      return msgMatch ? msgMatch.params.messageId : undefined
    },
  })
  const isRead = email.keywords[JMAPKeywords.SEEN]
  const isStarred = email.keywords[JMAPKeywords.FLAGGED]
  const isSelected = currentMessageId === email.id

  const senderName = getSenderDisplay(email.from)
  const initials = getInitials(senderName)
  const avatarGradient = getAvatarGradient(senderName)

  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  const handleToggleStar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await toggleStarFn({ data: { emailId: email.id, starred: !isStarred } })
      router.invalidate()
    } catch {
      toast.error('Failed to update star')
    }
  }

  const handleToggleRead = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (isRead) {
        await markAsUnreadFn({ data: { emailId: email.id } })
      } else {
        await markAsReadFn({ data: { emailId: email.id } })
      }
      router.invalidate()
    } catch {
      toast.error('Failed to update read status')
    }
  }

  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await archiveEmailFn({ data: { emailId: email.id } })
      toast.success('Email archived')
      router.invalidate()
    } catch {
      toast.error('Failed to archive email')
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const isCurrentEmail = currentMessageId === email.id

    if (isTrash) {
      confirm({
        title: 'Delete permanently?',
        description:
          'This email will be permanently deleted and cannot be recovered.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
        onConfirm: async () => {
          try {
            await deleteEmailFn({
              data: { emailId: email.id, permanent: true },
            })
            toast.success('Email deleted permanently')
            if (isCurrentEmail) {
              router.navigate({
                to: '/mail/$mailboxId',
                params: { mailboxId: params.mailboxId },
              })
            } else {
              router.invalidate()
            }
          } catch {
            toast.error('Failed to delete email')
          }
        },
      })
    } else {
      try {
        await deleteEmailFn({ data: { emailId: email.id } })
        toast.success('Email moved to trash')
        if (isCurrentEmail) {
          router.navigate({
            to: '/mail/$mailboxId',
            params: { mailboxId: params.mailboxId },
          })
        } else {
          router.invalidate()
        }
      } catch {
        toast.error('Failed to delete email')
      }
    }
  }

  return (
    <>
      <Link
        to="/mail/$mailboxId/$messageId"
        params={{ mailboxId: params.mailboxId, messageId: email.id }}
        className={cn(
          'group relative flex gap-3 px-3 py-3 rounded-lg transition-all',
          'hover:shadow-sm',
          isSelected && 'bg-muted/40 shadow-sm ring-1 ring-border/50',
          !isRead && !isSelected && 'bg-primary/[0.03]',
        )}
      >
        {/* Avatar */}
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-medium text-white"
          style={{ background: avatarGradient }}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('truncate text-[13px]', !isRead && 'font-semibold')}>
              {senderName}
            </span>

            {/* Star - always visible */}
            {!isTrash && (
              <button
                onClick={handleToggleStar}
                className={cn(
                  'shrink-0 p-0.5 rounded transition-colors',
                  isStarred
                    ? 'text-yellow-500'
                    : 'text-muted-foreground/30 hover:text-muted-foreground/60',
                )}
                title={isStarred ? 'Unstar' : 'Star'}
              >
                <HugeiconsIcon
                  icon={StarIcon}
                  className={cn('h-3.5 w-3.5', isStarred && 'fill-current')}
                />
              </button>
            )}

            <span className="ml-auto text-xs text-muted-foreground shrink-0">
              {formatDate(email.receivedAt)}
            </span>
          </div>

          <div
            className={cn(
              'truncate text-[13px]',
              !isRead ? 'text-foreground font-medium' : 'text-foreground',
            )}
          >
            {email.subject || '(No subject)'}
          </div>

          <div className="relative flex items-center">
            <div className="truncate text-xs text-muted-foreground/80 flex-1 group-hover:[mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)]">
              {email.preview}
            </div>

            {/* Actions overlay on hover */}
            <div className="hidden group-hover:flex items-center gap-0.5 absolute right-0 top-0 bottom-0 pl-8 bg-gradient-to-r from-transparent via-muted/60 to-muted rounded-r-lg">
              <button
                onClick={handleToggleRead}
                className="p-1.5 rounded-md hover:bg-background/80 transition-colors"
                title={isRead ? 'Mark as unread' : 'Mark as read'}
              >
                <HugeiconsIcon
                  icon={isRead ? MailIcon : MailOpen01Icon}
                  className="h-4 w-4"
                />
              </button>

              {!isTrash && (
                <button
                  onClick={handleArchive}
                  className="p-1.5 rounded-md hover:bg-background/80 transition-colors"
                  title="Archive"
                >
                  <HugeiconsIcon icon={Archive02Icon} className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={handleDelete}
                className={cn(
                  'p-1.5 rounded-md hover:bg-background/80 transition-colors',
                  isTrash && 'hover:text-destructive',
                )}
                title={isTrash ? 'Delete permanently' : 'Delete'}
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
      <ConfirmDialogComponent />
    </>
  )
}
