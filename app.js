// ── Configuración ──────────────────────────────────────────────────────────
const ARTISTS = [
  { key: 'bruno',    name: 'Bruno Mars',      color: '#D4A94E', img: 'https://unavatar.io/youtube/brunomars',           imgPos: 'center' },
  { key: 'bieber',   name: 'Justin Bieber',   color: '#45BB7A', img: 'https://unavatar.io/youtube/JustinBieberVEVO',    imgPos: 'center' },
  { key: 'weeknd',   name: 'The Weeknd',      color: '#C96868', img: 'https://unavatar.io/youtube/TheWeekndVEVO',       imgPos: 'center top' },
  { key: 'rihanna',  name: 'Rihanna',         color: '#D472A0', img: 'https://unavatar.io/youtube/RihannaVEVO',         imgPos: 'center' },
  { key: 'badbunny', name: 'Bad Bunny',       color: '#D4804E', img: 'https://unavatar.io/youtube/BadBunnyPR',          imgPos: 'center' },
  { key: 'taylor',   name: 'Taylor Swift',    color: '#9B8AEF', img: 'https://unavatar.io/youtube/TaylorSwiftVEVO',     imgPos: 'center' },
  { key: 'gaga',     name: 'Lady Gaga',       color: '#B47EE8', img: 'https://unavatar.io/youtube/LadyGagaVEVO',        imgPos: 'center' },
  { key: 'mj',       name: 'Michael Jackson', color: '#C8C8D8', img: 'https://unavatar.io/youtube/MichaelJacksonVEVO',  imgPos: 'center top' },
  { key: 'coldplay', name: 'Coldplay',        color: '#6AAEE8', img: 'https://unavatar.io/youtube/coldplay',            imgPos: 'center' },
  { key: 'drake',    name: 'Drake',           color: '#8FA8BC', img: 'drake.jpg',                                       imgPos: 'center top' },
  { key: 'guetta',   name: 'David Guetta',    color: '#3ECBC0', img: 'https://unavatar.io/youtube/davidguetta',         imgPos: 'center' },
  { key: 'billie',   name: 'Billie Eilish',   color: '#5EE87A', img: 'https://unavatar.io/youtube/BillieEilish',        imgPos: 'center' },
  { key: 'ariana',   name: 'Ariana Grande',   color: '#FF9DC0', img: 'https://unavatar.io/youtube/ArianaGrandeVevo',    imgPos: 'center' },
  { key: 'ed',       name: 'Ed Sheeran',      color: '#E8873A', img: 'https://unavatar.io/youtube/edsheeran',           imgPos: 'center' },
  { key: 'shakira',  name: 'Shakira',         color: '#F5C518', img: 'https://unavatar.io/youtube/ShakiraVEVO',         imgPos: 'center' },
  { key: 'katy',     name: 'Katy Perry',      color: '#FF45D8', img: 'https://unavatar.io/youtube/KatyPerryVEVO',       imgPos: 'center' },
  { key: 'maroon5',  name: 'Maroon 5',        color: '#A83232', img: 'https://unavatar.io/youtube/Maroon5VEVO',         imgPos: 'center' },
  { key: 'calvin',   name: 'Calvin Harris',   color: '#00CFFF', img: 'https://unavatar.io/youtube/CalvinHarris',        imgPos: 'center' },
  { key: 'eminem',   name: 'Eminem',          color: '#9CA3AF', img: 'https://unavatar.io/youtube/EminemMusic',         imgPos: 'center' },
  { key: 'pitbull',  name: 'Pitbull',         color: '#DAA520', img: 'https://unavatar.io/youtube/pitbull',             imgPos: 'center' },
];

const TOP_N = 10;

const START_DATE  = '2026-04-30';
const MONTH_START = '2026-05-01';
const END_DATE    = '2026-05-31';

const CHART_GRID_COLOR   = 'rgba(176,200,224,0.07)';
const CHART_TICK_COLOR   = '#4a5e7a';
const CHART_TOOLTIP = {
  backgroundColor:  'rgba(7,10,14,0.88)',
  borderColor:      'rgba(176,200,224,0.20)',
  borderWidth:      1,
  titleColor:       'rgba(176,200,224,0.55)',
  bodyColor:        '#d2dcea',
  padding:          { x: 12, y: 10 },
  cornerRadius:     6,
  boxPadding:       5,
};
const DS = { UPPER: '_bu_', LOWER: '_bl_', PROJ: '_proj_' };

const INITIAL_DATA = {
  '2026-04-30': { bruno: 136924541, bieber: 135434033, weeknd: 115583314, rihanna: null, badbunny: null, taylor: null, gaga: null, coldplay: null, drake: 88954243, guetta: null },
  '2026-05-01': { bruno: 136909550, bieber: 136648778, weeknd: 115780214, rihanna: 111072413, badbunny: 102473650, taylor: 101428168, gaga: 96929008, coldplay: 91292605, drake: 88928853, guetta: 88090128 },
};

const MEDALS = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20'];

function avatarImg(a, size) {
  const pos = a.imgPos || 'center';
  return a.img
    ? `<img src="${a.img}" alt="${a.name}" style="width:100%;height:100%;object-fit:cover;object-position:${pos}">`
    : `<span style="font-size:${size * 0.4}px;font-weight:700">${a.name[0]}</span>`;
}

