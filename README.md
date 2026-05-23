# Starator

A free, browser-based reading-practice app for a 7-year-old reading aloud
in English, French, and Spanish. Teleprompter-style scrolling, live word
highlighting via the microphone, and a research-backed session loop.

No accounts. No tracking. Progress lives in the browser, with optional
JSON / QR export to move between devices.

---

## Run locally

```bash
cd reading-app
npm install
npm run dev
```

Then open <http://127.0.0.1:5173> in **Chrome, Edge, or Safari** (the
Web Speech API isn't supported in Firefox out of the box).

On the first read the browser will ask for microphone permission — grant it.

## Build & deploy

```bash
npm run build
```

The `dist/` folder is a fully static site. Drop it on:

- Netlify, Vercel, Cloudflare Pages, GitHub Pages — any static host works
- No backend, no env vars, no server-side dependencies
- HTTPS is required for `getUserMedia` to work in production (all the
  above hosts give you that automatically)

## How it's wired

| Concern | Implementation |
|---|---|
| Speech recognition | Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`), continuous, interim results, language tag per session |
| Word matching | Levenshtein distance with language-adjusted thresholds — strict for English, lenient for French/Spanish; with 1-2 word look-ahead to handle skipped words |
| Text presentation | Andika font, cream/sepia default background, ~38ch line width, 1.6 line-height, teleprompter mask fades top and bottom |
| Progress | `localStorage`, JSON + QR export/import, no server |
| AI stories (optional) | Anthropic API direct from the browser — `claude-haiku-4-5`. Parent pastes their key into the Parent dashboard; key is stored only in localStorage |

## What the research drove

A separate brief in [`docs/literacy-research-brief.md`](docs/literacy-research-brief.md)
captures the evidence base. Decisions that came from it:

- **Personal best framing**, not raw WCPM goals — research is clear that
  coaching to speed inflates scores without improving fluency. Raw WCPM is
  hidden in the Parent dashboard.
- **Re-read prompt** on the result screen — repeated reading has the
  strongest effect-size evidence for fluency gains (Therrien meta-analysis).
- **Comprehension questions** after each story — the teleprompter scroll
  format is research-validated *only if* comprehension is checked.
  Without it, scrolling becomes pure speed pressure.
- **Three separate difficulty trees** per language — English follows
  Hasbrouck-Tindal Grade 2 norms; French follows the slower CP/CE1
  opaque-orthography progression; Spanish ramps faster (transparent
  orthography).
- **Lexend font** (with Atkinson Hyperlegible and Verdana fallbacks). The
  literacy brief recommended Andika or Sassoon Primary; we picked Lexend
  instead because the Shaver-Troup studies showed measurable reading-
  proficiency gains for struggling readers — strong empirical backing,
  not just design intent. Wider letterforms reinforce the explicit
  per-word margin we apply for visual word separation. Not OpenDyslexic:
  replication studies show it does not help and sometimes hurts.
- **No leaderboards** — streaks with grace tokens and milestone badges
  only. Process-praise copy on the result screen ("you stuck with the
  tricky parts"), never ability-praise.
- **TTS audio model** offered before reading — Read Naturally builds
  this in for a reason; it sets pronunciation and prosody before the
  child practices alone.

## Project layout

```
reading-app/
├── src/
│   ├── App.tsx                      # screen router
│   ├── main.tsx                     # React entry
│   ├── styles.css                   # all themes + components
│   ├── types.ts
│   ├── screens/
│   │   ├── Home.tsx                 # language, theme, streak, badges
│   │   ├── StoryPicker.tsx          # bundled + AI-generated picker
│   │   ├── Reader.tsx               # teleprompter + recognition
│   │   ├── Result.tsx               # comp questions + result + reread CTA
│   │   └── ParentDashboard.tsx      # PIN-gated settings + export/import
│   ├── state/
│   │   ├── SettingsContext.tsx
│   │   └── ProgressContext.tsx
│   ├── stories/
│   │   ├── en.ts                    # bundled English stories, 3 tiers
│   │   ├── fr.ts                    # bundled French stories, 3 tiers
│   │   ├── es.ts                    # bundled Spanish stories, 3 tiers
│   │   └── index.ts
│   └── lib/
│       ├── speech.ts                # Web Speech API hook
│       ├── matching.ts              # Levenshtein + adaptive thresholds
│       ├── tts.ts                   # browser SpeechSynthesis preview
│       ├── ai.ts                    # Anthropic API call (browser, no proxy)
│       ├── words.ts                 # tokenize + normalize
│       ├── hash.ts                  # SHA-256 for parent PIN
│       ├── qr.ts                    # QR encoding for progress export
│       └── storage.ts               # localStorage + JSON shape
└── docs/
    └── literacy-research-brief.md   # the research that shaped defaults
```

## Browser support

| Browser | Status |
|---|---|
| Chrome (desktop, Android) | ✓ full support |
| Edge (desktop) | ✓ full support |
| Safari (macOS, iOS 14.5+) | ✓ full support |
| Firefox | ⚠ speech recognition not supported by default |

For maximum reach, host with HTTPS. Microphone access requires a secure
origin in production.

## Parent settings cheat-sheet

| Setting | Default | What it does |
|---|---|---|
| Default speed | 110 wpm | Initial scroll speed. Slider can still adjust per session. |
| Max session minutes | 20 | A soft cap — HELPS research finds 15–20 min, 3-5×/week is optimal. |
| Difficulty override | None | Force all stories to a single tier (useful when ramping up or down). |
| Pronunciation strictness | Auto | Auto = strict EN, lenient FR/ES. Tunable to always lenient or always strict. |
| TTS preview | On | Show "Hear a sample" on story cards. |
| Parent PIN | None | Optional 4+ digit PIN to lock the dashboard. |
| Anthropic API key | None | Optional — enables "Make a new story" button in the picker. |

## What's deliberately *not* in v1

- Multi-child profiles (use export/import or separate browser profiles).
- Comprehension-question authoring UI (questions are bundled per story).
- Detailed phonics drilling — this is a fluency-practice tool, not a
  phonics curriculum.
- Cloud sync / accounts — privacy-first by design.

## License

MIT for the code. Stories are original prose, also MIT.
