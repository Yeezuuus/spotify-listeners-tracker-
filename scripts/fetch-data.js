#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');

const ARTISTS = [
  { key: 'bruno',    name: 'Bruno Mars' },
  { key: 'bieber',   name: 'Justin Bieber' },
  { key: 'weeknd',   name: 'The Weeknd' },
  { key: 'rihanna',  name: 'Rihanna' },
  { key: 'badbunny', name: 'Bad Bunny' },
  { key: 'taylor',   name: 'Taylor Swift' },
  { key: 'gaga',     name: 'Lady Gaga' },
  { key: 'mj',       name: 'Michael Jackson' },
  { key: 'coldplay', name: 'Coldplay' },
  { key: 'drake',    name: 'Drake' },
  { key: 'guetta',   name: 'David Guetta' },
  { key: 'billie',   name: 'Billie Eilish' },
  { key: 'ariana',   name: 'Ariana Grande' },
  { key: 'ed',       name: 'Ed Sheeran' },
  { key: 'shakira',  name: 'Shakira' },
  { key: 'katy',     name: 'Katy Perry' },
  { key: 'maroon5',  name: 'Maroon 5' },
  { key: 'calvin',   name: 'Calvin Harris' },
  { key: 'eminem',   name: 'Eminem' },
  { key: 'pitbull',  name: 'Pitbull' },
];

async function main() {
  console.log('Fetching kworb.net...');
  const res  = await fetch('https://kworb.net/spotify/listeners.html');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // Date in ET: UTC-4 during EDT (summer), UTC-5 during EST (winter)
  const now       = new Date();
  const etOffset  = isDST(now) ? -4 : -5;
  const etDate    = new Date(now.getTime() + etOffset * 3600 * 1000);
  const today     = etDate.toISOString().split('T')[0];

  console.log(`ET date: ${today}`);

  const fetched = {};
  ARTISTS.forEach(artist => {
    const escaped = artist.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match   = html.match(new RegExp(escaped + '[\\s\\S]{0,400}?(\\d{2,3},\\d{3},\\d{3})', 'i'));
    if (match) {
      const n = parseInt(match[1].replace(/,/g, ''), 10);
      if (n > 1_000_000) fetched[artist.key] = n;
    }
  });

  const fetchedCount = Object.keys(fetched).length;
  console.log(`Fetched ${fetchedCount} artists:`, fetched);

  if (fetchedCount < 5) {
    console.error('Too few results — aborting to avoid corrupting data.');
    process.exit(1);
  }

  const dataPath = path.join(__dirname, '..', 'data.json');
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.warn('data.json not found or invalid, starting fresh:', e.message);
  }

  const allDates   = Object.keys(data).sort();
  const lastDate   = allDates.at(-1);
  const lastEntry  = lastDate ? data[lastDate] : null;

  // If the most recent entry has nulls, check if kworb matches its non-null values.
  // If it does → same kworb snapshot → fill the nulls instead of creating a new date.
  if (lastEntry) {
    const hasNulls      = ARTISTS.some(a => lastEntry[a.key] == null);
    const anchors       = ARTISTS.filter(a => lastEntry[a.key] != null && fetched[a.key] != null);
    const sameSnapshot  = anchors.length >= 2 &&
      anchors.every(a => Math.abs(lastEntry[a.key] - fetched[a.key]) / lastEntry[a.key] < 0.005);

    // Extra guard: if kworb also matches the entry *before* lastDate, kworb hasn't
    // updated yet — filling would write stale data.
    const prevDate2  = allDates.filter(d => d < lastDate).at(-1);
    const prevEntry2 = prevDate2 ? data[prevDate2] : null;
    const prevAnchors = prevEntry2
      ? ARTISTS.filter(a => prevEntry2[a.key] != null && fetched[a.key] != null)
      : [];
    const kworbStale = prevAnchors.length >= 2 &&
      prevAnchors.every(a => Math.abs(prevEntry2[a.key] - fetched[a.key]) / prevEntry2[a.key] < 0.005);

    if (hasNulls && sameSnapshot && !kworbStale) {
      let filled = 0;
      ARTISTS.forEach(a => {
        if (lastEntry[a.key] == null && fetched[a.key] != null) {
          data[lastDate][a.key] = fetched[a.key];
          filled++;
        }
      });
      if (filled > 0) {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        console.log(`Filled ${filled} null(s) in ${lastDate} using kworb fingerprint.`);
      } else {
        console.log(`${lastDate} already complete — skipping.`);
      }
      process.exit(0);
    }
  }

  // Normal staleness check: if no artist changed vs last entry, kworb hasn't updated
  const prevDate  = allDates.filter(d => d < today).at(-1);
  const prevEntry = prevDate ? data[prevDate] : null;

  const anyNew = ARTISTS.some(a => {
    const kVal = fetched[a.key];
    if (!kVal) return false;
    const prev = prevEntry?.[a.key];
    return prev == null || Math.abs(prev - kVal) / prev >= 0.005;
  });

  if (!anyNew) {
    console.log('Kworb data unchanged — skipping update.');
    process.exit(0);
  }

  // At least one artist changed → write all artists for today
  const todayEntry = { ...(data[today] || {}) };
  ARTISTS.forEach(a => {
    if (fetched[a.key] != null) {
      todayEntry[a.key] = fetched[a.key];
    } else if (!(a.key in todayEntry)) {
      todayEntry[a.key] = null;
    }
  });
  data[today] = todayEntry;

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`data.json updated for ${today}.`);
}

// Detect US DST: second Sunday of March → first Sunday of November
function isDST(date) {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  return date.getTimezoneOffset() < Math.max(jan, jul);
}

main().catch(e => { console.error(e); process.exit(1); });
