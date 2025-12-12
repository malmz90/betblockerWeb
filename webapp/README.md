# BetBlocker DNS - Universal Blocklist for iOS

A Next.js web app that manages a universal DNS blocklist using NextDNS. All users share the same blocklist, and iOS devices can install a configuration profile to block unwanted domains.

## Features

- 🌐 **Universal Blocklist** - All users share the same blocklist
- 📱 **iOS Focus** - Download `.mobileconfig` profile for easy setup
- 🔒 **Optional Signing** - Sign profiles with certificates for added trust
- ⚡ **NextDNS Powered** - Uses NextDNS API for DNS-level blocking
- 👥 **Multi-User** - Support 100+ users with no database needed

## Quick Start

### 1. Prerequisites

- Node.js 16+ installed
- NextDNS account with API access
- A NextDNS profile ID (create one in NextDNS dashboard)

### 2. Setup

```bash
cd webapp
npm install
```

### 3. Configure Environment Variables

Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Required
NEXTDNS_API_KEY=your_api_key_from_nextdns
NEXTDNS_PROFILE_ID=your_profile_id

# Optional (for signing)
SIGNING_CERT_PATH=./certs/certificate.pem
SIGNING_KEY_PATH=./certs/private-key.pem
SIGNING_CA_PATH=./certs/ca-bundle.pem
```

**Where to get these:**
- **API Key**: https://nextdns.io/account
- **Profile ID**: Create a profile at https://my.nextdns.io → copy the ID from URL

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## How It Works

### For Users:

1. Visit your deployed app
2. Download the iOS configuration profile
3. Install it on their iOS device (Settings → Profile Downloaded → Install)
4. All domains in the shared blocklist are now blocked on their device

### For Admins:

1. Add domains to block via the web interface
2. All users with the profile installed are instantly protected
3. Remove domains to unblock them for everyone

## Signing Configuration Profiles

By default, profiles are **unsigned** - they work fine but iOS shows an "Unverified" warning.

To make profiles more trusted:

1. Generate a signing certificate (see [SIGNING_GUIDE.md](./SIGNING_GUIDE.md))
2. Add certificate paths to `.env.local`
3. Restart the app

See the full [Signing Guide](./SIGNING_GUIDE.md) for:
- Self-signed certificates (free, simple)
- Apple Developer certificates (most trusted)
- Detailed step-by-step instructions


## Deployment to Vercel

1. Push your code to GitHub
2. Import in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXTDNS_API_KEY`
   - `NEXTDNS_PROFILE_ID`
   - Optional: Certificate paths (if using signing)
4. Deploy!

**Note**: For signing on Vercel, you'll need to:
- Upload certificate files to your repo (in `certs/` folder)
- Add `certs/` to .gitignore if using sensitive certificates
- Or use Vercel's environment variables for certificate contents

## Project Structure

```
webapp/
├── src/
│   └── app/
│       ├── page.js                    # Main UI
│       ├── api/
│       │   ├── blocklist/route.js     # Add/remove/list domains
│       │   └── apple-profile/route.js # Generate & sign mobileconfig
├── certs/                             # Certificate files (gitignored)
├── .env.local                         # Your credentials (gitignored)
├── .env.example                       # Template for environment variables
├── SIGNING_GUIDE.md                   # Certificate signing instructions
└── README.md                          # This file
```

## API Endpoints

### `GET /api/blocklist`
Returns current universal blocklist

### `POST /api/blocklist`
Add domain to blocklist
```json
{ "domain": "example.com" }
```

### `DELETE /api/blocklist`
Remove domain from blocklist
```json
{ "domain": "example.com" }
```

### `GET /api/apple-profile`
Download iOS configuration profile (`.mobileconfig`)

## Security & Privacy

- API key stored server-side only (never exposed to browsers)
- All users share one NextDNS profile (no per-user data storage)
- Signing certificates kept in `certs/` folder (add to .gitignore)
- DNS queries processed by NextDNS (see their privacy policy)

## Limitations

- **iOS only** currently (Android support can be added)
- **Universal blocklist** (all users see same blocks)
- **No user authentication** (anyone can add/remove domains)
- **Requires manual profile installation** on each device

## Future Enhancements

- Add user authentication
- Per-user or group-based blocklists
- Android Private DNS support
- Pre-configured gambling site lists
- Allowlist support
- Analytics dashboard

## Troubleshooting

**"NEXTDNS_API_KEY not configured"**
- Check `.env.local` exists and has valid credentials
- Restart the dev server after changing `.env.local`

**Profile won't install on iOS**
- Check that the mobileconfig downloaded correctly
- Try in Safari (some browsers don't trigger profile install)
- Settings → General → VPN & Device Management → Install

**Domains not being blocked**
- Verify profile is installed (Settings → General → VPN & Device Management)
- Check NextDNS profile has the domains listed
- Wait 30-60 seconds for DNS cache to clear
- Try in Safari Private mode

**Signing not working**
- Check certificate file paths in `.env.local`
- Verify OpenSSL is installed: `openssl version`
- App will fall back to unsigned if signing fails
- Check server logs for signing errors

## License

MIT - Use freely for your blocking needs!
