# Removal Password Guide

⚠️ **IMPORTANT LIMITATION DISCOVERED**

The `RemovalPassword` field in iOS mobileconfig profiles **only works on supervised devices** (enterprise/education with MDM). On regular consumer iOS devices (personal iPhones/iPads), **iOS ignores the removal password**.

## What This Means

### On Consumer Devices (Most Users):
- ❌ Password is **not enforced** by iOS
- ❌ Users can remove profile without entering password
- ✅ Profile **shows** "password required" but iOS doesn't enforce it
- ✅ `ConsentText` warning **does show** and adds friction

### On Supervised Devices (Enterprise/MDM):
- ✅ Password **is enforced** by iOS
- ✅ Cannot remove without correct password
- ✅ Full protection works as intended

## What Actually Works

Since technical password protection doesn't work on consumer devices, here's what DOES work:

## What We Implemented Instead

Since password enforcement doesn't work, we use **ConsentText** - a warning message that appears when users try to remove the profile:

### Current Implementation:

When `REMOVAL_PASSWORD` is set in `.env.local`:

```bash
REMOVAL_PASSWORD=ContactYourSponsor
```

Users see this message when removing:

```
⚠️ IMPORTANT: This profile helps protect you from gambling sites.

Removal Password: ContactYourSponsor

By removing this profile, you will lose DNS-level blocking protection.

If you're experiencing an urge to gamble:
- Wait 24 hours before removing
- Contact your support person  
- Call gambling helpline: 1-800-GAMBLER

Think carefully before proceeding.
```

This creates **psychological friction** instead of technical enforcement.

### Option 2: Per-User Custom Password

Users can download with a custom password by visiting:

```
http://localhost:3000/api/apple-profile?password=CustomPassword123
```

## Example Scenarios

### Scenario 1: Self-Control Tool
**Setup:** User sets their own password and gives it to a trusted friend/family member

```
REMOVAL_PASSWORD=AskMyWifeFirst2024
```

- User installs profile with this password
- User doesn't have the password written down
- To remove, user must ask wife for password
- Adds accountability and thinking time

### Scenario 2: Time-Delayed Password
**Setup:** Use a password that you'll reveal later

```
REMOVAL_PASSWORD=RevealedIn30Days
```

- Tell users: "The password will be emailed to you in 30 days"
- Forces 30-day commitment period
- Good for behavior change programs

### Scenario 3: Unique Passwords Per User
**Setup:** Generate unique passwords for each user

Create a download page that generates unique links:
```javascript
// In your app, create download links like:
const userPassword = generateRandomPassword(); // Store this in your DB
const downloadUrl = `/api/apple-profile?password=${userPassword}`;
```

Then email users their unique removal password separately.

## Best Practices

### 1. **Make Password Memorable but Not Obvious**
```
❌ Bad: "123456", "password", "remove"
✅ Good: "MyCommitmentTo2025", "HealthyChoices"
```

### 2. **Communicate Clearly**
Tell users upfront:
- ✅ "You'll need a password to remove this profile"
- ✅ "Keep this password safe"
- ✅ "This is to help you stay committed"

### 3. **Store Password Securely**
- Don't email it with the profile link
- Consider time-delayed delivery
- Or give to accountability partner

### 4. **Consider Use Case**

**Personal Use:**
- Set a password you'll have to consciously retrieve
- Write it down and give to someone you trust

**Clinical/Therapeutic:**
- Therapist sets password
- Patient must request it (creates accountability)

**Family/Parental:**
- Parent sets password
- Children can't remove without asking

## What Users See

### During Installation:
```
Profile: "Spelinsikt BetBlocker DNS"
Organization: Spelinsikt

This profile will configure DNS settings.
A password is required to remove this profile.

[Cancel] [Install]
```

### During Removal:
```
Remove "Spelinsikt BetBlocker DNS"?

This profile requires a password to remove.

Password: [________________]

[Cancel] [Remove]
```

If wrong password: **"Incorrect password"** message

## Technical Details

- Password is stored in plain text in the mobileconfig
- Apple handles the password validation
- No way to recover password if lost (must reinstall profile)
- Password works on both iOS and macOS
- Cannot be bypassed without device reset or MDM

## Limitations

⚠️ **Important Limitations:**

1. **Can be read in the file**: If user opens the `.mobileconfig` in a text editor, they can see the password
2. **Not encryption**: This is not a security feature, it's a **friction feature**
3. **Factory reset removes it**: User can always factory reset device
4. **Delete profile via backup**: Advanced users can remove via iTunes/Finder backup editing

**This is about adding friction, not absolute prevention.**

## Recovery Options

If password is lost:

1. **Reinstall profile**: Download and install again (will replace old one)
2. **Factory reset device**: Nuclear option, removes everything
3. **Contact support**: If you control the password, you can tell them

## Example Use Cases That Work Well

✅ **Gambling Addiction Support**
- Password given to sponsor/therapist
- Creates accountability checkpoint

✅ **Digital Wellness**
- Self-imposed blocking
- Password in safe or with friend

✅ **Parental Controls**
- Parent controls removal
- Child can't bypass

✅ **Corporate Policy**
- IT department controls removal
- Employees must request access

## Example Implementation

### Simple Setup:

```bash
# .env.local
REMOVAL_PASSWORD=AskForHelp2025
```

Restart server, done!

### Advanced Setup with UI:

Update `page.js` to let users choose:

```javascript
const [password, setPassword] = useState('');

function handleDownloadWithPassword() {
  const url = password 
    ? `/api/apple-profile?password=${encodeURIComponent(password)}`
    : `/api/apple-profile`;
  window.location.href = url;
}

// In your JSX:
<input 
  type="text" 
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Optional: Set removal password"
/>
<button onClick={handleDownloadWithPassword}>
  Download Profile
</button>
```

## Testing

1. Set `REMOVAL_PASSWORD=test123` in `.env.local`
2. Restart server
3. Download and install profile
4. Try to remove: Settings → Profiles → Remove
5. You'll be prompted for password "test123"

## Recommendations for Spelinsikt BetBlocker

Since you're focused on gambling blocking:

```bash
# Good default passwords:
REMOVAL_PASSWORD=ContactSupport2025
REMOVAL_PASSWORD=ThinkTwice
REMOVAL_PASSWORD=24HourRule
REMOVAL_PASSWORD=CallYourSponsor
```

The password itself becomes a reminder of commitment!

## Further Security

For even more protection (advanced):

1. **Supervised devices** - Requires MDM, can truly prevent removal
2. **Screen Time API** - Native iOS blocking, harder to bypass
3. **DNS + VPN combo** - Add VPN profile too (double protection)
4. **Router-level blocking** - Block at network level

But for most use cases, **removal password + accountability partner** works great!

