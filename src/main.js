import './style.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from './data.js';
import { World, Z_START, Z_END, PORTAL_Z, FOCUS_OFFSET } from './world.js';
import { shell, caseStudy } from './templates.js';
import { createReel } from './reels.js';

gsap.registerPlugin(ScrollTrigger);

const ACCENT = '#D4FF3A';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.querySelector('#app').innerHTML = shell();
document.documentElement.classList.toggle('fine', finePointer);

/* --------------------------------------------------------------- scroll */

// lerp-based smoothing is frame-rate aware and responds instantly to input;
// the camera then follows it tightly instead of smoothing a second time.
const lenis = new Lenis({ lerp: reducedMotion ? 1 : 0.11, smoothWheel: !reducedMotion, wheelMultiplier: 1 });
lenis.stop();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.lagSmoothing(0);

const tunnel = $('#tunnel');
let tunnelTop = 0;
let tunnelLen = 1;
function measure() {
  tunnelTop = tunnel.offsetTop;
  tunnelLen = Math.max(1, tunnel.offsetHeight - window.innerHeight);
}
const zFromScroll = (y) => Z_START + (Z_END - Z_START) * clamp((y - tunnelTop) / tunnelLen);
const scrollFromZ = (z) => tunnelTop + ((z - Z_START) / (Z_END - Z_START)) * tunnelLen;

/* ---------------------------------------------------------------- world */

const world = new World($('#webgl'), projects, { accent: ACCENT, reducedMotion });
measure();
lenis.on('scroll', ({ scroll }) => (world.targetZ = zFromScroll(scroll)));

window.addEventListener('resize', () => {
  world.resize();
  measure();
  world.targetZ = zFromScroll(lenis.scroll);
  ScrollTrigger.refresh();
});

window.addEventListener('pointermove', (e) => {
  world.setPointer(e.clientX, e.clientY);
  cursor.x = e.clientX;
  cursor.y = e.clientY;
});

/* ------------------------------------------------------------- overlays */

const bands = $$('[data-band]').map((el) => ({ el, b: el.dataset.band.split(',').map(Number), last: -1 }));
const ease = (t) => t * t * (3 - 2 * t);

function updateOverlays(d) {
  for (const o of bands) {
    const [a, b, c, e] = o.b;
    let op = d <= a || d >= e ? 0 : d < b ? (d - a) / (b - a) : d <= c ? 1 : 1 - (d - c) / (e - c);
    op = ease(clamp(op));
    if (Math.abs(op - o.last) < 0.002) continue;
    o.last = op;
    const dir = d < b ? 1 : -1;
    const s = o.el.style;
    // opacity + transform only: both run on the compositor (no repaint, unlike filter: blur)
    s.opacity = op;
    s.transform = `translate3d(0, ${(1 - op) * dir * 70}px, 0) scale(${0.97 + 0.03 * op})`;
    s.visibility = op <= 0.002 ? 'hidden' : 'visible';
    const active = op > 0.6;
    if (active !== o.el.classList.contains('active')) {
      o.el.classList.toggle('active', active);
      if (active) o.el.dispatchEvent(new CustomEvent('band:enter'));
    }
  }
}

// about stats count up the first time the chapter appears
$('#about-ov').addEventListener('band:enter', () => countUp($$('#about-ov [data-count]')), { once: true });

function countUp(els) {
  els.forEach((el) => {
    const to = parseFloat(el.dataset.count);
    const dec = +el.dataset.decimals || 0;
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const o = { v: 0 };
    gsap.to(o, {
      v: to,
      duration: reducedMotion ? 0 : 1.6,
      ease: 'power3.out',
      onUpdate: () => (el.textContent = pre + o.v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf),
    });
  });
}

/* ------------------------------------------------------------------ HUD */

const hud = $('.hud');
const hudZ = $('.hud-z');
const hudFill = $('.hud-fill');
$$('.hud-tick').forEach((el, i) => {
  el.style.top = `${((PORTAL_Z[i] + FOCUS_OFFSET - Z_START) / (Z_END - Z_START)) * 100}%`;
});

const labels = $$('.portal-label').map((el) => ({ el, shown: false, hot: false }));
const lp = {};
const canvasEl = $('#webgl');
let lastZText = '';
let lastFill = -1;
let lastPast = null;
let lastCovered = null;

