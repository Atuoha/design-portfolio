/* ================================================================
   PEACE ATUOHA PORTFOLIO — script.js
================================================================ */

/* ── AOS ─────────────────────────────────────────────────────── */
AOS.init({ duration:820, easing:'ease-out-quad', once:true, offset:55 });

/* ── THEME TOGGLE ────────────────────────────────────────────── */
(function initTheme() {
  const html   = document.documentElement;
  const btn    = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', stored);

  if (btn) {
    btn.addEventListener('click', () => {
      const isDark = html.getAttribute('data-theme') === 'dark';
      const next   = isDark ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }
})();

/* ── SHOOTING / FALLING LINES CANVAS ─────────────────────────── */
(function initLines() {
  const canvas = document.getElementById('lines-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Each "meteor" is a line that falls from top, slight diagonal */
  const meteors = [];
  const MAX = 18;

  function spawnMeteor() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    meteors.push({
      x:     Math.random() * canvas.width,
      y:     -20 - Math.random() * 200,
      len:   40 + Math.random() * 100,
      speed: 2 + Math.random() * 5,
      angle: 70 + Math.random() * 20,        // degrees from horizontal
      alpha: .15 + Math.random() * .35,
      w:     .5 + Math.random() * 1.2,
      color: dark ? '#ffffff' : '#D83675',
    });
  }

  for (let i = 0; i < MAX; i++) {
    spawnMeteor();
    // Stagger starting y positions
    meteors[i].y = Math.random() * canvas.height;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';

    meteors.forEach((m, i) => {
      const rad = m.angle * Math.PI / 180;
      const dx  = Math.cos(rad) * m.len;
      const dy  = Math.sin(rad) * m.len;

      const grad = ctx.createLinearGradient(m.x, m.y, m.x + dx, m.y + dy);
      const col  = dark ? `rgba(255,255,255,${m.alpha})` : `rgba(216,54,117,${m.alpha})`;
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, col);

      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x + dx, m.y + dy);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = m.w;
      ctx.stroke();

      m.x += Math.cos(rad) * m.speed * .25;
      m.y += m.speed;

      // Reset when off-screen
      if (m.y > canvas.height + 100 || m.x > canvas.width + 100) {
        meteors[i] = {
          x:     Math.random() * canvas.width,
          y:     -20 - Math.random() * 80,
          len:   40 + Math.random() * 100,
          speed: 2 + Math.random() * 5,
          angle: 70 + Math.random() * 20,
          alpha: .15 + Math.random() * .35,
          w:     .5 + Math.random() * 1.2,
          color: dark ? '#ffffff' : '#D83675',
        };
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── NAVBAR ──────────────────────────────────────────────────── */
(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active links */
  const links   = document.querySelectorAll('.nav-links a[href*="#"]');
  const sections = document.querySelectorAll('section[id]');
  if (sections.length && links.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active',
          a.getAttribute('href').endsWith('#' + e.target.id)));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => io.observe(s));
  }
})();

/* ── MOBILE NAV ──────────────────────────────────────────────── */
(function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navLinks');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
})();

/* ── CUSTOM CURSOR ───────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  const lbl  = document.getElementById('cursor-label');
  if (!dot || !ring || !lbl) return;
  if (window.matchMedia('(pointer:coarse)').matches) return;

  let mx=0, my=0, rx=0, ry=0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx+'px'; dot.style.top = my+'px';
    lbl.style.left = mx+'px'; lbl.style.top  = my+'px';
  });

  (function loop() {
    rx += (mx-rx)*.1;
    ry += (my-ry)*.1;
    ring.style.left = rx+'px';
    ring.style.top  = ry+'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .filter-btn, .social-card, .footer-social').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('exp'));
    el.addEventListener('mouseleave', () => ring.classList.remove('exp'));
  });
  document.querySelectorAll('.project-card, .gallery-card, .gallery-strip-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('proj');
      lbl.textContent = 'Open'; lbl.classList.add('vis');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('proj'); lbl.classList.remove('vis');
    });
  });
})();

/* ── PROJECT FILTER ──────────────────────────────────────────── */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.project-item');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', function() {
      btns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const f = this.dataset.filter;
      items.forEach(item => {
        const show = f === 'all' || (item.dataset.category || '').includes(f);
        item.style.transition = 'opacity .4s, transform .4s';
        item.style.opacity    = show ? '1' : '0';
        item.style.transform  = show ? 'scale(1)' : 'scale(.95)';
        item.style.pointerEvents = show ? 'auto' : 'none';
        if (!show) setTimeout(() => { if (item.style.opacity==='0') item.style.display='none'; }, 400);
        else item.style.display='';
      });
    });
  });
})();

/* ── SKILL BARS ──────────────────────────────────────────────── */
(function initSkillBars() {
  const wrap = document.querySelector('.skills-grid');
  if (!wrap) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.skill-bar').forEach(bar => { bar.style.width = bar.dataset.width + '%'; });
      io.unobserve(e.target);
    });
  }, { threshold: .15 });
  io.observe(wrap);
})();

