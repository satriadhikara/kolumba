/**
 * Mock data for visual testing bypass (BYPASS_AUTH=true)
 * Provides realistic data to preview the UI without a live Stalwart server.
 */

import type { SessionData } from './session'
import type { Email, EmailListItem, Identity, Mailbox } from '@/lib/jmap/types'

// =============================================================================
// Session
// =============================================================================

export const mockSession: SessionData = {
  jmapUrl: 'https://mail.example.com',
  jmapApiUrl: 'https://mail.example.com/jmap',
  uploadUrl: 'https://mail.example.com/upload/{accountId}/',
  downloadUrl:
    'https://mail.example.com/download/{accountId}/{blobId}/{name}?accept={type}',
  accountId: 'mock-account-001',
  accessToken: 'bW9jay1ieXBhc3M=',
  username: 'demo@kolumba.app',
}

// =============================================================================
// Mailboxes
// =============================================================================

const allRights = {
  mayReadItems: true,
  mayAddItems: true,
  mayRemoveItems: true,
  maySetSeen: true,
  maySetKeywords: true,
  mayCreateChild: true,
  mayRename: true,
  mayDelete: true,
  maySubmit: true,
}

export const mockMailboxes: Array<Mailbox> = [
  {
    id: 'mb-inbox',
    name: 'Inbox',
    parentId: null,
    role: 'inbox',
    sortOrder: 1,
    totalEmails: 142,
    unreadEmails: 5,
    totalThreads: 130,
    unreadThreads: 5,
    myRights: allRights,
    isSubscribed: true,
  },
  {
    id: 'mb-drafts',
    name: 'Drafts',
    parentId: null,
    role: 'drafts',
    sortOrder: 2,
    totalEmails: 2,
    unreadEmails: 0,
    totalThreads: 2,
    unreadThreads: 0,
    myRights: allRights,
    isSubscribed: true,
  },
  {
    id: 'mb-sent',
    name: 'Sent',
    parentId: null,
    role: 'sent',
    sortOrder: 3,
    totalEmails: 89,
    unreadEmails: 0,
    totalThreads: 80,
    unreadThreads: 0,
    myRights: allRights,
    isSubscribed: true,
  },
  {
    id: 'mb-archive',
    name: 'Archive',
    parentId: null,
    role: 'archive',
    sortOrder: 4,
    totalEmails: 312,
    unreadEmails: 0,
    totalThreads: 290,
    unreadThreads: 0,
    myRights: allRights,
    isSubscribed: true,
  },
  {
    id: 'mb-junk',
    name: 'Spam',
    parentId: null,
    role: 'junk',
    sortOrder: 5,
    totalEmails: 14,
    unreadEmails: 14,
    totalThreads: 14,
    unreadThreads: 14,
    myRights: allRights,
    isSubscribed: true,
  },
  {
    id: 'mb-trash',
    name: 'Trash',
    parentId: null,
    role: 'trash',
    sortOrder: 6,
    totalEmails: 7,
    unreadEmails: 0,
    totalThreads: 7,
    unreadThreads: 0,
    myRights: allRights,
    isSubscribed: true,
  },
  {
    id: 'mb-receipts',
    name: 'Receipts',
    parentId: null,
    role: null,
    sortOrder: 10,
    totalEmails: 23,
    unreadEmails: 1,
    totalThreads: 23,
    unreadThreads: 1,
    myRights: allRights,
    isSubscribed: true,
  },
]