// Devuelve ARTISTS ordenados por oyentes actuales con medalla asignada.
// Es la única fuente de verdad para orden y emojis en toda la app.
function getRanked() {
  const curr = DATA[sorted().at(-1)];
  return [...ARTISTS]
    .sort((a, b) => (curr[b.key] ?? 0) - (curr[a.key] ?? 0))
    .map((a, i) => ({ ...a, medal: MEDALS[i] }));
}

// ── Datos ──────────────────────────────────────────────────────────────────
function migrateData(data) {
  Object.keys(data).forEach(date => {
    ARTISTS.forEach(a => { if (!(a.key in data[date])) data[date][a.key] = null; });
  });
  return data;
}

async function loadData() {
  // 1. Base: data.json mantenido por GitHub Actions
  let base = JSON.parse(JSON.stringify(INITIAL_DATA));
  try {
    const res = await fetch('./data.json');
    if (res.ok) base = migrateData(await res.json());
  } catch (e) { console.error('[loadData] failed to fetch data.json:', e); }

  // 2. Merge con localStorage a nivel de artista: manual no-null gana sobre base,
  //    pero base no-null llena huecos null del localStorage.
  const raw = localStorage.getItem('spotifyTracker_v2');
  if (raw) {
    let local;
    try { local = migrateData(JSON.parse(raw)); } catch (e) { console.error('[loadData] corrupted localStorage, ignoring:', e); }
    if (!local) return base;
    Object.keys(local).forEach(d => {
      if (!base[d]) {
        base[d] = local[d];
      } else {
        ARTISTS.forEach(a => {
          if (local[d][a.key] != null) base[d][a.key] = local[d][a.key];
        });
      }
    });
  }

  return base;
}
function persist(d) {
  localStorage.setItem('spotifyTracker_v2', JSON.stringify(d));
  pushToGithub(d).catch(e => console.error('[persist] push failed:', e));
}

let DATA = {};
function sorted() { return Object.keys(DATA).sort(); }

// ── Utilidades de fecha ────────────────────────────────────────────────────
// Returns local date as YYYY-MM-DD (avoids UTC midnight rollover from toISOString)
function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function toDate(str) { return new Date(str + 'T12:00:00'); }
function dayIndex(dateStr) {
  return Math.round((toDate(dateStr) - toDate(START_DATE)) / 86400000) + 1;
}
function dayIndexToDate(idx) {
  const d = toDate(START_DATE);
  d.setDate(d.getDate() + idx - 1);
  return d.toISOString().split('T')[0];
}
function allLabels() {
  const labels = [], end = toDate(END_DATE);
  for (let d = toDate(START_DATE); d <= end; d.setDate(d.getDate() + 1))
    labels.push(d.toISOString().split('T')[0]);
  return labels;
}

// ── Último dato conocido ───────────────────────────────────────────────────
function getLastKnown(artistKey) {
  const dates = sorted();
  for (let i = dates.length - 1; i >= 0; i--) {
    const v = DATA[dates[i]][artistKey];
    if (v != null) return { value: v, date: dates[i] };
  }
  return null;
}

// ── Formato ────────────────────────────────────────────────────────────────
function fmtM(n) { return (n / 1e6).toFixed(2) + 'M'; }
function fmtDelta(v) {
  if (v === null || v === undefined) return '—';
  const s = v >= 0 ? '+' : '';
  return `<span class="${v >= 0 ? 'pos' : 'neg'}">${s}${v.toLocaleString('en-US')}</span>`;
}

// ── Regresión logarítmica ──────────────────────────────────────────────────
// Modelo: y = a + b·ln(x)  →  mínimos cuadrados
function logRegression(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const lx   = xs.map(x => Math.log(x));
  const slx  = lx.reduce((s, v) => s + v, 0);
  const sy   = ys.reduce((s, v) => s + v, 0);
  const slx2 = lx.reduce((s, v) => s + v * v, 0);
  const sylx = ys.reduce((s, v, i) => s + v * lx[i], 0);
  const D    = n * slx2 - slx * slx;
  if (D === 0) return null;
  const b = (n * sylx - slx * sy) / D;
  const a = (sy - b * slx) / n;
  return { a, b };
}
function project(reg, x) { return reg.a + reg.b * Math.log(x); }

let PROJ_WINDOW = 14;
let hiddenArtists = new Set();
let currentChartView = 'evolution';

function _updateEvolutionHeader() {
  document.getElementById('chartViewTitle').textContent = PROJ_WINDOW !== null
    ? 'Evolution · Logarithmic projection to May 31'
    : 'Evolution · Full history';
  document.getElementById('legendNote').style.display = PROJ_WINDOW !== null ? '' : 'none';
}

function setChartView(view) {
  currentChartView = view;
  const evo = view === 'evolution';
  document.getElementById('artistToggles').style.display   = evo ? '' : 'none';
  document.getElementById('mainChartWrap').style.display   = evo ? '' : 'none';
  document.getElementById('windowSelector').style.display  = evo ? '' : 'none';
  document.getElementById('changeChartWrap').style.display = evo ? 'none' : '';
  if (evo) {
    _updateEvolutionHeader();
  } else {
    document.getElementById('chartViewTitle').textContent  = '24h change';
    document.getElementById('legendNote').style.display    = 'none';
  }
  document.querySelectorAll('.switch-opt').forEach(el =>
    el.classList.toggle('active', el.dataset.view === view)
  );
  updateSwitchThumb();
  if (!evo) buildChangeChart();
}

