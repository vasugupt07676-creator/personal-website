// Small progressive enhancements and dynamic project rendering
document.addEventListener('DOMContentLoaded', () => {
  // Reduce motion-friendly gradient animation
  const root = document.documentElement;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let hue = 210;
    setInterval(() => {
      hue = (hue + 1) % 360;
      root.style.setProperty('--brand', `hsl(${hue}, 90%, 55%)`);
    }, 60);
  }

  // Render projects from projects.json (editable by you)
  fetch('projects.json')
    .then(r => r.json())
    .then(projects => {
      const grid = document.getElementById('project-grid');
      if (!Array.isArray(projects) || !grid) return;
      grid.innerHTML = projects.map(p => card(p)).join('');
    })
    .catch(() => {
      // Fallback cards if file missing
      const grid = document.getElementById('project-grid');
      if (grid) {
        grid.innerHTML = [
          card({ title: 'Personal Website', description: 'This site — fast, accessible, and easily deployable.', stars: '—', link: '#' }),
          card({ title: 'UI Components', description: 'Reusable, accessible components in plain HTML/CSS/JS.', stars: '—', link: '#' })
        ].join('');
      }
    });
});

function card(p){
  const link = p.link ? `<a class="btn btn-outline" href="${p.link}" aria-label="Open ${p.title} (external)" rel="noopener">Open</a>` : '';
  const stars = p.stars ? `<span aria-label="GitHub stars">★ ${p.stars}</span>` : '';
  const stack = p.stack ? `<span>${p.stack}</span>` : '';
  return `
    <article class="card">
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description || '')}</p>
      <div class="meta">${stack}${stars}</div>
      ${link}
    </article>
  `;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