/* ── GALLERY LIGHTBOX ────────────────────────────────────────── */
(function initGallery() {
  const lightbox  = document.getElementById('gallery-lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbCount   = document.getElementById('lb-count');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');
  if (!lightbox || !lbImg) return;

  const cards = document.querySelectorAll('.gallery-card');
  let current = 0;

  const images = Array.from(cards).map(c => ({
    src:   c.dataset.src || c.querySelector('img')?.src,
    title: c.dataset.title || '',
  }));

  function open(i) {
    current = i;
    lbImg.src = images[i].src;
    lbCount.textContent = `${i+1} / ${images.length}`;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  function prev() { open((current - 1 + images.length) % images.length); }
  function next() { open((current + 1) % images.length); }

  cards.forEach((c, i) => c.addEventListener('click', () => open(i)));
  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev)  lbPrev.addEventListener('click',  prev);
  if (lbNext)  lbNext.addEventListener('click',  next);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
})();

/* ── CONTACT FORM — Formspree AJAX ──────────────────────────── */
(function initForm() {
  const form        = document.getElementById('contactForm');
  const successPanel= document.getElementById('formSuccess');
  const backBtn     = document.getElementById('formSuccessBack');
  const senderName  = document.getElementById('senderName');
  if (!form) return;

  /* ── Show success panel ────────────────────────────────────── */
  function showSuccess(name) {
    // Grab the name they typed (or fall back to friendly default)
    if (senderName) senderName.textContent = name ? name + '!' : 'friend!';

    // Fade form out
    form.style.transition = 'opacity .4s, transform .4s';
    form.style.opacity    = '0';
    form.style.transform  = 'translateY(18px)';

    setTimeout(() => {
      form.style.display   = 'none';
      successPanel.removeAttribute('aria-hidden');
      successPanel.classList.add('visible');
      spawnBurst();
    }, 380);
  }

  /* ── Hide success / reset ──────────────────────────────────── */
  function hideSuccess() {
    successPanel.classList.remove('visible');
    successPanel.setAttribute('aria-hidden', 'true');
    form.reset();
    form.style.display   = '';
    // tiny delay so display:'' is painted before opacity transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        form.style.opacity   = '1';
        form.style.transform = 'translateY(0)';
      });
    });
    // Reset the ring animation by cloning the SVG node
    const ring = successPanel.querySelector('.success-ring');
    if (ring) {
      const clone = ring.cloneNode(true);
      ring.parentNode.replaceChild(clone, ring);
    }
  }

  if (backBtn) backBtn.addEventListener('click', hideSuccess);

  /* ── Submit handler ────────────────────────────────────────── */
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const btn  = document.getElementById('submitBtn');
    const txt  = btn.querySelector('[data-send-text]');
    const ico  = btn.querySelector('[data-send-icon]');

    // Capture sender name before reset
    const nameField = form.querySelector('[name="name"]');
    const typedName = nameField ? nameField.value.trim().split(' ')[0] : '';

    // Ripple effect
    const rect = btn.getBoundingClientRect();
    const rpl  = document.createElement('span');
    rpl.classList.add('btn-ripple');
    const sz = Math.max(rect.width, rect.height);
    rpl.style.cssText = `width:${sz}px;height:${sz}px;left:${
      (e.clientX||rect.left+rect.width/2) - rect.left - sz/2}px;top:${
      (e.clientY||rect.top+rect.height/2) - rect.top  - sz/2}px`;
    btn.appendChild(rpl);
    setTimeout(() => rpl.remove(), 700);

    // Loading state
    btn.disabled       = true;
    txt.textContent    = 'Sending…';
    ico.className      = 'bi bi-hourglass-split';
    ico.style.animation = 'spin .8s linear infinite';

    try {
      const data = new FormData(form);
      const res  = await fetch(form.action, {
        method:  'POST',
        body:    data,
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        showSuccess(typedName);
      } else {
        // Parse Formspree error message if available
        const json = await res.json().catch(() => ({}));
        const msg  = json?.errors?.map(er => er.message).join(', ')
                     || 'Something went wrong. Please try again.';
        showFormError(btn, txt, ico, msg);
      }
    } catch (err) {
      showFormError(btn, txt, ico, 'Network error — please check your connection.');
    }
  });

  function showFormError(btn, txt, ico, msg) {
    btn.disabled    = false;
    txt.textContent = 'Try Again';
    ico.className   = 'bi bi-exclamation-circle';
    ico.style.animation = '';
    btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
    setTimeout(() => {
      btn.style.background = '';
      txt.textContent = 'Send Message';
      ico.className   = 'bi bi-send-fill';
    }, 3500);
    alert(msg);
  }
})();

/* ── Burst confetti particles ────────────────────────────────── */
function spawnBurst() {
  const wrap = document.getElementById('burstWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const colors = ['#D83675','#ff6baa','#a259ff','#22c55e','#f59e0b','#3b82f6'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('span');
    p.classList.add('burst-particle');
    const angle  = (i / 22) * 360;
    const dist   = 55 + Math.random() * 55;
    const size   = 5 + Math.random() * 7;
    const color  = colors[i % colors.length];
    const shape  = Math.random() > .45 ? '50%' : '2px';
    p.style.cssText = `
      --angle:${angle}deg;
      --dist:${dist}px;
      width:${size}px; height:${size}px;
      background:${color}; border-radius:${shape};
      position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%);
      animation:burst .75s cubic-bezier(.25,.46,.45,.94) ${i*.028}s both;
    `;
    wrap.appendChild(p);
  }
}

