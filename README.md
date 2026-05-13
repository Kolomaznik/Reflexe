# Reflexe bloku + Úkoly podle kategorií — PWA

Two-page Progressive Web App built with **Vite + React**:

- **`/index.html`** — *Reflexe bloku*: 8-question reflection form, optional Google Apps Script webhook, offline queue + local history, 2-hour reminder notifications.
- **`/ukoly.html`** — *Úkoly podle kategorií*: dynamic main categories + per-category subcategories, free-form task list with minutes estimate, voice dictation (Web Speech API, `cs-CZ`), OCR import via Tesseract.js, Word / plain-text export.

Both pages share the navy / gold visual theme and the same PWA shell (manifest + Workbox service worker via `vite-plugin-pwa`).

## Stack

- React 18 (JavaScript, no TypeScript)
- Zustand for state (with raw `localStorage` for legacy-key compatibility)
- CSS Modules per component, shared CSS custom properties in [src/shared/styles/theme.css](src/shared/styles/theme.css)
- Vitest + React Testing Library for tests
- `vite-plugin-pwa` (Workbox) for the service worker and asset precaching

## Repository layout

```
/
├── index.html                # Vite entry — mounts <Reflexe/>
├── ukoly.html                # Vite entry — mounts <Ukoly/>
├── public/                   # Static assets served at root (icons, manifest, .ics)
├── src/
│   ├── main-reflexe.jsx
│   ├── main-ukoly.jsx
│   ├── shared/               # Shared theme, helpers (escapeHtml, uid)
│   ├── reflexe/              # Reflection page: lib + store + components
│   └── ukoly/                # Tasks page: lib + store + components
├── tests/
│   └── setup.js              # jsdom polyfills: SpeechRecognition mock, clipboard, etc.
├── vite.config.js
├── package.json
├── apps-script.gs            # Google Apps Script webhook (server-side; unchanged)
└── NAVOD-GOOGLE-SHEET.md     # Setup guide for the webhook integration
```

## Develop

```bash
npm install
npm run dev          # Vite dev server (auto-reload)
npm run build        # Production build into dist/
npm run preview      # Preview the production build locally
```

Open `http://localhost:5173/` for the reflection form, `http://localhost:5173/ukoly.html` for the tasks page.

## Test

```bash
npm test             # Watch mode
npm run test:run     # Single-run (CI mode)
npm run coverage     # Coverage report (text + html)
```

Tests cover:

- **Pure helpers** ([src/ukoly/lib](src/ukoly/lib), [src/reflexe/lib](src/reflexe/lib)): formatters, OCR line cleaner, task grouping, Word/text export builders, reminder-time computation, webhook poster, Reflexe payload builder.
- **Stores** ([ukolyStore.test.js](src/ukoly/store/ukolyStore.test.js), [reflexeStore.test.js](src/reflexe/store/reflexeStore.test.js)): every action, persistence to legacy localStorage keys, hydration tolerance.
- **Components** (React Testing Library + user-event): CategoryEditor (add/rename/delete cat + subcategories), ActiveCategoryPicker, DefaultMinsPicker, TaskInput, TaskList (grouping, move-cat clears subcat, deletion, stale-subcat tolerance), DictateButton (mocked SpeechRecognition), OcrImport (mocked tesseract.js), ExportActions (Word download + clipboard copy), SliderField, ReflexeForm, SettingsPanel (save/test/clear webhook), NotifBanner (permission flow), ResultPanel + `useSubmitReflection` (offline queue + webhook flow).

## Legacy data preservation

The refactor keeps the original localStorage keys so existing users don't lose data:

| Key | Schema |
|---|---|
| `ukoly_state_v2` | `{ state: { categories, subcategories, tasks, activeCategory, activeSubcat, defaultMins }, version }` |
| `webhook-url` | Raw URL string |
| `reflexe-queue` | `[{ data, ts, tries }, ...]` |
| `reflexe-historie` | `[reflexePayload, ...]` |
| `reminders-enabled` | `'1'` or `'0'` |

The Ukoly store uses Zustand's `persist` middleware (under the same `ukoly_state_v2` key, with a tolerant `merge` that handles the prior 6-fixed-categories shape). The Reflexe store reads/writes the four raw keys directly — no JSON wrapping.

## Deploying

Same as before: any static HTTPS host (GitHub Pages, Netlify Drop, Vercel) will work for the built `dist/` directory. The service worker requires HTTPS to be installable as a PWA.

```bash
npm run build
# Upload everything in dist/ to your host
```

For the Google Sheets webhook integration, follow [NAVOD-GOOGLE-SHEET.md](NAVOD-GOOGLE-SHEET.md) (unchanged from the vanilla version).

## How the apps are used (end-user)

1. **Reminder fires** at every even hour 04:00–20:00.
2. Tap the notification → reflection form opens with the current block time pre-filled.
3. Fill the 8 questions (sliders + text fields) — about 3 minutes.
4. **Save reflection:**
   - With webhook configured: data POSTs straight into your Google Sheet → green ✓.
   - Without webhook (or offline): JSON copies to clipboard → paste into Claude chat; payload also waits in the offline queue and retries when the browser comes back online.
5. Open **Úkoly podle kategorií** to capture follow-up tasks by category — text input, voice dictation, or photo OCR — and export to Word / plain text when you need to share them.
