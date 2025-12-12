// Simple test endpoint to verify API routes work
export async function GET(request) {
  return Response.json({ 
    status: "ok",
    message: "API routes are working!",
    env: {
      hasApiKey: !!process.env.NEXTDNS_API_KEY,
      hasProfileId: !!process.env.NEXTDNS_PROFILE_ID,
      nodeEnv: process.env.NODE_ENV
    }
  });
}

