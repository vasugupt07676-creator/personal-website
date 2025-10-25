// Replace no-js class
document.documentElement.classList.remove('no-js');

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Theme handling with localStorage + prefers-color-scheme
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

const getStored = () => localStorage.getItem('theme');
const store = (val) => localStorage.setItem('theme', val);

function applyTheme(mode){
  if(mode === 'dark'){
    root.setAttribute('data-theme','dark');
    themeToggle.setAttribute('aria-pressed','true');
    themeToggle.querySelector('.label').textContent = 'Light';
    themeToggle.firstElementChild.textContent = '🌞';
  } else if(mode === 'light'){
    root.removeAttribute('data-theme'); // let light override via media query
    root.setAttribute('data-theme','light');
    themeToggle.setAttribute('aria-pressed','false');
    themeToggle.querySelector('.label').textContent = 'Dark';
    themeToggle.firstElementChild.textContent = '🌙';
  } else {
    // system
    root.setAttribute('data-theme','system');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}

const initial = getStored();
if(initial){ applyTheme(initial); }
else { applyTheme('system'); }

themeToggle.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  applyTheme(next); store(next);
});

// Mobile nav
const nav = document.getElementById('primary-nav');
const navToggle = document.getElementById('nav-toggle');
const mq = window.matchMedia('(max-width: 900px)');

function handleMQ(e){
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

navToggle.addEventListener('click', () => {
  const open = nav.getAttribute('data-open') === 'true';
  nav.setAttribute('data-open', String(!open));
  navToggle.setAttribute('aria-expanded', String(!open));
});

// Reduced motion: stop spin if user prefers less motion
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
function updateMotion(){
  document.documentElement.style.setProperty('--spin', reduceMotionQuery.matches ? 'paused' : 'running');
}
reduceMotionQuery.addEventListener('change', updateMotion);
updateMotion();
