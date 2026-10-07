# IB Recruiting Toolkit

A study app for investment banking recruiting. It runs entirely in the browser, needs no server or install, and works on a phone.

## What's inside

| Section | What it does |
|---|---|
| **Home** | Today's review queue, study streak, mastery by topic, weakest topics, and a countdown to your first superday with a recommended daily pace. |
| **Study** | Flashcards with **spaced repetition**: answer out loud, reveal, rate yourself (Again / Hard / Good / Easy), and missed cards come back sooner. Modes: **Daily review**, **Drill a topic**, and a timed **Mock superday**. |
| **Library** | Search and filter all 174 questions, see each one's review status, and **add your own**. |
| **Statements** | A three-statement simulator with 22 classic scenarios (depreciation, SBC, deferred revenue, write-downs, buybacks…). Predict Δ net income, Δ cash and Δ assets, then see every line of the IS, CFS and BS with a balance check and a walk-through. |
| **Valuation** | **DCF** (FCFF, perpetuity or exit-multiple TV, WACC × g sensitivity), **WACC builder** (unlever/relever beta, CAPM), **LBO** (cash sweep or fixed schedule, returns bridge, credit checks, entry × exit IRR sensitivity, plus the Bowl Corp class case), and **Quick math** drills with an IRR cheat sheet. |

### Question bank

The 174 questions cover ten topics: Accounting, EV/Equity Value, Valuation & Comps, DCF, WACC, LBO, PE Funds, M&A, Financial Analysis, and Fit.

- **From class:** questions tagged `SIB 3–6` are built from the Seminar in Investment Banking decks (Financial Analysis, Valuation, Private Equity, LBO). The formulas match the class conventions, e.g. FCFF = EBIT(1 − t) + D&A − ΔNWC − CapEx and β_a = β_e / [1 + (1 − t)D/E].
- **Core:** standard technical and fit questions, including M&A ahead of the M&A session.

All answers are written in our own words.

## Running it

- **Single file (easiest):** download **`ib-toolkit.html`** and open it in any browser. It has everything built in.
- **From the repo:** clone or download the whole repo (Code → Download ZIP) and open `index.html`. On its own, `index.html` won't work, because it loads the `css/`, `js/` and `data/` files next to it.
- **On your phone:** turn on GitHub Pages for this repo (Settings → Pages → deploy from the `main` branch, root folder) and open the URL it gives you.

Progress is saved in your browser's local storage. To move progress between devices, use **Home → Settings & backup → Export / Import**.

## Adding your own questions (e.g. from the 400 Questions guide)

The 400 Questions guide is a paid, copyrighted resource, so its content should **not** be committed to a public repo. There are two private ways to add questions:

1. **In the app:** go to Library → *+ Add question*, or bulk-import a JSON array. These are stored only in your browser and included in your backup.
2. **In a private file:** copy `data/private-questions.example.js` to `data/private-questions.js` and add questions there. That filename is in `.gitignore`, so it never gets pushed.

## Project layout

```
index.html                 App shell
css/styles.css             Styles (light + dark mode, mobile-first)
data/questions.js          Question bank
js/util.js                 Helpers (markdown, dates, formatting)
js/store.js                localStorage persistence, backup/restore
js/srs.js                  Spaced repetition scheduling (SM-2 style)
js/calc.js                 DCF / WACC / LBO math (pure functions)
js/views/*.js              One file per screen
tests/                     Node tests for the math, question bank and scenarios
tools/build-single.js      Bundles everything into ib-toolkit.html
```

## Rebuilding the single file

After changing any code or questions, regenerate `ib-toolkit.html`:

```
node tools/build-single.js
```

The private question file is never bundled into it. In the single-file version, add your own questions through the Library instead.

## Tests

```
node tests/calc.test.js      # DCF, WACC, LBO (incl. the Bowl Corp case → 19.8% IRR)
node tests/content.test.js   # question bank integrity + every statement scenario balances
```

## Ideas for next steps

- Add questions from the upcoming M&A class session.
- A PE fund waterfall calculator (hurdle, catch-up, European vs. American carry).
- An accretion/dilution calculator.
- A networking tracker for coffee chats and follow-ups.
