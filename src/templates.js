import { Z_START, PORTAL_Z, FOCUS_OFFSET } from './world.js';
import { profile, projects, experience, highlight, skills, education, certifications, writing } from './data.js';

const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ext = (url, label, cls = '') =>
  `<a class="${cls}" href="${url}" target="_blank" rel="noopener" data-magnetic>${esc(label)} <span class="arrow">↗</span></a>`;

// Split text into per-character spans for kinetic type
export const chars = (s) =>
  [...s].map((c) => `<span class="ch"><span>${c === ' ' ? '&nbsp;' : esc(c)}</span></span>`).join('');

// Split text into per-word spans for line reveals
export const words = (s) =>
  s
    .split(' ')
    .map((w) => `<span class="w"><span>${esc(w)}</span></span>`)
    .join(' ');

export function shell() {
  return `
  <div class="loader" aria-hidden="true">
    <div class="loader-top">
      <span>${esc(profile.first)} ${esc(profile.last)}</span>
      <span>Portfolio — ${new Date().getFullYear()}</span>
    </div>
    <div class="loader-count"><span class="loader-num">0</span><span class="loader-pct">%</span></div>
    <div class="loader-bar"><span></span></div>
    <div class="loader-bottom"><span>Initialising tunnel</span><span>${esc(profile.coords)}</span></div>
  </div>

  <div class="flash" aria-hidden="true"></div>

  <header class="nav">
    <a href="#top" class="brand" data-goto="top" data-magnetic aria-label="Back to top">
      <span class="brand-mark">SR</span>
      <span class="brand-name">${esc(profile.first)} ${esc(profile.last)}</span>
    </a>
    <nav class="nav-links" aria-label="Primary">
      <a href="#about" data-goto="about">About</a>
      <a href="#work" data-goto="work">Work</a>
      <a href="#experience" data-goto="experience">Experience</a>
      <a href="#contact" data-goto="contact">Contact</a>
      <a href="#resume" data-goto="resume">Résumé</a>
    </nav>
    <a class="status" href="mailto:${profile.email}" data-magnetic>
      <span class="status-dot"></span>${esc(profile.status)}
    </a>
  </header>

  <aside class="hud" aria-hidden="true">
    <div class="hud-depth"><span class="hud-label">Depth</span><span class="hud-z">Z +000.0</span></div>
    <div class="hud-track">
      <span class="hud-fill"></span>
      ${projects.map((p, i) => `<span class="hud-tick" style="--c:${p.color}" data-i="${i}"><em>${pad(i + 1)}</em></span>`).join('')}
    </div>
  </aside>

  <div class="overlays">
    <section class="ov ov-hero" data-band="-999,-999,3,14">
      <p class="hero-eyebrow"><span class="line"></span>${esc(profile.role)} · ${esc(profile.location)}</p>
      <h1 class="hero-name">
        <span class="hero-first">${chars(profile.first)}</span>
        <span class="hero-last">${chars(profile.last)}</span>
      </h1>
      <div class="hero-foot">
        <p class="hero-lede">${words(profile.headline)}</p>
        <div class="hero-scroll"><span class="hero-scroll-line"></span>Scroll to enter</div>
      </div>
    </section>

    <section class="ov ov-about" data-band="14,20,30,37" id="about-ov">
      <figure class="about-photo" data-tilt>
        <img src="${profile.photo}" alt="Portrait of ${esc(profile.first)} ${esc(profile.last)}" />
        <figcaption><span>${esc(profile.first)} ${esc(profile.last)}</span><span>MCA · MIT-WPU</span></figcaption>
      </figure>
      <div class="about-copy">
        <p class="kicker">( About )</p>
        <p class="about-quote">“${esc(profile.quote)}”</p>
        <p class="about-bio">${esc(profile.bio[0])} ${esc(profile.bio[1])}</p>
        <ul class="about-stats">
          ${profile.stats
            .map(
              (s) =>
                `<li><strong data-count="${s.value}" data-decimals="${s.decimals || 0}" data-suffix="${esc(s.suffix)}">0</strong><span>${esc(s.label)}</span></li>`,
            )
            .join('')}
        </ul>
      </div>
    </section>

    <section class="ov ov-work" data-band="37,41,45,50">
      <p class="kicker">( Selected work · ${pad(projects.length)} )</p>
      <h2 class="work-title">Things I’ve <em>built</em></h2>
      <p class="work-hint">Each portal is a live build. Click one to step inside.</p>
    </section>

    ${projects
      .map((p, i) => {
        const d = Z_START - (PORTAL_Z[i] + FOCUS_OFFSET); // distance travelled to this portal's focus point
        return `
    <section class="ov ov-chapter ${i % 2 === 0 ? 'left' : 'right'}" data-band="${d - 11},${d - 5},${d + 5},${d + 10}" style="--c:${p.color}">
      <p class="chapter-index"><span>${pad(i + 1)}</span> / ${pad(projects.length)}</p>
      <h3 class="chapter-title">${esc(p.title)}</h3>
      <p class="chapter-kicker">${esc(p.kicker)}</p>
      <p class="chapter-summary">${esc(p.summary)}</p>
      <ul class="chapter-tags">${p.stack.slice(0, 5).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      <button class="chapter-cta" data-open="${i}" data-magnetic>
        <span>Open case study</span><span class="cta-dot"></span>
      </button>
    </section>`;
      })
      .join('')}

    ${projects
      .map(
        (p, i) =>
          `<button class="portal-label" data-open="${i}" style="--c:${p.color}" tabindex="-1"><span>${pad(i + 1)}</span>${esc(p.title)}<em>${esc(p.year)}</em></button>`,
      )
      .join('')}
  </div>

  <div class="cursor" aria-hidden="true"><span class="cursor-dot"></span><span class="cursor-ring"><em>Enter</em></span></div>

  <main id="scroll">
    <div id="tunnel"></div>
    ${sections()}
  </main>

  <div class="case" data-lenis-prevent aria-hidden="true" role="dialog" aria-modal="true"></div>
  `;
}

function sections() {
  return `
  <div class="after">
    <section class="sec" id="experience">
      <header class="sec-head">
        <p class="kicker">( Experience · ${pad(experience.length)} )</p>
        <h2 class="sec-title" data-reveal>${words('Where design meets engineering')}</h2>
      </header>
      <ol class="xp">
        ${experience
          .map(
            (x, i) => `
          <li class="xp-row" data-fade>
            <span class="xp-i">${pad(i + 1)}</span>
            <span class="xp-role">${esc(x.role)}</span>
            <span class="xp-org">${esc(x.org)}${x.note ? `<em>${esc(x.note)}</em>` : ''}</span>
            <span class="xp-period">${esc(x.period)}</span>
          </li>`,
          )
          .join('')}
      </ol>
      <article class="spot" data-fade>
        <p class="kicker">( ${esc(highlight.label)} )</p>
        <h3>${esc(highlight.title)}</h3>
        <p>${esc(highlight.body)}</p>
        <div class="spot-games"><span>Valorant</span><span>BGMI</span><span>FIFA</span><span>LAN · Live-streamed</span></div>
      </article>
    </section>

    <section class="sec sec-stack" id="stack">
      <div class="marquee" aria-hidden="true">
        <div class="marquee-track">${marqueeRow(['Next.js', 'React', 'TypeScript', 'Python', 'FastAPI', 'Socket.IO', 'MongoDB', 'PostgreSQL', 'scikit-learn', 'Figma'])}</div>
      </div>
      <div class="marquee reverse" aria-hidden="true">
        <div class="marquee-track">${marqueeRow(['Design', 'Engineering', 'Data', 'AI', 'Motion', 'Branding', 'Real-time', 'AutoML'], true)}</div>
      </div>
      <div class="sec-inner">
        <header class="sec-head">
          <p class="kicker">( Toolkit )</p>
          <h2 class="sec-title" data-reveal>${words('A full-stack toolkit with a designer’s eye')}</h2>
        </header>
        <div class="skills">
          ${skills
            .map(
              (g) => `
            <div class="skill" data-fade>
              <h3>${esc(g.group)}</h3>
              <ul>${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
            </div>`,
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="sec" id="credentials">
      <header class="sec-head">
        <p class="kicker">( Education & credentials )</p>
        <h2 class="sec-title" data-reveal>${words('Always learning, always shipping')}</h2>
      </header>
      <div class="creds">
        <div class="edu">
          ${education
            .map(
              (e) => `
            <article class="edu-card" data-fade>
              <span class="edu-period">${esc(e.period)}</span>
              <h3>${esc(e.degree)}</h3>
              <p class="edu-school">${esc(e.school)}</p>
              <p class="edu-note">${esc(e.note)}</p>
            </article>`,
            )
            .join('')}
          <article class="edu-card award" data-fade>
            <span class="edu-period">Award · 2025</span>
            <h3>2nd Place — E.D.G.E. 2025</h3>
            <p class="edu-school">Web Application Division, MIT-WPU</p>
            <p class="edu-note">For DrawFive, with Pranav Nigade & Vivek Kumar</p>
          </article>
        </div>
        <ul class="certs">
          ${certifications
            .map(
              (c) => `
            <li data-fade>
              <span class="cert-name">${esc(c.name)}</span>
              ${c.issuer || c.date ? `<span class="cert-meta">${esc([c.issuer, c.date].filter(Boolean).join(' · '))}</span>` : ''}
            </li>`,
            )
            .join('')}
        </ul>
      </div>
    </section>

    <section class="sec" id="writing">
      <header class="sec-head">
        <p class="kicker">( Talks & notes )</p>
        <h2 class="sec-title" data-reveal>${words('Thinking out loud')}</h2>
      </header>
      <div class="notes">
        ${writing
          .map(
            (w, i) => `
          <a class="note" href="${profile.links[0].url}" target="_blank" rel="noopener" data-fade>
            <span class="note-type">${pad(i + 1)} — ${esc(w.type)}</span>
            <h3>${esc(w.title)}</h3>
            <span class="note-meta">${esc(w.meta)} <span class="arrow">↗</span></span>
          </a>`,
          )
          .join('')}
      </div>
    </section>

    <section class="sec contact" id="contact">
      <p class="kicker">( Contact )</p>
      <h2 class="contact-title" data-reveal>${words("Let's build something great.")}</h2>
      <p class="contact-sub">${esc(profile.statusDetail)}<br />Speaks ${esc(profile.languages.slice(0, -1).join(', '))} & ${esc(profile.languages.at(-1))}.</p>
      <div class="contact-actions">
        <a class="mail" href="mailto:${profile.email}" data-magnetic data-copy="${profile.email}">
          <span class="mail-label">${esc(profile.email)}</span>
          <span class="mail-hint">Click to copy</span>
        </a>
        <div class="contact-side">
          <div class="resumes" id="resume">
            ${profile.resumes
              .map(
                (r) =>
                  `<a class="resume" href="${r.file}" download data-magnetic><span class="resume-ico">↓</span><span><strong>${esc(r.label)}</strong><em>PDF</em></span></a>`,
              )
              .join('')}
          </div>
          <div class="socials">${profile.links.map((l) => ext(l.url, l.label, 'social')).join('')}</div>
        </div>
      </div>
      <footer class="foot">
        <span>© ${new Date().getFullYear()} ${esc(profile.first)} ${esc(profile.last)}</span>
        <span class="foot-clock">${esc(profile.location)} · <time class="clock">--:--</time></span>
        <a href="#top" data-goto="top">Back to the tunnel ↑</a>
      </footer>
    </section>
  </div>`;
}

function marqueeRow(items, outline = false) {
  const row = items.map((s) => `<span class="${outline ? 'outline' : ''}">${esc(s)}</span><i>✦</i>`).join('');
  return row + row; // duplicated for seamless loop
}

export function caseStudy(p, i) {
  const next = projects[(i + 1) % projects.length];
  return `
  <div class="case-inner" style="--c:${p.color}">
    <header class="case-bar">
      <button class="case-back" data-close data-magnetic><span>←</span> Back to tunnel</button>
      <span class="case-count">${pad(i + 1)} / ${pad(projects.length)}</span>
      ${p.links[0] ? ext(p.links[0].url, p.links[0].label, 'case-live') : '<span></span>'}
    </header>

    <section class="case-hero">
      <p class="kicker">( Case study · ${esc(p.year)} )</p>
      <h1 class="case-title">${chars(p.title)}</h1>
      <p class="case-sub">${esc(p.kicker)}</p>
      <dl class="case-meta">
        <div><dt>Timeline</dt><dd>${esc(p.timeline)}</dd></div>
        <div><dt>Team</dt><dd>${esc(p.team)}</dd></div>
        <div><dt>Stack</dt><dd>${esc(p.stack.slice(0, 3).join(' · '))}</dd></div>
        ${p.award ? `<div><dt>Award</dt><dd>${esc(p.award.split(' — ')[0])}</dd></div>` : ''}
      </dl>
    </section>

    <figure class="case-reel">
      ${p.video ? `<video src="${p.video}" autoplay muted loop playsinline></video>` : '<canvas width="800" height="500"></canvas>'}
      <figcaption><span>Live preview</span><span>${esc(p.title)} — ${esc(p.timeline)}</span></figcaption>
    </figure>

    <section class="case-metrics">
      ${p.metrics
        .map(
          (m) => `
        <div class="metric" data-fade>
          <strong data-count="${m.value}" data-decimals="${m.decimals || 0}" data-prefix="${esc(m.prefix || '')}" data-suffix="${esc(m.suffix || '')}">0</strong>
          <span>${esc(m.label)}</span>
        </div>`,
        )
        .join('')}
    </section>

    <section class="case-overview">
      <p class="kicker">( Overview )</p>
      <div>
        <p class="case-summary" data-fade>${esc(p.summary)}</p>
        <blockquote data-fade>“${esc(p.principle)}”</blockquote>
      </div>
    </section>

    <section class="case-features">
      <p class="kicker">( What it does )</p>
      <div class="features">
        ${p.features
          .map(
            (f, k) => `
          <article class="feature" data-fade>
            <span>${pad(k + 1)}</span>
            <h3>${esc(f.title)}</h3>
            <p>${esc(f.body)}</p>
          </article>`,
          )
          .join('')}
      </div>
      ${p.roadmap ? `<p class="roadmap" data-fade><span>Next up</span>${p.roadmap.map((r) => `<em>${esc(r)}</em>`).join('')}</p>` : ''}
    </section>

    <section class="case-stack">
      <p class="kicker">( Built with )</p>
      <ul>${p.stack.map((s) => `<li data-fade>${esc(s)}</li>`).join('')}</ul>
      ${p.links.length ? `<div class="case-links">${p.links.map((l, k) => ext(l.url, l.label, k ? 'btn ghost' : 'btn')).join('')}</div>` : ''}
    </section>

    <button class="case-next" data-next="${(i + 1) % projects.length}" style="--n:${next.color}">
      <span class="kicker">( Next project )</span>
      <span class="case-next-title">${esc(next.title)} <span class="arrow">→</span></span>
      <span class="case-next-sub">${esc(next.kicker)}</span>
    </button>
  </div>`;
}