/* ── spin keyframe (injected once) ─────────────────────────── */
(function addSpinStyle() {
  if (document.getElementById('spinStyle')) return;
  const s = document.createElement('style');
  s.id = 'spinStyle';
  s.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes burst {
      0%   { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(0) scale(1); opacity:1; }
      80%  { opacity:1; }
      100% { transform: translate(-50%,-50%) rotate(var(--angle)) translateX(var(--dist)) scale(.3); opacity:0; }
    }
  `;
  document.head.appendChild(s);
})();

function showToast() {
  const t = document.getElementById('toast');
  if (!t) return;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4500);
}

/* ── PARALLAX blobs on scroll ───────────────────────────────── */
(function initParallax() {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.querySelectorAll('.hero-gradient').forEach(el => {
      el.style.transform = `translateY(${y * .12}px)`;
    });
  }, { passive: true });
})();

/* ── SWIPE GALLERY ───────────────────────────────────────────── */
(function initSwipeGallery() {
  const stage   = document.getElementById('swipeStage');
  if (!stage) return;

  const cards   = Array.from(stage.querySelectorAll('.scard'));
  const total   = cards.length;
  const dotsWrap= document.getElementById('swipeDots');
  const prevBtn = document.getElementById('swipePrev');
  const nextBtn = document.getElementById('swipeNext');
  const currEl  = document.getElementById('swipeCurrent');
  const totEl   = document.getElementById('swipeTotal');
  if (totEl) totEl.textContent = total;

  let current = 0;

  /* Build dots */
  const dots = [];
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'swipe-dot' + (i===0 ? ' active' : '');
      d.setAttribute('aria-label', `Go to project ${i+1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
      dots.push(d);
    });
  }

  /* Position classes */
  const POS = ['sc-far-prev','sc-prev','sc-active','sc-next','sc-far-next'];

  function getPos(cardIdx, currentIdx) {
    const diff = ((cardIdx - currentIdx) % total + total) % total;
    // diff: 0=active, 1=next, 2=far-next, ..., total-1=far-prev, total-2=prev
    if (diff === 0)            return 'sc-active';
    if (diff === 1)            return 'sc-next';
    if (diff === 2)            return 'sc-far-next';
    if (diff === total - 1)    return 'sc-prev';
    if (diff === total - 2)    return 'sc-far-prev';
    return 'sc-hidden';
  }

  function render(animateExit, dir) {
    cards.forEach((card, i) => {
      card.className = 'scard ' + getPos(i, current);
    });
    /* Update counter & dots */
    if (currEl) currEl.textContent = current + 1;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    render();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  /* Touch / mouse drag on active card */
  let dragStart = null, dragCurrent = 0, isDragging = false;

  function onDragStart(e) {
    const activeCard = stage.querySelector('.sc-active');
    if (!activeCard) return;
    dragStart    = (e.touches ? e.touches[0].clientX : e.clientX);
    dragCurrent  = 0;
    isDragging   = true;
    activeCard.classList.add('dragging');
  }
  function onDragMove(e) {
    if (!isDragging || dragStart === null) return;
    dragCurrent = (e.touches ? e.touches[0].clientX : e.clientX) - dragStart;
    const activeCard = stage.querySelector('.sc-active');
    if (activeCard) {
      activeCard.style.transform = `translateX(${dragCurrent}px) scale(1) rotate(${dragCurrent * 0.04}deg)`;
    }
  }
  function onDragEnd() {
    if (!isDragging) return;
    isDragging   = false;
    const activeCard = stage.querySelector('.sc-active');
    if (activeCard) {
      activeCard.style.transform = '';
      activeCard.classList.remove('dragging');
    }
    const THRESHOLD = 70;
    if (dragCurrent < -THRESHOLD) next();
    else if (dragCurrent > THRESHOLD) prev();
    dragStart   = null;
    dragCurrent = 0;
  }

  stage.addEventListener('mousedown',  onDragStart);
  stage.addEventListener('touchstart', onDragStart, { passive:true });
  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('touchmove', onDragMove, { passive:true });
  window.addEventListener('mouseup',   onDragEnd);
  window.addEventListener('touchend',  onDragEnd);

  /* Prevent clicking on non-active cards navigating away */
  cards.forEach((card, i) => {
    card.addEventListener('click', e => {
      if (!card.classList.contains('sc-active')) {
        e.preventDefault();
        e.stopPropagation();
        goTo(i);
      }
    });
  });

  /* Init */
  render();
})();

/* ── CHIP RAIN trigger ───────────────────────────────────────── */
(function initChipRain() {
  const wrap = document.getElementById('chipRain');
  if (!wrap) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      wrap.classList.add('rained');
      io.unobserve(wrap);
    });
  }, { threshold: .25 });
  io.observe(wrap);
})();