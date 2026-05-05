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
  { key: 'coldplay', name: 'Coldplay' },
  { key: 'drake',    name: 'Drake' },
  { key: 'guetta',   name: 'David Guetta' },
];

async function main() {
  console.log('Fetching kworb.net...');
  const res  = await fetch('https://kworb.net/spotify/listeners.html');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // Date in ET: UTC-4 during EDT (summer), UTC-5 during EST (winter)
  const now    = new Date();
  const etOffset = isDST(now) ? -4 : -5;
  const etDate = new Date(now.getTime() + etOffset * 3600 * 1000);
  const today  = etDate.toISOString().split('T')[0];

  console.log(`ET date: ${today}`);

  const entry = {};
  ARTISTS.forEach(artist => {
    const escaped = artist.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match   = html.match(new RegExp(escaped + '[\\s\\S]{0,400}?(\\d{2,3},\\d{3},\\d{3})', 'i'));
    if (match) {
      const n = parseInt(match[1].replace(/,/g, ''), 10);
      if (n > 1_000_000) entry[artist.key] = n;
    }
  });

  const filled = Object.keys(entry).length;
  console.log(`Fetched ${filled} artists:`, entry);

  if (filled < 5) {
    console.error('Too few results — aborting to avoid corrupting data.');
    process.exit(1);
  }

  ARTISTS.forEach(a => { if (!(a.key in entry)) entry[a.key] = null; });

  const dataPath = path.join(__dirname, '..', 'data.json');
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.warn('data.json not found or invalid, starting fresh:', e.message);
  }
  data[today] = entry;

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
