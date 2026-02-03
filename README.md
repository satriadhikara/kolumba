# Kolumba

Modern open-source webmail client for [Stalwart Mail Server](https://stalw.art/), built on the JMAP protocol.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)

## About

Kolumba is a purpose-built webmail client for Stalwart Mail Server. Unlike general-purpose email clients, Kolumba speaks JMAP natively - no IMAP translation, no provider-specific APIs. Just point it at your Stalwart instance and go.

**Name origin:** Columba = Latin for dove/pigeon (the classic mail carrier bird)

## Features

- **Native JMAP** - Full RFC 8620/8621 implementation
- **Secure by Design** - Credentials never reach the browser; all JMAP communication is proxied through server functions
- **Modern UI** - Clean, minimal interface inspired by modern email clients
- **Keyboard Shortcuts** - Power user friendly (`j/k` navigate, `c` compose, `r` reply, `e` archive, and more)
- **Dark Mode** - First-class dark mode support
- **Responsive** - Works on desktop, tablet, and mobile
- **Self-Hostable** - Deploy via Docker or serverless platforms

## Screenshots

*Coming soon*

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+) or Node.js (v20+)
- A running [Stalwart Mail Server](https://stalw.art/) instance with JMAP enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/satriadhikara/kolumba.git
cd kolumba

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your Stalwart credentials.

### Environment Variables

```env
SESSION_SECRET=your-32-character-secret-here  # Required for production
```

Note: The JMAP URL is entered per-user at login, not configured globally.

## Deployment

### Docker

```bash
# Build the image
docker build -t kolumba .

# Run the container
docker run -p 3000:3000 -e SESSION_SECRET=your-secret kolumba
```

### Docker Compose

```yaml
version: '3.8'
services:
  kolumba:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SESSION_SECRET=your-32-character-secret-here
    restart: unless-stopped
```

### Serverless

Kolumba supports deployment to:

- **Vercel** - Zero-config deployment
- **Cloudflare Workers** - Via adapter
- **AWS Lambda** - Via adapter

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19 meta-framework)
- **Routing:** [TanStack Router](https://tanstack.com/router) (file-based)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) with Tailwind CSS v4
- **Icons:** [HugeIcons](https://hugeicons.com/)
- **Font:** [Geist](https://vercel.com/font)
- **Protocol:** JMAP ([RFC 8620](https://datatracker.ietf.org/doc/html/rfc8620), [RFC 8621](https://datatracker.ietf.org/doc/html/rfc8621))

## Architecture

```
Browser (React) → TanStack Server Functions → Stalwart JMAP API
```

All JMAP communication happens server-side, keeping credentials secure and enabling deployment on both serverless and traditional platforms.

```
src/
├── routes/           # File-based routing
├── server/           # Server functions (auth, JMAP operations)
├── lib/jmap/         # JMAP protocol implementation
├── components/
│   ├── mail/         # Email-specific components
│   └── ui/           # shadcn/ui components
└── hooks/            # React hooks (keyboard shortcuts, etc.)
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `j` / `k` | Navigate messages |
| `c` | Compose new email |
| `r` | Reply |
| `a` | Reply all |
| `f` | Forward |
| `e` | Archive |
| `#` | Delete |
| `s` | Star/unstar |
| `u` | Mark unread |
| `Esc` | Close/back |

## Development

```bash
# Start dev server
bun run dev

# Run tests
bun run test

# Lint code
bun run lint

# Format and fix
bun run check

# Production build
bun run build
```

## Roadmap

### v1.0 (Current)
- [x] Login / authentication
- [x] Mailbox navigation
- [x] Message list with pagination
- [x] Message detail view
- [x] Compose / Reply / Forward
- [x] Mark read/unread, star/unstar
- [x] Move, delete, archive
- [x] Search
- [x] Keyboard shortcuts
- [x] Dark mode
- [x] Responsive design

### Future
- [ ] Email threading / conversation view
- [ ] Contacts / address book (JMAP Contacts)
- [ ] Calendar (JMAP Calendars)
- [ ] Push notifications (JMAP EventSource)
- [ ] Attachment preview
- [ ] Multi-account support
- [ ] Advanced filters / rules

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Stalwart Mail Server](https://stalw.art/) - The excellent mail server this client is built for
- [TanStack](https://tanstack.com/) - For the amazing React ecosystem
- [shadcn/ui](https://ui.shadcn.com/) - For the beautiful UI components
- [mail0](https://github.com/Mail-0/Mail-0) - For UI/UX inspiration

---

**Kolumba** - Modern webmail for the self-hosted era.
