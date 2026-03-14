# π Forever

> A digit of pi, every minute, forever.

A living website that reveals one decimal digit of π every 60 seconds, starting midnight UTC on Pi Day — March 14, 2026. An experiment in permanence, math, and quiet internet joy.

## What is this?

π Forever is a real-time, ever-growing display of the digits of pi. Starting from **3.**, a new decimal digit appears every minute, indefinitely. At 525,600 digits per year it would take ~190 million years to exhaust the 100 trillion digits of π computed to date.

### Engagement hooks

- **Find your number** — Search for your birthday (0314), anniversary, phone number, or any digit sequence across all precomputed digits of π.
- **Reveal dates** — If your number hasn't appeared on screen yet, the site tells you the exact date and time it will be revealed.
- **Live stats** — A header bar shows total digits revealed, countdown to the next digit, and total time running.
- **Interesting facts** — A curated modal of educational and fun facts about π.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS 4 |
| Styling | Dark theme, amber accent, monospace font (Geist Mono) |
| Pi generation | Python + [mpmath](https://mpmath.org/) (Chudnovsky algorithm) |
| Hosting | Static-compatible — works on Vercel, Netlify, or any CDN |

### Project structure

```
piforever/
├── public/
│   └── pi-digits.txt          # Precomputed decimal digits (currently 1M)
├── scripts/
│   ├── generate-pi.py          # Python/mpmath generator (primary, fast)
│   └── generate-pi.ts          # TypeScript/BigInt generator (fallback, slow >100K)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, fonts, metadata, OG tags
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Tailwind imports, animations
│   ├── components/
│   │   └── PiDisplay.tsx       # Core component: countdown, live digits, search, facts
│   └── lib/
│       └── constants.ts        # Launch date, timing config, fallback digits
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

## How it works

### Digit revelation logic

The site is entirely client-side. No database, no WebSocket, no server logic.

1. A **launch timestamp** is hardcoded: `2026-03-14T00:00:00Z`
2. On each tick (every second), the client calculates:
   ```
   elapsed = now - launchDate
   digitsRevealed = floor(elapsed / 60000) + 1
   ```
3. It slices the first `digitsRevealed` characters from the preloaded pi digits string
4. The latest digit renders with a glow animation; a blinking cursor follows

Before launch, the site shows a countdown timer. After launch, digits flow.

### Pi computation

**Primary method — Python + mpmath:**

mpmath uses the **binary splitting Chudnovsky algorithm**, the fastest known series for computing π:

$$\frac{1}{\pi} = 12 \sum_{k=0}^{\infty} \frac{(-1)^k (6k)! (13591409 + 545140134k)}{(3k)!(k!)^3 640320^{3k+3/2}}$$

Each term adds about 14 digits. mpmath's implementation uses binary splitting to evaluate this series with sub-quadratic complexity.

- **1 million digits:** ~36 seconds
- **10 million digits:** ~minutes
- **100 million digits:** ~under an hour

**Fallback method — TypeScript + BigInt (Machin's formula):**

$$\frac{\pi}{4} = 4 \arctan\frac{1}{5} - \arctan\frac{1}{239}$$

Implemented using fixed-point BigInt arithmetic. Works for up to ~100K digits but scaling is quadratic, making it impractical beyond that.

### Search feature

The search runs client-side against the full preloaded digits string using `String.indexOf()`. Results show:
- **If already revealed:** position number + green highlight in the digit stream
- **If not yet revealed:** position number + exact future reveal date/time

## Running locally

```bash
# Install dependencies
npm install

# Generate pi digits (requires Python 3 + mpmath)
python scripts/generate-pi.py

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

```bash
npm run build   # runs generate-pi then next build
npm start       # or deploy .next to Vercel/Netlify
```

The `public/pi-digits.txt` file is served as a static asset. No server-side computation at runtime.

## Next steps

### Roadmap priorities

| Priority | Feature | Why |
|----------|---------|-----|
| **High** | Shareable links + social cards | Growth engine — every share brings visitors |
| **High** | Analytics (Plausible or Umami) | Free, privacy-friendly — know your traffic before monetizing |
| **Medium** | Email milestone notifications | "Your number 19901225 will be revealed in 3 days" — brings people back |
| **Medium** | Ad slots (modal only) | Simple revenue, non-intrusive |
| **Low** | Merch store | Wait for audience signal |
| **Low** | API for developers | Let others embed the live digit count — more exposure |

### Short-term (launch week)

- [ ] Deploy to Vercel (or similar) for Pi Day 2026 launch
- [ ] Add Open Graph image for social sharing (auto-generated or static)
- [ ] Add a share button — "My birthday appears at position X in π"

### Medium-term (next few months)

- [ ] Social cards — generate shareable images with a person's number highlighted in π
- [ ] Milestone alerts — "π just passed 100,000 digits!" (could be a simple Twitter/X bot)
- [ ] Progressive digit loading — load digits in chunks instead of the full file upfront as the file grows
- [ ] Add sound — an optional subtle tone each time a new digit appears

### Long-term (scaling digits)

| Digits | Duration | File size | Action |
|--------|----------|-----------|--------|
| 1,000,000 (current) | ~1.9 years | 1 MB | ✅ Done |
| 10,000,000 | ~19 years | 10 MB | Bump `NUM_DIGITS` in `generate-pi.py`, recompute |
| 100,000,000 | ~190 years | 100 MB | Same script, will take ~1 hour |
| 1,000,000,000 | ~1,902 years | 1 GB | Download from [pi.delivery](https://pi.delivery) or y-cruncher output |

At 10M+ digits, consider chunked loading: split the file into segments and fetch on demand as the user scrolls up through history or as new digits are needed.

### Ideas for community engagement

- "Digit of the day" social post
- Leaderboard of interesting sequences found by visitors
- Teacher mode: show groups of digits with position labels for classroom use
- API endpoint returning the current digit count and latest N digits
- Embedding widget — let other sites show the live π counter

---

*Launched Pi Day, March 14, 2026. One digit. Every minute. Forever.*