function updateSwitchThumb() {
  const sw = document.querySelector('.chart-view-switch');
  if (!sw) return;
  const active = sw.querySelector('.switch-opt.active');
  const thumb  = sw.querySelector('.switch-thumb');
  if (!active || !thumb) return;
  thumb.style.left  = active.offsetLeft + 'px';
  thumb.style.width = active.offsetWidth + 'px';
}

// ── Drag-to-toggle ─────────────────────────────────────────────────────────
const _drag = { on: false, action: null, dirty: false };

document.addEventListener('mousedown', () => { _drag.on = true; });
document.addEventListener('mouseup', () => {
  _drag.on = false;
  _drag.action = null;
  if (_drag.dirty) { _drag.dirty = false; renderArtistToggles(); }
});

function _toggleStyleStr(a) {
  return hiddenArtists.has(a.key)
    ? 'background:transparent;border-color:var(--border);color:var(--muted2)'
    : `background:${a.color}14;border-color:${a.color}55;color:${a.color}`;
}

function _toggleStyle(btn, key) {
  btn.style.cssText = _toggleStyleStr(ARTISTS.find(a => a.key === key));
}

function _applyDrag(key, btn) {
  if (_drag.action === null) _drag.action = hiddenArtists.has(key) ? 'show' : 'hide';
  const isHidden = hiddenArtists.has(key);
  if (_drag.action === 'hide' && !isHidden) hiddenArtists.add(key);
  else if (_drag.action === 'show' && isHidden) hiddenArtists.delete(key);
  else return;
  _drag.dirty = true;
  _toggleStyle(btn, key);
  buildMainChart();
}

function startToggleDrag(e, key) {
  e.preventDefault();
  _applyDrag(key, e.currentTarget);
}

function continueToggleDrag(e, key) {
  if (!_drag.on) return;
  _applyDrag(key, e.currentTarget);
}

function renderArtistToggles() {
  const ranked = getRanked().slice(0, TOP_N);
  document.getElementById('artistToggles').innerHTML = ranked.map(a =>
    `<button class="artist-toggle" style="${_toggleStyleStr(a)}"
      onmousedown="startToggleDrag(event,'${a.key}')"
      onmouseenter="continueToggleDrag(event,'${a.key}')"
    >${a.medal} ${a.name}</button>`
  ).join('');
}

function setWindow(n) {
  PROJ_WINDOW = n;
  document.querySelectorAll('.win-btn').forEach(btn => {
    const v = btn.dataset.window === 'null' ? null : parseInt(btn.dataset.window, 10);
    btn.classList.toggle('active', v === n);
  });
  buildMainChart();
  renderCards();
  renderBetCard();
}

function getRegression(artistKey) {
  let dates = sorted().filter(d => DATA[d][artistKey] != null);
  if (PROJ_WINDOW !== null && dates.length > PROJ_WINDOW) dates = dates.slice(-PROJ_WINDOW);
  return logRegression(
    dates.map(d => dayIndex(d)),
    dates.map(d => DATA[d][artistKey])
  );
}

// Día-índice donde reg2 crosses reg1 (logarithmic intersection)
function findCrossing(reg1, reg2) {
  if (!reg1 || !reg2) return null;
  const D = reg1.b - reg2.b;
  if (Math.abs(D) < 1) return null;
  const lnX = (reg2.a - reg1.a) / D;
  if (lnX <= 0) return null;
  const x = Math.exp(lnX);
  // ceil: first full day where reg2 already leads reg1
  return { x, date: dayIndexToDate(Math.ceil(x)) };
}

// ── Plugin: línea vertical de cruce ───────────────────────────────────────
const crossingLinePlugin = {
  id: 'crossingLine',
  afterDraw(chart) {
    const opts = chart.options.plugins?.crossingLine;
    if (!opts?.labelIndex && opts?.labelIndex !== 0) return;
    const { ctx } = chart;
    const xScale  = chart.scales.x;
    const yScale  = chart.scales.y;
    const px      = xScale.getPixelForValue(opts.labelIndex);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(px, yScale.top);
    ctx.lineTo(px, yScale.bottom);
    ctx.strokeStyle = opts.color || 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.stroke();

    if (opts.text) {
      ctx.fillStyle  = opts.color || 'rgba(255,255,255,0.4)';
      ctx.font       = 'bold 11px sans-serif';
      ctx.textAlign  = 'center';
      ctx.setLineDash([]);
      ctx.fillText(opts.text, px, yScale.top - 8);
    }
    ctx.restore();
  }
};
Chart.register(crossingLinePlugin);

// ── Gráficas ───────────────────────────────────────────────────────────────
let mainChart, changeChart;

const glassBarBg = (context) => {
  const { chart, dataIndex } = context;
  const { ctx, chartArea } = chart;
  const c = context.dataset.borderColor?.[dataIndex] || '#888';
  if (!chartArea) return c + '55';
  const isNeg = (context.parsed?.y ?? 0) < 0;
  const grad = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  if (isNeg) { grad.addColorStop(0, c + '18'); grad.addColorStop(1, c + 'cc'); }
  else        { grad.addColorStop(0, c + 'cc'); grad.addColorStop(1, c + '18'); }
  return grad;
};

