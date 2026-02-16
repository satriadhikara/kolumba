/**
 * JMAP Method Helpers
 * Typed helpers for common JMAP method calls
 */

import { JMAPRequestBuilder, createJMAPClient } from './client'
import {
  EMAIL_FULL_PROPERTIES,
  EMAIL_LIST_PROPERTIES,
  JMAPCapabilities,
} from './types'
import type { JMAPClient, JMAPHttpOptions } from './client'
import type {
  ChangesResult,
  Comparator,
  Email,
  EmailFilter,
  EmailListItem,
  EmailSubmission,
  GetResult,
  Identity,
  Keywords,
  Mailbox,
  QueryResult,
  ResultReference,
  SetResult,
} from './types'

/**
 * Mailbox methods
 */
export const MailboxMethods = {
  /**
   * Get all mailboxes
   */
  async getAll(
    client: JMAPClient,
    accountId: string,
  ): Promise<GetResult<Mailbox>> {
    const builder = new JMAPRequestBuilder()
    builder.addCapability(JMAPCapabilities.MAIL)

    const callId = builder.call('Mailbox/get', {
      accountId,
      ids: null,
    })

    const parser = await client.execute(builder)
    return parser.get<GetResult<Mailbox>>(callId)
  },

  /**
   * Get specific mailboxes by ID
   */
  async get(
    client: JMAPClient,
    accountId: string,
    ids: Array<string>,
  ): Promise<GetResult<Mailbox>> {
    return client.call<GetResult<Mailbox>>('Mailbox/get', { accountId, ids }, [
      JMAPCapabilities.MAIL,
    ])
  },

  /**
   * Create, update, or delete mailboxes
   */
  async set(
    client: JMAPClient,
    accountId: string,
    options: {
      create?: Record<string, Partial<Mailbox>>
      update?: Record<string, Partial<Mailbox>>
      destroy?: Array<string>
    },
  ): Promise<SetResult<Mailbox>> {
    return client.call<SetResult<Mailbox>>(
      'Mailbox/set',
      { accountId, ...options },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Find mailbox by role
   */
  findByRole(mailboxes: Array<Mailbox>, role: string): Mailbox | undefined {
    return mailboxes.find((m) => m.role === role)
  },
}

/**
 * Email methods
 */
export const EmailMethods = {
  /**
   * Query and get emails for a mailbox in one request
   */
  async queryAndGet(
    client: JMAPClient,
    accountId: string,
    options: {
      filter?: EmailFilter
      sort?: Array<Comparator>
      position?: number
      limit?: number
      properties?: Array<keyof Email>
    } = {},
  ): Promise<{ query: QueryResult; emails: Array<EmailListItem> }> {
    const builder = new JMAPRequestBuilder()
    builder.addCapability(JMAPCapabilities.MAIL)

    const {
      filter,
      sort = [{ property: 'receivedAt', isAscending: false }],
      position = 0,
      limit = 50,
      properties = EMAIL_LIST_PROPERTIES,
    } = options

    // First call: query to get IDs
    const queryCallId = builder.call('Email/query', {
      accountId,
      filter,
      sort,
      position,
      limit,
      calculateTotal: true,
    })

    // Second call: get emails using back-reference
    const getCallId = builder.call('Email/get', {
      accountId,
      '#ids': builder.ref(queryCallId, '/ids'),
      properties,
    })

    const parser = await client.execute(builder)

    const queryResult = parser.get<QueryResult>(queryCallId)
    const getResult = parser.get<GetResult<EmailListItem>>(getCallId)

    return {
      query: queryResult,
      emails: getResult.list,
    }
  },

  /**
   * Get full email details
   */
  async get(
    client: JMAPClient,
    accountId: string,
    ids: Array<string>,
    properties: Array<keyof Email> = EMAIL_FULL_PROPERTIES,
  ): Promise<GetResult<Email>> {
    const builder = new JMAPRequestBuilder()
    builder.addCapability(JMAPCapabilities.MAIL)

    const callId = builder.call('Email/get', {
      accountId,
      ids,
      properties,
      fetchTextBodyValues: true,
      fetchHTMLBodyValues: true,
      fetchAllBodyValues: true,
      maxBodyValueBytes: 1024 * 1024, // 1MB
    })

    const parser = await client.execute(builder)
    return parser.get<GetResult<Email>>(callId)
  },

  /**
   * Update email keywords (read/unread, star, etc.)
   */
  async updateKeywords(
    client: JMAPClient,
    accountId: string,
    emailId: string,
    keywords: Keywords,
  ): Promise<SetResult<Email>> {
    return client.call<SetResult<Email>>(
      'Email/set',
      {
        accountId,
        update: {
          [emailId]: { keywords },
        },
      },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Add a keyword to an email
   */
  async addKeyword(
    client: JMAPClient,
    accountId: string,
    emailId: string,
    keyword: string,
  ): Promise<SetResult<Email>> {
    return client.call<SetResult<Email>>(
      'Email/set',
      {
        accountId,
        update: {
          [emailId]: { [`keywords/${keyword}`]: true },
        },
      },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Remove a keyword from an email
   */
  async removeKeyword(
    client: JMAPClient,
    accountId: string,
    emailId: string,
    keyword: string,
  ): Promise<SetResult<Email>> {
    return client.call<SetResult<Email>>(
      'Email/set',
      {
        accountId,
        update: {
          [emailId]: { [`keywords/${keyword}`]: null },
        },
      },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Move email to a different mailbox
   */
  async move(
    client: JMAPClient,
    accountId: string,
    emailId: string,
    toMailboxId: string,
  ): Promise<SetResult<Email>> {
    return client.call<SetResult<Email>>(
      'Email/set',
      {
        accountId,
        update: {
          [emailId]: { mailboxIds: { [toMailboxId]: true } },
        },
      },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Move email from one mailbox to another
   */
  async moveFrom(
    client: JMAPClient,
    accountId: string,
    emailId: string,
    fromMailboxId: string,
    toMailboxId: string,
  ): Promise<SetResult<Email>> {
    return client.call<SetResult<Email>>(
      'Email/set',
      {
        accountId,
        update: {
          [emailId]: {
            [`mailboxIds/${fromMailboxId}`]: null,
            [`mailboxIds/${toMailboxId}`]: true,
          },
        },
      },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Delete emails (move to trash or permanent delete)
   */
  async destroy(
    client: JMAPClient,
    accountId: string,
    emailIds: Array<string>,
  ): Promise<SetResult<Email>> {
    return client.call<SetResult<Email>>(
      'Email/set',
      {
        accountId,
        destroy: emailIds,
      },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Create a draft email
   */
  async createDraft(
    client: JMAPClient,
    accountId: string,
    draft: {
      mailboxIds: Record<string, boolean>
      from: Array<{ name?: string; email: string }>
      to: Array<{ name?: string; email: string }>
      cc?: Array<{ name?: string; email: string }>
      bcc?: Array<{ name?: string; email: string }>
      subject: string
      textBody?: Array<{ value: string; type: string }>
      htmlBody?: Array<{ value: string; type: string }>
      keywords?: Keywords
    },
  ): Promise<SetResult<Email>> {
    const emailToCreate = {
      ...draft,
      keywords: {
        $draft: true,
        ...draft.keywords,
      },
    }

    return client.call<SetResult<Email>>(
      'Email/set',
      {
        accountId,
        create: {
          draft: emailToCreate,
        },
      },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Get email changes since a state
   */
  async changes(
    client: JMAPClient,
    accountId: string,
    sinceState: string,
    maxChanges?: number,
  ): Promise<ChangesResult> {
    return client.call<ChangesResult>(
      'Email/changes',
      {
        accountId,
        sinceState,
        maxChanges,
      },
      [JMAPCapabilities.MAIL],
    )
  },

  /**
   * Search emails
   */
  async search(
    client: JMAPClient,
    accountId: string,
    text: string,
    options: {
      limit?: number
      inMailbox?: string
    } = {},
  ): Promise<{ query: QueryResult; emails: Array<EmailListItem> }> {
    const filter: EmailFilter = { text }
    if (options.inMailbox) {
      ;(filter as any).inMailbox = options.inMailbox
    }

    return EmailMethods.queryAndGet(client, accountId, {
      filter,
      limit: options.limit ?? 50,
    })
  },
}

/**
 * EmailSubmission methods for sending emails
 */
export const EmailSubmissionMethods = {
  /**
   * Create and send an email in one request
   */
  async createAndSend(
    client: JMAPClient,
    accountId: string,
    options: {
      identityId: string
      sentMailboxId: string
      email: {
        mailboxIds: Record<string, boolean>
        from: Array<{ name?: string; email: string }>
        to: Array<{ name?: string; email: string }>
        cc?: Array<{ name?: string; email: string }>
        bcc?: Array<{ name?: string; email: string }>
        subject: string
        textBody?: Array<{ value: string; type: string }>
        htmlBody?: Array<{ value: string; type: string }>
        inReplyTo?: Array<string>
        references?: Array<string>
      }
    },
  ): Promise<{
    emailResult: SetResult<Email>
    submissionResult: SetResult<EmailSubmission>
  }> {
    const builder = new JMAPRequestBuilder()
    builder.addCapability(JMAPCapabilities.MAIL)
    builder.addCapability(JMAPCapabilities.SUBMISSION)

    // Create the email
    const emailCallId = builder.call('Email/set', {
      accountId,
      create: {
        email: options.email,
      },
    })

    // Create the submission with back-reference to the email
    const submissionCallId = builder.call('EmailSubmission/set', {
      accountId,
      create: {
        submission: {
          identityId: options.identityId,
          emailId: '#email',
        },
      },
      onSuccessUpdateEmail: {
        '#submission': {
          [`mailboxIds/${options.sentMailboxId}`]: true,
          [`mailboxIds/${Object.keys(options.email.mailboxIds)[0]}`]: null,
          'keywords/$draft': null,
          'keywords/$seen': true,
        },
      },
    })

    const parser = await client.execute(builder)

    return {
      emailResult: parser.get<SetResult<Email>>(emailCallId),
      submissionResult:
        parser.get<SetResult<EmailSubmission>>(submissionCallId),
    }
  },

  /**
   * Send an existing draft
   */
  async sendDraft(
    client: JMAPClient,
    accountId: string,
    emailId: string,
    identityId: string,
    sentMailboxId: string,
  ): Promise<SetResult<EmailSubmission>> {
    const builder = new JMAPRequestBuilder()
    builder.addCapability(JMAPCapabilities.MAIL)
    builder.addCapability(JMAPCapabilities.SUBMISSION)

    const callId = builder.call('EmailSubmission/set', {
      accountId,
      create: {
        submission: {
          identityId,
          emailId,
        },
      },
      onSuccessUpdateEmail: {
        '#submission': {
          'keywords/$draft': null,
          'keywords/$seen': true,
          mailboxIds: { [sentMailboxId]: true },
        },
      },
    })

    const parser = await client.execute(builder)
    return parser.get<SetResult<EmailSubmission>>(callId)
  },
}

/**
 * Identity methods
 */
export const IdentityMethods = {
  /**
   * Get all identities
   */
  async getAll(
    client: JMAPClient,
    accountId: string,
  ): Promise<GetResult<Identity>> {
    return client.call<GetResult<Identity>>(
      'Identity/get',
      { accountId, ids: null },
      [JMAPCapabilities.SUBMISSION],
    )
  },

  /**
   * Get specific identities
   */
  async get(
    client: JMAPClient,
    accountId: string,
    ids: Array<string>,
  ): Promise<GetResult<Identity>> {
    return client.call<GetResult<Identity>>(
      'Identity/get',
      { accountId, ids },
      [JMAPCapabilities.SUBMISSION],
    )
  },
}

/**
 * Combined helper for common email operations
 */
export function createEmailHelper(client: JMAPClient, accountId: string) {
  return {
    // Mailbox operations
    getMailboxes: () => MailboxMethods.getAll(client, accountId),
    findMailboxByRole: async (role: string) => {
      const result = await MailboxMethods.getAll(client, accountId)
      return MailboxMethods.findByRole(result.list, role)
    },

    // Email operations
    listEmails: (
      mailboxId: string,
      options?: { limit?: number; position?: number },
    ) =>
      EmailMethods.queryAndGet(client, accountId, {
        filter: { inMailbox: mailboxId },
        ...options,
      }),
    getEmail: (id: string) => EmailMethods.get(client, accountId, [id]),
    searchEmails: (query: string, inMailbox?: string) =>
      EmailMethods.search(client, accountId, query, { inMailbox }),

    // Email actions
    markAsRead: (emailId: string) =>
      EmailMethods.addKeyword(client, accountId, emailId, '$seen'),
    markAsUnread: (emailId: string) =>
      EmailMethods.removeKeyword(client, accountId, emailId, '$seen'),
    star: (emailId: string) =>
      EmailMethods.addKeyword(client, accountId, emailId, '$flagged'),
    unstar: (emailId: string) =>
      EmailMethods.removeKeyword(client, accountId, emailId, '$flagged'),
    moveToMailbox: (emailId: string, mailboxId: string) =>
      EmailMethods.move(client, accountId, emailId, mailboxId),
    deleteEmails: (emailIds: Array<string>) =>
      EmailMethods.destroy(client, accountId, emailIds),

    // Identity operations
    getIdentities: () => IdentityMethods.getAll(client, accountId),

    // Send email
    sendEmail: (
      identityId: string,
      email: Parameters<
        typeof EmailSubmissionMethods.createAndSend
      >[2]['email'],
    ) =>
      EmailSubmissionMethods.createAndSend(client, accountId, {
        identityId,
        email,
      }),
  }
}

export type EmailHelper = ReturnType<typeof createEmailHelper>
