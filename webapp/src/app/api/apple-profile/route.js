import { randomUUID } from "crypto";
import { readFile } from "fs/promises";
import { spawn } from "child_process";
import { join } from "path";
import { createHash } from "crypto";

const NEXTDNS_PROFILE_ID = process.env.NEXTDNS_PROFILE_ID;
const SIGNING_CERT_PATH = process.env.SIGNING_CERT_PATH;
const SIGNING_KEY_PATH = process.env.SIGNING_KEY_PATH;
const SIGNING_CA_PATH = process.env.SIGNING_CA_PATH;
const REMOVAL_PASSWORD = process.env.REMOVAL_PASSWORD;

function createMobileConfig(removalPassword) {
  if (!NEXTDNS_PROFILE_ID) {
    throw new Error("NEXTDNS_PROFILE_ID is not configured");
  }

  const safeId = String(NEXTDNS_PROFILE_ID).replace(/[^a-zA-Z0-9_-]/g, "");
  const profileUUID = randomUUID();
  const payloadUUID = randomUUID();

  // Build the basic configuration
  let config = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadIdentifier</key>
  <string>com.spelinsikt.betblocker.nextdns.${safeId}</string>
  <key>PayloadUUID</key>
  <string>${profileUUID}</string>
  <key>PayloadDisplayName</key>
  <string>Spelinsikt BetBlocker DNS</string>
  <key>PayloadDescription</key>
  <string>Configures DNS-over-HTTPS using NextDNS to block unwanted gambling and betting sites. A password is required to remove this profile.</string>
  <key>PayloadOrganization</key>
  <string>Spelinsikt</string>
  <key>PayloadScope</key>
  <string>System</string>`;

  // Configure removal restrictions
  // Note: RemovalPassword only works on supervised devices (MDM)
  // For consumer devices, we can only add friction, not absolute prevention
  if (removalPassword) {
    config += `
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>RemovalPassword</key>
  <string>${removalPassword}</string>
  <key>ConsentText</key>
  <dict>
    <key>en</key>
    <string>⚠️ IMPORTANT: This profile helps protect you from gambling sites.

Removal Password Required: ${removalPassword}

By removing this profile, you will lose DNS-level blocking protection. 

If you're experiencing an urge to gamble:
- Wait 24 hours before removing
- Contact your support person
- Call gambling helpline: 1-800-GAMBLER

Think carefully before proceeding.</string>
  </dict>`;
  } else {
    config += `
  <key>PayloadRemovalDisallowed</key>
  <false/>
  <key>ConsentText</key>
  <dict>
    <key>en</key>
    <string>⚠️ This profile blocks access to gambling websites.

Before removing, please consider:
- Wait 24 hours before making this decision
- Contact your support person or counselor
- Call gambling helpline if needed

Are you sure you want to remove this protection?</string>
  </dict>`;
  }

  config += `
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key>
      <string>com.apple.dnsSettings.managed</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>PayloadIdentifier</key>
      <string>com.spelinsikt.betblocker.nextdns.dns.${safeId}</string>
      <key>PayloadUUID</key>
      <string>${payloadUUID}</string>
      <key>PayloadDisplayName</key>
      <string>NextDNS Configuration</string>
      <key>DNSSettings</key>
      <dict>
        <key>DNSProtocol</key>
        <string>HTTPS</string>
        <key>ServerURL</key>
        <string>https://dns.nextdns.io/${safeId}</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;

  return config;
}

async function signMobileConfig(unsignedContent) {
  // Check if signing credentials are available
  if (!SIGNING_CERT_PATH || !SIGNING_KEY_PATH) {
    console.log("No signing credentials configured - returning unsigned profile");
    return unsignedContent;
  }

  try {
    // Read certificate files
    const certPath = join(process.cwd(), SIGNING_CERT_PATH);
    const keyPath = join(process.cwd(), SIGNING_KEY_PATH);
    const caPath = SIGNING_CA_PATH ? join(process.cwd(), SIGNING_CA_PATH) : null;

    // Verify files exist
    await readFile(certPath);
    await readFile(keyPath);
    if (caPath) await readFile(caPath);

    // Use OpenSSL to sign the profile
    return new Promise((resolve, reject) => {
      const opensslArgs = [
        "smime",
        "-sign",
        "-signer", certPath,
        "-inkey", keyPath,
        "-certfile", caPath || certPath,
        "-outform", "der",
        "-nodetach"
      ];

      const openssl = spawn("openssl", opensslArgs);
      
      const chunks = [];
      openssl.stdout.on("data", (chunk) => chunks.push(chunk));
      
      let errorOutput = "";
      openssl.stderr.on("data", (chunk) => {
        errorOutput += chunk.toString();
      });

      openssl.on("close", (code) => {
        if (code !== 0) {
          console.error("OpenSSL signing failed:", errorOutput);
          console.log("Falling back to unsigned profile");
          resolve(unsignedContent);
        } else {
          const signedBuffer = Buffer.concat(chunks);
          resolve(signedBuffer);
        }
      });

      openssl.on("error", (err) => {
        console.error("Failed to spawn openssl:", err);
        console.log("Falling back to unsigned profile");
        resolve(unsignedContent);
      });

      // Write the unsigned content to OpenSSL stdin
      openssl.stdin.write(unsignedContent);
      openssl.stdin.end();
    });
  } catch (error) {
    console.error("Error during signing process:", error);
    console.log("Falling back to unsigned profile");
    return unsignedContent;
  }
}

export async function GET(request) {
  try {
    // Get optional removal password from query or env
    const { searchParams } = new URL(request.url);
    const removalPassword = searchParams.get("password") || REMOVAL_PASSWORD;

    const unsignedConfig = createMobileConfig(removalPassword);
    const finalConfig = await signMobileConfig(unsignedConfig);

    const safeId = String(NEXTDNS_PROFILE_ID).replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `spelinsikt-betblocker-${safeId}.mobileconfig`;

    const isSigned = Buffer.isBuffer(finalConfig);

    return new Response(finalConfig, {
      status: 200,
      headers: {
        "Content-Type": isSigned 
          ? "application/pkcs7-signature" 
          : "application/x-apple-aspen-config",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Profile-Signed": isSigned ? "true" : "false",
        "X-Profile-Protected": removalPassword ? "true" : "false",
      },
    });
  } catch (error) {
    console.error("Error generating profile:", error);
    return Response.json(
      { error: error.message || "Failed to generate mobileconfig" },
      { status: 500 }
    );
  }
}
