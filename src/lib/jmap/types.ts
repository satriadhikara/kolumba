/**
 * JMAP Type Definitions
 * Based on RFC 8620 (JMAP Core) and RFC 8621 (JMAP Mail)
 */

// =============================================================================
// JMAP Core Types (RFC 8620)
// =============================================================================

/**
 * JMAP Session object returned from /.well-known/jmap
 */
export interface JMAPSession {
  capabilities: Record<string, unknown>
  accounts: Record<string, JMAPAccount>
  primaryAccounts: Record<string, string>
  username: string
  apiUrl: string
  downloadUrl: string
  uploadUrl: string
  eventSourceUrl: string
  state: string
}

export interface JMAPAccount {
  name: string
  isPersonal: boolean
  isReadOnly: boolean
  accountCapabilities: Record<string, unknown>
}

/**
 * JMAP Request format
 */
export interface JMAPRequest {
  using: Array<string>
  methodCalls: Array<MethodCall>
}

/**
 * A single method call in a JMAP request
 * Format: [methodName, arguments, callId]
 */
export type MethodCall = [string, Record<string, unknown>, string]

/**
 * JMAP Response format
 */
export interface JMAPResponse {
  methodResponses: Array<MethodResponse>
  sessionState: string
}

/**
 * A single method response
 * Format: [methodName, response, callId]
 */
export type MethodResponse = [string, Record<string, unknown>, string]

/**
 * JMAP Error response
 */
export interface JMAPError {
  type: string
  description?: string
  properties?: Array<string>
}

// =============================================================================
// JMAP Mail Types (RFC 8621)
// =============================================================================

/**
 * JMAP Keywords (flags)
 */
export const JMAPKeywords = {
  SEEN: '$seen',
  FLAGGED: '$flagged',
  DRAFT: '$draft',
  ANSWERED: '$answered',
  FORWARDED: '$forwarded',
} as const

export type JMAPKeyword = (typeof JMAPKeywords)[keyof typeof JMAPKeywords]

/**
 * Keywords object - maps keyword strings to boolean true
 */
export type Keywords = Record<string, boolean>

/**
 * Email address object
 */
export interface EmailAddress {
  name: string | null
  email: string
}

/**
 * Email header object for custom headers
 */
export interface EmailHeader {
  name: string
  value: string
}

/**
 * Email body part
 */
export interface EmailBodyPart {
  partId?: string | null
  blobId?: string | null
  size?: number
  headers?: Array<EmailHeader>
  name?: string | null
  type?: string
  charset?: string | null
  disposition?: string | null
  cid?: string | null
  language?: Array<string> | null
  location?: string | null
  subParts?: Array<EmailBodyPart> | null
}

/**
 * Email body value
 */
export interface EmailBodyValue {
  value: string
  isEncodingProblem?: boolean
  isTruncated?: boolean
  type?: string
}

/**
 * Full Email object
 */
export interface Email {
  id: string
  blobId: string
  threadId: string
  mailboxIds: Record<string, boolean>
  keywords: Keywords
  size: number
  receivedAt: string

  // Header fields
  messageId: Array<string> | null
  inReplyTo: Array<string> | null
  references: Array<string> | null
  sender: Array<EmailAddress> | null
  from: Array<EmailAddress> | null
  to: Array<EmailAddress> | null
  cc: Array<EmailAddress> | null
  bcc: Array<EmailAddress> | null
  replyTo: Array<EmailAddress> | null
  subject: string | null
  sentAt: string | null

  // Body
  bodyStructure?: EmailBodyPart
  bodyValues?: Record<string, EmailBodyValue>
  textBody?: Array<EmailBodyPart>
  htmlBody?: Array<EmailBodyPart>
  attachments?: Array<EmailBodyPart>

  // Convenience
  hasAttachment: boolean
  preview: string
}

/**
 * Minimal Email object for list views
 */
export interface EmailListItem {
  id: string
  threadId: string
  mailboxIds: Record<string, boolean>
  keywords: Keywords
  receivedAt: string
  from: Array<EmailAddress> | null
  to: Array<EmailAddress> | null
  subject: string | null
  preview: string
  hasAttachment: boolean
}

/**
 * Properties to fetch for email list
 */
export const EMAIL_LIST_PROPERTIES: Array<keyof Email> = [
  'id',
  'threadId',
  'mailboxIds',
  'keywords',
  'receivedAt',
  'from',
  'to',
  'subject',
  'preview',
  'hasAttachment',
]

/**
 * Properties to fetch for full email view
 */
export const EMAIL_FULL_PROPERTIES: Array<keyof Email> = [
  'id',
  'blobId',
  'threadId',
  'mailboxIds',
  'keywords',
  'size',
  'receivedAt',
  'messageId',
  'inReplyTo',
  'references',
  'sender',
  'from',
  'to',
  'cc',
  'bcc',
  'replyTo',
  'subject',
  'sentAt',
  'bodyStructure',
  'bodyValues',
  'textBody',
  'htmlBody',
  'attachments',
  'hasAttachment',
  'preview',
]

/**
 * Mailbox object
 */
