// Cloudflare Worker — Gemini proxy for the Ellis Home Library.
//
// The Gemini API key lives ONLY here, as an encrypted Worker secret named
// GEMINI_API_KEY. It is never sent to the browser. The static page on GitHub
// Pages calls this Worker; the Worker adds the key and forwards to Gemini.
//
// Set the secret once with:  npx wrangler secret put GEMINI_API_KEY
// (paste the AQ.* key when prompted — it is encrypted at rest, not in this file)

const MODEL = "gemini-2.5-flash-lite";

// Only allow your own site to use this proxy. Origin can be spoofed by
// non-browser clients, so this stops casual abuse from other websites but is
// not airtight — see DEPLOY.md. Add any custom domain you use here too.
const ALLOWED_ORIGINS = new Set([
  "https://samellis1.github.io",
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }
    if (!ALLOWED_ORIGINS.has(origin)) {
      return new Response("Forbidden origin", { status: 403, headers: cors });
    }
    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: { message: "Server is missing GEMINI_API_KEY secret." } }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Forward the request body straight to Gemini, adding the key server-side.
    const body = await request.text();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body,
    });

    // Relay Gemini's response (status + JSON) back to the page.
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
