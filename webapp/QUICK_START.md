# Quick Start Guide

Get your BetBlocker app running in 5 minutes!

## Step 1: Get NextDNS Credentials (2 minutes)

### Get API Key:
1. Go to https://nextdns.io/account
2. Log in or create a free account
3. Scroll to "API Key" section
4. Click "Generate" if you don't have one
5. Copy the API key

### Get Profile ID:
1. Go to https://my.nextdns.io
2. Click on any profile (or create a new one called "BetBlocker")
3. Look at the URL: `https://my.nextdns.io/abc123/setup`
4. The `abc123` part is your Profile ID - copy it

## Step 2: Configure the App (1 minute)

```bash
cd webapp

# Edit .env.local
nano .env.local  # or use your favorite editor
```

Replace these values:
```bash
NEXTDNS_API_KEY=paste_your_api_key_here
NEXTDNS_PROFILE_ID=paste_your_profile_id_here
```

Save the file (Ctrl+X, then Y in nano).

## Step 3: Install & Run (2 minutes)

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

Open http://localhost:3000 in your browser!

## Step 4: Test It Out

### On your computer:
1. Add a domain like `example.com` to the blocklist
2. Refresh to see it in the list

### On your iPhone/iPad:
1. Open http://localhost:3000 from your iOS device (make sure it's on the same network)
2. Click "📥 Download iOS Profile"
3. Go to Settings → Profile Downloaded → Install
4. Try visiting a blocked domain in Safari - it won't load!

## That's It! 🎉

Your app is now running. Any domain you add will be blocked on all devices that have the profile installed.

## Next Steps

### Make it Public:

Deploy to Vercel so anyone can access it:

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main

# Then go to vercel.com:
# 1. Import your GitHub repo
# 2. Add environment variables (same as .env.local)
# 3. Deploy!
```

### Add Signing (Optional):

To make your iOS profile appear more trusted:

```bash
# Generate a self-signed certificate
mkdir certs
cd certs

openssl genrsa -out private-key.pem 2048
openssl req -new -key private-key.pem -out request.csr \
  -subj "/C=US/O=BetBlocker/CN=BetBlocker DNS"
openssl x509 -req -days 365 -in request.csr \
  -signkey private-key.pem -out certificate.pem
cp certificate.pem ca-bundle.pem

cd ..
```

Then uncomment the signing lines in `.env.local`:
```bash
SIGNING_CERT_PATH=./certs/certificate.pem
SIGNING_KEY_PATH=./certs/private-key.pem
SIGNING_CA_PATH=./certs/ca-bundle.pem
```

Restart the server: `npm run dev`

See [SIGNING_GUIDE.md](./SIGNING_GUIDE.md) for more details.

## Troubleshooting

**Can't access from iPhone:**
- Make sure your iPhone is on the same WiFi
- Find your computer's IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
- Visit `http://YOUR_IP:3000` on iPhone

**Profile won't install:**
- Use Safari on iOS (other browsers may not work)
- Make sure you downloaded the file
- Check Settings → General → VPN & Device Management

**Domains not blocking:**
- Wait 30-60 seconds after installing profile
- Restart Safari or use Private mode
- Verify profile is installed and active

**"API Key not configured" error:**
- Make sure `.env.local` exists in the `webapp/` folder
- Check that the API key is correct (no extra spaces)
- Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

## Tips

- Test with a domain you control first
- Profile installation shows a warning - this is normal for unsigned profiles
- Blocked sites will show "Cannot connect" in Safari
- To unblock, just remove the domain from the list
- Changes take effect immediately (after DNS cache clears)

Need more help? Check out [README.md](./README.md) for detailed documentation!

