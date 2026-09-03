/* ============================================================
   GIDEON MUCHINA — main.js
   Interactive logic for skills filtering, stats counter, typewriter,
   smooth scrolling, scroll-reveal, and contact form handling.
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ─── Navbar scroll effect ────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  /* ─── Mobile Menu Toggle ─────────────────────────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navMobile = document.getElementById('nav-mobile');

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('open');
      navMobile.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navMobile.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── Active Nav Link on Scroll ──────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  function updateActiveNavLink() {
    let current = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  /* ─── Typewriter Effect ──────────────────────────────────────── */
  const typewriterEl = document.querySelector('.typewriter-text');
  const phrases = [
    'Head of Tech Support @ ISP Tech Firm',
    'ISP Infrastructure & RADIUS / PPPoE',
    'Elixir / Phoenix / Ash Framework Dev',
    'MikroTik, WireGuard & VLAN Specialist',
    'ALX Software Engineering Certified'
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typePause = false;

  function typeWriter() {
    if (!typewriterEl) return;

    const currentPhrase = phrases[phraseIdx];

    if (typePause) {
      setTimeout(typeWriter, 1400);
      typePause = false;
      return;
    }

    if (isDeleting) {
      typewriterEl.textContent = currentPhrase.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
      setTimeout(typeWriter, 40);
    } else {
      typewriterEl.textContent = currentPhrase.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === currentPhrase.length) {
        isDeleting = true;
        typePause = true;
      }
      setTimeout(typeWriter, 70);
    }
  }

  typeWriter();

  /* ─── Skill Category Filter ──────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filterValue = btn.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      // Re-trigger skill bar widths for visible cards
      animateSkillBars();
    });
  });

  /* ─── Skill Bar Animations ───────────────────────────────────── */
  let skillsAnimated = false;

  function animateSkillBars() {
    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const rect = skillsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85) {
      skillsAnimated = true;
      document.querySelectorAll('.skill-card:not(.hidden) .skill-bar-fill').forEach(bar => {
        const targetWidth = bar.getAttribute('data-width');
        if (targetWidth) {
          bar.style.width = targetWidth;
        }
      });
    }
  }

  window.addEventListener('scroll', animateSkillBars, { passive: true });
  animateSkillBars();

  /* ─── Stat Ticker Counter ────────────────────────────────────── */
  let statsCounted = false;

  function countStats() {
    const statsSection = document.querySelector('.hero-stats');
    if (!statsSection || statsCounted) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      statsCounted = true;

      document.querySelectorAll('.hero-stat-value').forEach(el => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target)) return;

        let current = 0;
        const increment = Math.max(1, Math.ceil(target / 25));
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          const suffix = target === 1 ? '+ Yr' : (target === 2 ? '+ Yrs' : '+');
          el.textContent = current + suffix;
        }, 50);
      });
    }
  }

  window.addEventListener('scroll', countStats, { passive: true });
  countStats();

  /* ─── Scroll Reveal Observer ─────────────────────────────────── */
  function revealElements() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.88) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', revealElements, { passive: true });
  revealElements();

  /* ─── Back-to-Top Button ─────────────────────────────────────── */
  const backToTopBtn = document.getElementById('back-to-top');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── Smooth Scroll for Anchors ──────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const targetRect = target.getBoundingClientRect().top;
        const targetPosition = targetRect - bodyRect - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ─── Formspree Contact Form Submission ──────────────────────── */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      }

      if (formStatus) {
        formStatus.className = 'form-status';
        formStatus.style.display = 'none';
      }

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          if (formStatus) {
            formStatus.textContent = '✓ Message sent successfully! I will get back to you within 24 hours.';
            formStatus.className = 'form-status success';
            formStatus.style.display = 'block';
          }
          contactForm.reset();
        } else {
          const result = await response.json().catch(() => ({}));
          const errMsg = result.errors ? result.errors.map(err => err.message).join(', ') : 'Failed to send message. Please try again.';
          if (formStatus) {
            formStatus.textContent = `✕ ${errMsg}`;
            formStatus.className = 'form-status error';
            formStatus.style.display = 'block';
          }
        }
      } catch (err) {
        if (formStatus) {
          formStatus.textContent = '✕ Network error. Please check your connection and try again.';
          formStatus.className = 'form-status error';
          formStatus.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
        }
        setTimeout(() => {
          if (formStatus && formStatus.classList.contains('success')) {
            formStatus.style.display = 'none';
          }
        }, 8000);
      }
    });
  }

});
