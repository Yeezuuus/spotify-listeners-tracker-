# Spotify Top Listeners Tracker

A glassmorphism-styled web app that tracks and visualizes daily Spotify listener counts for the top 10 artists throughout May 2026. Data updates automatically 4× per day via GitHub Actions.

**Live site:** https://yeezuuus.github.io/spotify-listeners-tracker-

---

## Features

- **Live rankings** — top 10 artists sorted by current listener count with duel card for #1 vs #2
- **Logarithmic projection** — predicts listener counts through May 31 with ±1σ confidence band
- **Crossing detection** — calculates and displays when #2 is projected to overtake #1
- **24h change chart** — bar chart showing daily listener gains/losses per artist
- **Full history table** — all logged dates with per-artist values and gap tracking
- **Auto-fetch** — GitHub Actions fetches data from kworb.net 4× daily (2:30 AM, 8:30 AM, 2:30 PM, 8:30 PM ET)
- **Admin mode** — password-protected edit access with direct GitHub API sync
- **Mobile responsive** — optimized layout for phones and tablets

---

## Artists Tracked

| # | Artist | Color |
|---|--------|-------|
| - | Justin Bieber | Green |
| - | Bruno Mars | Gold |
| - | The Weeknd | Red |
| - | Rihanna | Pink |
| - | Bad Bunny | Orange |
| - | Taylor Swift | Purple |
| - | Lady Gaga | Violet |
| - | Coldplay | Blue |
| - | Drake | Steel |
| - | David Guetta | Teal |

---

## How Data Works

### Automatic (GitHub Actions)
A workflow runs at **2:30 AM, 8:30 AM, 2:30 PM, and 8:30 PM ET** every day:
1. Fetches listener counts from [kworb.net/spotify/listeners.html](https://kworb.net/spotify/listeners.html)
2. Parses each artist's count with regex
3. Commits updated `data.json` to the repo if data changed

### Manual (Admin)
1. Click the 🔒 icon in the footer
2. Enter password → enter GitHub token (first time only, saved permanently)
3. Use the **Log Entry** form to add or edit data
4. Each save updates `data.json` in the repo directly via GitHub API

### Data Merge Logic
On page load, the app merges two sources:
- `data.json` from the repo (Actions data)
- `localStorage` (manual browser edits)

Artist-level merge: manual non-null values take priority; Actions data fills any nulls.

---

## Auto-fill Button

Fetches live data from kworb.net via CORS proxy. Smart detection:
- If kworb values match the previous day within 0.5% → **"Already up to date"** (kworb hasn't refreshed)
- If today's entry is already complete → **"Already up to date"**
- Otherwise → fills only the **missing artists** for today's entry

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/yeezuuus/spotify-listeners-tracker-.git
cd spotify-listeners-tracker-

# Open in browser (no build step needed)
open index.html
```

To pull the latest data from GitHub Actions:
```bash
git pull
```

To push manual data changes:
```bash
git add data.json
git commit -m "data: update listeners YYYY-MM-DD"
git push
```

---

## GitHub Actions Setup

The workflow requires no secrets or configuration — it commits directly using the built-in `GITHUB_TOKEN` with `contents: write` permission.

To trigger manually: **Actions → Daily Spotify fetch → Run workflow**

---

## Stack

- Vanilla HTML/CSS/JS — no framework, no build step
- [Chart.js](https://www.chartjs.org/) for charts
- [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) + [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) fonts
- GitHub Pages for hosting
- GitHub Actions for scheduled data fetching
- 
## About this project
This project was developed with significant AI assistance (Claude by Anthropic), 
including code generation, architecture decisions, and documentation.
