/**
 * JMAP Server Functions
 * All JMAP operations are executed server-side
 * Credentials never reach the browser
 */

import { createServerFn } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { useAppSession, isSessionValid } from './session'
import { createJMAPClient, resetCallIdCounter } from '@/lib/jmap/client'
import {
  MailboxMethods,
  EmailMethods,
  IdentityMethods,
  EmailSubmissionMethods,
} from '@/lib/jmap/methods'
import type {
  Mailbox,
  Email,
  EmailListItem,
  Identity,
  EmailFilter,
  Comparator,
  Keywords,
} from '@/lib/jmap/types'

/**
 * Helper to get authenticated JMAP client
 */
async function getAuthenticatedClient() {
  resetCallIdCounter()
  const session = await useAppSession()

  if (!isSessionValid(session.data)) {
    throw redirect({ to: '/login' })
  }

  const client = createJMAPClient({
    apiUrl: session.data.jmapApiUrl,
    accessToken: session.data.accessToken,
  })

  return { client, accountId: session.data.accountId }
}

// =============================================================================
// Mailbox Operations
// =============================================================================

/**
 * Get all mailboxes
 */
export const getMailboxesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Mailbox[]> => {
    const { client, accountId } = await getAuthenticatedClient()
    const result = await MailboxMethods.getAll(client, accountId)
    return result.list
  },
)

/**
 * Create a new mailbox
 */
export const createMailboxFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { name: string; parentId?: string }) => data)
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()
    const result = await MailboxMethods.set(client, accountId, {
      create: {
        newMailbox: {
          name: data.name,
          parentId: data.parentId ?? null,
        },
      },
    })

    if (result.notCreated?.newMailbox) {
      throw new Error(
        result.notCreated.newMailbox.description || 'Failed to create mailbox',
      )
    }

    return result.created?.newMailbox
  })

/**
 * Delete a mailbox
 */
export const deleteMailboxFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { mailboxId: string }) => data)
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()
    const result = await MailboxMethods.set(client, accountId, {
      destroy: [data.mailboxId],
    })

    if (result.notDestroyed?.[data.mailboxId]) {
      throw new Error(
        result.notDestroyed[data.mailboxId].description ||
          'Failed to delete mailbox',
      )
    }

    return { success: true }
  })

// =============================================================================
// Email Operations
// =============================================================================

/**
 * Get emails for a mailbox with pagination
 */
export const getEmailsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { mailboxId: string; limit?: number; position?: number }) => data,
  )
  .handler(
    async ({
      data,
    }): Promise<{
      emails: EmailListItem[]
      total: number
      position: number
    }> => {
      const { client, accountId } = await getAuthenticatedClient()

      const result = await EmailMethods.queryAndGet(client, accountId, {
        filter: { inMailbox: data.mailboxId },
        limit: data.limit ?? 50,
        position: data.position ?? 0,
      })

      return {
        emails: result.emails,
        total: result.query.total ?? 0,
        position: result.query.position,
      }
    },
  )

/**
 * Get a single email with full content
 */
export const getEmailFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { emailId: string }) => data)
  .handler(async ({ data }): Promise<Email | null> => {
    const { client, accountId } = await getAuthenticatedClient()
    const result = await EmailMethods.get(client, accountId, [data.emailId])

    if (result.notFound.includes(data.emailId)) {
      return null
    }

    return result.list[0] ?? null
  })

/**
 * Mark email as read
 */
export const markAsReadFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { emailId: string }) => data)
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()
    await EmailMethods.addKeyword(client, accountId, data.emailId, '$seen')
    return { success: true }
  })

/**
 * Mark email as unread
 */
export const markAsUnreadFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { emailId: string }) => data)
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()
    await EmailMethods.removeKeyword(client, accountId, data.emailId, '$seen')
    return { success: true }
  })

/**
 * Toggle star/flag on email
 */
export const toggleStarFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { emailId: string; starred: boolean }) => data)
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()

    if (data.starred) {
      await EmailMethods.addKeyword(client, accountId, data.emailId, '$flagged')
    } else {
      await EmailMethods.removeKeyword(
        client,
        accountId,
        data.emailId,
        '$flagged',
      )
    }

    return { success: true }
  })

/**
 * Move email to a different mailbox
 */
export const moveEmailFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { emailId: string; toMailboxId: string }) => data)
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()
    await EmailMethods.move(client, accountId, data.emailId, data.toMailboxId)
    return { success: true }
  })

/**
 * Move email to trash (or permanently delete if already in trash)
 */
export const deleteEmailFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { emailId: string; permanent?: boolean }) => data)
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()

    if (data.permanent) {
      await EmailMethods.destroy(client, accountId, [data.emailId])
    } else {
      // Find trash mailbox and move to it
      const mailboxes = await MailboxMethods.getAll(client, accountId)
      const trash = MailboxMethods.findByRole(mailboxes.list, 'trash')

      if (trash) {
        await EmailMethods.move(client, accountId, data.emailId, trash.id)
      } else {
        // No trash folder, permanently delete
        await EmailMethods.destroy(client, accountId, [data.emailId])
      }
    }

    return { success: true }
  })

/**
 * Archive email (move to archive folder)
 */
export const archiveEmailFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { emailId: string }) => data)
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()
    const mailboxes = await MailboxMethods.getAll(client, accountId)
    const archive = MailboxMethods.findByRole(mailboxes.list, 'archive')

    if (archive) {
      await EmailMethods.move(client, accountId, data.emailId, archive.id)
    } else {
      throw new Error('No archive folder found')
    }

    return { success: true }
  })

/**
 * Search emails
 */
