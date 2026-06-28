# 📚 Home Library Catalog

A simple, self-contained web app to search your home library and get AI book recommendations.

## Files
- `books.json` — the catalog (single source of truth; edit to add/fix/remove books)
- `index.html` — the web app (search + recommendation chat)

## Run it
The app loads `books.json` over `fetch`, so it needs a tiny local server (opening the file
directly with `file://` will be blocked by the browser). From this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000> in your browser.

## Recommendation chatbot (Gemini)
1. Get a **free** API key at <https://aistudio.google.com/apikey>.
2. Open the **💬 Recommend me a book** tab → expand **⚙️ Gemini API key** → paste it → **Save**.
   - The key is stored only in your browser's `localStorage`. It is never uploaded anywhere
     except directly to Google's Gemini API from your machine.
3. Ask in plain language ("something uplifting for a 10-year-old who loves dragons"). Gemini picks
   2–4 books **from your catalog only** and explains why. Picks are checked against the catalog.

Model used: `gemini-2.5-flash-lite` (free tier). To change it, edit the `MODEL` constant in `index.html`.

## Editing the catalog
Each entry: `title`, `author`, `genre`, `audience`. Add or correct entries in `books.json` and refresh.

## Note on accuracy
The catalog was generated from spine photos. A handful of tightly-packed or faint spines on
densely-filled shelves couldn't be read with confidence and were left out. Search for a title to
check whether it made it in, and add anything missing to `books.json`.