function buildMainChart() {
  const labels  = allLabels();
  const dates   = sorted();
  const dispLbl = labels.map(l => {
    const d = toDate(l);
    return `${d.getDate()} ${d.getMonth() === 3 ? 'Apr' : 'May'}`;
  });

  const regBruno  = getRegression('bruno');
  const regBieber = getRegression('bieber');
  const crossing  = findCrossing(regBruno, regBieber);

  const lastDate = dates[dates.length - 1];
  const lastIdx  = dayIndex(lastDate);

  // Índice de label donde cae el cruce (para el plugin)
  const crossingLabelIdx = crossing ? labels.indexOf(crossing.date) : null;
  const crossingInRange  = crossingLabelIdx > 0 && crossing.x > lastIdx;

  if (currentChartView === 'evolution') _updateEvolutionHeader();
  renderArtistToggles();
  const showProj = PROJ_WINDOW !== null;
  const datasets = [];

  getRanked().slice(0, TOP_N).forEach((artist, artistIdx) => {
    const isHidden = hiddenArtists.has(artist.key);
    const reg = getRegression(artist.key);

    // Error estándar de los residuos (banda de confianza ±1σ)
    let se = 0;
    if (reg) {
      let regDates = sorted().filter(d => DATA[d][artist.key] != null);
      if (PROJ_WINDOW !== null && regDates.length > PROJ_WINDOW) regDates = regDates.slice(-PROJ_WINDOW);
      if (regDates.length >= 3) {
        const res = regDates.map(d => DATA[d][artist.key] - project(reg, dayIndex(d)));
        se = Math.sqrt(res.reduce((s, r) => s + r * r, 0) / (regDates.length - 2));
      }
    }

    // Histórico (línea sólida)
    const historical = labels.map(lbl => {
      const v = DATA[lbl]?.[artist.key];
      return v != null ? v / 1e6 : null;
    });

    // Último día con dato real para este artista específico
    const artistDates = sorted().filter(d => DATA[d][artist.key] != null);
    const artistLastDate = artistDates[artistDates.length - 1];
    const artistLastIdx  = artistLastDate ? dayIndex(artistLastDate) : null;
    const artistLastVal  = artistLastDate ? DATA[artistLastDate][artist.key] : null;

    // Shift para que la proyección salga suave desde el último punto real
    const projShift = (showProj && reg && artistLastIdx !== null && artistLastVal !== null)
      ? artistLastVal - project(reg, artistLastIdx)
      : 0;

    // Proyección central (línea punteada)
    const projection = labels.map(lbl => {
      const idx = dayIndex(lbl);
      if (!showProj || !reg || artistLastIdx === null || idx < artistLastIdx) return null;
      return (project(reg, idx) + projShift) / 1e6;
    });

    // Banda superior
    const bandUpper = labels.map(lbl => {
      const idx = dayIndex(lbl);
      if (!showProj || !reg || se === 0 || artistLastIdx === null || idx < artistLastIdx) return null;
      return (project(reg, idx) + projShift + se) / 1e6;
    });

    // Banda inferior
    const bandLower = labels.map(lbl => {
      const idx = dayIndex(lbl);
      if (!showProj || !reg || se === 0 || artistLastIdx === null || idx < artistLastIdx) return null;
      return (project(reg, idx) + projShift - se) / 1e6;
    });

    datasets.push({
      label: artist.name,  // no prefix → real data series
      data: historical,
      hidden: isHidden,
      borderColor: artist.color,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return artist.color + '00';
        const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        grad.addColorStop(0, artist.color + '28');
        grad.addColorStop(1, artist.color + '00');
        return grad;
      },
      fill: 'origin',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: historical.map(v => v !== null ? 3.5 : 0),
      pointHoverRadius: 5.5,
      pointBackgroundColor: artist.color,
      pointBorderColor: 'transparent',
      spanGaps: false,
    });

    datasets.push({
      label: DS.UPPER + artist.key,
      data: bandUpper,
      hidden: isHidden,
      borderColor: 'transparent',
      backgroundColor: artist.color + '12',
      borderWidth: 0,
      // each artist occupies 4 slots: [historical, upper, lower, proj]
      // fill down to the lower-band dataset at artistIdx*4+2
      fill: artistIdx * 4 + 2,
      tension: 0.3,
      pointRadius: 0,
      spanGaps: false,
    });

    datasets.push({
      label: DS.LOWER + artist.key,
      data: bandLower,
      hidden: isHidden,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      borderWidth: 0,
      fill: false,
      tension: 0.3,
      pointRadius: 0,
      spanGaps: false,
    });

    datasets.push({
      label: DS.PROJ + artist.key,
      data: projection,
      hidden: isHidden,
      borderColor: artist.color,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [6, 5],
      tension: 0.3,
      pointRadius: 0,
      spanGaps: false,
    });
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: true },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...CHART_TOOLTIP,
        callbacks: {
          label: ctx => {
            if (ctx.raw === null) return null;
            const lbl = ctx.dataset.label;
            if (lbl.startsWith(DS.UPPER) || lbl.startsWith(DS.LOWER)) return null;
            const isProj = lbl.startsWith(DS.PROJ);
            const name = isProj
              ? ARTISTS.find(a => DS.PROJ + a.key === lbl)?.name
              : lbl;
            return ` ${name}: ${isProj ? '~' : ''}${ctx.parsed.y.toFixed(3)}M`;
          }
        },
        filter: item => item.raw !== null && !item.dataset.label.startsWith(DS.UPPER) && !item.dataset.label.startsWith(DS.LOWER),
      },
      crossingLine: crossingInRange && showProj ? {
        labelIndex: crossingLabelIdx,
        color: 'rgba(255, 200, 0, 0.40)',
        text: `cross ~${crossing.date.slice(5)}`,
      } : {},
    },
    scales: {
      x: {
        ticks: { color: CHART_TICK_COLOR, maxTicksLimit: 16 },
        grid: { color: CHART_GRID_COLOR },
        border: { color: 'rgba(176,200,224,0.10)' },
      },
      y: {
        ticks: { color: CHART_TICK_COLOR, callback: v => v.toFixed(0) + 'M' },
        grid: { color: CHART_GRID_COLOR },
        border: { color: 'rgba(176,200,224,0.10)' },
        min: 82,
      }
    }
  };

  if (mainChart) {
    mainChart.data.labels   = dispLbl;
    mainChart.data.datasets = datasets;
    mainChart.options       = options;
    mainChart.update('none');
  } else {
    mainChart = new Chart(document.getElementById('mainChart'), {
      type: 'line', data: { labels: dispLbl, datasets }, options,
    });
  }
}

