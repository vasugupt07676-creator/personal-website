// Replace no-js class
document.documentElement.classList.remove('no-js');

const root = document.documentElement;

// Year (safe if footer is missing on any page)
const yearEl = document.getElementById('year');
if(yearEl) yearEl.textContent = String(new Date().getFullYear());

// -----------------------------
// Theme handling
// Stored values: "light" | "dark" | "system"
// - "system" means: no data-theme attribute (CSS uses prefers-color-scheme)
// -----------------------------
const themeToggle = document.getElementById('theme-toggle');
const themeLabel = themeToggle?.querySelector('.label') || null;
const themeIcon = themeToggle?.querySelector('[aria-hidden="true"]') || themeToggle?.firstElementChild || null;

const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function getStoredTheme(){
  try { return localStorage.getItem('theme') || 'system'; } catch { return 'system'; }
}

function storeTheme(val){
  try { localStorage.setItem('theme', val); } catch { /* ignore */ }
}

function resolvedDark(){
  return systemQuery.matches;
}

function setThemeUI(isDark){
  if(!themeToggle) return;
  themeToggle.setAttribute('aria-pressed', String(isDark));
  if(themeLabel) themeLabel.textContent = isDark ? 'Light' : 'Dark';
  if(themeIcon) themeIcon.textContent = isDark ? '🌞' : '🌙';
  themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
}

function applyTheme(mode){
  // Mode: light | dark | system
  if(mode === 'dark'){
    root.setAttribute('data-theme','dark');
    setThemeUI(true);
    return;
  }
  if(mode === 'light'){
    root.setAttribute('data-theme','light');
    setThemeUI(false);
    return;
  }

  // system
  root.removeAttribute('data-theme');
  setThemeUI(resolvedDark());
}

const initialTheme = getStoredTheme();
applyTheme(initialTheme);

// If user is in system mode, keep UI in sync when OS theme changes
systemQuery.addEventListener('change', () => {
  if(getStoredTheme() === 'system') applyTheme('system');
});

themeToggle?.addEventListener('click', () => {
  const stored = getStoredTheme();
  const isDarkNow = (stored === 'dark') || (stored === 'system' && resolvedDark());
  const next = isDarkNow ? 'light' : 'dark';
  storeTheme(next);
  applyTheme(next);
});

// -----------------------------
// Mobile nav
// -----------------------------
const nav = document.getElementById('primary-nav');
const navToggle = document.getElementById('nav-toggle');
const mq = window.matchMedia('(max-width: 900px)');

function handleMQ(e){
  if(!nav || !navToggle) return;
  if(e.matches){
    navToggle.style.display = 'inline-flex';
    nav.setAttribute('data-open','false');
  } else {
    navToggle.style.display = 'none';
    nav.removeAttribute('data-open');
    navToggle.setAttribute('aria-expanded','false');
  }
}
handleMQ(mq);
mq.addEventListener('change', handleMQ);

navToggle?.addEventListener('click', () => {
  if(!nav) return;
  const open = nav.getAttribute('data-open') === 'true';
  nav.setAttribute('data-open', String(!open));
  navToggle.setAttribute('aria-expanded', String(!open));
});

// -----------------------------
// Reduced motion (controls the hero glow spin)
// -----------------------------
function updateMotion(){
  root.style.setProperty('--spin', reduceMotionQuery.matches ? 'paused' : 'running');
}
reduceMotionQuery.addEventListener('change', updateMotion);
updateMotion();

// -----------------------------
// Projects page: render projects.json if present
// -----------------------------
const grid = document.getElementById('projects-grid');
if(grid){
  fetch('projects.json')
    .then((r) => r.ok ? r.json() : Promise.reject(new Error('Failed to load projects.json')))
    .then((projects) => {
      grid.innerHTML = '';
      projects.forEach((p) => {
        const tags = Array.isArray(p.tags) ? p.tags : [];
        const highlights = Array.isArray(p.highlights) ? p.highlights : [];

        const article = document.createElement('article');
        article.className = 'hero-card';
        article.style.display = 'flex';
        article.style.flexDirection = 'column';

        article.innerHTML = `
          <picture>
            <img src="${p.image || 'assets/hero.png'}" alt="${p.imageAlt || (p.title + ' preview')}" width="640" height="400" loading="lazy" decoding="async" />
          </picture>
          <div style="margin-top: var(--space-4)">
            <h3 style="margin:0">${p.title}</h3>
            <p class="trust-note">${p.stack || ''}</p>
            <p>${p.description || ''}</p>
            ${highlights.length ? `<ul class="trust-note" style="padding-left:1.1rem; margin:.75rem 0 0">
              ${highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>` : ''}
          </div>
          <div class="tech-badges" style="margin-top:auto">
            ${tags.map(t => `<span class="badge">#${t}</span>`).join('')}
            ${p.live ? `<a class="btn btn-outline" href="${p.live}" rel="noopener noreferrer">Live</a>` : ''}
            ${p.github ? `<a class="btn btn-outline" href="${p.github}" rel="noopener noreferrer">GitHub</a>` : ''}
          </div>
        `;

        grid.appendChild(article);
      });
    })
    .catch(() => {
      grid.innerHTML = '<p class="trust-note">Projects list failed to load.</p>';
    });
}
