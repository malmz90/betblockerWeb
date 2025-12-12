const NEXTDNS_API_KEY = process.env.NEXTDNS_API_KEY;
const NEXTDNS_PROFILE_ID = process.env.NEXTDNS_PROFILE_ID;

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

  if (!NEXTDNS_PROFILE_ID) {
    return {
      ok: false,
      status: 500,
      json: async () => ({
        error: "NEXTDNS_PROFILE_ID is not configured on the server",
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
  const response = await callNextDns(
    `/profiles/${encodeURIComponent(NEXTDNS_PROFILE_ID)}/denylist`,
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
  const body = await request.json().catch(() => null);
  const domain = body?.domain;

  if (!domain || typeof domain !== "string") {
    return Response.json(
      { error: "Request body must include a 'domain' string" },
      { status: 400 }
    );
  }

  const response = await callNextDns(
    `/profiles/${encodeURIComponent(NEXTDNS_PROFILE_ID)}/denylist`,
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
    { message: `Domain ${domain} added to universal blocklist.` },
    { status: 200 }
  );
}

export async function DELETE(request) {
  const body = await request.json().catch(() => null);
  const domain = body?.domain;

  if (!domain || typeof domain !== "string") {
    return Response.json(
      { error: "Request body must include a 'domain' string" },
      { status: 400 }
    );
  }

  const response = await callNextDns(
    `/profiles/${encodeURIComponent(NEXTDNS_PROFILE_ID)}/denylist/${encodeURIComponent(
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
    { message: `Domain ${domain} removed from universal blocklist.` },
    { status: 200 }
  );
}