function updateHUD() {
  const z = world.camZ;
  const p = clamp((z - Z_START) / (Z_END - Z_START));
  // only touch the DOM when a value actually changes
  const zText = `Z ${z >= 0 ? '+' : '−'}${Math.abs(z).toFixed(1).padStart(5, '0')}`;
  if (zText !== lastZText) hudZ.textContent = lastZText = zText;
  if (Math.abs(p - lastFill) > 0.0005) hudFill.style.transform = `scaleY(${(lastFill = p)})`;

  const past = lenis.scroll > tunnelTop + tunnelLen + window.innerHeight * 0.3;
  if (past !== lastPast) {
    lastPast = past;
    document.body.classList.toggle('past-tunnel', past);
  }
  hud.classList.toggle('hidden', past || caseIndex >= 0);

  // once the opaque sections fully cover the canvas, stop rendering WebGL entirely
  const covered = lenis.scroll > tunnelTop + tunnelLen + window.innerHeight * 1.7;
  if (covered !== lastCovered) {
    lastCovered = covered;
    world.hidden = covered;
    canvasEl.style.visibility = covered ? 'hidden' : 'visible';
    if (!covered) world.resetAdapt();
  }
  if (covered) return;

  labels.forEach((l, i) => {
    world.labelPosition(i, lp);
    const fade = clamp((lp.dist - 5) / 4) * clamp((30 - lp.dist) / 6);
    const show = lp.visible && world.mode === 'scroll' && fade > 0.01;
    if (show) {
      l.el.style.opacity = fade;
      l.el.style.transform = `translate3d(${lp.x}px, ${lp.y}px, 0)`;
    }
    if (show !== l.shown) {
      l.shown = show;
      if (!show) l.el.style.opacity = 0;
    }
    l.el.style.pointerEvents = show && fade > 0.5 ? 'auto' : 'none';
    const hot = world.hovered === i;
    if (hot !== l.hot) l.el.classList.toggle('hot', (l.hot = hot));
  });
}

document.addEventListener('visibilitychange', () => world.resetAdapt());

/* --------------------------------------------------------------- cursor */

const cursor = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2, el: $('.cursor') };
const cDot = $('.cursor-dot');
const cRing = $('.cursor-ring');

function updateCursor(dt) {
  if (!finePointer) return;
  const k = 1 - Math.exp(-dt * 14);
  cursor.rx += (cursor.x - cursor.rx) * k;
  cursor.ry += (cursor.y - cursor.ry) * k;
  cDot.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
  cRing.style.transform = `translate3d(${cursor.rx}px, ${cursor.ry}px, 0)`;
  cursor.el.classList.toggle('portal', world.hovered >= 0 && caseIndex < 0);
}

document.addEventListener('pointerover', (e) => {
  cursor.el.classList.toggle('link', !!e.target.closest('a, button'));
});

// magnetic hover for buttons & links
function bindMagnetic(root = document) {
  if (!finePointer || reducedMotion) return;
  $$('[data-magnetic]', root).forEach((el) => {
    if (el._mag) return;
    el._mag = true;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
    });
  });
}
bindMagnetic();

// subtle 3D tilt on the portrait
$$('[data-tilt]').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: x * 14, rotateX: -y * 14, duration: 0.6, ease: 'power3.out' });
    el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
    el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
  });
  el.addEventListener('pointerleave', () => gsap.to(el, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, 0.4)' }));
});

/* ------------------------------------------------------------ case view */

const caseEl = $('.case');
const flash = $('.flash');
let caseIndex = -1;
let busy = false;
let caseReel = null;
let caseObserver = null;

function setFlash(color) {
  flash.style.setProperty('--c', color);
}

function openCase(i, { push = true } = {}) {
  if (busy || caseIndex >= 0) return;
  busy = true;
  lenis.stop();
  document.body.classList.add('flying');
  const p = projects[i];
  setFlash(p.color);
  if (push) history.pushState({ case: p.slug }, '', `#/work/${p.slug}`);

  const tl = world.flyInto(i);
  tl.to(flash, { opacity: 1, duration: 0.35, ease: 'power2.in' }, 'push+=0.35')
    .add(() => showCase(i), 'push+=0.75')
    .to(flash, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 'push+=0.8')
    .add(() => {
      busy = false;
      document.body.classList.remove('flying');
    });
}