export interface Mailbox {
  id: string
  name: string
  parentId: string | null
  role: MailboxRole | null
  sortOrder: number
  totalEmails: number
  unreadEmails: number
  totalThreads: number
  unreadThreads: number
  myRights: MailboxRights
  isSubscribed: boolean
}

/**
 * Standard mailbox roles
 */
export type MailboxRole =
  | 'all'
  | 'archive'
  | 'drafts'
  | 'flagged'
  | 'important'
  | 'inbox'
  | 'junk'
  | 'sent'
  | 'subscribed'
  | 'trash'

/**
 * Mailbox rights
 */
export interface MailboxRights {
  mayReadItems: boolean
  mayAddItems: boolean
  mayRemoveItems: boolean
  maySetSeen: boolean
  maySetKeywords: boolean
  mayCreateChild: boolean
  mayRename: boolean
  mayDelete: boolean
  maySubmit: boolean
}

/**
 * Identity object for sending emails
 */
export interface Identity {
  id: string
  name: string
  email: string
  replyTo: Array<EmailAddress> | null
  bcc: Array<EmailAddress> | null
  textSignature: string
  htmlSignature: string
  mayDelete: boolean
}

/**
 * EmailSubmission for sending emails
 */
export interface EmailSubmission {
  id: string
  identityId: string
  emailId: string
  threadId: string
  envelope: EmailSubmissionEnvelope | null
  sendAt: string
  undoStatus: 'pending' | 'final' | 'canceled'
  deliveryStatus: Record<string, DeliveryStatus> | null
  dsnBlobIds: Array<string>
  mdnBlobIds: Array<string>
}

export interface EmailSubmissionEnvelope {
  mailFrom: EmailSubmissionAddress
  rcptTo: Array<EmailSubmissionAddress>
}

export interface EmailSubmissionAddress {
  email: string
  parameters: Record<string, string> | null
}

export interface DeliveryStatus {
  smtpReply: string
  delivered: 'queued' | 'yes' | 'no' | 'unknown'
  displayed: 'yes' | 'unknown'
}

// =============================================================================
// Query and Filter Types
// =============================================================================

/**
 * Email filter conditions
 */
export interface EmailFilterCondition {
  inMailbox?: string
  inMailboxOtherThan?: Array<string>
  before?: string
  after?: string
  minSize?: number
  maxSize?: number
  allInThreadHaveKeyword?: string
  someInThreadHaveKeyword?: string
  noneInThreadHaveKeyword?: string
  hasKeyword?: string
  notKeyword?: string
  hasAttachment?: boolean
  text?: string
  from?: string
  to?: string
  cc?: string
  bcc?: string
  subject?: string
  body?: string
  header?: [string, string]
}

/**
 * Filter operator for combining conditions
 */
export interface EmailFilterOperator {
  operator: 'AND' | 'OR' | 'NOT'
  conditions: Array<EmailFilterCondition | EmailFilterOperator>
}

export type EmailFilter = EmailFilterCondition | EmailFilterOperator

/**
 * Sort comparator
 */
export interface Comparator {
  property: string
  isAscending?: boolean
  collation?: string
}

/**
 * Query result
 */
export interface QueryResult {
  accountId: string
  queryState: string
  canCalculateChanges: boolean
  position: number
  ids: Array<string>
  total?: number
  limit?: number
}

/**
 * Get result
 */
export interface GetResult<T> {
  accountId: string
  state: string
  list: Array<T>
  notFound: Array<string>
}

/**
 * Set result
 */
export interface SetResult<T> {
  accountId: string
  oldState: string | null
  newState: string
  created: Record<string, T> | null
  updated: Record<string, T | null> | null
  destroyed: Array<string> | null
  notCreated: Record<string, JMAPError> | null
  notUpdated: Record<string, JMAPError> | null
  notDestroyed: Record<string, JMAPError> | null
}

/**
 * Changes result for delta sync
 */
export interface ChangesResult {
  accountId: string
  oldState: string
  newState: string
  hasMoreChanges: boolean
  created: Array<string>
  updated: Array<string>
  destroyed: Array<string>
}

// =============================================================================
// Request Argument Types
// =============================================================================

export interface GetRequest {
  accountId: string
  ids?: Array<string> | null
  properties?: Array<string> | null
}

export interface QueryRequest {
  accountId: string
  filter?: EmailFilter | null
  sort?: Array<Comparator> | null
  position?: number
  anchor?: string | null
  anchorOffset?: number
  limit?: number | null
  calculateTotal?: boolean
}

export interface SetRequest<T> {
  accountId: string
  ifInState?: string | null
  create?: Record<string, Partial<T>> | null
  update?: Record<string, Partial<T> | null> | null
  destroy?: Array<string> | null
}

export interface ChangesRequest {
  accountId: string
  sinceState: string
  maxChanges?: number | null
}

// =============================================================================
// Back-reference Types
// =============================================================================

/**
 * Back-reference to a previous method call result
 */
export interface ResultReference {
  resultOf: string
  name: string
  path: string
}

/**
 * Capability URNs
 */
export const JMAPCapabilities = {
  CORE: 'urn:ietf:params:jmap:core',
  MAIL: 'urn:ietf:params:jmap:mail',
  SUBMISSION: 'urn:ietf:params:jmap:submission',
} as const
