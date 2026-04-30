# QA Event Dashboard

A dark-mode developer tool for QA engineers to validate, compare, and track analytics event payloads. Save baseline events, paste actual payloads, and instantly see field-level diffs — with GitHub Gist sync to share baselines across your team.

---

## Features

### Saved Events — Baseline vs Actual

- **Baseline library** — Save named event payloads to a persistent sidebar. Supports Firebase, Kinesis, and Statsig platform badges.
- **Side-by-side diff viewer** — Paste an actual payload next to any saved baseline and click **Compare** to run a deep, order-agnostic field comparison.
- **Inline diff highlighting** — Changed, missing, and added fields are highlighted directly in the JSON editor so you can spot issues at a glance.
- **Edit baseline** — Modify a saved baseline in-place with a live JSON editor, format it with one click, and save it back.
- **Reorder to match** — Reorders the actual payload's keys to mirror the baseline structure, making visual scanning easier.
- **Copy** — Copy the actual (or reordered) payload to clipboard in one click.
- **All-keys-match banner** — A green shield banner appears at the top when every field matches, giving an instant pass signal.

### Compare Live

- **Free-form comparison** — Paste any two JSON payloads (Left / Right) without needing a saved baseline.
- **Swap** — Flip left and right payloads instantly.
- **Reorder right to match left** — Align the right pane's key order to the left for easier reading.
- **Clear all** — Reset both panes in one click.
- **Per-pane format & copy** — Format or copy each side independently.

### Diff Summary Bar

- **PASS / FAIL badge** — Clear green/red result at a glance after every comparison.
- **Field-level breakdown** — Pill counts for missing, added, changed, and ignored fields.
- **Score** — Shows `passed / total fields` so you know exactly how far off a payload is.

### Key Count Badge

- Displays the total number of leaf-level fields in each pane header as a green badge.
- Count matches the diff engine exactly — nested object containers are not counted, only their leaf values.

### Ignored Fields

- **Per-session ignore list** — Add field names or dot-notation paths (e.g. `timestamp`, `metadata.seid`) to exclude them from comparison entirely.
- Ignored fields are shown as removable chips and counted separately in the diff summary.

### GitHub Gist Sync

- Connect a GitHub Personal Access Token (gist scope only) to sync your entire baseline library to a private GitHub Gist.
- Events load and save automatically — access the same baselines from any device with the same token.
- Live sync status indicator in the top nav (idle / connecting / syncing / synced / error).

### Syntax-highlighted JSON Editor

- PrismJS-powered JSON syntax highlighting with distinct colours for strings, numbers, booleans, nulls, and punctuation.
- Diff highlights are overlaid on top of the syntax highlighting without replacing it.
- Both panes scroll in sync so corresponding lines stay aligned.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com)
- [PrismJS](https://prismjs.com) — JSON syntax highlighting
- [Lodash](https://lodash.com) — deep equality checks
- [Lucide React](https://lucide.dev) — icons
- GitHub Gist API — cloud storage