export const searchEmailsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: { query: string; mailboxId?: string; limit?: number }) => data,
  )
  .handler(
    async ({
      data,
    }): Promise<{
      emails: EmailListItem[]
      total: number
    }> => {
      const { client, accountId } = await getAuthenticatedClient()

      const result = await EmailMethods.search(client, accountId, data.query, {
        inMailbox: data.mailboxId,
        limit: data.limit ?? 50,
      })

      return {
        emails: result.emails,
        total: result.query.total ?? result.emails.length,
      }
    },
  )

// =============================================================================
// Send Email Operations
// =============================================================================

/**
 * Get user identities (for from address selection)
 */
export const getIdentitiesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Identity[]> => {
    const { client, accountId } = await getAuthenticatedClient()
    const result = await IdentityMethods.getAll(client, accountId)
    return result.list
  },
)

/**
 * Send an email
 */
export const sendEmailFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      identityId: string
      to: { name?: string; email: string }[]
      cc?: { name?: string; email: string }[]
      bcc?: { name?: string; email: string }[]
      subject: string
      textBody?: string
      htmlBody?: string
      inReplyTo?: string
      references?: string[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()

    // Get identities to find the from address
    const identities = await IdentityMethods.getAll(client, accountId)
    const identity = identities.list.find((i) => i.id === data.identityId)

    if (!identity) {
      throw new Error('Identity not found')
    }

    // Get sent mailbox for storing sent email
    const mailboxes = await MailboxMethods.getAll(client, accountId)
    const sent = MailboxMethods.findByRole(mailboxes.list, 'sent')
    const drafts = MailboxMethods.findByRole(mailboxes.list, 'drafts')

    const mailboxIds: Record<string, boolean> = {}
    if (drafts) {
      mailboxIds[drafts.id] = true
    }

    const emailData: Parameters<
      typeof EmailSubmissionMethods.createAndSend
    >[2]['email'] = {
      mailboxIds,
      from: [{ name: identity.name, email: identity.email }],
      to: data.to,
      cc: data.cc && data.cc.length > 0 ? data.cc : undefined,
      bcc: data.bcc && data.bcc.length > 0 ? data.bcc : undefined,
      subject: data.subject,
      inReplyTo: data.inReplyTo ? [data.inReplyTo] : undefined,
      references: data.references,
    }

    const bodyValues: Record<string, { value: string }> = {}
    let textPartId: string | undefined
    let htmlPartId: string | undefined

    if (data.textBody) {
      const partId = 'text'
      bodyValues[partId] = { value: data.textBody }
      textPartId = partId
    }
    if (data.htmlBody) {
      const partId = htmlPartId || 'html'
      bodyValues[partId] = { value: data.htmlBody }
      htmlPartId = partId
    }

    if (Object.keys(bodyValues).length > 0) {
      emailData.bodyValues = bodyValues
    }
    if (textPartId) {
      emailData.textBody = [{ partId: textPartId }]
    }
    if (htmlPartId) {
      emailData.htmlBody = [{ partId: htmlPartId }]
    }

    if (!sent) {
      throw new Error('Sent mailbox not found')
    }

    const result = await EmailSubmissionMethods.createAndSend(
      client,
      accountId,
      {
        identityId: data.identityId,
        sentMailboxId: sent.id,
        email: emailData,
      },
    )

    if (result.emailResult.notCreated?.email) {
      const error = result.emailResult.notCreated.email
      throw new Error(
        error.description +
          (error.properties
            ? ` (Failed properties: ${error.properties.join(', ')})`
            : '') || 'Failed to create email',
      )
    }

    if (result.submissionResult.notCreated?.submission) {
      const error = result.submissionResult.notCreated.submission
      throw new Error(
        error.description +
          (error.properties
            ? ` (Failed properties: ${error.properties.join(', ')})`
            : '') || 'Failed to send email',
      )
    }

    return { success: true }
  })

/**
 * Save draft
 */
export const saveDraftFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      to?: { name?: string; email: string }[]
      cc?: { name?: string; email: string }[]
      bcc?: { name?: string; email: string }[]
      subject?: string
      textBody?: string
      htmlBody?: string
      draftId?: string // For updating existing draft
    }) => data,
  )
  .handler(async ({ data }) => {
    const { client, accountId } = await getAuthenticatedClient()

    // Get drafts mailbox
    const mailboxes = await MailboxMethods.getAll(client, accountId)
    const drafts = MailboxMethods.findByRole(mailboxes.list, 'drafts')

    if (!drafts) {
      throw new Error('Drafts folder not found')
    }

    // Get identity for from address
    const identities = await IdentityMethods.getAll(client, accountId)
    const identity = identities.list[0]

    if (!identity) {
      throw new Error('No identity found')
    }

    const draft: Parameters<typeof EmailMethods.createDraft>[2] = {
      mailboxIds: { [drafts.id]: true },
      from: [{ name: identity.name, email: identity.email }],
      to: data.to ?? [],
      cc: data.cc,
      subject: data.subject ?? '',
    }

    if (data.htmlBody) {
      draft.htmlBody = [{ value: data.htmlBody, type: 'text/html' }]
    }
    if (data.textBody) {
      draft.textBody = [{ value: data.textBody, type: 'text/plain' }]
    }

    // If updating existing draft, delete the old one
    if (data.draftId) {
      await EmailMethods.destroy(client, accountId, [data.draftId])
    }

    const result = await EmailMethods.createDraft(client, accountId, draft)

    if (result.notCreated?.draft) {
      throw new Error(
        result.notCreated.draft.description || 'Failed to save draft',
      )
    }

    return {
      success: true,
      draftId: result.created?.draft?.id,
    }
  })
