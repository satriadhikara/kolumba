# Kolumba

Modern open-source webmail client for Stalwart mail server, built on JMAP protocol.

## Project Overview

Kolumba is a purpose-built webmail client for Stalwart mail server. Unlike general-purpose email clients (Gmail, mail0), Kolumba speaks JMAP natively - no IMAP translation, no provider-specific APIs. Users point it at their Stalwart instance and go.

**Name origin:** Columba = Latin for dove/pigeon (mail carrier bird)

## Development Commands

```bash
bun run dev          # Start dev server on port 3000
bun run build        # Production build
bun run test         # Run tests (Vitest)
bun run lint         # Run ESLint
bun run check        # Format with Prettier and fix ESLint issues
bun run preview      # Preview production build
bun run format       # Run Prettier (check only)
```

## Tech Stack

- **Framework:** TanStack Start (React 19 meta-framework with SSR via Nitro)
- **Routing:** TanStack Router with file-based routing in `src/routes/`
- **UI:** shadcn/ui (base-nova style, Zinc base, Violet accent, small radius)
- **Base Components:** @base-ui/react (headless component primitives)
- **Rich Text Editor:** Tiptap
- **Font:** Geist
- **Icons:** HugeIcons
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest
- **Protocol:** JMAP (RFC 8620, RFC 8621)
- **Target server:** Stalwart Mail Server

## Architecture

### Key Patterns

- **File-based Routing:** Routes are defined in `src/routes/`. The `__root.tsx` file is the root layout. Route tree is auto-generated in `routeTree.gen.ts` (do not edit manually).
- **Authenticated Routes:** Protected routes use the `_authed` layout route pattern. Routes under `src/routes/_authed/` require authentication; the `_authed.tsx` layout handles auth checks and redirects.
- **Path Aliases:** Use `@/*` to import from `src/*` (e.g., `@/components/ui/button`).
- **Component Variants:** UI components use class-variance-authority (CVA) for variant styling.
- **Utility Function:** Use `cn()` from `@/lib/utils` for merging Tailwind classes.
- **TypeScript Strictness:** `noUncheckedIndexedAccess` is enabled — array/record indexed access returns `T | undefined`. Always handle the `undefined` case when accessing `arr[i]` or `record[key]`.

### Key Principle: Server functions handle all JMAP calls

Credentials never reach the browser. TanStack Start server functions proxy all JMAP communication.

```
Browser (React) → TanStack Server Functions → Stalwart JMAP API
```

This enables deployment on:

- Serverless (Vercel, Cloudflare Workers, AWS Lambda)
- Traditional VPS (Node/Docker)

### Configuration

Simple env-based config. Users just set:

```env
JMAP_URL=https://mail.example.com
```

Auth is per-user via login flow.

## Project Structure

```
src/
├── router.tsx                                # TanStack Router configuration
├── styles.css                                # Global styles (Tailwind)
├── logo.svg                                  # App logo
├── routeTree.gen.ts                          # Auto-generated route tree (do not edit)
├── routes/
│   ├── __root.tsx                            # root layout
│   ├── index.tsx                             # landing/redirect
│   ├── login.tsx                             # login page
│   └── _authed.tsx                           # authenticated layout (auth guard)
│       └── _authed/
│           └── mail/
│               ├── route.tsx                 # mail layout (sidebar + content area)
│               ├── compose.tsx               # compose new email
│               └── $mailboxId/
│                   ├── route.tsx             # message list layout for mailbox
│                   ├── index.tsx             # message list default view
│                   └── $messageId.tsx        # message detail view
├── server/
│   ├── jmap.ts                               # core JMAP server functions
│   ├── auth.ts                               # authentication logic
│   └── session.ts                            # session/cookie management
├── lib/
│   ├── jmap/
│   │   ├── client.ts                         # JMAP request builder
│   │   ├── types.ts                          # JMAP type definitions (Email, Mailbox, etc.)
│   │   └── methods.ts                        # typed method helpers (Email/get, Mailbox/query, etc.)
│   └── utils.ts                              # cn() utility
├── hooks/
│   └── use-keyboard-shortcuts.ts             # keyboard shortcut handler (j/k, r, a, etc.)
└── components/
    ├── mail/
    │   ├── mailbox-list.tsx                   # sidebar mailbox navigation
    │   ├── message-list.tsx                   # email list with hover actions
    │   ├── message-list-item.tsx              # individual message row
    │   ├── message-view.tsx                   # email detail/reading pane
    │   ├── compose.tsx                        # compose/reply form
    │   ├── rich-text-editor.tsx               # Tiptap rich text editor for compose
    │   └── search.tsx                         # email search component
    └── ui/                                    # shadcn/ui components
```

