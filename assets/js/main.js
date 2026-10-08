/* =========================================================
   RAFI HAIDAR — Digital CV
   Renderer (dari content.json) + Interactions
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.remove("no-js");

  /* ============ Helpers ============ */
  const get = (obj, path) =>
    path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

  const ICONS = {
    blue: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
    violet: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.6L22 7H6"/></svg>',
    pink: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>',
  };

  /* ============ RENDER ============ */
  function render(C) {
    if (!C) return;

    /* meta */
    if (C.meta) {
      if (C.meta.title) document.title = C.meta.title;
      const md = $('meta[name="description"]');
      if (md && C.meta.description) md.setAttribute("content", C.meta.description);
    }

    /* generic scalar binding via data-cms / data-cms-html / data-cms-src / data-cms-href */
    $$("[data-cms]").forEach((el) => {
      const v = get(C, el.getAttribute("data-cms"));
      if (v != null && v !== "") el.textContent = v;
    });
    $$("[data-cms-html]").forEach((el) => {
      const v = get(C, el.getAttribute("data-cms-html"));
      if (v != null && v !== "") el.innerHTML = v;
    });
    $$("[data-cms-src]").forEach((el) => {
      const v = get(C, el.getAttribute("data-cms-src"));
      if (v) el.setAttribute("src", v);
    });
    $$("[data-cms-href]").forEach((el) => {
      const raw = get(C, el.getAttribute("data-cms-href"));
      if (!raw) return;
      const kind = el.getAttribute("data-cms-href-kind");
      el.setAttribute("href", kind === "mailto" ? "mailto:" + raw : raw);
      if (el.hasAttribute("data-cms-href-text")) el.textContent = raw;
    });

    /* brand (rafi.haidar) */
    const brandEl = $("[data-brand]");
    if (brandEl && C.profile && C.profile.brand) {
      const b = C.profile.brand;
      const i = b.indexOf(".");
      brandEl.innerHTML = i > -1 ? b.slice(0, i) + "<em>.</em>" + b.slice(i + 1) : b;
    }

    /* stats */
    const statsEl = $("#statsList");
    if (statsEl && C.stats) {
      statsEl.innerHTML = C.stats
        .map((s) => {
          const num =
            typeof s.value === "number"
              ? `<span data-count="${s.value}" data-decimals="${s.decimals || 0}" data-suffix="${s.suffix || ""}">0</span>`
              : s.value;
          return `<div class="stats__item${s.accent ? " stats__item--accent" : ""}">
            <div class="stats__num">${num}</div>
            <div class="stats__label">${s.label || ""}</div>
          </div>`;
        })
        .join("");
    }

    /* about */
    const parasEl = $("#aboutParagraphs");
    if (parasEl && C.about) parasEl.innerHTML = (C.about.paragraphs || []).map((p) => `<p>${p}</p>`).join("");
    const chipsEl = $("#aboutChips");
    if (chipsEl && C.about) chipsEl.innerHTML = (C.about.chips || []).map((c) => `<li>${c}</li>`).join("");
    const factsEl = $("#aboutFacts");
    if (factsEl && C.about)
      factsEl.innerHTML = (C.about.facts || [])
        .map((f) => `<li><span>${f.label}</span><strong class="${f.highlight ? "hl" : ""}">${f.value}</strong></li>`)
        .join("");

    /* expertise */
    const bentoEl = $("#bentoList");
    if (bentoEl && C.expertise) {
      bentoEl.innerHTML = (C.expertise.items || [])
        .map(
          (it, i) => `<article class="bento__card${it.wide ? " bento__card--wide" : ""} reveal" data-delay="${i * 80}">
            <div class="bento__icon bento__icon--${it.icon || "blue"}">${ICONS[it.icon] || ICONS.blue}</div>
            <h3>${it.title}</h3>
            <p>${it.descHtml || ""}</p>
            <div class="bento__tags">${(it.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>
          </article>`
        )
        .join("");
    }

    /* experience */
    const expEl = $("#expList");
    if (expEl && C.experience) {
      expEl.innerHTML = (C.experience.items || [])
        .map(
          (it) => `<li class="timeline__item reveal">
            <div class="timeline__dot"></div>
            <div class="timeline__card">
              <span class="timeline__date">${it.date}</span>
              <h3>${it.title}</h3>
              <p class="timeline__org">${it.org}</p>
              <ul>${(it.points || []).map((p) => `<li>${p}</li>`).join("")}</ul>
            </div>
          </li>`
        )
        .join("");
    }

    /* publications */
    const pubCountEl = $("#pubCounters");
    if (pubCountEl && C.publications) {
      pubCountEl.innerHTML = `<div class="pub__counter"><strong>${C.publications.journalCount}</strong><span>Jurnal Terbit</span></div>
        <div class="pub__counter"><strong>${C.publications.bookCount}</strong><span>Buku Nasional</span></div>`;
    }
    const pubEl = $("#pubList");
    if (pubEl && C.publications) {
      pubEl.innerHTML = (C.publications.items || [])
        .map(
          (it, i) => `<article class="pub reveal" data-delay="${i * 60}">
            <span class="pub__type${it.book ? " pub__type--book" : ""}">${it.type}</span>
            <h3>${it.title}</h3>
            <p class="pub__meta">${it.meta}</p>
          </article>`
        )
        .join("");
    }

    /* certifications */
    const certEl = $("#certList");
    if (certEl && C.certifications) {
      certEl.innerHTML = (C.certifications.items || [])
        .map(
          (it, i) => `<article class="cert reveal" data-delay="${i * 60}">
            <div class="cert__top"><span class="cert__badge">${it.badge}</span><span class="cert__level">${it.level}</span></div>
            <h3>${it.title}</h3>
            <p>${it.org}</p>
          </article>`
        )
        .join("");
    }

    /* portfolio */
    const projEl = $("#projectList");
    if (projEl && C.portfolio) {
      projEl.innerHTML = (C.portfolio.items || [])
        .map((it, i) => {
          const tagCls = it.tagColor && it.tagColor !== "blue" ? ` project__tag--${it.tagColor}` : "";
          const points = (it.points || []).length
            ? `<ul class="project__list">${it.points.map((p) => `<li>${p}</li>`).join("")}</ul>`
            : "";
          const talk = (it.talk || []).length
            ? `<ul class="project__talk">${it.talk.map((p) => `<li>${p}</li>`).join("")}</ul>`
            : "";
          const chips = (it.chips || []).length
            ? `<div class="chips">${it.chips.map((c) => `<span>${c}</span>`).join("")}</div>`
            : "";
          const handles = (it.handles || []).length
            ? `<div class="project__handles"><span class="project__handles-label">${it.handlesLabel || "Handle:"}</span><div class="handles">${it.handles
                .map((h) => `<span>${h}</span>`)
                .join("")}</div></div>`
            : "";
          return `<article class="project${it.wide ? " project--wide" : ""} reveal" data-delay="${i * 60}">
            <span class="project__tag${tagCls}">${it.tag}</span>
            <h3>${it.title}</h3>
            ${it.descHtml ? `<p class="project__desc">${it.descHtml}</p>` : ""}
            ${points}${talk}${chips}${handles}
          </article>`;
        })
        .join("");
    }

    /* business */
    const bizEl = $("#businessList");
    if (bizEl && C.business) {
      bizEl.innerHTML = (C.business.items || [])
        .map(
          (it, i) => `<article class="biz reveal" data-delay="${i * 80}">
            <div class="biz__logo"><img src="${it.logo}" alt="Logo ${it.name}" width="240" height="240" /></div>
            <div class="biz__body"><h3>${it.name}</h3><p>${it.desc}</p></div>
          </article>`
        )
        .join("");
    }

    /* gallery */
    const tabsEl = $("#galleryTabs");
    const panelsEl = $("#galleryPanels");
    if (C.gallery && C.gallery.groups) {
      const groups = C.gallery.groups;
      if (tabsEl)
        tabsEl.innerHTML = groups
          .map(
            (g, i) =>
              `<button class="gallery__tab${i === 0 ? " is-active" : ""}" data-tab="${g.id}" role="tab" aria-selected="${i === 0}">${g.label}</button>`
          )
          .join("");
      if (panelsEl)
        panelsEl.innerHTML = groups
          .map(
            (g, i) => `<div class="gallery__panel${i === 0 ? " is-active" : ""}" id="${g.id}" role="tabpanel"${i === 0 ? "" : " hidden"}>
              ${(g.images || [])
                .map(
                  (img) => `<figure class="gallery__item"><img src="${img.src}" alt="${img.alt}" loading="lazy" width="720" height="480" /></figure>`
                )
                .join("")}
            </div>`
          )
          .join("");
    }
  }

  /* ============ INIT INTERACTIONS ============ */
  function init(C) {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* --- Nav --- */
    const nav = $("#nav");
    const navLinks = $("#navLinks");
    const navToggle = $("#navToggle");
    const linkEls = $$("#navLinks a[href^='#']");

    const onScrollNav = () => nav && nav.classList.toggle("is-stuck", window.scrollY > 30);
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

    /* --- Progress + to top --- */
    const progress = $("#scrollProgress");
    const toTop = $("#toTop");
    const updateProgress = () => {
      if (!progress) return;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    };
    if (toTop) {
      toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
    }
    const toggleToTop = () => toTop && toTop.classList.toggle("is-visible", window.scrollY > 640);
    toggleToTop();

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

    /* --- Scrollspy --- */
    const sections = $$("main section[id]");
    if ("IntersectionObserver" in window) {
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
    }

    /* --- Reveal --- */
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

      const revealInView = () => {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        revealEls.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("is-visible");
        });
      };
      revealInView();
      setTimeout(revealInView, 400);
    }

    /* --- Counters --- */
    const counters = $$("[data-count]");
    const runCounter = (el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / 1500, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val).toString()) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!reduceMotion && counters.length && "IntersectionObserver" in window) {
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

    /* --- Typed roles --- */
    const typedEl = $("#typed");
    const phrases = (C && C.profile && C.profile.roles) || ["Dosen Sains Data"];
    if (typedEl) {
      if (reduceMotion) {
        typedEl.textContent = phrases[0];
      } else {
        let pi = 0, ci = 0, deleting = false;
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

    /* --- Cursor glow --- */
    const glow = $("#cursorGlow");
    if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let gx = window.innerWidth / 2, gy = window.innerHeight / 2, cx = gx, cy = gy;
      window.addEventListener("mousemove", (e) => { gx = e.clientX; gy = e.clientY; glow.style.opacity = "1"; }, { passive: true });
      document.addEventListener("mouseleave", () => (glow.style.opacity = "0"));
      const loop = () => {
        cx += (gx - cx) * 0.12;
        cy += (gy - cy) * 0.12;
        glow.style.transform = `translate(${cx - 230}px, ${cy - 230}px)`;
        requestAnimationFrame(loop);
      };
      loop();
    }

    /* --- Bento spotlight --- */
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

    /* --- Gallery tabs --- */
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

    /* --- Lightbox (delegation: aman walau galeri dirender ulang) --- */
    const lightbox = $("#lightbox");
    const lbImg = $("#lbImg");
    const lbCaption = $("#lbCaption");
    let current = [], index = 0;

    const renderLb = () => {
      const img = current[index];
      if (!img) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      lbCaption.textContent = `${img.alt || "Dokumentasi"} — ${index + 1}/${current.length}`;
    };
    const openLb = (imgs, i) => {
      current = imgs; index = i; renderLb();
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add("is-open"));
      document.body.style.overflow = "hidden";
      $("#lbClose") && $("#lbClose").focus();
    };
    const closeLb = () => {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => (lightbox.hidden = true), 320);
    };
    const stepLb = (dir) => {
      if (!current.length) return;
      index = (index + dir + current.length) % current.length;
      renderLb();
    };

    const panelsWrap = $("#galleryPanels");
    if (panelsWrap && lightbox) {
      panelsWrap.addEventListener("click", (e) => {
        const fig = e.target.closest(".gallery__item");
        if (!fig) return;
        const panel = fig.closest(".gallery__panel");
        const imgs = $$("img", panel);
        openLb(imgs, imgs.indexOf(fig.querySelector("img")));
      });
    }
    if (lightbox) {
      $("#lbClose") && $("#lbClose").addEventListener("click", closeLb);
      $("#lbPrev") && $("#lbPrev").addEventListener("click", () => stepLb(-1));
      $("#lbNext") && $("#lbNext").addEventListener("click", () => stepLb(1));
      lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLb(); });
      document.addEventListener("keydown", (e) => {
        if (lightbox.hidden) return;
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowLeft") stepLb(-1);
        if (e.key === "ArrowRight") stepLb(1);
      });
    }
  }

  /* ============ BOOT ============ */
  (async function boot() {
    let content = null;
    try {
      const res = await fetch("content.json", { cache: "no-cache" });
      if (res.ok) content = await res.json();
    } catch (e) {
      /* offline / file:// → pakai konten statis di HTML */
    }
    try {
      render(content);
    } catch (e) {
      console.warn("Render konten gagal, memakai konten statis:", e);
    }
    init(content);
  })();
})();
