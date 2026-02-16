# Setting Up Stalwart Mail Server for Kolumba

This guide walks you through setting up [Stalwart Mail Server](https://stalw.art/) to work with Kolumba webmail.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual Installation](#manual-installation)
- [Configuring JMAP](#configuring-jmap)
- [Creating User Accounts](#creating-user-accounts)
- [Stalwart Web UI](#stalwart-web-ui)
- [Connecting Kolumba](#connecting-kolumba)
- [Production Considerations](#production-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- A server with a public IP address (for receiving emails)
- A domain name with DNS access
- Docker and Docker Compose (recommended) or a Linux server
- SSL certificate (Let's Encrypt recommended)

## Quick Start with Docker

The fastest way to get Stalwart running is with Docker.

### 1. Create Docker Compose File

```yaml
# docker-compose.yml
version: '3.8'

services:
  stalwart:
    image: stalwartlabs/mail-server:latest
    container_name: stalwart-mail
    restart: unless-stopped
    ports:
      - '25:25' # SMTP
      - '465:465' # SMTP over TLS
      - '587:587' # SMTP Submission
      - '993:993' # IMAP over TLS
      - '443:443' # HTTPS (JMAP + Web UI)
      - '8080:8080' # HTTP (management)
    volumes:
      - ./stalwart-data:/opt/stalwart-mail
    environment:
      - STALWART_HOSTNAME=mail.example.com
```

### 2. Start Stalwart

```bash
docker compose up -d
```

### 3. Initial Setup

On first run, Stalwart creates an admin account. Check the logs for credentials:

```bash
docker logs stalwart-mail 2>&1 | grep -i "admin"
```

You'll see output like:

```
Created default administrator account "admin" with password "XXXXXXXX"
```

Save these credentials - you'll need them to access the admin UI.

## Manual Installation

For non-Docker installations, follow the [official Stalwart installation guide](https://stalw.art/docs/install/).

### Linux (Debian/Ubuntu)

```bash
# Download latest release
curl -sSL https://get.stalw.art | sh

# Start the service
systemctl enable stalwart-mail
systemctl start stalwart-mail
```

## Configuring JMAP

Stalwart has JMAP enabled by default. Verify it's accessible:

```bash
curl -s https://mail.example.com/.well-known/jmap | jq
```

You should see a JSON response with JMAP capabilities:

```json
{
  "capabilities": {
    "urn:ietf:params:jmap:core": { ... },
    "urn:ietf:params:jmap:mail": { ... }
  },
  "accounts": { ... },
  "apiUrl": "https://mail.example.com/jmap",
  ...
}
```

### JMAP Configuration Options

If you need to customize JMAP settings, edit your Stalwart configuration:

```toml
# /opt/stalwart-mail/etc/config.toml

[server.listener.https]
bind = ["0.0.0.0:443"]
protocol = "http"
tls.implicit = true

[server.http]
# Enable JMAP endpoints
jmap.enable = true
# Enable Web UI
webadmin.enable = true
```

## Creating User Accounts

### Via Web Admin UI

1. Open `https://mail.example.com/admin` in your browser
2. Log in with the admin credentials from setup
3. Navigate to **Accounts** → **Add Account**
4. Fill in:
   - **Username**: `user@example.com`
   - **Password**: Strong password
   - **Name**: Display name
5. Click **Create**

### Via CLI

```bash
# Docker
docker exec -it stalwart-mail stalwart-cli account create user@example.com "User Name"

# Non-Docker
stalwart-cli account create user@example.com "User Name"
```

### Via REST API

```bash
curl -X POST https://mail.example.com/api/account \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user@example.com",
    "password": "securepassword",
    "description": "User Name"
  }'
```

## Stalwart Web UI

Stalwart includes a built-in web administration interface.

### Accessing the Admin UI

1. Navigate to `https://mail.example.com/admin`
2. Log in with admin credentials

### Admin UI Features

- **Dashboard**: Server status, queue stats, active connections
- **Accounts**: Create, edit, delete user accounts
- **Domains**: Manage email domains
- **Settings**: Configure server options
- **Logs**: View server logs and activity
- **Queue**: Monitor and manage email queues

### User Settings UI

Users can access their own settings at:

- `https://mail.example.com/settings`

Here they can:

- Change password
- Set up email forwarding
- Configure vacation auto-reply
- Manage email aliases

## Connecting Kolumba

Once Stalwart is running, connect Kolumba:

### 1. Start Kolumba

```bash
cd kolumba
bun run dev
```

### 2. Log In

1. Open `http://localhost:3000`
2. Enter your Stalwart details:
   - **JMAP URL**: `https://mail.example.com` (your Stalwart server)
   - **Username**: `user@example.com`
   - **Password**: Your account password

### 3. Verify Connection

If successful, you'll be redirected to your inbox. If you see errors:

- Check that Stalwart is running
- Verify the URL is correct (no trailing slash)
- Ensure your credentials are correct
- Check browser console for CORS errors

## Production Considerations

### DNS Records

Configure these DNS records for your domain:

```
# MX Record (for receiving mail)
example.com.        MX    10 mail.example.com.

# A Record (point to your server)
mail.example.com.   A     YOUR_SERVER_IP

# SPF Record (authorize sending)
example.com.        TXT   "v=spf1 mx -all"

# DKIM Record (get from Stalwart admin UI)
default._domainkey.example.com.  TXT   "v=DKIM1; k=rsa; p=..."

# DMARC Record
_dmarc.example.com. TXT   "v=DMARC1; p=quarantine; rua=mailto:admin@example.com"
```

### SSL/TLS Certificates

For production, use proper SSL certificates:

```yaml
# docker-compose.yml with Let's Encrypt
services:
  stalwart:
    image: stalwartlabs/mail-server:latest
    volumes:
      - ./stalwart-data:/opt/stalwart-mail
      - /etc/letsencrypt:/etc/letsencrypt:ro
    environment:
      - STALWART_TLS_CERT=/etc/letsencrypt/live/mail.example.com/fullchain.pem
      - STALWART_TLS_KEY=/etc/letsencrypt/live/mail.example.com/privkey.pem
```

Or use Stalwart's built-in ACME support:

```toml
# config.toml
[certificate.acme]
domains = ["mail.example.com"]
contact = ["mailto:admin@example.com"]
directory = "https://acme-v02.api.letsencrypt.org/directory"
```

### Firewall Rules

Open these ports:

| Port | Protocol | Purpose                             |
| ---- | -------- | ----------------------------------- |
| 25   | TCP      | SMTP (receiving mail)               |
| 465  | TCP      | SMTPS (sending with TLS)            |
| 587  | TCP      | Submission (sending)                |
| 993  | TCP      | IMAPS (optional, for other clients) |
| 443  | TCP      | HTTPS (JMAP, Web UI)                |

### Reverse Proxy (Optional)

If running behind nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name mail.example.com;

    ssl_certificate /etc/letsencrypt/live/mail.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mail.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (for JMAP push)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Troubleshooting

### "Connection Refused" in Kolumba

1. Check Stalwart is running:

   ```bash
   docker ps | grep stalwart
   ```

2. Test JMAP endpoint:

   ```bash
   curl -v https://mail.example.com/.well-known/jmap
   ```

3. Check Stalwart logs:
   ```bash
   docker logs stalwart-mail --tail 100
   ```

### "Invalid Credentials"

1. Verify the account exists:

   ```bash
   docker exec stalwart-mail stalwart-cli account list
   ```

2. Reset password if needed:
   ```bash
   docker exec stalwart-mail stalwart-cli account update user@example.com --password newpassword
   ```

### "CORS Errors" in Browser

Stalwart handles CORS automatically for JMAP. If you see CORS errors:

1. Ensure you're using HTTPS (not HTTP)
2. Check that the JMAP URL matches exactly (no www. mismatch)
3. Verify Stalwart's HTTP listener is configured correctly

### "Certificate Errors"

For development with self-signed certs:

1. Add the certificate to your system trust store, or
2. Use a proper Let's Encrypt certificate

### Emails Not Being Received

1. Check MX records:

   ```bash
   dig MX example.com
   ```

2. Test SMTP port is open:

   ```bash
   nc -zv mail.example.com 25
   ```

3. Check Stalwart queue:
   ```bash
   docker exec stalwart-mail stalwart-cli queue list
   ```

## Resources

- [Stalwart Documentation](https://stalw.art/docs/)
- [Stalwart GitHub](https://github.com/stalwartlabs/mail-server)
- [JMAP Specification (RFC 8620)](https://datatracker.ietf.org/doc/html/rfc8620)
- [JMAP Mail (RFC 8621)](https://datatracker.ietf.org/doc/html/rfc8621)
- [Kolumba GitHub](https://github.com/satriadhikara/kolumba)

---

Need help? [Open an issue](https://github.com/satriadhikara/kolumba/issues) on the Kolumba repository.
