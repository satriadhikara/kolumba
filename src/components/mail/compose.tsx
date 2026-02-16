import { useEffect, useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, MailSend01Icon } from '@hugeicons/core-free-icons'
import type { Email, Identity } from '@/lib/jmap/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { sendEmailFn } from '@/server/jmap'

interface ComposeProps {
  identities: Array<Identity>
  originalEmail: Email | null
  mode: 'new' | 'reply' | 'replyAll' | 'forward'
  onClose: () => void
}

function getReplySubject(subject: string | null): string {
  if (!subject) return 'Re: '
  if (subject.toLowerCase().startsWith('re:')) return subject
  return `Re: ${subject}`
}

function getForwardSubject(subject: string | null): string {
  if (!subject) return 'Fwd: '
  if (subject.toLowerCase().startsWith('fwd:')) return subject
  return `Fwd: ${subject}`
}

function formatQuotedText(email: Email): string {
  const date = new Date(email.receivedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const from = email.from?.[0]?.email || 'Unknown'

  let body = ''
  if (email.bodyValues && email.textBody?.[0]?.partId) {
    body = email.bodyValues[email.textBody[0].partId]?.value || ''
  } else if (email.preview) {
    body = email.preview
  }

  const quotedLines = body
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')

  return `\n\nOn ${date}, ${from} wrote:\n${quotedLines}`
}

export function Compose({
  identities,
  originalEmail,
  mode,
  onClose,
}: ComposeProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [identityId, setIdentityId] = useState(identities[0]?.id || '')

  // Pre-fill fields based on mode
  useEffect(() => {
    if (!originalEmail) return

    if (mode === 'reply') {
      const replyTo = originalEmail.replyTo?.[0] || originalEmail.from?.[0]
      if (replyTo) setTo(replyTo.email)
      setSubject(getReplySubject(originalEmail.subject))
      setBody(formatQuotedText(originalEmail))
    } else if (mode === 'replyAll') {
      const replyTo = originalEmail.replyTo?.[0] || originalEmail.from?.[0]
      if (replyTo) setTo(replyTo.email)

      // Add original To recipients (except self) to CC
      const myEmails = identities.map((i) => i.email.toLowerCase())
      const ccRecipients =
        originalEmail.to
          ?.filter((addr) => !myEmails.includes(addr.email.toLowerCase()))
          .map((addr) => addr.email) || []

      if (originalEmail.cc) {
        ccRecipients.push(
          ...originalEmail.cc
            .filter((addr) => !myEmails.includes(addr.email.toLowerCase()))
            .map((addr) => addr.email),
        )
      }

      setCc(ccRecipients.join(', '))
      setSubject(getReplySubject(originalEmail.subject))
      setBody(formatQuotedText(originalEmail))
    } else if (mode === 'forward') {
      setSubject(getForwardSubject(originalEmail.subject))
      setBody(formatQuotedText(originalEmail))
    }
  }, [originalEmail, mode, identities])

  const parseAddresses = (
    input: string,
  ): Array<{ name?: string; email: string }> => {
    if (!input.trim()) return []
    return input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((email) => ({ email }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const toAddresses = parseAddresses(to)
      if (toAddresses.length === 0) {
        setError('Please enter at least one recipient')
        setIsLoading(false)
        return
      }

      await sendEmailFn({
        data: {
          identityId,
          to: toAddresses,
          cc: parseAddresses(cc),
          bcc: parseAddresses(bcc),
          subject,
          textBody: body,
          inReplyTo:
            mode === 'reply' || mode === 'replyAll'
              ? originalEmail?.messageId?.[0]
              : undefined,
          references:
            mode === 'reply' || mode === 'replyAll'
              ? originalEmail?.references || originalEmail?.messageId
              : undefined,
        },
      })

      router.invalidate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-4 shrink-0">
        <h2 className="text-lg font-semibold">
          {mode === 'new'
            ? 'New Message'
            : mode === 'forward'
              ? 'Forward'
              : 'Reply'}
        </h2>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" onClick={onClose}>
          <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 gap-4">
        {/* From (if multiple identities) */}
        {identities.length > 1 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="from" className="w-16 text-right shrink-0">
              From
            </Label>
            <select
              id="from"
              value={identityId}
              onChange={(e) => setIdentityId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              {identities.map((identity) => (
                <option key={identity.id} value={identity.id}>
                  {identity.name
                    ? `${identity.name} <${identity.email}>`
                    : identity.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* To */}
        <div className="flex items-center gap-2">
          <Label htmlFor="to" className="w-16 text-right shrink-0">
            To
          </Label>
          <Input
            id="to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            required
            className="flex-1"
          />
        </div>

        {/* CC */}
        <div className="flex items-center gap-2">
          <Label htmlFor="cc" className="w-16 text-right shrink-0">
            Cc
          </Label>
          <Input
            id="cc"
            type="text"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="cc@example.com"
            className="flex-1"
          />
        </div>

        {/* BCC */}
        <div className="flex items-center gap-2">
          <Label htmlFor="bcc" className="w-16 text-right shrink-0">
            Bcc
          </Label>
          <Input
            id="bcc"
            type="text"
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            placeholder="bcc@example.com"
            className="flex-1"
          />
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2">
          <Label htmlFor="subject" className="w-16 text-right shrink-0">
            Subject
          </Label>
          <Input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1"
          />
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
            className="flex-1 min-h-[200px] resize-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            <HugeiconsIcon icon={MailSend01Icon} className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
