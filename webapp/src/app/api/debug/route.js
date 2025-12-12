// Debug endpoint to check environment variables
export async function GET(request) {
  return Response.json({
    env: {
      NEXTDNS_API_KEY: process.env.NEXTDNS_API_KEY 
        ? `${process.env.NEXTDNS_API_KEY.substring(0, 8)}...` 
        : "NOT SET",
      NEXTDNS_PROFILE_ID: process.env.NEXTDNS_PROFILE_ID || "NOT SET",
      REMOVAL_PASSWORD: process.env.REMOVAL_PASSWORD || "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
    },
    message: "Check if environment variables are loaded"
  });
}

