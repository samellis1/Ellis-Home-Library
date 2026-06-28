# Deploying the Gemini proxy (Cloudflare Workers)

Your page stays on GitHub Pages. This Worker is a tiny backend that holds the
Gemini API key as an **encrypted secret**, so the key never appears in your
public site. The page calls the Worker; the Worker calls Gemini.

## One-time setup

1. **Create a free Cloudflare account** at https://dash.cloudflare.com/sign-up

2. **Deploy the Worker** (run these from the `proxy/` folder):
   ```sh
   cd proxy
   npx wrangler login        # opens a browser to authorize
   npx wrangler deploy
   ```
   This prints your Worker URL, e.g.
   `https://ellis-library-gemini-proxy.your-name.workers.dev`

3. **Store the Gemini key as a secret** (you'll be prompted to paste it — it is
   encrypted at rest and never written to any file in this repo):
   ```sh
   npx wrangler secret put GEMINI_API_KEY
   ```
   Paste your `AQ.*` key when asked, then press Enter.

4. **Point the page at the Worker.** In `../index.html`, set `PROXY_URL` to the
   URL from step 2:
   ```js
   const PROXY_URL = "https://ellis-library-gemini-proxy.your-name.workers.dev";
   ```

5. **Allow your site's origin.** In `worker.js`, make sure `ALLOWED_ORIGINS`
   includes the origin your GitHub Pages site is served from, e.g.
   `https://samellis1.github.io` (origin only — no path). Add a custom domain
   here too if you use one. Re-run `npx wrangler deploy` after any change.

6. **Commit & push** `index.html` (now key-free) to GitHub. ✅ Safe — no secret in it.

## Test it
```sh
curl -X POST "https://YOUR-WORKER-URL" \
  -H "Content-Type: application/json" \
  -H "Origin: https://samellis1.github.io" \
  -d '{"contents":[{"role":"user","parts":[{"text":"hi"}]}]}'
```
A JSON response with `candidates` means it works. A `403 Forbidden origin`
means step 5's origin doesn't match.

## Security notes / limits
- **The key is never in the browser or the repo** — only in the encrypted
  Worker secret. This is the actual fix.
- The `ALLOWED_ORIGINS` check blocks other *websites* from using your proxy, but
  the `Origin` header can be spoofed by non-browser tools (curl, scripts). For a
  personal library that's fine. To harden further you could add a shared secret
  header, rate limiting (Cloudflare WAF), or Cloudflare Access.
- **Rotate the leaked key.** Your old/embedded keys should be deleted at
  https://aistudio.google.com/apikey and a fresh one created for the secret.
- Cloudflare Workers free tier (100k requests/day) is far more than a home
  library needs.