function showCase(i) {
  caseIndex = i;
  world.skipRender = true;
  caseEl.innerHTML = caseStudy(projects[i], i);
  caseEl.scrollTop = 0;
  caseEl.classList.add('open');
  caseEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('case-open');
  const reelCanvas = $('.case-reel canvas', caseEl);
  caseReel = reelCanvas ? createReel(projects[i].slug, projects[i].color, { scale: 2, canvas: reelCanvas }) : null;
  bindMagnetic(caseEl);

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from($$('.case-title .ch > span', caseEl), { yPercent: 115, rotate: 6, duration: 1.3, stagger: 0.035 }, 0.05)
    .from($$('.case-hero .kicker, .case-sub, .case-meta > div, .case-bar > *', caseEl), { y: 24, opacity: 0, duration: 1, stagger: 0.05 }, 0.2)
    .from($('.case-reel', caseEl), { clipPath: 'inset(18% 12% 18% 12% round 24px)', scale: 1.08, duration: 1.6 }, 0.25);

  caseObserver?.disconnect();
  caseObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        const counter = en.target.querySelector('[data-count]');
        if (counter) countUp([counter]);
        caseObserver.unobserve(en.target);
      }),
    { root: caseEl, threshold: 0.2 },
  );
  $$('[data-fade]', caseEl).forEach((el) => caseObserver.observe(el));
  setTimeout(() => $('.case-back', caseEl)?.focus({ preventScroll: true }), 300);
}

function hideCase() {
  caseEl.classList.remove('open');
  caseEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('case-open');
  caseObserver?.disconnect();
  caseReel = null;
  world.skipRender = false;
}

function closeCase({ push = true } = {}) {
  if (busy || caseIndex < 0) return;
  busy = true;
  const i = caseIndex;
  setFlash(projects[i].color);
  if (push) history.pushState({}, '', location.pathname + location.search);
  gsap
    .timeline()
    .to(flash, { opacity: 1, duration: 0.4, ease: 'power2.in' })
    .add(() => {
      hideCase();
      caseIndex = -1;
      const z = world.portals[i].focusZ;
      lenis.scrollTo(scrollFromZ(z), { immediate: true, force: true });
      world.targetZ = z;
      world.flyOut(i);
    })
    .to(flash, { opacity: 0, duration: 0.9, ease: 'power2.out' })
    .add(() => {
      lenis.start();
      busy = false;
    }, '-=0.3');
}

function nextCase(n) {
  if (busy) return;
  busy = true;
  setFlash(projects[n].color);
  history.replaceState({ case: projects[n].slug }, '', `#/work/${projects[n].slug}`);
  gsap
    .timeline()
    .to(caseEl, { opacity: 0, duration: 0.35, ease: 'power2.in' })
    .to(flash, { opacity: 1, duration: 0.35, ease: 'power2.in' }, 0)
    .add(() => {
      world.parkInside(n);
      showCase(n);
      gsap.set(caseEl, { opacity: 1 });
    })
    .to(flash, { opacity: 0, duration: 0.8, ease: 'power2.out' })
    .add(() => (busy = false), '-=0.4');
}

caseEl.addEventListener('click', (e) => {
  if (e.target.closest('[data-close]')) closeCase();
  const nx = e.target.closest('[data-next]');
  if (nx) nextCase(+nx.dataset.next);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && caseIndex >= 0) closeCase();
});