function buildChangeChart() {
  const dates = sorted();
  if (dates.length < 2) return;
  const prev    = dates[dates.length - 2];
  const curr    = dates[dates.length - 1];
  const ranked  = getRanked().slice(0, TOP_N);
  const changes = ranked.map(a => {
    const c = DATA[curr][a.key], p = DATA[prev][a.key];
    return c != null && p != null ? c - p : null;
  });

  const labels = ranked.map(a => `${a.medal} ${a.name}`);
  const data   = changes.map(c => c != null ? Math.round(c / 1000) : null);
  const colors = ranked.map(a => a.color);

  if (changeChart) {
    changeChart.data.labels = labels;
    changeChart.data.datasets[0].data = data;
    changeChart.data.datasets[0].borderColor = colors;
    changeChart.update('none');
    return;
  }

  changeChart = new Chart(document.getElementById('changeChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: glassBarBg,
        borderColor: colors,
        borderWidth: { top: 1.5, left: 1, right: 1, bottom: 0 },
        borderSkipped: false,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...CHART_TOOLTIP,
          callbacks: {
            label: ctx =>
              `${ctx.parsed.y >= 0 ? '+' : ''}${ctx.parsed.y.toLocaleString()}K listeners`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: CHART_TICK_COLOR },
          grid: { display: false },
          border: { color: 'rgba(176,200,224,0.10)' },
        },
        y: {
          ticks: { color: CHART_TICK_COLOR, callback: v => v + 'K' },
          grid: { color: CHART_GRID_COLOR },
          border: { color: 'rgba(176,200,224,0.10)' },
        }
      }
    }
  });
}

// ── Cards ──────────────────────────────────────────────────────────────────
function renderCards() {
  const dates  = sorted();
  const curr   = DATA[dates[dates.length - 1]];
  const prev   = dates.length > 1 ? DATA[dates[dates.length - 2]] : null;
  const endIdx = dayIndex(END_DATE);
  const ranked = getRanked();
  const maxVal = ranked.reduce((m, a) => Math.max(m, curr[a.key] ?? 0), 0);

  // ── Duel: top 2 face to face ────────────────────────────────────────────
  const [a1, a2] = ranked;

  function duelSide(a, dir) {
    const val    = curr[a.key] ?? null;
    const pval   = prev?.[a.key] ?? null;
    const change = val != null && pval != null ? val - pval : null;
    const reg    = getRegression(a.key);
    const proj   = reg ? project(reg, endIdx) : null;
    const stale  = val == null ? getLastKnown(a.key) : null;
    const num    = val != null ? fmtM(val) : stale ? `~${fmtM(stale.value)}` : '—';
    const isStale = val == null && stale;

    return `
      <div class="duel-side duel-${dir}">
        <div class="duel-avatar">${avatarImg(a, 76)}</div>
        <div class="duel-info">
          <div class="duel-rank">${a.medal}</div>
          <div class="duel-name">${a.name}</div>
          <div class="duel-num${isStale ? ' stale' : ''}">${num}</div>
          ${proj   ? `<div class="duel-proj">proj. ${fmtM(proj)}</div>` : ''}
          ${change !== null ? `<div class="duel-change">${fmtDelta(change)}</div>` : ''}
        </div>
      </div>`;
  }

  const gap = (curr[a1.key] ?? 0) - (curr[a2.key] ?? 0);
  const duel = `
    <div class="duel-card">
      ${duelSide(a1, 'left')}
      <div class="duel-center">
        <div class="duel-vs">vs</div>
        <div class="duel-gap-num">${gap > 0 ? gap.toLocaleString('en-US') : '—'}</div>
        <div class="duel-gap-lbl">gap</div>
      </div>
      ${duelSide(a2, 'right')}
    </div>`;

  // ── Rank list: positions 3–TOP_N ───────────────────────────────────────
  const list = ranked.slice(2, TOP_N).map(a => {
    const val    = curr[a.key] ?? null;
    const pval   = prev?.[a.key] ?? null;
    const change = val != null && pval != null ? val - pval : null;
    const stale  = val == null ? getLastKnown(a.key) : null;
    const dispV  = val ?? stale?.value ?? 0;
    const pct    = maxVal > 0 ? (dispV / maxVal * 100).toFixed(1) : 0;
    const num    = val != null ? fmtM(val) : stale ? `~${fmtM(stale.value)}` : '—';

    return `
      <div class="rank-row">
        <div class="rank-pos">${a.medal}</div>
        <div class="rank-avatar">${avatarImg(a, 34)}</div>
        <div class="rank-name">${a.name}</div>
        <div class="rank-bar-wrap"><div class="rank-bar" style="width:${pct}%"></div></div>
        <div class="rank-val${val == null && stale ? ' stale' : ''}">${num}</div>
        <div class="rank-change">${change !== null ? fmtDelta(change) : ''}</div>
      </div>`;
  }).join('');

  document.getElementById('cards').innerHTML =
    duel + `<div class="rank-list">${list}</div>`;
}

