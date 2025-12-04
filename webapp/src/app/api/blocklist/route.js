const NEXTDNS_API_KEY = process.env.NEXTDNS_API_KEY;

async function callNextDns(path, options = {}) {
  if (!NEXTDNS_API_KEY) {
    return {
      ok: false,
      status: 500,
      json: async () => ({
        error: "NEXTDNS_API_KEY is not configured on the server",
      }),
    };
  }

  const response = await fetch(`https://api.nextdns.io${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": NEXTDNS_API_KEY,
      ...(options.headers || {}),
    },
  });

  return response;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return Response.json(
      { error: "Missing required query parameter: profileId" },
      { status: 400 }
    );
  }

  const response = await callNextDns(
    `/profiles/${encodeURIComponent(profileId)}/denylist`,
    { method: "GET" }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return Response.json(
      {
        error:
          errorData.message ||
          errorData.error ||
          "Failed to fetch blocklist from NextDNS",
      },
      { status: response.status }
    );
  }

  const data = await response.json();

  // NextDNS returns denylist entries in a data array
  const denylist = Array.isArray(data?.data) ? data.data : data || [];

  return Response.json({ denylist });
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return Response.json(
      { error: "Missing required query parameter: profileId" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const domain = body?.domain;

  if (!domain || typeof domain !== "string") {
    return Response.json(
      { error: "Request body must include a 'domain' string" },
      { status: 400 }
    );
  }

  const response = await callNextDns(
    `/profiles/${encodeURIComponent(profileId)}/denylist`,
    {
      method: "POST",
      body: JSON.stringify({
        id: domain,
        active: true,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return Response.json(
      {
        error:
          errorData.message ||
          errorData.error ||
          "Failed to add domain to NextDNS blocklist",
      },
      { status: response.status }
    );
  }

  return Response.json(
    { message: `Domain ${domain} added to blocklist.` },
    { status: 200 }
  );
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");

  if (!profileId) {
    return Response.json(
      { error: "Missing required query parameter: profileId" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const domain = body?.domain;

  if (!domain || typeof domain !== "string") {
    return Response.json(
      { error: "Request body must include a 'domain' string" },
      { status: 400 }
    );
  }

  const response = await callNextDns(
    `/profiles/${encodeURIComponent(profileId)}/denylist/${encodeURIComponent(
      domain
    )}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    return Response.json(
      {
        error:
          errorData.message ||
          errorData.error ||
          "Failed to remove domain from NextDNS blocklist",
      },
      { status: response.status }
    );
  }

  return Response.json(
    { message: `Domain ${domain} removed from blocklist.` },
    { status: 200 }
  );
}