function route({ push = false } = {}) {
  const m = location.hash.match(/^#\/work\/([\w-]+)/);
  const i = m ? projects.findIndex((p) => p.slug === m[1]) : -1;
  if (i >= 0 && caseIndex < 0) openCase(i, { push });
  else if (i < 0 && caseIndex >= 0) closeCase({ push });
  else if (i >= 0 && caseIndex >= 0 && i !== caseIndex) nextCase(i);
}
window.addEventListener('popstate', () => route());

/* --------------------------------------------------------------- clicks */

document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  if (open) {
    e.preventDefault();
    openCase(+open.dataset.open);
    return;
  }
  const go = e.target.closest('[data-goto]');
  if (go) {
    e.preventDefault();
    if (caseIndex >= 0) return;
    const id = go.dataset.goto;
    const target =
      id === 'top' ? 0
      : id === 'about' ? scrollFromZ(Z_START - 25)
      : id === 'work' ? scrollFromZ(PORTAL_Z[0] + FOCUS_OFFSET)
      : $(`#${id}`);
    lenis.scrollTo(target, { duration: reducedMotion ? 0 : 2.2 });
    return;
  }
  const copy = e.target.closest('[data-copy]');
  if (copy && navigator.clipboard) {
    navigator.clipboard.writeText(copy.dataset.copy).then(() => {
      const hint = $('.mail-hint', copy);
      hint.textContent = 'Copied to clipboard ✓';
      setTimeout(() => (hint.textContent = 'Click to copy'), 2200);
    });
  }
  // clicking a portal in the 3D scene
  if (caseIndex < 0 && !e.target.closest('a, button, .case')) {
    world.setPointer(e.clientX, e.clientY);
    const hit = world.pick();
    if (hit >= 0) openCase(hit);
  }
});

/* -------------------------------------------------------- after-tunnel */

function setupSections() {
  $$('[data-reveal]').forEach((el) => {
    gsap.from($$('.w > span', el), {
      yPercent: 110,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
  ScrollTrigger.batch('.after [data-fade]', {
    start: 'top 90%',
    onEnter: (els) => els.forEach((el, k) => setTimeout(() => el.classList.add('in'), k * 70)),
  });
  // marquees skew with scroll velocity
  const skews = $$('.marquee-track').map((t) => gsap.quickTo(t, 'skewX', { duration: 0.4, ease: 'power3.out' }));
  ScrollTrigger.create({
    trigger: '#stack',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (self) => {
      const v = clamp(self.getVelocity() / 2500, -1, 1);
      skews.forEach((s) => s(-v * 8));
    },
    onLeave: () => skews.forEach((s) => s(0)),
    onLeaveBack: () => skews.forEach((s) => s(0)),
  });
}

/* ---------------------------------------------------------------- clock */

const clocks = $$('.clock');
function tickClock() {
  const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date());
  clocks.forEach((c) => (c.textContent = `${t} IST`));
}
tickClock();
setInterval(tickClock, 15000);

/* ----------------------------------------------------------------- loop */

gsap.ticker.add((time, deltaMs) => {
  const dt = Math.min(deltaMs / 1000, 0.05);
  lenis.raf(time * 1000);
  world.tick(dt);
  updateOverlays(Z_START - world.camZ);
  updateHUD();
  updateCursor(dt);
  if (caseReel) caseReel.draw(time);
});

/* --------------------------------------------------------------- loader */

async function intro() {
  const num = $('.loader-num');
  const bar = $('.loader-bar span');
  const counter = { v: 0 };
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const img = new Promise((res) => {
    const im = new Image();
    im.onload = im.onerror = res;
    im.src = $('.about-photo img').src;
  });

  await gsap.to(counter, {
    v: 100,
    duration: reducedMotion ? 0.2 : 1.9,
    ease: 'power2.inOut',
    onUpdate: () => {
      num.textContent = Math.round(counter.v);
      bar.style.transform = `scaleX(${counter.v / 100})`;
    },
  });
  await Promise.all([fonts, img]);
  world.warmup(); // reels are drawn with web fonts, so warm up after they load

  setupSections();
  world.mode = 'scroll';
  const tl = gsap.timeline();
  tl.to('.loader-count, .loader-top, .loader-bottom, .loader-bar', { yPercent: -40, opacity: 0, duration: 0.6, ease: 'power3.in', stagger: 0.04 })
    .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=0.2')
    .set('.loader', { display: 'none' })
    .from('.hero-name .ch > span', { yPercent: 120, rotate: 8, duration: 1.4, ease: 'expo.out', stagger: 0.04 }, '-=0.7')
    .from('.hero-eyebrow, .nav > *', { y: -20, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }, '-=1.2')
    .from('.hero-lede .w > span', { yPercent: 110, duration: 1, ease: 'expo.out', stagger: 0.015 }, '-=1.1')
    .from('.hero-scroll', { opacity: 0, duration: 1 }, '-=0.6')
    .add(() => {
      lenis.start();
      route();
    }, '-=0.8');
}

intro();
