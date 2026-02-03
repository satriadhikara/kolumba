import { Link, useParams } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InboxIcon,
  MailSend01Icon,
  Edit01Icon,
  Delete02Icon,
  Cancel01Icon,
  Archive02Icon,
  StarIcon,
  FolderIcon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import type { Mailbox, MailboxRole } from '@/lib/jmap/types'

interface MailboxListProps {
  mailboxes: Mailbox[]
}

const roleIcons: Record<string, typeof InboxIcon> = {
  inbox: InboxIcon,
  sent: MailSend01Icon,
  drafts: Edit01Icon,
  trash: Delete02Icon,
  junk: Cancel01Icon,
  archive: Archive02Icon,
  flagged: StarIcon,
}

const roleOrder: string[] = [
  'inbox',
  'drafts',
  'sent',
  'archive',
  'junk',
  'trash',
]

export function MailboxList({ mailboxes }: MailboxListProps) {
  const params = useParams({ from: '/_authed/mail/$mailboxId' })
  const currentMailboxId = params.mailboxId

  // Sort mailboxes: standard roles first (in order), then custom folders alphabetically
  const sortedMailboxes = [...mailboxes].sort((a, b) => {
    const aRoleIndex = a.role ? roleOrder.indexOf(a.role) : -1
    const bRoleIndex = b.role ? roleOrder.indexOf(b.role) : -1

    if (aRoleIndex >= 0 && bRoleIndex >= 0) {
      return aRoleIndex - bRoleIndex
    }
    if (aRoleIndex >= 0) return -1
    if (bRoleIndex >= 0) return 1
    return a.name.localeCompare(b.name)
  })

  // Find the inbox mailbox ID for the "inbox" route
  const inboxMailbox = mailboxes.find((m) => m.role === 'inbox')

  return (
    <nav className="flex-1 overflow-y-auto py-2">
      <ul className="space-y-0.5 px-2">
        {sortedMailboxes.map((mailbox) => {
          const Icon = mailbox.role ? roleIcons[mailbox.role] : FolderIcon
          // Use role as the route param for standard folders, ID for custom
          const mailboxParam =
            mailbox.role === 'inbox' ? 'inbox' : mailbox.id
          const isActive =
            currentMailboxId === mailboxParam ||
            (currentMailboxId === 'inbox' && mailbox.role === 'inbox') ||
            currentMailboxId === mailbox.id

          return (
            <li key={mailbox.id}>
              <Link
                to="/mail/$mailboxId"
                params={{ mailboxId: mailboxParam }}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  'hover:bg-accent/50',
                  isActive && 'bg-accent text-accent-foreground font-medium'
                )}
              >
                <HugeiconsIcon
                  icon={Icon || FolderIcon}
                  className="h-4 w-4 shrink-0"
                />
                <span className="flex-1 truncate">{mailbox.name}</span>
                {mailbox.unreadEmails > 0 && (
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      isActive
                        ? 'text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {mailbox.unreadEmails}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
