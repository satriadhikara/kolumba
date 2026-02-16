import { Link, useParams, useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Archive02Icon,
  ArrowLeft01Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  AttachmentIcon,
  Delete02Icon,
  StarIcon,
} from '@hugeicons/core-free-icons'
import { useEffect, useState } from 'react'
import type { Email } from '@/lib/jmap/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { JMAPKeywords } from '@/lib/jmap/types'
import { archiveEmailFn, deleteEmailFn, toggleStarFn } from '@/server/jmap'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'

interface MessageViewProps {
  email: Email
  isTrash?: boolean
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatAddress(addr: { name: string | null; email: string }): string {
  if (addr.name) {
    return `${addr.name} <${addr.email}>`
  }
  return addr.email
}

function formatAddresses(
  addrs: Array<{ name: string | null; email: string }> | null,
): string {
  if (!addrs || addrs.length === 0) return ''
  return addrs.map(formatAddress).join(', ')
}

function getInitials(from: Email['from']): string {
  if (!from || from.length === 0) return '??'
  const sender = from[0]
  const name = sender.name || sender.email
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getEmailBody(email: Email): {
  html: string | null
  text: string | null
} {
  let html: string | null = null
  let text: string | null = null

  if (email.bodyValues) {
    // Check HTML body parts
    if (email.htmlBody && email.htmlBody.length > 0) {
      const htmlPart = email.htmlBody[0]
      if (htmlPart.partId && email.bodyValues[htmlPart.partId]) {
        html = email.bodyValues[htmlPart.partId].value
      }
    }

    // Check text body parts
    if (email.textBody && email.textBody.length > 0) {
      const textPart = email.textBody[0]
      if (textPart.partId && email.bodyValues[textPart.partId]) {
        text = email.bodyValues[textPart.partId].value
      }
    }
  }

  return { html, text }
}

export function MessageView({ email, isTrash }: MessageViewProps) {
  const router = useRouter()
  const params = useParams({ from: '/_authed/mail/$mailboxId/$messageId' })
  const isStarred = email.keywords[JMAPKeywords.FLAGGED]
  const { html, text } = getEmailBody(email)

  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  // Track theme state - initialize from localStorage, fallback to system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Listen for theme changes
  useEffect(() => {
    // Check dark mode state - prefer localStorage, fallback to class
    const checkDarkMode = () => {
      const stored = localStorage.getItem('theme')
      if (stored) {
        setIsDarkMode(stored === 'dark')
      } else {
        setIsDarkMode(document.documentElement.classList.contains('dark'))
      }
    }

    checkDarkMode()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode()
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  // Generate theme-aware iframe styles
  const iframeStyles = isDarkMode
    ? `
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #e5e5e5;
          background: #0a0a0a;
          margin: 0;
          padding: 0;
        }
        img { max-width: 100%; height: auto; }
        a { color: #818cf8; text-decoration: underline; }
        blockquote { border-left: 3px solid #333; padding-left: 1em; margin-left: 0; }
        pre { background: #1a1a1a; padding: 1em; border-radius: 4px; overflow-x: auto; }
        code { background: #1a1a1a; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
      `
    : `
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1a1a1a;
          background: #ffffff;
          margin: 0;
          padding: 0;
        }
        img { max-width: 100%; height: auto; }
        a { color: #4f46e5; text-decoration: underline; }
        blockquote { border-left: 3px solid #e5e5e5; padding-left: 1em; margin-left: 0; }
        pre { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }
        code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e5e5e5; padding: 8px; text-align: left; }
      `

  const handleToggleStar = async () => {
    await toggleStarFn({ data: { emailId: email.id, starred: !isStarred } })
    router.invalidate()
  }

  const handleArchive = async () => {
    await archiveEmailFn({ data: { emailId: email.id } })
    router.navigate({
      to: '/mail/$mailboxId',
      params: { mailboxId: params.mailboxId },
    })
  }

  const handleDelete = async () => {
    if (isTrash) {
      confirm({
        title: 'Delete permanently?',
        description:
          'This email will be permanently deleted and cannot be recovered.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
        onConfirm: async () => {
          await deleteEmailFn({
            data: { emailId: email.id, permanent: true },
          })
          router.navigate({
            to: '/mail/$mailboxId',
            params: { mailboxId: params.mailboxId },
          })
        },
      })
    } else {
      await deleteEmailFn({ data: { emailId: email.id } })
      router.navigate({
        to: '/mail/$mailboxId',
        params: { mailboxId: params.mailboxId },
      })
    }
  }

  const handleReply = () => {
    router.navigate({
      to: '/mail/compose',
      search: { replyTo: email.id },
    })
  }

  const handleReplyAll = () => {
    router.navigate({
      to: '/mail/compose',
      search: { replyTo: email.id, replyAll: true },
    })
  }

  const handleForward = () => {
    router.navigate({
      to: '/mail/compose',
      search: { forward: email.id },
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b flex items-center gap-1 px-4 shrink-0">
        <Link
          to="/mail/$mailboxId"
          params={{ mailboxId: params.mailboxId }}
          className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors mr-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </Link>

        {!isTrash && (
          <>
            <Button variant="ghost" size="sm" onClick={handleReply}>
              <HugeiconsIcon
                icon={ArrowTurnBackwardIcon}
                className="h-4 w-4 mr-1"
              />
              Reply
            </Button>

            <Button variant="ghost" size="sm" onClick={handleReplyAll}>
              <HugeiconsIcon
                icon={ArrowTurnBackwardIcon}
                className="h-4 w-4 mr-1"
              />
              Reply All
            </Button>

            <Button variant="ghost" size="sm" onClick={handleForward}>
              <HugeiconsIcon
                icon={ArrowTurnForwardIcon}
                className="h-4 w-4 mr-1"
              />
              Forward
            </Button>
          </>
        )}

        <div className="flex-1" />

        {!isTrash && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleStar}
              className={cn(isStarred && 'text-yellow-500')}
            >
              <HugeiconsIcon
                icon={StarIcon}
                className={cn('h-4 w-4', isStarred && 'fill-current')}
              />
            </Button>

            <Button variant="ghost" size="icon" onClick={handleArchive}>
              <HugeiconsIcon icon={Archive02Icon} className="h-4 w-4" />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          className={cn(isTrash && 'hover:text-destructive')}
        >
          <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
        </Button>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Subject */}
          <h1 className="text-2xl font-semibold mb-6">
            {email.subject || '(No subject)'}
          </h1>

          {/* Header */}
          <div className="flex gap-4 mb-6">
            {/* Avatar */}
            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-medium shrink-0">
              {getInitials(email.from)}
            </div>

            {/* From/To info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium">
                  {email.from?.[0]?.name || email.from?.[0]?.email || 'Unknown'}
                </span>
                <span className="text-sm text-muted-foreground truncate">
                  {email.from?.[0]?.email && `<${email.from[0].email}>`}
                </span>
              </div>

              <div className="text-sm text-muted-foreground">
                <span>To: {formatAddresses(email.to)}</span>
                {email.cc && email.cc.length > 0 && (
                  <span className="ml-4">Cc: {formatAddresses(email.cc)}</span>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {formatFullDate(email.receivedAt)}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {email.hasAttachment &&
            email.attachments &&
            email.attachments.length > 0 && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <HugeiconsIcon icon={AttachmentIcon} className="h-4 w-4" />
                  <span>Attachments ({email.attachments.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {email.attachments.map((att, i) => (
                    <div
                      key={att.blobId || i}
                      className="px-3 py-1.5 bg-background rounded border text-sm"
                    >
                      {att.name || `Attachment ${i + 1}`}
                      {att.size && (
                        <span className="ml-2 text-muted-foreground">
                          ({Math.round(att.size / 1024)}KB)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Body */}
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            {html ? (
              <iframe
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        ${iframeStyles}
                      </style>
                    </head>
                    <body>${html}</body>
                  </html>
                `}
                className="w-full min-h-[400px] border-0"
                sandbox="allow-same-origin"
                title="Email content"
              />
            ) : text ? (
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                {text}
              </pre>
            ) : (
              <p className="text-muted-foreground italic">No content</p>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialogComponent />
    </div>
  )
}
