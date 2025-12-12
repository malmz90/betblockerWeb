# iOS mobileconfig Signing Guide

This guide explains how to sign your mobileconfig files to make them more trusted on iOS devices.

## Why Sign?

- **Unsigned profiles**: iOS shows a warning "Unverified Profile" but users can still install
- **Signed profiles**: Shows your organization name and appears more trustworthy
- **Enterprise signed**: If using Apple Developer Enterprise certificate, can be auto-distributed

## Option 1: Self-Signed Certificate (Free, Simple)

Good for testing. Users still see a warning but it shows your organization name.

### Generate Self-Signed Certificate

```bash
# Create a directory for certificates
mkdir -p certs
cd certs

# Generate private key
openssl genrsa -out private-key.pem 2048

# Generate certificate signing request
openssl req -new -key private-key.pem -out request.csr \
  -subj "/C=US/ST=State/L=City/O=BetBlocker/OU=IT/CN=BetBlocker DNS"

# Generate self-signed certificate (valid for 1 year)
openssl x509 -req -days 365 \
  -in request.csr \
  -signkey private-key.pem \
  -out certificate.pem

# Create CA bundle (for self-signed, same as certificate)
cp certificate.pem ca-bundle.pem

cd ..
```

### Update .env.local

```bash
SIGNING_CERT_PATH=./certs/certificate.pem
SIGNING_KEY_PATH=./certs/private-key.pem
SIGNING_CA_PATH=./certs/ca-bundle.pem
```

## Option 2: Apple Developer Certificate (Recommended)

Most trusted option. Requires Apple Developer account ($99/year).

### Steps:

1. **Get Apple Developer Account**
   - Go to https://developer.apple.com
   - Enroll in Apple Developer Program

2. **Create Certificate Signing Request (CSR)**
   ```bash
   # On macOS, use Keychain Access:
   # Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
   # Save the .certSigningRequest file
   ```

3. **Create Certificate in Apple Developer Portal**
   - Go to https://developer.apple.com/account/resources/certificates
   - Click "+" to create new certificate
   - Choose "iOS Distribution" or "Developer ID Application"
   - Upload your CSR file
   - Download the certificate (.cer file)

4. **Export Certificate and Private Key**
   ```bash
   # Import .cer into Keychain Access (double-click)
   # Find certificate in Keychain
   # Right-click → Export → Save as .p12
   # Enter a password
   ```

5. **Convert to PEM format**
   ```bash
   mkdir -p certs
   
   # Extract certificate
   openssl pkcs12 -in certificate.p12 -clcerts -nokeys -out certs/certificate.pem
   
   # Extract private key
   openssl pkcs12 -in certificate.p12 -nocerts -nodes -out certs/private-key.pem
   
   # Download Apple Root CA from:
   # https://www.apple.com/certificateauthority/
   # Save as certs/ca-bundle.pem
   ```

6. **Update .env.local**
   ```bash
   SIGNING_CERT_PATH=./certs/certificate.pem
   SIGNING_KEY_PATH=./certs/private-key.pem
   SIGNING_CA_PATH=./certs/ca-bundle.pem
   ```

## Option 3: No Signing (Easiest)

Just leave the signing variables empty in `.env.local`. The profile will be unsigned but still works.

```bash
# Comment out or remove these lines
# SIGNING_CERT_PATH=
# SIGNING_KEY_PATH=
# SIGNING_CA_PATH=
```

Users will see "Unverified Profile" warning but can still install and use it.

## Testing Signed Profiles

1. Start your app: `npm run dev`
2. Download the mobileconfig on your iOS device
3. Go to Settings → Profile Downloaded
4. Check if it shows:
   - ✅ Signed: Shows organization name
   - ⚠️ Unsigned: Shows "Unverified"

Both can be installed and will work the same way.

## Security Notes

- **Keep your private key secure** - Never commit `private-key.pem` to git
- **Add to .gitignore**: The `certs/` folder should be in .gitignore
- **Rotate certificates**: Apple certificates expire after 1 year
- **Production**: For enterprise deployment, consider MDM (Mobile Device Management)

## Troubleshooting

**Error: "openssl: command not found"**
- Install OpenSSL (comes with macOS/Linux)
- Windows: Use Git Bash or WSL

**Signing fails silently**
- Check file paths in .env.local
- Ensure certificate files exist
- App will fall back to unsigned profile

**"Unverified Profile" still shows**
- Self-signed certificates still show this warning
- Only Apple Developer certificates show as verified
- The profile still works fine

## Recommended Approach

For your use case (testing with 100+ users):

1. **Start with Option 3 (No signing)** - Easiest, works fine
2. **Upgrade to Option 1 (Self-signed)** - Shows your branding
3. **Use Option 2 (Apple Developer)** - If you want most professional look

The blocking functionality works the same regardless of signing!

