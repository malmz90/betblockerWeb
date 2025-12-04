const NEXTDNS_API_KEY = process.env.NEXTDNS_API_KEY;

export async function POST(request) {
  if (!NEXTDNS_API_KEY) {
    return Response.json(
      { error: "NEXTDNS_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const label = body?.label;

  // Give each tester their own profile name; all under your single NextDNS account
  const name =
    label ||
    `betblocker_${Math.random().toString(36).slice(2, 8)}_${Date.now()}`;

  const response = await fetch("https://api.nextdns.io/profiles", {
    method: "POST",
    headers: {
      "X-Api-Key": NEXTDNS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      json?.message || json?.error || "Failed to create NextDNS profile";
    return Response.json({ error: message }, { status: response.status });
  }

  const profile = json?.data || json;
  const profileId = profile?.id;

  if (!profileId) {
    return Response.json(
      {
        error:
          "NextDNS API responded without a profile id. Check your API key and permissions.",
      },
      { status: 500 }
    );
  }

  return Response.json(
    {
      profileId,
      name: profile?.name || name,
    },
    { status: 200 }
  );
}