// ── Bet card (gap + projection) ────────────────────────────────────────────
function renderBetCard() {
  const el       = document.getElementById('betCard');
  const dates    = sorted();
  const lastDate = dates[dates.length - 1];
  const curr     = DATA[lastDate];
  const lastIdx  = dayIndex(lastDate);
  const endIdx   = dayIndex(END_DATE);
  const ranked   = getRanked();
  const leader   = ranked[0];
  const second   = ranked[1];

  // ── Gap column: current #1 vs #2 ──────────────────────────────────────
  let gapVal = '—', gapSub = '';
  const v1 = curr[leader.key], v2 = curr[second.key];
  if (v1 != null && v2 != null) {
    gapVal = (v1 - v2).toLocaleString('en-US');
    gapSub = `${leader.name} leads`;
  }

  // ── Projection column: who leads May 31, earliest crossing of #1 ──────
  const reg1 = getRegression(leader.key);

  // Projected #1 at END_DATE
  const projAtEnd = ranked
    .map(a => {
      const reg = getRegression(a.key);
      const val = reg ? project(reg, endIdx) : (getLastKnown(a.key)?.value ?? 0);
      return { a, val };
    })
    .sort((x, y) => y.val - x.val)[0].a;

  let projVal = '—', projSub = '', projStyle = '';
  if (projAtEnd.key !== leader.key) {
    // Projected leader is different — find the crossing date
    const regChallenger = getRegression(projAtEnd.key);
    const cross = findCrossing(reg1, regChallenger);
    if (cross && cross.x > lastIdx && cross.date <= END_DATE) {
      const today     = localDateStr();
      const daysUntil = Math.round((toDate(cross.date) - toDate(today)) / 86400000);
      projVal  = `May ${cross.date.slice(5)}`;
      projSub  = `${projAtEnd.name} takes #1 · in ~${daysUntil}d`;
      if (daysUntil <= 5) projStyle = 'color:var(--neg)';
    } else {
      projVal = `May 31`;
      projSub = `${projAtEnd.name} projected to lead`;
    }
  } else {
    projVal = 'After May 31';
    projSub = `${leader.name} holds lead`;
  }

  el.innerHTML = `
    <div class="bet-card">
      <div class="bet-col">
        <div class="bet-label">Gap #1 · #2</div>
        <div class="bet-value">${gapVal}</div>
        <div class="bet-sub">${gapSub}</div>
      </div>
      <div class="bet-divider"></div>
      <div class="bet-col">
        <div class="bet-label">Next crossing</div>
        <div class="bet-value" style="${projStyle}">${projVal}</div>
        <div class="bet-sub">${projSub}</div>
      </div>
    </div>`;
}

// ── Subtítulo ──────────────────────────────────────────────────────────────
function renderSubtitle() {
  const dates  = sorted();
  const last   = dates[dates.length - 1];
  const dayNum = Math.max(1, Math.round((toDate(last) - toDate(MONTH_START)) / 86400000) + 1);
  document.getElementById('subtitle').textContent =
    `Daily tracking · May 2026 · Day ${dayNum} · last entry: ${last.slice(5)}`;
}

// ── Tabla ──────────────────────────────────────────────────────────────────
function renderTable() {
  const dates  = sorted();
  const ranked = getRanked().slice(0, TOP_N);
  const top1   = ranked[0];
  const top2   = ranked[1];
  const cols   = ranked.length + 3; // date + artists + gap + edit

  let html = `<div class="table-wrap"><table>
    <tr>
      <th>Date</th>
      ${ranked.map(a => `<th>${a.name}</th>`).join('')}
      <th>Gap #1-#2</th><th></th>
    </tr>`;

  dates.forEach((date, i) => {
    const d    = DATA[date];
    const prev = i > 0 ? DATA[dates[i - 1]] : null;
    const gap  = d[top1.key] != null && d[top2.key] != null ? d[top1.key] - d[top2.key] : null;

    html += `<tr>
      <td>${date.slice(5)}</td>
      ${ranked.map(a => {
        const val  = d[a.key];
        const pval = prev?.[a.key];
        const delta = val != null && pval != null ? val - pval : null;
        const tip   = delta !== null ? (delta >= 0 ? '+' : '') + delta.toLocaleString('en-US') : null;
        const tipAttr = tip ? (delta >= 0 ? `data-tip-pos="${tip}"` : `data-tip-neg="${tip}"`) : '';
        return `<td${tipAttr ? ' ' + tipAttr : ''}>${val != null ? (val / 1e6).toFixed(3) + 'M' : '—'}</td>`;
      }).join('')}
      <td>${gap != null ? `<span class="${gap > 0 ? 'pos' : 'neg'}">${gap > 0 ? '+' : ''}${gap.toLocaleString('en-US')}</span>` : '—'}</td>
      <td><button class="btn-edit" onclick="toggleEdit('${date}')" title="Edit">✏</button></td>
    </tr>
    <tr id="edit-panel-${date}" class="edit-panel-row" style="display:none">
      <td colspan="${cols}">
        <div class="edit-panel">
          <div class="edit-chips">
            ${ranked.map(a => {
              const val = d[a.key];
              return `<div class="edit-chip">
                <span class="chip-name">${a.medal} ${a.name}</span>
                <span class="chip-val">${val != null ? (val / 1e6).toFixed(3) + 'M' : '—'}</span>
                ${val != null ? `<button class="chip-clear" onclick="clearArtist('${date}','${a.key}')" title="Clear">✕</button>` : ''}
              </div>`;
            }).join('')}
          </div>
          <button class="btn-del-row" onclick="deleteRow('${date}')">Delete row</button>
        </div>
      </td>
    </tr>`;
  });

  html += '</table></div>';
  document.getElementById('tableContainer').innerHTML = html;
}