## JMAP Implementation

### Session Discovery

```
GET https://{JMAP_URL}/.well-known/jmap
```

Returns session object with capabilities, account IDs, and API URL.

### Core JMAP Methods to Implement

**Mailbox operations:**

- `Mailbox/get` - fetch all mailboxes (inbox, sent, drafts, trash, etc.)
- `Mailbox/query` - search/filter mailboxes
- `Mailbox/set` - create, update, delete mailboxes

**Email operations:**

- `Email/query` - search/filter emails in a mailbox
- `Email/get` - fetch full email details (headers, body, attachments)
- `Email/set` - create drafts, update flags (read/unread, starred), move, delete
- `Email/changes` - efficient delta sync (only fetch what changed since last state)
- `EmailSubmission/set` - send emails

**Identity:**

- `Identity/get` - get user's send-as identities

### JMAP Request Format

All calls go to the API URL from session, as POST with:

```json
{
  "using": ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
  "methodCalls": [
    [
      "Email/query",
      {
        "accountId": "abc",
        "filter": { "inMailbox": "inbox-id" },
        "sort": [{ "property": "receivedAt", "isAscending": false }],
        "limit": 50
      },
      "call-0"
    ],
    [
      "Email/get",
      {
        "accountId": "abc",
        "#ids": { "resultOf": "call-0", "name": "Email/query", "path": "/ids" },
        "properties": [
          "id",
          "from",
          "to",
          "subject",
          "receivedAt",
          "preview",
          "keywords"
        ]
      },
      "call-1"
    ]
  ]
}
```

Note: JMAP supports **back-references** (`#ids` referencing results from previous calls in the same request). Use this to batch query + get in a single HTTP request.

### JMAP Keywords (Flags)

- `$seen` - read
- `$flagged` - starred/flagged
- `$draft` - draft
- `$answered` - replied to
- `$forwarded` - forwarded

## UI/UX Design

### Reference: mail0.io

Study mail0 (github.com/Mail-0/Mail-0) for UI/UX patterns. Key elements to adopt:

### Layout

- **Desktop:** Three-column layout (mailbox sidebar | message list | message view)
- **Tablet:** Two-column with collapsible sidebar
- **Mobile:** Single column with navigation stack

### Core UI Patterns

1. **Minimal chrome** - no heavy borders, generous whitespace
2. **Hover actions** - archive, delete, mark read/unread appear on message row hover
3. **Sender avatars** - generated from initials or gravatar for visual scanning
4. **Compact density toggle** - power users want more messages visible
5. **Keyboard shortcuts:**
   - `j/k` - navigate messages
   - `r` - reply
   - `a` - reply all
   - `f` - forward
   - `e` - archive
   - `#` - delete
   - `c` - compose
   - `Esc` - close/back
6. **Optimistic updates** - mark as read, move, delete should feel instant
7. **Dark mode** from day one

### Theme

- **Base:** Zinc
- **Accent:** Violet (selected items, unread indicators, primary actions)
- **Style:** Nova
- **Radius:** Small
- **Font:** Geist

## v1 Scope (MVP)

### Include

- [ ] Login / authentication with Stalwart
- [ ] Mailbox list (inbox, sent, drafts, trash, spam, custom folders)
- [ ] Message list with pagination/infinite scroll
- [ ] Message detail view (HTML + plain text rendering)
- [ ] Compose / Reply / Reply All / Forward
- [ ] Mark read/unread, star/unstar
- [ ] Move to folder, delete, archive
- [ ] Search emails
- [ ] Dark mode
- [ ] Mobile responsive
- [ ] Docker image for self-hosting

### Defer to Later

- Contacts / address book (JMAP Contacts)
- Calendar (JMAP Calendars)
- Advanced filter/rule management
- Multi-account support
- RTL language support
- AI features (summaries, categorization)
- Push notifications via JMAP EventSource
- Attachment preview (images, PDFs)
- Email threading/conversation view (can be v1.1)

## Deployment Targets

### Docker (primary)

```dockerfile
FROM node:20-alpine AS builder
# build steps
FROM node:20-alpine
# minimal production image
EXPOSE 3000
```

### Serverless

- Vercel: zero-config with TanStack Start adapter
- Cloudflare Workers: via adapter
- AWS Lambda: via adapter

### Environment Variables

```env
JMAP_URL=https://mail.example.com    # Stalwart JMAP endpoint
SESSION_SECRET=random-secret-here     # for cookie encryption
```

## Open Source

- **License:** MIT
- **Repo:** GitHub
- **Contributions:** Welcome
- **Goal:** Be the default webmail UI for Stalwart self-hosters