// =============================================================================
// Helpers
// =============================================================================

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function hoursAgo(n: number): string {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

// =============================================================================
// Email list items (inbox)
// =============================================================================

export const mockEmailList: Array<EmailListItem> = [
  {
    id: 'em-001',
    threadId: 'th-001',
    mailboxIds: { 'mb-inbox': true },
    keywords: {},
    receivedAt: hoursAgo(1),
    from: [{ name: 'Elena Rodriguez', email: 'elena@designstudio.co' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Updated brand guidelines — final version for Q2 review',
    preview:
      'Hi there! I just finished the updated brand guidelines document. The color palette has been refined based on our last meeting. Please review and let me know if you have any feedback before we share with the team.',
    hasAttachment: true,
  },
  {
    id: 'em-002',
    threadId: 'th-002',
    mailboxIds: { 'mb-inbox': true },
    keywords: { $seen: true, $flagged: true },
    receivedAt: hoursAgo(3),
    from: [{ name: 'Marcus Chen', email: 'marcus@openlab.dev' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Re: API rate limiting discussion',
    preview:
      'Good point about the sliding window approach. I ran some benchmarks and the results are promising — 40% reduction in p99 latency. Attaching the full report.',
    hasAttachment: true,
  },
  {
    id: 'em-003',
    threadId: 'th-003',
    mailboxIds: { 'mb-inbox': true },
    keywords: {},
    receivedAt: hoursAgo(5),
    from: [{ name: 'Ava Lindström', email: 'ava.lindstrom@nordic.se' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Conference talk submission accepted!',
    preview:
      'Great news — your talk "Building Modern Email Clients with JMAP" has been accepted for NordicConf 2026. The slot is June 14, 2:30 PM in Track B. Please confirm your attendance by March 20.',
    hasAttachment: false,
  },
  {
    id: 'em-004',
    threadId: 'th-004',
    mailboxIds: { 'mb-inbox': true },
    keywords: { $seen: true },
    receivedAt: daysAgo(1),
    from: [{ name: 'James Okafor', email: 'james@greenfield.io' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Invoice #2847 — March consulting hours',
    preview:
      'Please find attached the invoice for 32 hours of consulting work completed in February. Payment terms: net 30. Let me know if you have any questions.',
    hasAttachment: true,
  },
  {
    id: 'em-005',
    threadId: 'th-005',
    mailboxIds: { 'mb-inbox': true },
    keywords: { $seen: true },
    receivedAt: daysAgo(1),
    from: [{ name: 'Sophie Tremblay', email: 'sophie@codeweave.ca' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Thoughts on the new onboarding flow?',
    preview:
      'Hey! I sketched out some ideas for simplifying the onboarding. Instead of 5 steps, we could reduce it to 3 with progressive disclosure. What do you think about this approach?',
    hasAttachment: false,
  },
  {
    id: 'em-006',
    threadId: 'th-006',
    mailboxIds: { 'mb-inbox': true },
    keywords: { $seen: true, $flagged: true },
    receivedAt: daysAgo(2),
    from: [{ name: 'Raj Patel', email: 'raj@cloudnative.systems' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Kubernetes migration plan',
    preview:
      'Here is the revised migration plan with the rollback strategy we discussed. Phase 1 starts next Monday. All staging tests passed green. Need your sign-off by EOD Thursday.',
    hasAttachment: false,
  },
  {
    id: 'em-007',
    threadId: 'th-007',
    mailboxIds: { 'mb-inbox': true },
    keywords: {},
    receivedAt: daysAgo(3),
    from: [{ name: 'GitHub', email: 'notifications@github.com' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject:
      '[kolumba/webmail] PR #42: Implement JMAP push notifications via EventSource',
    preview:
      '@user opened a pull request: This PR adds support for real-time email notifications using the JMAP EventSource endpoint. Changes include a new EventSource client, notification badge updates, and browser notification permission handling.',
    hasAttachment: false,
  },
  {
    id: 'em-008',
    threadId: 'th-008',
    mailboxIds: { 'mb-inbox': true },
    keywords: { $seen: true },
    receivedAt: daysAgo(5),
    from: [{ name: 'Lucia Fernández', email: 'lucia@typecraft.design' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Font pairing suggestions for Kolumba',
    preview:
      'After testing several combinations, I think Plus Jakarta Sans pairs beautifully with Geist Mono for code. The warmth of Jakarta balances the geometric precision of Geist perfectly.',
    hasAttachment: false,
  },
  {
    id: 'em-009',
    threadId: 'th-009',
    mailboxIds: { 'mb-inbox': true },
    keywords: { $seen: true },
    receivedAt: daysAgo(14),
    from: [{ name: 'Oliver Winslow', email: 'oliver@archivists.org' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Re: Data retention policy update',
    preview:
      'Thanks for the clarification. We will update our records accordingly. The new 90-day retention window should give us enough time for compliance audits while keeping storage costs manageable.',
    hasAttachment: false,
  },
  {
    id: 'em-010',
    threadId: 'th-010',
    mailboxIds: { 'mb-inbox': true },
    keywords: { $seen: true },
    receivedAt: daysAgo(60),
    from: [{ name: 'Yuki Tanaka', email: 'yuki@pixelforge.jp' }],
    to: [{ name: null, email: 'demo@kolumba.app' }],
    subject: 'Happy New Year from PixelForge',
    preview:
      'Wishing you a wonderful 2026! Looking forward to continuing our collaboration. We have some exciting projects lined up that I think you will love.',
    hasAttachment: false,
  },
]

// =============================================================================
// Full email objects (for detail view)
// =============================================================================

export const mockEmails: Record<string, Email> = {
  'em-001': {
    id: 'em-001',
    blobId: 'blob-001',
    threadId: 'th-001',
    mailboxIds: { 'mb-inbox': true },
    keywords: {},
    size: 48200,
    receivedAt: mockEmailList[0]!.receivedAt,
    messageId: ['<msg-001@designstudio.co>'],
    inReplyTo: null,
    references: null,
    sender: null,
    from: [{ name: 'Elena Rodriguez', email: 'elena@designstudio.co' }],
    to: [{ name: 'Demo User', email: 'demo@kolumba.app' }],
    cc: null,
    bcc: null,
    replyTo: null,
    subject: 'Updated brand guidelines — final version for Q2 review',
    sentAt: mockEmailList[0]!.receivedAt,
    bodyValues: {
      'text-body': {
        value:
          'Hi there!\n\nI just finished the updated brand guidelines document. The color palette has been refined based on our last meeting.\n\nKey changes:\n- Primary color shifted from violet to indigo\n- Warmer neutral tones throughout\n- New typography pairing: Plus Jakarta Sans + Geist Mono\n\nPlease review and let me know if you have any feedback before we share with the team.\n\nBest,\nElena',
      },
      'html-body': {
        value: `<div style="font-family: system-ui, sans-serif;">
<p>Hi there!</p>
<p>I just finished the updated brand guidelines document. The color palette has been refined based on our last meeting.</p>
<h3>Key changes:</h3>
<ul>
<li>Primary color shifted from violet to <strong>indigo</strong></li>
<li>Warmer neutral tones throughout</li>
<li>New typography pairing: <em>Plus Jakarta Sans</em> + <code>Geist Mono</code></li>
</ul>
<blockquote>
<p>"Good design is as little design as possible." — Dieter Rams</p>
</blockquote>
<p>Please review and let me know if you have any feedback before we share with the team.</p>
<p>Best,<br>Elena</p>
</div>`,
      },
    },
    textBody: [{ partId: 'text-body', type: 'text/plain' }],
    htmlBody: [{ partId: 'html-body', type: 'text/html' }],
    attachments: [
      {
        partId: 'att-1',
        blobId: 'blob-att-001',
        name: 'Brand-Guidelines-Q2-2026.pdf',
        type: 'application/pdf',
        size: 4200000,
      },
      {
        partId: 'att-2',
        blobId: 'blob-att-002',
        name: 'Color-Palette.png',
        type: 'image/png',
        size: 820000,
      },
    ],
    hasAttachment: true,
    preview: mockEmailList[0]!.preview,
  },
  'em-002': {
    id: 'em-002',
    blobId: 'blob-002',
    threadId: 'th-002',
    mailboxIds: { 'mb-inbox': true },
    keywords: { $seen: true, $flagged: true },
    size: 15600,
    receivedAt: mockEmailList[1]!.receivedAt,
    messageId: ['<msg-002@openlab.dev>'],
    inReplyTo: ['<msg-002-parent@kolumba.app>'],
    references: ['<msg-002-parent@kolumba.app>'],
    sender: null,
    from: [{ name: 'Marcus Chen', email: 'marcus@openlab.dev' }],
    to: [{ name: 'Demo User', email: 'demo@kolumba.app' }],
    cc: [{ name: 'Sophie Tremblay', email: 'sophie@codeweave.ca' }],
    bcc: null,
    replyTo: null,
    subject: 'Re: API rate limiting discussion',
    sentAt: mockEmailList[1]!.receivedAt,
    bodyValues: {
      'text-body': {
        value:
          'Good point about the sliding window approach. I ran some benchmarks and the results are promising — 40% reduction in p99 latency.\n\nAttaching the full report.\n\n— Marcus',
      },
      'html-body': {
        value: `<div style="font-family: system-ui, sans-serif;">
<p>Good point about the sliding window approach. I ran some benchmarks and the results are promising — <strong>40% reduction in p99 latency</strong>.</p>
<p>Here are the highlights:</p>
<pre><code>Benchmark Results (1000 requests/sec)
─────────────────────────────────────
Fixed Window:   p99 = 245ms, p95 = 180ms
Sliding Window: p99 = 147ms, p95 = 112ms
Token Bucket:   p99 = 168ms, p95 = 130ms</code></pre>
<p>Attaching the full report.</p>
<p>— Marcus</p>
</div>`,
      },
    },
    textBody: [{ partId: 'text-body', type: 'text/plain' }],
    htmlBody: [{ partId: 'html-body', type: 'text/html' }],
    attachments: [
      {
        partId: 'att-1',
        blobId: 'blob-att-003',
        name: 'rate-limiting-benchmarks.pdf',
        type: 'application/pdf',
        size: 1560000,
      },
    ],
    hasAttachment: true,
    preview: mockEmailList[1]!.preview,
  },
  'em-003': {
    id: 'em-003',
    blobId: 'blob-003',
    threadId: 'th-003',
    mailboxIds: { 'mb-inbox': true },
    keywords: {},
    size: 8400,
    receivedAt: mockEmailList[2]!.receivedAt,
    messageId: ['<msg-003@nordic.se>'],
    inReplyTo: null,
    references: null,
    sender: null,
    from: [{ name: 'Ava Lindström', email: 'ava.lindstrom@nordic.se' }],
    to: [{ name: 'Demo User', email: 'demo@kolumba.app' }],
    cc: null,
    bcc: null,
    replyTo: [{ name: 'NordicConf Speakers', email: 'speakers@nordic.se' }],
    subject: 'Conference talk submission accepted!',
    sentAt: mockEmailList[2]!.receivedAt,
    bodyValues: {
      'text-body': {
        value:
          'Great news — your talk "Building Modern Email Clients with JMAP" has been accepted for NordicConf 2026.\n\nDetails:\n- Date: June 14, 2026\n- Time: 2:30 PM\n- Track: B (Developer Tools)\n- Duration: 30 minutes + 10 min Q&A\n\nPlease confirm your attendance by March 20.\n\nLooking forward to it!\nAva Lindström\nProgram Chair, NordicConf',
      },
      'html-body': {
        value: `<div style="font-family: system-ui, sans-serif;">
<p>Great news — your talk <strong>"Building Modern Email Clients with JMAP"</strong> has been accepted for <a href="#">NordicConf 2026</a>.</p>
<h3>Details:</h3>
<table style="border-collapse: collapse; width: 100%; max-width: 400px;">
<tr><td style="padding: 8px; border: 1px solid #e5e5e5;"><strong>Date</strong></td><td style="padding: 8px; border: 1px solid #e5e5e5;">June 14, 2026</td></tr>
<tr><td style="padding: 8px; border: 1px solid #e5e5e5;"><strong>Time</strong></td><td style="padding: 8px; border: 1px solid #e5e5e5;">2:30 PM</td></tr>
<tr><td style="padding: 8px; border: 1px solid #e5e5e5;"><strong>Track</strong></td><td style="padding: 8px; border: 1px solid #e5e5e5;">B (Developer Tools)</td></tr>
<tr><td style="padding: 8px; border: 1px solid #e5e5e5;"><strong>Duration</strong></td><td style="padding: 8px; border: 1px solid #e5e5e5;">30 min + 10 min Q&A</td></tr>
</table>
<p>Please confirm your attendance by <strong>March 20</strong>.</p>
<p>Looking forward to it!<br>Ava Lindström<br><em>Program Chair, NordicConf</em></p>
</div>`,
      },
    },
    textBody: [{ partId: 'text-body', type: 'text/plain' }],
    htmlBody: [{ partId: 'html-body', type: 'text/html' }],
    attachments: [],
    hasAttachment: false,
    preview: mockEmailList[2]!.preview,
  },
}

// Generate basic mock Email for any ID not in the detailed map
function generateBasicMockEmail(listItem: EmailListItem): Email {
  return {
    id: listItem.id,
    blobId: `blob-${listItem.id}`,
    threadId: listItem.threadId,
    mailboxIds: listItem.mailboxIds,
    keywords: listItem.keywords,
    size: 5000,
    receivedAt: listItem.receivedAt,
    messageId: [`<${listItem.id}@mock>`],
    inReplyTo: null,
    references: null,
    sender: null,
    from: listItem.from,
    to: listItem.to,
    cc: null,
    bcc: null,
    replyTo: null,
    subject: listItem.subject,
    sentAt: listItem.receivedAt,
    bodyValues: {
      'text-body': { value: listItem.preview },
    },
    textBody: [{ partId: 'text-body', type: 'text/plain' }],
    htmlBody: [],
    attachments: [],
    hasAttachment: listItem.hasAttachment,
    preview: listItem.preview,
  }
}

export function getMockEmail(emailId: string): Email | null {
  if (mockEmails[emailId]) return mockEmails[emailId]
  const listItem = mockEmailList.find((e) => e.id === emailId)
  if (listItem) return generateBasicMockEmail(listItem)
  return null
}

// =============================================================================
// Identities
// =============================================================================

export const mockIdentities: Array<Identity> = [
  {
    id: 'id-001',
    name: 'Demo User',
    email: 'demo@kolumba.app',
    replyTo: null,
    bcc: null,
    textSignature: '',
    htmlSignature: '',
    mayDelete: false,
  },
]
