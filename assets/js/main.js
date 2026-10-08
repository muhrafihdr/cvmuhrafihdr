/* =========================================================
   RAFI HAIDAR — Gen-Z Digital CV
   Interactions & animations
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");

  /* ---- Year in footer ---- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Toast-free smooth anchor offset handled by CSS scroll-padding ---- */

  /* ============ 1. NAV: stuck, mobile menu, scrollspy ============ */
  const nav = $("#nav");
  const navLinks = $("#navLinks");
  const navToggle = $("#navToggle");
  const linkEls = $$("#navLinks a[href^='#']");

  const onScrollNav = () => {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 30);
  };
  onScrollNav();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });

    linkEls.forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ============ 2. SCROLL PROGRESS ============ */
  const progress = $("#scrollProgress");
  const updateProgress = () => {
    if (!progress) return;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + "%";
  };

  /* ============ 3. BACK TO TOP ============ */
  const toTop = $("#toTop");
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    }
  const toggleToTop = () => {
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 640);
  };
  toggleToTop();

  /* Throttled scroll listener */
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScrollNav();
        updateProgress();
        toggleToTop();
        ticking = false;
      });
    },
    { passive: true }
  );
  updateProgress();

  /* ============ 4. SCROLLSPY ============ */
  const sections = $$("main section[id]");
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        linkEls.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id && !a.classList.contains("nav__cta"))
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));

  /* ============ 5. REVEAL ON SCROLL ============ */
  const revealEls = $$(".reveal");
  revealEls.forEach((el) => {
    const d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", d + "ms");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => revealObs.observe(el));

    // Jaring pengaman: pastikan elemen yang sudah ada di viewport saat load tetap tampil
    const revealInView = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("is-visible");
      });
    };
    window.addEventListener("load", () => {
      revealInView();
      setTimeout(revealInView, 400);
    });
    if (document.readyState === "complete") revealInView();
  }

  /* ============ 6. COUNTERS ============ */
  const counters = $$("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1500;
    const start = performance.now();

    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent =
        (decimals ? val.toFixed(decimals) : Math.round(val).toString()) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!reduceMotion && counters.length) {
    const cObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cObs.observe(c));
  } else {
    counters.forEach((el) => {
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const v = parseFloat(el.getAttribute("data-count"));
      el.textContent = (decimals ? v.toFixed(decimals) : v.toString()) + suffix;
    });
  }

  /* ============ 7. TYPED ROLE TEXT ============ */
  const typedEl = $("#typed");
  if (typedEl) {
    const phrases = [
      "Dosen Sains Data",
      "Digital Strategist",
      "AI & Machine Learning Researcher",
      "Tech Educator & Speaker",
      "Marketplace Analyst",
    ];
    if (reduceMotion) {
      typedEl.textContent = phrases[0];
    } else {
      let pi = 0;
      let ci = 0;
      let deleting = false;

      const tick = () => {
        const word = phrases[pi];
        if (!deleting) {
          ci++;
          typedEl.textContent = word.slice(0, ci);
          if (ci === word.length) {
            deleting = true;
            return setTimeout(tick, 1700);
          }
          return setTimeout(tick, 62);
        }
        ci--;
        typedEl.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          return setTimeout(tick, 320);
        }
        return setTimeout(tick, 32);
      };
      setTimeout(tick, 500);
    }
  }

  /* ============ 8. CURSOR GLOW ============ */
  const glow = $("#cursorGlow");
  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let cx = gx;
    let cy = gy;

    window.addEventListener(
      "mousemove",
      (e) => {
        gx = e.clientX;
        gy = e.clientY;
        glow.style.opacity = "1";
      },
      { passive: true }
    );
    document.addEventListener("mouseleave", () => (glow.style.opacity = "0"));

    const loop = () => {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate(${cx - 230}px, ${cy - 230}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ============ 9. BENTO SPOTLIGHT ============ */
  $$(".bento__card").forEach((card) => {
    card.addEventListener(
      "mousemove",
      (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      },
      { passive: true }
    );
  });

  /* ============ 10. GALLERY TABS ============ */
  const tabs = $$(".gallery__tab");
  const panels = $$(".gallery__panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      panels.forEach((p) => {
        const active = p.id === id;
        p.classList.toggle("is-active", active);
        p.hidden = !active;
      });
    });
  });

  /* ============ 11. LIGHTBOX ============ */
  const lightbox = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbCaption = $("#lbCaption");
  const lbClose = $("#lbClose");
  const lbPrev = $("#lbPrev");
  const lbNext = $("#lbNext");

  let current = [];
  let index = 0;

  const openLightbox = (imgs, i) => {
    current = imgs;
    index = i;
    render();
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    lbClose && lbClose.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => (lightbox.hidden = true), 320);
  };

  const render = () => {
    const img = current[index];
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt || "";
    lbCaption.textContent = `${img.alt || "Dokumentasi"} — ${index + 1}/${current.length}`;
  };

  const step = (dir) => {
    if (!current.length) return;
    index = (index + dir + current.length) % current.length;
    render();
  };

  $$(".gallery__panel").forEach((panel) => {
    const imgs = $$("img", panel);
    imgs.forEach((img, i) => {
      const fig = img.closest(".gallery__item");
      if (fig) fig.addEventListener("click", () => openLightbox(imgs, i));
    });
  });

  if (lightbox) {
    lbClose && lbClose.addEventListener("click", closeLightbox);
    lbPrev && lbPrev.addEventListener("click", () => step(-1));
    lbNext && lbNext.addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }
})();
