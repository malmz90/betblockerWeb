import { randomUUID } from "crypto";

function createMobileConfig(profileId) {
  const safeId = String(profileId).replace(/[^a-zA-Z0-9_-]/g, "");
  const profileUUID = randomUUID();
  const payloadUUID = randomUUID();

  // Minimal DNS settings profile using DNS-over-HTTPS for NextDNS
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
  <key>PayloadIdentifier</key>
  <string>com.betblocker.nextdns.${safeId}</string>
  <key>PayloadUUID</key>
  <string>${profileUUID}</string>
  <key>PayloadDisplayName</key>
  <string>BetBlocker DNS (${safeId})</string>
  <key>PayloadDescription</key>
  <string>Configures this device to use NextDNS for BetBlocker.</string>
  <key>PayloadOrganization</key>
  <string>BetBlocker</string>
  <key>PayloadScope</key>
  <string>System</string>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key>
      <string>com.apple.dnsSettings.managed</string>
      <key>PayloadVersion</key>
      <integer>1</integer>
      <key>PayloadIdentifier</key>
      <string>com.betblocker.nextdns.dns.${safeId}</string>
      <key>PayloadUUID</key>
      <string>${payloadUUID}</string>
      <key>PayloadDisplayName</key>
      <string>BetBlocker DNS</string>
      <key>DNSSettings</key>
      <dict>
        <key>DNSProtocol</key>
        <string>HTTPS</string>
        <key>ServerURL</key>
        <string>https://dns.nextdns.io/${safeId}</string>
        <key>ServerAddresses</key>
        <array/>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return new Response("Missing required query parameter: profileId", {
      status: 400,
    });
  }

  const mobileconfig = createMobileConfig(profileId);
  const filename = `betblocker-${String(profileId).replace(
    /[^a-zA-Z0-9_-]/g,
    ""
  )}.mobileconfig`;

  return new Response(mobileconfig, {
    status: 200,
    headers: {
      "Content-Type": "application/x-apple-aspen-config",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}


