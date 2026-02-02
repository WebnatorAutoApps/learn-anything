const ALLOWED_ORIGINS = [
  process.env.WEB_APP_URL,
  process.env.LANDING_URL,
].filter(Boolean) as string[];

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

/**
 * Handle CORS preflight OPTIONS request.
 */
export function handleOptions(request: Request): Response {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/**
 * Create a JSON response with CORS headers.
 */
export function jsonResponse(
  body: unknown,
  init?: { status?: number; headers?: Record<string, string> },
  request?: Request
): Response {
  const origin = request?.headers.get("origin") ?? null;
  return Response.json(body, {
    status: init?.status ?? 200,
    headers: {
      ...corsHeaders(origin),
      ...init?.headers,
    },
  });
}
