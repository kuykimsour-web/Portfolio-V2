/* ==========================================================================
   Kimsour Kuy — Portfolio interactions
   Vanilla JS only. No frameworks, no external libraries.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------- Theme switcher (persisted via localStorage) ---------------- */
  const THEME_KEY = "kk-portfolio-theme";
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      themeToggle.setAttribute("aria-pressed", "true");
    } else {
      root.removeAttribute("data-theme");
      themeToggle.setAttribute("aria-pressed", "false");
    }
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  applyTheme(getPreferredTheme());

  themeToggle.addEventListener("click", function () {
    const isLight = root.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ---------------- Mobile navigation ---------------- */
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  function closeMenu() {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
  }

  hamburger.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------------- Sticky header state + scroll progress + back-to-top ---------------- */
  const siteHeader = document.getElementById("siteHeader");
  const scrollProgress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    scrollProgress.style.width = progress + "%";
    siteHeader.classList.toggle("scrolled", scrollTop > 8);
    backToTop.classList.toggle("visible", scrollTop > 480);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------------- Active section highlighting (scroll spy) ---------------- */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navMap = new Map();
  document.querySelectorAll(".nav-link").forEach(function (link) {
    navMap.set(link.dataset.section, link);
  });

  const spyObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        const link = navMap.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          document.querySelectorAll(".nav-link").forEach(function (l) {
            l.classList.remove("active");
          });
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    spyObserver.observe(section);
  });

  /* ---------------- Scroll reveal animations ---------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------------- Animated skill bars ---------------- */
  const skillCards = document.querySelectorAll(".skill-card");
  const skillObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const fill = card.querySelector(".skill-bar-fill");
        const percentEl = card.querySelector(".skill-percent");
        const target = parseInt(fill.dataset.width, 10);

        fill.style.width = target + "%";
        animateCount(percentEl, target, "%");

        observer.unobserve(card);
      });
    },
    { threshold: 0.3 }
  );
  skillCards.forEach(function (card) {
    skillObserver.observe(card);
  });

  /* ---------------- Animated stat counters ---------------- */
  function animateCount(el, target, suffix, duration) {
    suffix = suffix || "";
    duration = duration || 1200;
    const start = 0;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(start + (target - start) * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statEls = document.querySelectorAll(".stat-number");
  const statObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCount(el, target, "", 1500);
        observer.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );
  statEls.forEach(function (el) {
    statObserver.observe(el);
  });

  /* ---------------- Typing animation for hero name (if present) ---------------- */
  const typedNameEl = document.getElementById("typedName");
  if (typedNameEl) {
    const FULL_NAME = "Kimsour ";
    function typeName() {
      let i = 0;
      typedNameEl.textContent = "";
      const interval = setInterval(function () {
        i += 1;
        typedNameEl.textContent = FULL_NAME.slice(0, i);
        if (i >= FULL_NAME.length) clearInterval(interval);
      }, 90);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      typedNameEl.textContent = FULL_NAME;
    } else {
      typeName();
    }
  }

  /* ---------------- Profile image fallback (no image required) ---------------- */
  const profileImg = document.getElementById("profileImg");
  profileImg.addEventListener("error", function () {
    profileImg.replaceWith(buildFallbackAvatar());
  });

  function buildFallbackAvatar() {
    const div = document.createElement("div");
    div.className = "profile-img";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.background = "linear-gradient(145deg, var(--surface-2), var(--surface))";
    div.style.borderRadius = "50%";
    div.style.overflow = "hidden";
    div.style.width = "420px";
    div.style.height = "420px";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 128 128");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.innerHTML = `
      <circle cx="64" cy="64" r="64" fill="var(--surface)" opacity="0.1" />
      <path d="M64 68c14 0 26-8 26-20s-12-20-26-20-26 8-26 20 12 20 26 20zm0 10c-16 0-46 8-46 24v6h92v-6c0-16-30-24-46-24z" fill="var(--text-muted)" />
    `;

    div.appendChild(svg);
    return div;
  }

  /* ---------------- Decorative hero data-stream canvas (signature element) ---------------- */
  const heroCanvasHost = document.getElementById("heroCanvas");
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  heroCanvasHost.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let nodes = [];
  let animId = null;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resizeCanvas() {
    const rect = heroCanvasHost.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    initNodes(rect.width, rect.height);
  }

  function initNodes(w, h) {
    const count = w < 700 ? 24 : 46;
    nodes = new Array(count).fill(null).map(function () {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      };
    });
  }

  function getCSSColor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function drawFrame() {
    const rect = heroCanvasHost.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    const lineColor = getCSSColor("--teal") || "#2DD4BF";
    const dotColor = getCSSColor("--gold") || "#C9A227";

    nodes.forEach(function (n) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.strokeStyle = lineColor;
          ctx.globalAlpha = (1 - dist / 140) * 0.18;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 0.7;
    nodes.forEach(function (n) {
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    animId = requestAnimationFrame(drawFrame);
  }

  if (!reduceMotion) {
    resizeCanvas();
    drawFrame();
    window.addEventListener("resize", resizeCanvas);
  }

  /* ---------------- Contact form validation ---------------- */
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const submitButton = form.querySelector('button[type="submit"]');

  function setError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + "Error");
    const row = document.getElementById(fieldId).closest(".form-row");
    errorEl.textContent = message || "";
    row.classList.toggle("has-error", Boolean(message));
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    let valid = true;

    if (name.length < 2) {
      setError("name", "Please enter your name.");
      valid = false;
    } else {
      setError("name", "");
    }

    if (!isValidEmail(email)) {
      setError("email", "Please enter a valid email address.");
      valid = false;
    } else {
      setError("email", "");
    }

    if (message.length < 10) {
      setError("message", "Message should be at least 10 characters.");
      valid = false;
    } else {
      setError("message", "");
    }

    if (!valid) {
      formStatus.textContent = "Please fix the errors above.";
      formStatus.style.color = "#E06666";
      return;
    }

    if (form.action.includes("YOUR_FORM_ID")) {
      formStatus.style.color = "#E06666";
      formStatus.textContent = "Please add your Formspree form ID before sending messages.";
      return;
    }

    submitButton.disabled = true;
    formStatus.style.color = "";
    formStatus.textContent = "Sending your message...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Message could not be sent.");

      formStatus.style.color = "#1b8f5a";
      formStatus.textContent = "Thank you, " + name.split(" ")[0] + "! Your message has been sent.";
      form.reset();
    } catch (error) {
      formStatus.style.color = "#E06666";
      formStatus.textContent = "Sorry, your message could not be sent. Please try again later.";
    } finally {
      submitButton.disabled = false;
    }
  });

  /* ---------------- Footer year ---------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
