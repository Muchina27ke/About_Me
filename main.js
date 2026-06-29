/* ============================================================
   GIDEON MUCHINA — main.js
   ============================================================ */

'use strict';

/* ─── Navbar scroll effect ────────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNavLink();
  revealOnScroll();
  animateSkillBars();
  animateTimeline();
  handleBackToTop();
}, { passive: true });

/* ─── Mobile menu toggle ─────────────────────────────────────── */
const navToggle  = document.getElementById('nav-toggle');
const navMobile  = document.getElementById('nav-mobile');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navMobile.classList.toggle('open');
  document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
});

// Close mobile menu on link click
navMobile.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── Active nav link on scroll ──────────────────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link[data-section]');

function updateActiveNavLink() {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
}

/* ─── Smooth scroll for anchor links ────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({
      top: target.offsetTop - 80,
      behavior: 'smooth',
    });
  });
});

/* ─── Typewriter effect ──────────────────────────────────────── */
const typewriterEl = document.querySelector('.typewriter-text');
const phrases = [
  'Full Stack Developer',
  'IT Specialist',
  'MikroTik Expert',
  'Elixir / Phoenix Dev',
  'Cyber Security Enthusiast',
];

let phraseIdx  = 0;
let charIdx    = 0;
let isDeleting = false;
let typePause  = false;

function typeWriter() {
  if (!typewriterEl) return;

  const current = phrases[phraseIdx];

  if (typePause) {
    setTimeout(typeWriter, 1200);
    typePause = false;
    return;
  }

  if (isDeleting) {
    typewriterEl.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isDeleting = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
    }
    setTimeout(typeWriter, 60);
  } else {
    typewriterEl.textContent = current.slice(0, charIdx + 1);
    charIdx++;
    if (charIdx === current.length) {
      isDeleting = true;
      typePause  = true;
    }
    setTimeout(typeWriter, 90);
  }
}

typeWriter();

/* ─── Skill bar animations ───────────────────────────────────── */
let skillsAnimated = false;

function animateSkillBars() {
  if (skillsAnimated) return;
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  const rect = skillsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.85) {
    skillsAnimated = true;
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
      const target = bar.dataset.width;
      setTimeout(() => {
        bar.style.width = target;
      }, 100);
    });
  }
}

/* ─── Timeline reveal ────────────────────────────────────────── */
function animateTimeline() {
  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.88) {
      setTimeout(() => item.classList.add('visible'), i * 80);
    }
  });
}

/* ─── Generic reveal on scroll ───────────────────────────────── */
function revealOnScroll() {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('visible');
    }
  });
}

/* ─── Back-to-top button ─────────────────────────────────────── */
const backToTopBtn = document.getElementById('back-to-top');

function handleBackToTop() {
  if (window.scrollY > 400) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── Contact form — Formspree fetch submission ──────────────── */
const contactForm   = document.getElementById('contact-form');
const formStatus    = document.getElementById('form-status');
const submitBtn     = document.getElementById('submit-btn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    formStatus.className = 'form-status';

    const data = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        formStatus.textContent = "✓ Message sent! I'll get back to you soon.";
        formStatus.className   = 'form-status success';
        contactForm.reset();
      } else {
        const json = await response.json().catch(() => ({}));
        const msg  = json.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
        formStatus.textContent = `✕ ${msg}`;
        formStatus.className   = 'form-status error';
      }
    } catch {
      formStatus.textContent = '✕ Network error — please try again.';
      formStatus.className   = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
      setTimeout(() => { formStatus.className = 'form-status'; }, 7000);
    }
  });
}

/* ─── Initial run on page load ───────────────────────────────── */
window.addEventListener('load', () => {
  updateActiveNavLink();
  revealOnScroll();
  animateSkillBars();
  animateTimeline();
  handleBackToTop();
});