function toggleEdit(date) {
  const panel = document.getElementById('edit-panel-' + date);
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'table-row' : 'none';
}

function clearArtist(date, key) {
  if (!DATA[date]) return;
  DATA[date][key] = null;
  persist(DATA);
  updateAll();
}

// ── Formulario ─────────────────────────────────────────────────────────────
function renderFormGrid() {
  const lastEntry = DATA[sorted().at(-1)];
  const artistInputs = getRanked().map(a => {
    const hint = lastEntry[a.key] != null ? lastEntry[a.key] : '';
    return `
    <div class="form-group">
      <label>${a.medal} · ${a.name}</label>
      <input type="number" id="in-${a.key}" placeholder="${hint}" />
    </div>`;
  }).join('');

  document.getElementById('formGrid').innerHTML = `
    <div class="form-date-section">
      <div class="form-group" style="max-width:220px">
        <label>Date</label>
        <div class="date-row">
          <input type="date" id="inDate" />
          <button class="btn-today" onclick="setToday()">today</button>
        </div>
      </div>
    </div>
    <div class="form-artists-grid">${artistInputs}</div>`;

  setToday();
  ['inDate', ...ARTISTS.map(a => 'in-' + a.key)].forEach(id =>
    document.getElementById(id)?.addEventListener('input', clearErrors)
  );
}

function updateFormPlaceholders() {
  const lastEntry = DATA[sorted().at(-1)];
  ARTISTS.forEach(a => {
    const el = document.getElementById('in-' + a.key);
    if (el) el.placeholder = lastEntry[a.key] != null ? lastEntry[a.key] : '';
  });
}

function setToday() {
  document.getElementById('inDate').value = localDateStr();
}

function allInputIds() {
  return ['inDate', ...ARTISTS.map(a => 'in-' + a.key)];
}

function validateForm() {
  let ok = true;
  const dateEl = document.getElementById('inDate');
  const badDate = !dateEl.value;
  dateEl.classList.toggle('error', badDate);
  if (badDate) ok = false;

  // Artist fields are optional — only flag if they have an invalid (non-numeric) value
  ARTISTS.forEach(a => {
    const el = document.getElementById('in-' + a.key);
    if (!el) return;
    const bad = el.value !== '' && isNaN(parseInt(el.value, 10));
    el.classList.toggle('error', bad);
    if (bad) ok = false;
  });

  // Require at least one artist to have a value
  const anyFilled = ARTISTS.some(a => {
    const el = document.getElementById('in-' + a.key);
    return el && el.value !== '';
  });
  if (!anyFilled) {
    ARTISTS.forEach(a => document.getElementById('in-' + a.key)?.classList.add('error'));
    ok = false;
  }
  return ok;
}

function clearErrors() {
  allInputIds().forEach(id => document.getElementById(id)?.classList.remove('error'));
}

function addData() {
  if (!validateForm()) return;
  const date = document.getElementById('inDate').value;
  const existing = DATA[date] || {};
  const entry = {};
  ARTISTS.forEach(a => {
    const v = document.getElementById('in-' + a.key).value;
    entry[a.key] = v !== '' ? parseInt(v, 10) : (existing[a.key] ?? null);
  });
  DATA[date] = entry;
  persist(DATA);
  updateAll();
  ARTISTS.forEach(a => {
    const el = document.getElementById('in-' + a.key);
    if (el) el.value = '';
  });
}

function deleteRow(date) {
  if (sorted().length <= 1) { alert('You need at least 1 row of data.'); return; }
  if (!confirm(`Delete data for ${date}?`)) return;
  delete DATA[date];
  persist(DATA);
  updateAll();
}

function resetData() {
  ARTISTS.forEach(a => {
    const el = document.getElementById('in-' + a.key);
    if (el) el.value = '';
  });
  setToday();
}

function exportData() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

