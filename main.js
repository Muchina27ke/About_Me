/* ============================================================
   GIDEON MUCHINA — main.js
   Theme, network canvas, terminal, command palette, project
   modal, skill filter, spotlight/tilt, reveal, contact form.
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Toast ─────────────────────────────────────────────────── */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ─── Theme (persisted, respects OS preference) ─────────────── */
  const root = document.documentElement;
  const themeBtn = $('#theme-toggle');
  function applyTheme(t) {
    root.dataset.theme = t;
    themeBtn.innerHTML = t === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    $('meta[name="theme-color"]').content = t === 'dark' ? '#0b0f17' : '#f6f8fc';
    netColor();
  }
  function toggleTheme() {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (_) {}
  }
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (_) {}
  themeBtn.addEventListener('click', toggleTheme);

  /* ─── Network canvas background (nodes + links, mouse-reactive) ─ */
  const canvas = $('#net-bg');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], rgb = '34,211,238';
  const mouse = { x: -999, y: -999 };

  function netColor() {
    rgb = getComputedStyle(root).getPropertyValue('--net').trim() || rgb;
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    const count = Math.min(70, Math.floor(innerWidth / 22));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr,
    }));
    canvas._dpr = dpr;
  }
  function drawNet() {
    ctx.clearRect(0, 0, W, H);
    const dpr = canvas._dpr, link = 130 * dpr, mlink = 170 * dpr;
    for (const n of nodes) {
      if (!reduceMotion) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      ctx.fillStyle = `rgba(${rgb},.8)`;
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.6 * dpr, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / link) * .35})`;
          ctx.lineWidth = dpr * .7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < mlink) {
        ctx.strokeStyle = `rgba(${rgb},${(1 - md / mlink) * .7})`;
        ctx.lineWidth = dpr;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
  }
  let netRunning = true;
  function loop() {
    if (netRunning) drawNet();
    if (!reduceMotion) requestAnimationFrame(loop);
  }
  addEventListener('mousemove', e => {
    const dpr = canvas._dpr || 1;
    mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
  }, { passive: true });
  addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { netRunning = !document.hidden; });
  applyTheme(saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  resize(); loop();
  if (reduceMotion) drawNet();

  /* ─── Navbar, progress, active link, back-to-top ────────────── */
  const navbar = $('#navbar');
  const progress = $('#progress');
  const toTop = $('#back-to-top');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-link[data-section]');

  function onScroll() {
    const y = scrollY;
    navbar.classList.toggle('scrolled', y > 30);
    toTop.classList.toggle('visible', y > 500);
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    let cur = '';
    for (const s of sections) if (y + 160 >= s.offsetTop) cur = s.id;
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === cur));
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const navToggle = $('#nav-toggle'), navMobile = $('#nav-mobile');
  function closeMenu() { navMobile.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
  navToggle.addEventListener('click', () => {
    const open = navMobile.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  $$('a', navMobile).forEach(a => a.addEventListener('click', closeMenu));

  /* ─── Typewriter ────────────────────────────────────────────── */
  const tw = $('#typewriter');
  const phrases = [
    'mikrotik --configure radius pppoe',
    'mix phx.server  # Elixir / Ash / LiveView',
    'wg-quick up wg0  # secure tunnels',
    'ping -c 4 your-next-hire',
  ];
  let pi = 0, ci = 0, del = false;
  function type() {
    const p = phrases[pi];
    tw.textContent = p.slice(0, del ? --ci : ++ci);
    let wait = del ? 28 : 65;
    if (!del && ci === p.length) { del = true; wait = 1500; }
    else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 350; }
    setTimeout(type, wait);
  }
  if (reduceMotion) tw.textContent = phrases[0]; else type();

  /* ─── Stat count-up ─────────────────────────────────────────── */
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      statObs.unobserve(en.target);
      const el = en.target, target = +el.dataset.count, suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / 1100, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => statObs.observe(el));

  /* ─── Scroll reveal ─────────────────────────────────────────── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); revObs.unobserve(en.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revObs.observe(el));

  /* ─── Spotlight hover + photo tilt ──────────────────────────── */
  $$('.spot').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  const tilt = $('.tilt');
  if (tilt && !reduceMotion && matchMedia('(hover:hover)').matches) {
    tilt.addEventListener('pointermove', e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
    });
    tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  }

  /* ─── Skills: filter + tooltip line ─────────────────────────── */
  const skills = $$('.skill'), tip = $('#skill-tip');
  $$('.filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter').forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn); });
    skills.forEach(s => s.classList.toggle('hidden', btn.dataset.filter !== 'all' && s.dataset.category !== btn.dataset.filter));
  }));
  skills.forEach(s => {
    const show = () => { tip.innerHTML = '> '; tip.append(s.textContent.trim() + ' — '); tip.insertAdjacentHTML('beforeend', s.dataset.tip); };
    s.addEventListener('mouseenter', show);
    s.addEventListener('focus', show);
    s.addEventListener('click', show);
  });

  /* ─── Project case studies (modal) ──────────────────────────── */
  const projects = {
    isp: {
      title: 'Cloud ISP Billing & Traffic Platform', img: 'isp-platform.svg',
      sum: 'Cloud billing and network-enforcement platform for ISPs.',
      problem: 'ISPs lose revenue and support time when billing, subscriber authentication and bandwidth control live in separate tools and are reconciled by hand.',
      approach: [
        'Backend modelled with Ash resources on Elixir/Phoenix; real-time dashboards via LiveView.',
        'RADIUS + PPPoE integration so unpaid invoices automatically change a subscriber\'s access and speed queue on MikroTik.',
        'WhatsApp gateway for instant invoice alerts and payment receipts.',
        'Live traffic monitoring so support can see a customer\'s state without logging into a router.',
      ],
      outcome: 'Billing, enforcement and notifications run as one automated flow, cutting manual reconciliation and speeding up support triage.',
      stack: ['Elixir', 'Phoenix', 'Ash', 'LiveView', 'PostgreSQL', 'MikroTik', 'RADIUS', 'PPPoE'],
      links: [],
      note: 'Proprietary enterprise platform — source is private; happy to walk through the architecture in an interview.',
    },
    jirani: {
      title: 'Jirani E-Store', img: 'e-commerce.png',
      sum: 'Hyperlocal e-commerce marketplace connecting neighbourhood vendors with customers.',
      problem: 'Small local vendors lack an affordable way to sell online and offer reliable delivery.',
      approach: [
        'Role-based dashboards for Admin, Vendor and Customer.',
        'Real-time delivery tracking and order status updates.',
        'Multilingual interface for local audiences.',
      ],
      outcome: 'A working multi-role marketplace covering catalogue, ordering and delivery tracking end-to-end.',
      stack: ['JavaScript', 'PHP', 'MySQL'],
      links: [['View repository', 'https://github.com/Muchina27ke/jirani-e-store']],
    },
    daycare: {
      title: 'Swiss Bears Daycare System', img: 'ms.png',
      sum: 'Web-based daycare management for staff and parents.',
      problem: 'Paper check-in sheets and phone calls make attendance and parent communication slow and error-prone.',
      approach: [
        'Digital child check-in/out with timestamps.',
        'Automated attendance reports for administrators.',
        'Parent–caregiver communication in one place.',
      ],
      outcome: 'Replaced manual record-keeping with a single searchable system and ready-made attendance reports.',
      stack: ['PHP', 'MySQL', 'JavaScript'],
      links: [['View repository', 'https://github.com/Muchina27ke/DAYCARE-MANAGEMENT-SYSTEM-MUCHINA']],
    },
  };
  const modal = $('#project-modal'), pmContent = $('#pm-content');
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function openProject(id) {
    const p = projects[id]; if (!p) return;
    pmContent.innerHTML = `
      <img class="pm-hero" src="${p.img}" alt="${esc(p.title)} screenshot">
      <div class="pm-body">
        <h3 id="pm-title">${esc(p.title)}</h3>
        <p class="pm-sum">${esc(p.sum)}</p>
        <div class="pm-block"><h4>Problem</h4><p>${esc(p.problem)}</p></div>
        <div class="pm-block"><h4>Approach</h4><ul>${p.approach.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>
        <div class="pm-block"><h4>Outcome</h4><p>${esc(p.outcome)}</p></div>
        <div class="chips">${p.stack.map(s => `<span>${esc(s)}</span>`).join('')}</div>
        ${p.note ? `<p class="tiny">${esc(p.note)}</p>` : ''}
        <div class="pm-actions">${p.links.map(l => `<a class="btn btn-primary" href="${l[1]}" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i> ${esc(l[0])}</a>`).join('')}
        <a class="btn btn-ghost" href="#contact" data-close>Discuss this</a></div>
      </div>`;
    modal.showModal();
  }
  $$('.project').forEach(c => {
    c.addEventListener('click', () => openProject(c.dataset.project));
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(c.dataset.project); } });
  });
  $('#pm-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close]')) modal.close();
  });

  /* ─── Command palette (Ctrl/Cmd+K) ──────────────────────────── */
  const pal = $('#palette'), palQ = $('#pal-q'), palList = $('#pal-list');
  const go = id => () => { const t = document.getElementById(id); t && t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); };
  const actions = [
    { label: 'Go to Home', icon: 'house', hint: 'section', run: go('home') },
    { label: 'Go to About', icon: 'user', hint: 'section', run: go('about') },
    { label: 'Go to Projects', icon: 'folder-open', hint: 'section', run: go('projects') },
    { label: 'Go to Experience', icon: 'briefcase', hint: 'section', run: go('experience') },
    { label: 'Go to Stack', icon: 'layer-group', hint: 'section', run: go('skills') },
    { label: 'Go to Credentials', icon: 'certificate', hint: 'section', run: go('certifications') },
    { label: 'Go to Contact', icon: 'paper-plane', hint: 'section', run: go('contact') },
    { label: 'Open: Cloud ISP Billing Platform', icon: 'server', hint: 'project', run: () => openProject('isp') },
    { label: 'Open: Jirani E-Store', icon: 'store', hint: 'project', run: () => openProject('jirani') },
    { label: 'Open: Daycare System', icon: 'child', hint: 'project', run: () => openProject('daycare') },
    { label: 'Toggle light / dark theme', icon: 'circle-half-stroke', hint: 'action', run: toggleTheme },
    { label: 'Copy email address', icon: 'copy', hint: 'action', run: copyEmail },
    { label: 'Open GitHub', icon: 'github', brand: true, hint: 'link', run: () => open('https://github.com/Muchina27ke', '_blank', 'noopener') },
    { label: 'Open LinkedIn', icon: 'linkedin-in', brand: true, hint: 'link', run: () => open('https://www.linkedin.com/in/gideon-muchina-9b027b261', '_blank', 'noopener') },
  ];
  let sel = 0, shown = actions;
  function renderPal() {
    const q = palQ.value.trim().toLowerCase();
    shown = actions.filter(a => a.label.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    palList.innerHTML = shown.length
      ? shown.map((a, i) => `<li role="option" data-i="${i}" class="${i === sel ? 'sel' : ''}"><i class="${a.brand ? 'fab' : 'fas'} fa-${a.icon}"></i>${esc(a.label)}<small>${a.hint}</small></li>`).join('')
      : '<li class="empty">No matches</li>';
    const s = $('.sel', palList); s && s.scrollIntoView({ block: 'nearest' });
  }
  function openPalette() { palQ.value = ''; sel = 0; renderPal(); if (!pal.open) pal.showModal(); palQ.focus(); }
  function runSel() { const a = shown[sel]; if (!a) return; pal.close(); setTimeout(a.run, 60); }
  palQ.addEventListener('input', () => { sel = 0; renderPal(); });
  palQ.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); renderPal(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); renderPal(); }
    else if (e.key === 'Enter') { e.preventDefault(); runSel(); }
  });
  palList.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) { sel = +li.dataset.i; runSel(); } });
  pal.addEventListener('click', e => { if (e.target === pal) pal.close(); });
  $('#open-palette').addEventListener('click', openPalette);
  addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.open ? pal.close() : openPalette(); }
  });

  /* ─── Interactive terminal ──────────────────────────────────── */
  const out = $('#term-out'), form = $('#term-form'), input = $('#term-input'), body = $('#term-body');
  const history = []; let hIdx = 0;
  function print(html, cls) {
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.innerHTML = html;
    out.appendChild(p);
    body.scrollTop = body.scrollHeight;
  }
  const row = (k, v) => `<span class="k">${k.padEnd(12)}</span>${v}`;
  const commands = {
    help: () => print(['Available commands:',
      row('whoami', 'who I am'), row('skills', 'tech stack'), row('projects', 'selected work'),
      row('experience', 'career timeline'), row('contact', 'how to reach me'),
      row('open <x>', 'jump to: about projects experience skills contact'),
      row('theme', 'toggle light/dark'), row('palette', 'open command palette'), row('clear', 'clear screen')].join('\n')),
    whoami: () => print('<span class="p">Gideon Muchina</span> — Head of Technical Support @ ISP tech firm.\nNetwork engineer (MikroTik · RADIUS/PPPoE · WireGuard) and Elixir/Ash developer.\nBSc IT, ALX Software Engineering. Nairobi, Kenya. Plays chess.'),
    skills: () => print([row('network', 'MikroTik, RADIUS, PPPoE, WireGuard, VLANs, Wireshark'),
      row('software', 'Elixir, Phoenix, Ash, LiveView, JS, Node, PHP, SQL'),
      row('systems', 'Linux/Kali, Docker, hardening, AWS fundamentals')].join('\n')),
    projects: () => print([row('1 isp', 'Cloud ISP Billing & Traffic Platform'),
      row('2 jirani', 'Jirani E-Store'), row('3 daycare', 'Swiss Bears Daycare System'),
      'Run <span class="k">open projects</span> or <span class="k">case isp</span> for details.'].join('\n')),
    experience: () => print([row('2025–now', 'Head of Technical Support · ISP firm'),
      row('2024–now', 'Network Troubleshooting Specialist'), row('2024', 'MikroTik Specialist · Westlands'),
      row('2025', 'Web Dev · AgTech'), row('2023–25', 'IT Support · KCA University')].join('\n')),
    contact: () => print([row('email', 'gideonmuchina381@gmail.com'),
      row('github', '<a href="https://github.com/Muchina27ke" target="_blank" rel="noopener noreferrer">Muchina27ke</a>'),
      row('linkedin', '<a href="https://www.linkedin.com/in/gideon-muchina-9b027b261" target="_blank" rel="noopener noreferrer">gideon-muchina</a>')].join('\n')),
    ls: () => print('about/  projects/  experience/  skills/  contact/'),
    clear: () => { out.innerHTML = ''; },
    theme: () => { toggleTheme(); print('theme → ' + root.dataset.theme); },
    palette: () => openPalette(),
    date: () => print(new Date().toString()),
    pwd: () => print('/home/gideon'),
    sudo: () => print('gideon is not in the sudoers file. This incident will be reported. 😄', 'err'),
    chess: () => print('♟  1. e4 — let\'s play. (Best opening is whichever one you\'ve studied.)'),
  };
  function run(raw) {
    const line = raw.trim();
    const p = document.createElement('p'); p.className = 'cmd';
    p.innerHTML = '<b>gideon@nairobi:~$</b> '; p.append(line);
    out.appendChild(p);
    if (!line) return;
    const [cmd, ...args] = line.split(/\s+/); const c = cmd.toLowerCase();
    if (c === 'open' || c === 'cd' || c === 'goto') {
      const t = (args[0] || '').replace(/\/$/, '').toLowerCase();
      const map = { about: 'about', projects: 'projects', experience: 'experience', skills: 'skills', contact: 'contact', certs: 'certifications', home: 'home' };
      if (map[t]) { print('opening ' + t + '…'); go(map[t])(); } else print('usage: open about|projects|experience|skills|contact', 'err');
    } else if (c === 'case') {
      const id = (args[0] || '').toLowerCase();
      if (projects[id]) { print('opening case study…'); openProject(id); } else print('usage: case isp|jirani|daycare', 'err');
    } else if (commands[c]) commands[c]();
    else print('command not found: ' + esc(cmd) + '. Try <span class="k">help</span>.', 'err');
    body.scrollTop = body.scrollHeight;
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value; input.value = '';
    if (v.trim()) { history.push(v); hIdx = history.length; }
    run(v);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) input.value = history[--hIdx]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); input.value = hIdx < history.length - 1 ? history[++hIdx] : ((hIdx = history.length), ''); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const m = Object.keys(commands).filter(k => k.startsWith(input.value.toLowerCase()));
      if (m.length === 1) input.value = m[0];
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) { e.preventDefault(); commands.clear(); }
  });
  $('#terminal').addEventListener('click', e => { if (!e.target.closest('a, button') && !getSelection().toString()) input.focus({ preventScroll: true }); });
  $$('.term-hints button').forEach(b => b.addEventListener('click', () => { run(b.dataset.cmd); }));
  print('Welcome to <span class="p">gideon-os</span> v1.0 — type <span class="k">help</span> or tap a shortcut below.\n');
  run('whoami');

  /* ─── Contact: quick subjects, copy, local time, form ───────── */
  $$('.quick-subjects button').forEach(b => b.addEventListener('click', () => { $('#subject').value = b.dataset.subject; $('#message').focus(); }));

  function copyEmail() {
    const email = 'gideonmuchina381@gmail.com';
    (navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject())
      .then(() => toast('Email copied ✓'))
      .catch(() => { location.href = 'mailto:' + email; });
  }
  $('#copy-email').addEventListener('click', copyEmail);

  const timeEl = $('#local-time');
  function tick() {
    timeEl.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
  }
  tick(); setInterval(tick, 30000);

  const contactForm = $('#contact-form'), statusEl = $('#form-status'), submitBtn = $('#submit-btn');
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    statusEl.className = 'form-status';
    let ok = true;
    $$('input, textarea', contactForm).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    if (!ok) { statusEl.textContent = 'Please fill in every field with valid details.'; statusEl.className = 'form-status error'; return; }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    try {
      const res = await fetch(contactForm.action, { method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' } });
      if (res.ok) {
        statusEl.textContent = '✓ Message sent — I\'ll reply within 24 hours.';
        statusEl.className = 'form-status success';
        contactForm.reset();
      } else {
        const r = await res.json().catch(() => ({}));
        statusEl.textContent = '✕ ' + (r.errors ? r.errors.map(x => x.message).join(', ') : 'Could not send. Please try again.');
        statusEl.className = 'form-status error';
      }
    } catch (_) {
      statusEl.textContent = '✕ Network error. Check your connection or email me directly.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send message <i class="fas fa-paper-plane"></i>';
    }
  });
});
