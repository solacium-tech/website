/* ============================================================
   SOLACIUM TECH — Main JavaScript
   ============================================================ */

/* ── Nav scroll behaviour ─────────────────────────── */

const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ── Mobile hamburger ─────────────────────────────── */

const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');

hamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

/* ── Smooth scroll for all anchor links ───────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── Active nav link on scroll ────────────────────── */

const navLinks = document.querySelectorAll('.nav-links a[data-section]');
const sections = Array.from(navLinks).map(link =>
  document.getElementById(link.dataset.section)
).filter(Boolean);

function updateActiveNav() {
  const scrollY = window.scrollY + nav.offsetHeight + 40;
  let current = sections[0];
  for (const section of sections) {
    if (section.offsetTop <= scrollY) current = section;
  }
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current?.id);
  });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ── Intersection Observer — reveal on scroll ─────── */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Back to top ──────────────────────────────────── */

const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Cookie banner ────────────────────────────────── */

(function initCookies() {
  const banner = document.getElementById('cookieBanner');
  const consent = localStorage.getItem('cookie-consent');

  if (!consent) {
    setTimeout(() => banner.classList.add('visible'), 1200);
  }

  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    banner.classList.remove('visible');
  });

  document.getElementById('cookieDecline').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'declined');
    banner.classList.remove('visible');
  });
})();

/* ── Radar canvas animation ───────────────────────── */

(function initRadar() {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, cx, cy, radius;
  const SWEEP_SPEED = 0.006;
  const BLIPS = [];
  const MAX_BLIPS = 8;
  let angle = 0;

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    cx = w / 2;
    cy = h / 2;
    radius = Math.min(w, h) * 0.42;
  }

  function spawnBlip() {
    if (BLIPS.length >= MAX_BLIPS) return;
    const r = radius * (0.3 + Math.random() * 0.6);
    const a = Math.random() * Math.PI * 2;
    BLIPS.push({
      x: cx + Math.cos(a) * r,
      y: cy + Math.sin(a) * r,
      alpha: 1,
      size: 2 + Math.random() * 2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(89,162,136,0.25)';
    ctx.lineWidth = 0.8;
    [0.25, 0.5, 0.75, 1].forEach(f => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * f, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(89,162,136,0.15)';
    ctx.lineWidth = 0.6;
    [0, Math.PI / 2].forEach(a => {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.lineTo(cx - Math.cos(a) * radius, cy - Math.sin(a) * radius);
      ctx.stroke();
    });

    const TRAIL = Math.PI * 0.55;
    for (let i = 0; i < 60; i++) {
      const frac = i / 60;
      const a = angle - TRAIL * frac;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, a, a + (TRAIL / 60) + 0.002);
      ctx.closePath();
      ctx.fillStyle = `rgba(89,162,136,${0.18 * (1 - frac)})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.strokeStyle = 'rgba(89,162,136,0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    BLIPS.forEach((b, idx) => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(89,162,136,${b.alpha})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size + 4 * (1 - b.alpha), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(89,162,136,${b.alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      b.alpha -= 0.003;
      if (b.alpha <= 0) BLIPS.splice(idx, 1);
    });

    angle += SWEEP_SPEED;
    if (angle > Math.PI * 2) {
      angle -= Math.PI * 2;
      spawnBlip();
      if (Math.random() > 0.5) spawnBlip();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  spawnBlip();
  spawnBlip();
  draw();
})();

/* ── Contact form ─────────────────────────────────── */

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        btn.textContent = 'Message Sent — Thank You';
        btn.style.background = '#536f68';
        contactForm.reset();
      } else {
        btn.textContent = 'Something went wrong — please email info@solacium.tech';
        btn.style.background = '#7a4040';
        btn.disabled = false;
      }
    } catch {
      btn.textContent = 'Something went wrong — please email info@solacium.tech';
      btn.style.background = '#7a4040';
      btn.disabled = false;
    }
  });
}