async function fetchWithProxy(targetUrl) {
  const proxies = [
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  ];
  for (const buildUrl of proxies) {
    try {
      const res = await fetch(buildUrl(targetUrl), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const ct = res.headers.get('content-type') || '';
      // allorigins wraps in JSON; codetabs/corsproxy return raw HTML
      const text = ct.includes('json') ? (await res.json()).contents : await res.text();
      if (text && text.length > 1000) return text;
    } catch (e) { console.warn('[proxy] failed:', e); }
  }
  throw new Error('All proxies failed');
}

async function autoFill() {
  const btn = document.getElementById('autoFillBtn');
  btn.textContent = 'Loading...';
  btn.disabled = true;

  try {
    const html = await fetchWithProxy('https://kworb.net/spotify/listeners.html');

    // Extract listener counts from kworb for each artist
    const fetched = {};
    ARTISTS.forEach(artist => {
      const escaped = artist.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = html.match(new RegExp(escaped + '[\\s\\S]{0,400}?(\\d{2,3},\\d{3},\\d{3})', 'i'));
      if (match) {
        const n = parseInt(match[1].replace(/,/g, ''), 10);
        if (n > 1_000_000) fetched[artist.key] = n;
      }
    });

    if (Object.keys(fetched).length === 0) {
      btn.textContent = 'No data'; btn.style.color = 'var(--neg)';
      setTimeout(() => { btn.textContent = 'Auto-fill'; btn.disabled = false; btn.style.color = ''; }, 3000);
      return;
    }

    // Always target today — autofill fetches the current Spotify snapshot
    const today = localDateStr();
    document.getElementById('inDate').value = today;

    const todayData = DATA[today];

    // If kworb values match yesterday's data within 0.5% → kworb hasn't refreshed yet.
    // Only applies when comparing against yesterday — if there's a gap, skip the check.
    const yesterday = (() => {
      const d = new Date(); d.setDate(d.getDate() - 1);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    })();
    const prevDate = sorted().filter(d => d < today).at(-1);
    const prevData = prevDate ? DATA[prevDate] : null;
    const comparableArtists = ARTISTS.filter(a => fetched[a.key] && prevData?.[a.key] != null);
    const kworkIsStale = prevDate === yesterday && comparableArtists.length >= 5 &&
      comparableArtists.every(a =>
        Math.abs(prevData[a.key] - fetched[a.key]) / prevData[a.key] < 0.005
      );

    if (kworkIsStale) {
      btn.textContent = 'Already up to date';
      btn.style.color = 'var(--muted)';
      setTimeout(() => { btn.textContent = 'Auto-fill'; btn.disabled = false; btn.style.color = ''; }, 3000);
      return;
    }

    // Fill only artists missing from today's entry
    let filled = 0;
    ARTISTS.forEach(artist => {
      const input = document.getElementById('in-' + artist.key);
      if (!input || !fetched[artist.key]) return;
      if (todayData?.[artist.key] == null) {
        input.value = fetched[artist.key];
        filled++;
      }
    });

    if (filled === 0) {
      btn.textContent = 'Already up to date';
      btn.style.color = 'var(--muted)';
      setTimeout(() => { btn.textContent = 'Auto-fill'; btn.disabled = false; btn.style.color = ''; }, 3000);
      return;
    }

    btn.textContent = `${filled} filled · ${today.slice(5)}`;
    btn.style.color = 'var(--muted)';
  } catch (e) {
    console.error('[autofill] error:', e);
    btn.textContent  = 'Error';
    btn.style.color  = 'var(--neg)';
  }

  setTimeout(() => {
    btn.textContent = 'Auto-fill';
    btn.disabled    = false;
    btn.style.color = '';
  }, 3000);
}

// ── Actualizar todo ────────────────────────────────────────────────────────
function updateAll() {
  renderSubtitle();
  renderCards();
  renderBetCard();
  updateFormPlaceholders();
  buildMainChart();
  buildChangeChart();
  renderTable();
}

// ── Partículas ─────────────────────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
    r: Math.random() * 2.5 + 1,
    color: '#ffffff',
    opacity: Math.random() * 0.18 + 0.07,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Inicio ─────────────────────────────────────────────────────────────────
document.querySelector('.form-box').addEventListener('keydown', e => {
  if (e.key === 'Enter') addData();
});

// ── Admin mode ─────────────────────────────────────────────────────────────
const ADMIN_HASH = '19857514fe809744c28460e43c905bce01fd89fbb3dacf07f1295cffbc08503f';
const GH_REPO    = 'yeezuuus/spotify-listeners-tracker-';
const GH_FILE    = 'data.json';

function isAdmin() { return sessionStorage.getItem('admin') === '1'; }

function applyAdminMode() {
  document.body.classList.toggle('admin-mode', isAdmin());
  const lock = document.getElementById('adminLock');
  if (lock) lock.textContent = isAdmin() ? '🔓' : '🔒';
}

async function pushToGithub(data) {
  const token = localStorage.getItem('ghToken');
  if (!token) return;
  try {
    const apiUrl = `https://api.github.com/repos/${GH_REPO}/contents/${GH_FILE}`;
    const getRes = await fetch(apiUrl, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!getRes.ok) return;
    const { sha } = await getRes.json();
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `data: listeners ${new Date().toISOString().split('T')[0]}`,
        content,
        sha
      })
    });
  } catch (e) { console.error('[pushToGithub] failed:', e); }
}

async function toggleAdmin() {
  if (isAdmin()) {
    sessionStorage.removeItem('admin');
    applyAdminMode();
    return;
  }
  const pw = prompt('');
  if (!pw) return;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  if (hex === ADMIN_HASH) {
    sessionStorage.setItem('admin', '1');
    if (!localStorage.getItem('ghToken')) {
      const token = prompt('');
      if (token && token.trim()) localStorage.setItem('ghToken', token.trim());
    }
    applyAdminMode();
  }
}

(async () => {
  const skeleton = document.getElementById('skeleton');
  const content  = document.getElementById('mainContent');
  skeleton.style.display = 'block';
  content.style.display  = 'none';

  const [data] = await Promise.all([
    loadData(),
    new Promise(r => setTimeout(r, 800)),
  ]);
  DATA = data;
  renderFormGrid();
  updateAll();
  updateSwitchThumb();
  initParticles();
  applyAdminMode();

  skeleton.style.display = 'none';
  content.style.opacity  = '0';
  content.style.display  = 'block';
  content.style.transition = 'opacity 0.45s ease';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    content.style.opacity = '1';
  }));
})();
