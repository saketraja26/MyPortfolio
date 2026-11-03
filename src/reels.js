// Procedural looping "screen recordings" drawn on a 2D canvas.
// Each reel is a stylised, animated UI of the project that plays inside its
// portal (and in the case study) until a real video is supplied in data.js.

export const REEL_W = 800;
export const REEL_H = 500;

const MONO = '"Geist Mono", ui-monospace, monospace';
const SANS = 'Geist, system-ui, sans-serif';

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

// deterministic pseudo-random
function rand(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function panel(ctx, x, y, w, h, title, color) {
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  ctx.stroke();
  if (title) {
    ctx.fillStyle = 'rgba(236,234,228,0.5)';
    ctx.font = `500 11px ${MONO}`;
    ctx.fillText(title.toUpperCase(), x + 14, y + 22);
    ctx.fillStyle = color;
    ctx.fillRect(x + w - 22, y + 16, 8, 8);
  }
}

// The window chrome and dot grid never change, so they're drawn once per reel
// into an offscreen canvas and blitted each frame (~900 fewer draw calls/frame).
const chromeCache = new Map();

function chrome(ctx, url, color, t) {
  const scale = ctx.__scale || 1;
  const key = url + '@' + scale;
  let cached = chromeCache.get(key);
  if (!cached) {
    cached = document.createElement('canvas');
    cached.width = REEL_W * scale;
    cached.height = REEL_H * scale;
    const c = cached.getContext('2d');
    c.scale(scale, scale);
    drawChrome(c, url);
    chromeCache.set(key, cached);
  }
  ctx.drawImage(cached, 0, 0, REEL_W, REEL_H);
  // live indicator
  ctx.fillStyle = rgba(color, 0.5 + 0.5 * Math.sin(t * 4));
  ctx.beginPath();
  ctx.arc(REEL_W - 60, 20, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawChrome(ctx, url) {
  ctx.fillStyle = '#0A0B0F';
  ctx.fillRect(0, 0, REEL_W, REEL_H);
  // dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let x = 10; x < REEL_W; x += 20) for (let y = 50; y < REEL_H; y += 20) ctx.fillRect(x, y, 1, 1);
  ctx.fillStyle = '#101217';
  ctx.fillRect(0, 0, REEL_W, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 40, REEL_W, 1);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
    ctx.fillStyle = rgba(c, 0.75);
    ctx.beginPath();
    ctx.arc(22 + i * 18, 20, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  roundRect(ctx, 250, 10, 300, 20, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  ctx.fillStyle = 'rgba(236,234,228,0.6)';
  ctx.font = `400 11px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(url, 400, 24);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(236,234,228,0.55)';
  ctx.fillText('LIVE', REEL_W - 50, 24);
}

function typewriter(text, t, speed = 28) {
  const n = Math.floor(t * speed);
  return text.slice(0, Math.max(0, Math.min(text.length, n)));
}

function wrapText(ctx, text, x, y, maxW, lh) {
  const words = text.split(' ');
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = w;
      y += lh;
    } else line = test;
  }
  ctx.fillText(line, x, y);
}

/* ------------------------------------------------------------------ */
/* CypherCorp — EDA dashboard + AutoML leaderboard + AI insight        */
/* ------------------------------------------------------------------ */
function drawCypher(ctx, t, c) {
  chrome(ctx, 'cyphercorp.in/studio — sales_2026.csv', c, t);

  // histogram
  panel(ctx, 24, 56, 360, 230, 'Distribution · revenue', c);
  const bars = 20;
  for (let i = 0; i < bars; i++) {
    const base = Math.exp(-((i - 8) ** 2) / 22);
    const h = (0.15 + base * 0.85 + 0.08 * Math.sin(t * 2 + i * 0.8)) * 160;
    const x = 44 + i * 16.5;
    const g = ctx.createLinearGradient(0, 270 - h, 0, 270);
    g.addColorStop(0, rgba(c, 0.95));
    g.addColorStop(1, rgba(c, 0.15));
    ctx.fillStyle = g;
    ctx.fillRect(x, 270 - h, 12, h);
  }
  // outlier marker
  ctx.strokeStyle = 'rgba(255,107,107,0.8)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(352, 90);
  ctx.lineTo(352, 270);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,107,107,0.9)';
  ctx.font = `500 10px ${MONO}`;
  ctx.fillText('3 outliers', 300, 86);

  // scatter + regression
  panel(ctx, 400, 56, 376, 230, 'Correlation · ad spend × revenue', c);
  for (let i = 0; i < 70; i++) {
    const px = rand(i) * 320;
    const py = px * 0.5 + (rand(i + 99) - 0.5) * 90;
    const x = 425 + px;
    const y = 262 - py - 10 + Math.sin(t * 1.5 + i) * 2;
    ctx.fillStyle = rgba('#ECEAE4', 0.25 + rand(i + 7) * 0.5);
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  const lp = (t * 0.35) % 1;
  ctx.strokeStyle = c;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(425, 252);
  ctx.lineTo(425 + 320 * Math.min(1, lp * 1.6), 252 - 160 * Math.min(1, lp * 1.6));
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = c;
  ctx.font = `600 13px ${MONO}`;
  ctx.fillText('r = 0.82', 690, 96);

  // AutoML leaderboard
  panel(ctx, 24, 300, 360, 176, 'AutoML · leaderboard', c);
  const models = [
    ['RandomForest', 0.94],
    ['GradientBoosting', 0.92],
    ['Ridge', 0.86],
    ['Lasso', 0.81],
  ];
  const cyc = (t % 6) / 6;
  models.forEach(([name, score], i) => {
    const y = 340 + i * 32;
    const p = Math.min(1, Math.max(0, cyc * 2.2 - i * 0.18));
    ctx.fillStyle = 'rgba(236,234,228,0.75)';
    ctx.font = `400 12px ${MONO}`;
    ctx.fillText(name, 40, y);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(190, y - 9, 140, 8);
    ctx.fillStyle = i === 0 ? c : 'rgba(236,234,228,0.4)';
    ctx.fillRect(190, y - 9, 140 * score * p, 8);
    ctx.fillText((score * p).toFixed(2), 338, y);
    if (i === 0 && p >= 1) {
      ctx.fillStyle = c;
      ctx.font = `600 10px ${MONO}`;
      ctx.fillText('★ BEST', 108 + 40, y - 14 + 0);
    }
  });

  // AI insight typing
  panel(ctx, 400, 300, 376, 176, 'AI Data Scientist', c);
  const insights = [
    'Revenue rises ~0.5 units per unit of ad spend (r = 0.82). Three Q4 outliers inflate the mean — consider a median.',
    'Missing values: 4.1% in "region". Imputing by mode keeps the distribution stable. RandomForest is the best model (F1 0.94).',
  ];
  const k = Math.floor(t / 7) % insights.length;
  const local = t % 7;
  ctx.fillStyle = 'rgba(236,234,228,0.85)';
  ctx.font = `400 14px ${SANS}`;
  const txt = typewriter(insights[k], local, 30);
  wrapText(ctx, txt + (Math.floor(t * 2) % 2 ? '▍' : ''), 416, 352, 340, 22);
}

/* ------------------------------------------------------------------ */
/* Video Q&A — player, waveform, transcript search with timestamps    */
/* ------------------------------------------------------------------ */
function drawVideo(ctx, t, c) {
  chrome(ctx, 'learning-assistant — ask your lectures', c, t);

  // player
  roundRect(ctx, 24, 56, 470, 270, 10);
  const g = ctx.createLinearGradient(24, 56, 494, 326);
  g.addColorStop(0, '#16131f');
  g.addColorStop(1, '#0d0f16');
  ctx.fillStyle = g;
  ctx.fill();
  // "slide" content in the video
  ctx.fillStyle = 'rgba(236,234,228,0.85)';
  ctx.font = `600 20px ${SANS}`;
  ctx.fillText('Backpropagation', 52, 104);
  ctx.fillStyle = 'rgba(236,234,228,0.25)';
  for (let i = 0; i < 4; i++) ctx.fillRect(52, 126 + i * 18, 160 + rand(i) * 120, 6);
  // neural net diagram
  const layers = [3, 4, 2];
  const pts = layers.map((n, li) =>
    Array.from({ length: n }, (_, j) => [330 + li * 60, 110 + (j - (n - 1) / 2) * 38 + 60]),
  );
  for (let li = 0; li < 2; li++)
    for (const a of pts[li])
      for (const b of pts[li + 1]) {
        const pulse = (Math.sin(t * 3 - li * 1.5 + a[1] * 0.05) + 1) / 2;
        ctx.strokeStyle = rgba(c, 0.1 + pulse * 0.45);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
  for (const layer of pts)
    for (const [x, y] of layer) {
      ctx.fillStyle = '#0d0f16';
      ctx.strokeStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  // progress bar
  const prog = (t * 0.06) % 1;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(44, 300, 430, 3);
  ctx.fillStyle = c;
  ctx.fillRect(44, 300, 430 * prog, 3);
  ctx.beginPath();
  ctx.arc(44 + 430 * prog, 301.5, 5, 0, Math.PI * 2);
  ctx.fill();
  const secs = Math.floor(prog * 2722);
  ctx.fillStyle = 'rgba(236,234,228,0.6)';
  ctx.font = `400 11px ${MONO}`;
  ctx.fillText(`${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')} / 45:22`, 44, 290);

  // waveform
  panel(ctx, 24, 340, 470, 136, 'Whisper · transcribing', c);
  for (let i = 0; i < 74; i++) {
    const a = Math.abs(Math.sin(i * 0.45 + t * 5) * Math.sin(i * 0.13 + t * 1.3)) * 70 + 4;
    ctx.fillStyle = i / 74 < prog ? c : 'rgba(236,234,228,0.25)';
    ctx.fillRect(40 + i * 6, 420 - a / 2, 3, a);
  }

  // query + transcript
  panel(ctx, 508, 56, 268, 420, '', c);
  roundRect(ctx, 520, 68, 244, 36, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fill();
  ctx.strokeStyle = rgba(c, 0.6);
  ctx.stroke();
  const qs = ['how does backprop work?', 'what is a learning rate?', 'explain the chain rule'];
  const qi = Math.floor(t / 6) % qs.length;
  const ql = t % 6;
  ctx.fillStyle = 'rgba(236,234,228,0.9)';
  ctx.font = `400 12px ${MONO}`;
  ctx.fillText('› ' + typewriter(qs[qi], ql, 18), 532, 90);

  const lines = [
    ['03:12', 'weights start randomly initialised'],
    ['07:48', 'loss measures how wrong we are'],
    ['14:22', 'gradients flow backwards layer by layer'],
    ['19:05', 'the chain rule links each derivative'],
    ['23:40', 'learning rate scales every step'],
    ['28:16', 'too high and training diverges'],
    ['33:02', 'batches trade noise for speed'],
    ['38:57', 'validation loss reveals overfitting'],
  ];
  const off = (t * 14) % (lines.length * 46);
  ctx.save();
  ctx.beginPath();
  ctx.rect(508, 116, 268, 300);
  ctx.clip();
  for (let r = 0; r < lines.length * 2; r++) {
    const [ts, text] = lines[r % lines.length];
    const y = 140 + r * 46 - off;
    if (y < 100 || y > 440) continue;
    const hit = (r % lines.length) === (qi * 2 + 2) % lines.length && ql > 2;
    if (hit) {
      ctx.fillStyle = rgba(c, 0.14);
      ctx.fillRect(516, y - 16, 252, 40);
    }
    ctx.fillStyle = hit ? c : 'rgba(236,234,228,0.4)';
    ctx.font = `500 11px ${MONO}`;
    ctx.fillText('▶ ' + ts, 526, y);
    ctx.fillStyle = hit ? 'rgba(236,234,228,0.95)' : 'rgba(236,234,228,0.55)';
    ctx.font = `400 12px ${SANS}`;
    ctx.fillText(text, 526, y + 17);
  }
  ctx.restore();
  // similarity chip
  roundRect(ctx, 520, 430, 244, 34, 8);
  ctx.fillStyle = rgba(c, 0.16);
  ctx.fill();
  ctx.fillStyle = c;
  ctx.font = `600 12px ${MONO}`;
  ctx.fillText(`jump to 14:22 · sim 0.9${Math.floor(t * 3) % 10}`, 534, 452);
}

/* ------------------------------------------------------------------ */
/* Drawzzl — players sketching live + scoreboard + guesses            */
/* ------------------------------------------------------------------ */
const DRAW_PLAYERS = [
  { name: 'saket', color: '#FF6B9E', f: (s) => [Math.sin(s * 3) * 0.8, Math.sin(s * 2) * 0.7] },
  { name: 'pranav', color: '#5CF2C8', f: (s) => [Math.cos(s) * s * 0.11, Math.sin(s) * s * 0.11] },
  { name: 'vivek', color: '#FFB547', f: (s) => [(s / Math.PI - 1) * 0.9, Math.sin(s * 4) * 0.25 + 0.55] },
];

function drawDrawzzl(ctx, t, c) {
  chrome(ctx, 'drawzzl — room #A7F2 · round 3/8', c, t);
  roundRect(ctx, 24, 56, 540, 420, 10);
  ctx.fillStyle = '#0f1116';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.stroke();

  // word hint
  ctx.fillStyle = 'rgba(236,234,228,0.85)';
  ctx.font = `600 18px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('_ _ _ _ _ _ _', 294, 92);
  ctx.textAlign = 'left';

  const cycle = 9;
  const p = (t % cycle) / cycle;
  const fade = p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1;
  const cx = 294, cy = 290, sc = 180;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  DRAW_PLAYERS.forEach((pl, k) => {
    const end = Math.min(1, p * 1.35) * Math.PI * 2;
    ctx.strokeStyle = rgba(pl.color, fade);
    ctx.lineWidth = 5 - k;
    ctx.beginPath();
    let tip = null;
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const s = (i / steps) * end;
      const [x, y] = pl.f(s);
      const X = cx + x * sc + (k - 1) * 30, Y = cy + y * sc * 0.75;
      if (i === 0) ctx.moveTo(X, Y);
      else ctx.lineTo(X, Y);
      tip = [X, Y];
    }
    ctx.stroke();
    if (tip && fade > 0.2) {
      ctx.fillStyle = pl.color;
      ctx.beginPath();
      ctx.moveTo(tip[0], tip[1]);
      ctx.lineTo(tip[0] + 4, tip[1] + 14);
      ctx.lineTo(tip[0] + 12, tip[1] + 10);
      ctx.closePath();
      ctx.fill();
      roundRect(ctx, tip[0] + 12, tip[1] + 12, ctx.measureText(pl.name).width + 16, 18, 5);
      ctx.fill();
      ctx.fillStyle = '#0A0B0F';
      ctx.font = `600 11px ${MONO}`;
      ctx.fillText(pl.name, tip[0] + 20, tip[1] + 25);
    }
  });
  ctx.lineCap = 'butt';

  // timer ring
  const tl = 1 - p;
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(700, 104, 28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = c;
  ctx.beginPath();
  ctx.arc(700, 104, 28, -Math.PI / 2, -Math.PI / 2 + tl * Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = 'rgba(236,234,228,0.9)';
  ctx.font = `600 16px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText(String(Math.ceil(tl * 80)), 700, 110);
  ctx.textAlign = 'left';

  // scoreboard
  panel(ctx, 580, 150, 196, 160, 'Players · 15 online', c);
  const scores = [
    ['pranav', 1840],
    ['saket', 1720],
    ['vivek', 1505],
    ['you', 1210],
  ];
  scores.forEach(([n, s], i) => {
    const y = 196 + i * 28;
    ctx.fillStyle = i === 0 ? c : 'rgba(236,234,228,0.7)';
    ctx.font = `500 12px ${MONO}`;
    ctx.fillText(`${i + 1}. ${n}`, 596, y);
    ctx.textAlign = 'right';
    ctx.fillText(String(s + Math.floor(p * (4 - i) * 60)), 760, y);
    ctx.textAlign = 'left';
  });

  // chat
  panel(ctx, 580, 322, 196, 154, 'Guesses', c);
  const chat = [
    ['vivek', 'a snake?'],
    ['you', 'rollercoaster'],
    ['saket', 'butterfly!'],
  ];
  const shown = Math.min(chat.length, Math.floor(p * 6));
  for (let i = 0; i < shown; i++) {
    ctx.fillStyle = 'rgba(236,234,228,0.45)';
    ctx.font = `500 11px ${MONO}`;
    ctx.fillText(chat[i][0], 596, 366 + i * 22);
    ctx.fillStyle = 'rgba(236,234,228,0.85)';
    ctx.fillText(chat[i][1], 650, 366 + i * 22);
  }
  if (p > 0.6) {
    roundRect(ctx, 590, 434, 176, 28, 6);
    ctx.fillStyle = rgba('#5CF2C8', 0.16);
    ctx.fill();
    ctx.fillStyle = '#5CF2C8';
    ctx.font = `600 11px ${MONO}`;
    ctx.fillText('✓ pranav guessed it!', 602, 452);
  }
}

/* ------------------------------------------------------------------ */
/* DrawFive — coin toss + BO3 map veto                                */
/* ------------------------------------------------------------------ */
const MAPS = ['CITADEL', 'HARBOR', 'DUNES', 'VAULT', 'SUMMIT', 'REACTOR', 'FOUNDRY'];
const VETO = [
  [0, 'BAN', 'A'],
  [5, 'BAN', 'B'],
  [2, 'PICK', 'A'],
  [4, 'PICK', 'B'],
  [1, 'BAN', 'A'],
  [6, 'BAN', 'B'],
  [3, 'DECIDER', ''],
];

function drawDrawFive(ctx, t, c) {
  chrome(ctx, 'drawfive.in/veto — Grand Final · BO3', c, t);
  const cycle = 11;
  const lt = t % cycle;

  // teams header
  ctx.font = `700 22px ${SANS}`;
  ctx.fillStyle = 'rgba(236,234,228,0.95)';
  ctx.fillText('TEAM NOVA', 40, 96);
  ctx.textAlign = 'right';
  ctx.fillText('TEAM ECLIPSE', 760, 96);
  ctx.textAlign = 'left';
  ctx.font = `500 11px ${MONO}`;
  ctx.fillStyle = 'rgba(236,234,228,0.45)';
  ctx.fillText('SEED #1 · A', 40, 116);
  ctx.textAlign = 'right';
  ctx.fillText('SEED #4 · B', 760, 116);
  ctx.textAlign = 'left';

  // coin toss
  const spin = Math.min(lt / 1.6, 1);
  const sx = spin < 1 ? Math.cos(lt * 14) : 1;
  ctx.save();
  ctx.translate(400, 96);
  ctx.scale(Math.abs(sx) * 1 + 0.02, 1);
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0A0B0F';
  ctx.font = `800 18px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(sx > 0 ? 'A' : 'B', 0, 7);
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.font = `500 11px ${MONO}`;
  ctx.fillStyle = spin >= 1 ? c : 'rgba(236,234,228,0.45)';
  ctx.fillText(spin >= 1 ? 'NOVA WINS THE TOSS' : 'COIN TOSS…', 400, 138);
  ctx.textAlign = 'left';

  // map cards
  const step = Math.floor(Math.max(0, lt - 1.8) / 1.1);
  const cw = 98, gap = 9, x0 = (REEL_W - (cw * 7 + gap * 6)) / 2, y0 = 160, ch = 210;
  MAPS.forEach((m, i) => {
    const x = x0 + i * (cw + gap);
    const vi = VETO.findIndex((v) => v[0] === i);
    const done = vi > -1 && vi < step;
    const active = vi === step;
    const v = VETO[vi];
    roundRect(ctx, x, y0, cw, ch, 8);
    const g = ctx.createLinearGradient(x, y0, x + cw, y0 + ch);
    const hue = (i * 47) % 360;
    g.addColorStop(0, `hsla(${hue},45%,28%,1)`);
    g.addColorStop(1, `hsla(${hue + 40},40%,10%,1)`);
    ctx.fillStyle = g;
    ctx.fill();
    // geometric emblem
    ctx.save();
    ctx.translate(x + cw / 2, y0 + 80);
    ctx.rotate(t * 0.3 + i);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const sides = 3 + (i % 4);
    for (let s = 0; s <= sides; s++) {
      const a = (s / sides) * Math.PI * 2;
      ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 26);
    }
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(236,234,228,0.95)';
    ctx.font = `700 12px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(m, x + cw / 2, y0 + ch - 22);
    ctx.textAlign = 'left';

    if (done && v[1] === 'BAN') {
      ctx.fillStyle = 'rgba(10,11,15,0.72)';
      roundRect(ctx, x, y0, cw, ch, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,90,90,0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 26, y0 + 56);
      ctx.lineTo(x + cw - 26, y0 + 104);
      ctx.moveTo(x + cw - 26, y0 + 56);
      ctx.lineTo(x + 26, y0 + 104);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    if ((done && v[1] !== 'BAN') || active) {
      ctx.strokeStyle = active ? rgba(c, 0.5 + 0.5 * Math.sin(t * 8)) : c;
      ctx.lineWidth = 2;
      roundRect(ctx, x - 1, y0 - 1, cw + 2, ch + 2, 9);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
    if (done) {
      const label = v[1] === 'DECIDER' ? 'DECIDER' : `${v[1]} · ${v[2] === 'A' ? 'NOVA' : 'ECL'}`;
      roundRect(ctx, x + 8, y0 + 10, cw - 16, 20, 5);
      ctx.fillStyle = v[1] === 'BAN' ? 'rgba(255,90,90,0.85)' : c;
      ctx.fill();
      ctx.fillStyle = '#0A0B0F';
      ctx.font = `700 9px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText(label, x + cw / 2, y0 + 24);
      ctx.textAlign = 'left';
    }
  });

  // turn indicator
  const cur = VETO[Math.min(step, VETO.length - 1)];
  ctx.font = `500 12px ${MONO}`;
  ctx.fillStyle = 'rgba(236,234,228,0.6)';
  ctx.textAlign = 'center';
  const msg =
    lt < 1.8
      ? 'Waiting for coin toss'
      : step >= VETO.length
        ? 'Veto complete · Map 1: DUNES · Map 2: SUMMIT · Decider: VAULT'
        : `${cur[2] === 'A' ? 'NOVA' : cur[2] === 'B' ? 'ECLIPSE' : 'SYSTEM'} to ${cur[1].toLowerCase()}…`;
  ctx.fillText(msg, 400, 410);
  ctx.textAlign = 'left';
  // step pips
  for (let i = 0; i < VETO.length; i++) {
    ctx.fillStyle = i < step ? c : 'rgba(255,255,255,0.12)';
    ctx.fillRect(400 - 7 * 24 / 2 + i * 24, 430, 18, 4);
  }
  ctx.fillStyle = 'rgba(236,234,228,0.35)';
  ctx.font = `400 10px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('ADMIN · LIVE AT AAROHAN', 400, 462);
  ctx.textAlign = 'left';
}

const DRAWERS = {
  cyphercorp: drawCypher,
  'video-qa': drawVideo,
  drawzzl: drawDrawzzl,
  drawfive: drawDrawFive,
};

export function createReel(slug, color, { scale = 1, canvas = document.createElement('canvas') } = {}) {
  canvas.width = REEL_W * scale;
  canvas.height = REEL_H * scale;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.__scale = scale;
  const fn = DRAWERS[slug];
  const offset = Math.random() * 20;
  return {
    canvas,
    draw(t) {
      ctx.save();
      ctx.scale(scale, scale);
      fn(ctx, t + offset, color);
      ctx.restore();
    },
  };
}
