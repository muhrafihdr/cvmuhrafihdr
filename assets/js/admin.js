/* =========================================================
   Admin Panel — editor konten + simpan ke GitHub
   ========================================================= */
(function () {
  "use strict";

  const CFG = { owner: "muhrafihdr", repo: "cvmuhrafihdr", branch: "main", path: "content.json" };
  const API = "https://api.github.com";
  const TOKEN_KEY = "cv_admin_token";

  const SECTIONS = [
    { key: "meta", label: "SEO & Meta", ico: "🏷️" },
    { key: "profile", label: "Profil & Hero", ico: "👤" },
    { key: "stats", label: "Statistik", ico: "📈" },
    { key: "about", label: "Tentang", ico: "📝" },
    { key: "expertise", label: "Keahlian", ico: "🧠" },
    { key: "experience", label: "Timeline Karir", ico: "💼" },
    { key: "publications", label: "Publikasi", ico: "📚" },
    { key: "certifications", label: "Sertifikasi", ico: "🎖️" },
    { key: "portfolio", label: "Portofolio", ico: "🚀" },
    { key: "business", label: "Bisnis", ico: "🏪" },
    { key: "gallery", label: "Galeri", ico: "🖼️" },
    { key: "contact", label: "Kontak", ico: "✉️" },
    { key: "footer", label: "Footer", ico: "🔻" },
  ];

  const $ = (s, c = document) => c.querySelector(s);

  let token = localStorage.getItem(TOKEN_KEY) || "";
  let content = null;
  let active = "profile";
  let busy = false;

  /* ---------- utils ---------- */
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const b64 = (str) => {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  };
  const unb64 = (s) => {
    const bin = atob(String(s).replace(/\n/g, ""));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const humanize = (k) =>
    k
      .replace(/Html$/, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const isHtmlKey = (k) => /Html$/.test(k);
  const looksHtml = (s) => typeof s === "string" && /<\w+[^>]*>/.test(s);

  const toast = (msg, type = "") => {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast is-show" + (type ? " " + type : "");
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      t.classList.remove("is-show");
      setTimeout(() => (t.hidden = true), 300);
    }, 4200);
  };

  const setStatus = (text, type) => {
    const el = $("#connState");
    el.textContent = text;
    el.className = "pill " + (type === "ok" ? "is-ok" : type === "warn" ? "is-warn" : type === "err" ? "is-err" : "");
  };

  /* ---------- GitHub ---------- */
  async function gh(path, opts = {}) {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.headers || {}),
    };
    if (token) headers.Authorization = "Bearer " + token;
    const res = await fetch(API + path, { ...opts, headers });
    if (!res.ok) {
      let detail = "";
      try {
        detail = (await res.json()).message || "";
      } catch (e) {}
      throw new Error(`${res.status}${detail ? " — " + detail : ""}`);
    }
    return res.json();
  }

  const fileUrl = (ref) => `/repos/${CFG.owner}/${CFG.repo}/contents/${CFG.path}${ref ? "?ref=" + ref : ""}`;

  async function loadFromGitHub() {
    const info = await gh(fileUrl(CFG.branch));
    const json = JSON.parse(unb64(info.content));
    return { json, sha: info.sha };
  }

  async function loadFromSite() {
    const res = await fetch("content.json?t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return { json: await res.json(), sha: "" };
  }

  /* ---------- boot / load ---------- */
  async function boot() {
    if (token) {
      try {
        const user = await gh("/user");
        setStatus("Login: " + (user.login || "ok"), "ok");
        const { json } = await loadFromGitHub();
        content = json;
        afterLoad();
        return;
      } catch (e) {
        setStatus("Token gagal: " + e.message, "err");
        token = "";
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    try {
      const { json } = await loadFromSite();
      content = json;
      setStatus("Pratinjau (belum login)", "warn");
      afterLoad();
    } catch (e) {
      setStatus("Gagal memuat konten: " + e.message, "err");
      toast("Tidak bisa memuat content.json. Buka halaman ini dari server/live site, bukan file://.", "is-err");
    }
  }

  function afterLoad() {
    syncLoginUI();
    renderNav();
    renderEditor();
  }

  function syncLoginUI() {
    const box = $("#loginBox");
    box.classList.toggle("is-authed", !!token);
    const input = $("#tokenInput");
    if (token) input.value = "";
  }

  /* ---------- nav ---------- */
  function renderNav() {
    const nav = $("#sectionNav");
    nav.innerHTML = SECTIONS.map(
      (s) => `<button type="button" data-key="${s.key}" class="${s.key === active ? "is-active" : ""}">
        <span class="ico">${s.ico}</span> ${s.label}
      </button>`
    ).join("");
    nav.querySelectorAll("button").forEach((b) =>
      b.addEventListener("click", () => {
        active = b.getAttribute("data-key");
        nav.querySelectorAll("button").forEach((x) => x.classList.toggle("is-active", x === b));
        renderEditor();
      })
    );
  }

  /* ---------- editor ---------- */
  function renderEditor() {
    const meta = SECTIONS.find((s) => s.key === active);
    $("#sectionTitle").textContent = meta ? meta.label : "Konten";
    $("#sectionHint").textContent = hintFor(active);

    const form = $("#editorForm");
    form.innerHTML = "";
    if (!content) {
      form.innerHTML = '<p class="empty">Konten belum dimuat.</p>';
      return;
    }
    const value = content[active];
    if (value === undefined) {
      form.innerHTML = '<p class="empty">Bagian ini tidak ada di content.json.</p>';
      return;
    }
    if (isPlainObject(value)) {
      Object.keys(value).forEach((k) => form.appendChild(buildField(value, k)));
    } else if (Array.isArray(value)) {
      form.appendChild(buildArray(value, active));
    }
  }

  function hintFor(key) {
    const h = {
      meta: "Judul & deskripsi untuk Google dan saat link dibagikan.",
      profile: "Nama, sapaan, daftar peran (efek mengetik), dan foto.",
      stats: "Angka statistik di bawah hero. Kolom nilai boleh angka atau teks (mis. \"AI\").",
      about: "Paragraf, chip keahlian, dan kartu profil singkat. Kolom bertanda HTML boleh memakai tag seperti <strong>.",
      expertise: "Kartu keahlian. Ikon: blue / violet / pink.",
      experience: "Riwayat pekerjaan. Urutan teratas tampil paling atas.",
      publications: "Buku & jurnal. Centang \"book\" untuk menandai buku.",
      certifications: "Daftar sertifikasi.",
      portfolio: "Kartu proyek. Bisa berisi daftar poin, chip, talk, atau handles.",
      business: "Unit bisnis beserta logo.",
      gallery: "Tab galeri & daftar fotonya.",
      contact: "Email (tanpa mailto:) dan nomor WhatsApp.",
      footer: "Nama & peran pada footer.",
    };
    return h[key] || "";
  }

  const isPlainObject = (v) => v && typeof v === "object" && !Array.isArray(v);

  function buildField(parent, key) {
    const val = parent[key];
    const wrap = document.createElement("div");
    wrap.className = "field";

    const lab = document.createElement("label");
    lab.innerHTML = humanize(key) + (isHtmlKey(key) ? ' <span class="tag">HTML</span>' : "");
    wrap.appendChild(lab);

    if (typeof val === "boolean") {
      const sw = document.createElement("label");
      sw.className = "switch";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = val;
      cb.addEventListener("change", () => (parent[key] = cb.checked));
      sw.appendChild(cb);
      sw.appendChild(document.createTextNode(val ? "Aktif" : "Nonaktif"));
      cb.addEventListener("change", () => (sw.lastChild.textContent = cb.checked ? "Aktif" : "Nonaktif"));
      wrap.appendChild(sw);
      return wrap;
    }

    if (typeof val === "number") {
      const inp = document.createElement("input");
      inp.type = "number";
      inp.value = val;
      inp.step = "any";
      inp.addEventListener("input", () => (parent[key] = inp.value === "" ? 0 : Number(inp.value)));
      wrap.appendChild(inp);
      return wrap;
    }

    if (typeof val === "string") {
      const useArea = isHtmlKey(key) || looksHtml(val) || val.length > 90 || val.includes("\n");
      const inp = document.createElement(useArea ? "textarea" : "input");
      if (!useArea) inp.type = "text";
      inp.value = val;
      inp.addEventListener("input", () => (parent[key] = inp.value));
      wrap.appendChild(inp);

      if (["photo", "logo", "src"].includes(key)) {
        const img = document.createElement("img");
        img.src = val;
        img.alt = "";
        img.style.cssText = "max-height:90px;border-radius:10px;margin-top:6px;align-self:flex-start;border:1px solid var(--line)";
        img.onerror = () => (img.style.display = "none");
        inp.addEventListener("input", () => {
          img.style.display = "";
          img.src = inp.value;
        });
        wrap.appendChild(img);
      }
      return wrap;
    }

    if (Array.isArray(val)) {
      wrap.appendChild(buildArray(val, key));
      return wrap;
    }

    if (isPlainObject(val)) {
      const g = document.createElement("div");
      g.className = "group";
      Object.keys(val).forEach((k) => g.appendChild(buildField(val, k)));
      wrap.appendChild(g);
      return wrap;
    }

    return wrap;
  }

  function buildArray(arr, key) {
    const g = document.createElement("div");
    g.className = "group";

    const isObjArr = arr.length > 0 && arr.every(isPlainObject);
    const isSimple = arr.every((v) => typeof v === "string" || typeof v === "number");

    const title = document.createElement("div");
    title.className = "group__title";
    title.innerHTML = `<span>${humanize(key)} <span class="count">(${arr.length})</span></span>`;
    g.appendChild(title);

    const list = document.createElement("div");
    list.style.cssText = "display:flex;flex-direction:column;gap:12px";
    g.appendChild(list);

    if (isObjArr || (arr.length === 0 && /items|groups|images|facts|stats/i.test(key))) {
      arr.forEach((item, i) => list.appendChild(buildItem(arr, item, i, key)));
      g.appendChild(addButton("+ Tambah " + humanize(key).replace(/s$/, ""), () => {
        const tpl = arr.length ? JSON.parse(JSON.stringify(arr[0])) : {};
        resetTemplate(tpl);
        arr.push(tpl);
        renderEditor();
      }));
    } else if (isSimple) {
      arr.forEach((v, i) => list.appendChild(buildSimpleItem(arr, i, key)));
      g.appendChild(addButton("+ Tambah " + humanize(key).replace(/s$/, ""), () => {
        arr.push("");
        renderEditor();
      }));
    } else {
      const ta = document.createElement("textarea");
      ta.value = JSON.stringify(arr, null, 2);
      ta.style.minHeight = "160px";
      ta.addEventListener("input", () => {
        try {
          const parsed = JSON.parse(ta.value);
          arr.length = 0;
          parsed.forEach((x) => arr.push(x));
          ta.style.borderColor = "";
        } catch (e) {
          ta.style.borderColor = "#ff6b8a";
        }
      });
      wrapAppend(g, ta);
    }

    return g;
  }

  function buildItem(arr, item, i, key) {
    const box = document.createElement("div");
    box.className = "item";

    const head = document.createElement("div");
    head.className = "item__head";
    const num = document.createElement("span");
    num.className = "item__num";
    num.textContent = "#" + (i + 1) + (item.title ? " · " + String(item.title).slice(0, 40) : "");
    head.appendChild(num);

    const tools = document.createElement("div");
    tools.className = "item__tools";
    tools.appendChild(iconBtn("↑", "Naik", () => move(arr, i, -1)));
    tools.appendChild(iconBtn("↓", "Turun", () => move(arr, i, 1)));
    tools.appendChild(iconBtn("✕", "Hapus", () => { arr.splice(i, 1); renderEditor(); }, true));
    head.appendChild(tools);
    box.appendChild(head);

    const fields = document.createElement("div");
    fields.style.cssText = "display:flex;flex-direction:column;gap:12px";
    Object.keys(item).forEach((k) => fields.appendChild(buildField(item, k)));
    box.appendChild(fields);

    return box;
  }

  function buildSimpleItem(arr, i, key) {
    const box = document.createElement("div");
    box.className = "item";
    const head = document.createElement("div");
    head.className = "item__head";
    const num = document.createElement("span");
    num.className = "item__num";
    num.textContent = "#" + (i + 1);
    head.appendChild(num);
    const tools = document.createElement("div");
    tools.className = "item__tools";
    tools.appendChild(iconBtn("↑", "Naik", () => move(arr, i, -1)));
    tools.appendChild(iconBtn("↓", "Turun", () => move(arr, i, 1)));
    tools.appendChild(iconBtn("✕", "Hapus", () => { arr.splice(i, 1); renderEditor(); }, true));
    head.appendChild(tools);
    box.appendChild(head);

    const useArea = looksHtml(arr[i]) || String(arr[i]).length > 90;
    const inp = document.createElement(useArea ? "textarea" : "input");
    if (!useArea) inp.type = "text";
    inp.value = arr[i];
    inp.addEventListener("input", () => (arr[i] = inp.value));
    box.appendChild(inp);
    return box;
  }

  function wrapAppend(g, node) {
    g.appendChild(node);
  }

  function move(arr, i, dir) {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    renderEditor();
  }

  function iconBtn(txt, title, fn, danger) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "icon-btn" + (danger ? " icon-btn--danger" : "");
    b.title = title;
    b.textContent = txt;
    b.addEventListener("click", fn);
    return b;
  }

  function addButton(text, fn) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn btn--add";
    b.textContent = text;
    b.addEventListener("click", fn);
    return b;
  }

  function resetTemplate(obj) {
    Object.keys(obj).forEach((k) => {
      const v = obj[k];
      if (typeof v === "string") obj[k] = "";
      else if (typeof v === "number") obj[k] = 0;
      else if (typeof v === "boolean") obj[k] = false;
      else if (Array.isArray(v)) obj[k] = [];
    });
  }

  /* ---------- save ---------- */
  async function save() {
    if (busy) return;
    if (!content) return;
    if (!token) {
      toast("Login dulu dengan GitHub token untuk menyimpan.", "is-err");
      return;
    }
    busy = true;
    $("#btnSave").disabled = true;
    setStatus("Menyimpan…", "warn");
    try {
      const json = JSON.stringify(content, null, 2) + "\n";
      const info = await gh(fileUrl(CFG.branch)); // ambil sha terbaru
      await gh(fileUrl(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "content: update via admin panel (" + new Date().toISOString().slice(0, 16).replace("T", " ") + ")",
          content: b64(json),
          sha: info.sha,
          branch: CFG.branch,
        }),
      });
      setStatus("Tersimpan ✓", "ok");
      toast("✅ Berhasil disimpan! Situs akan ter-update otomatis dalam ±1 menit.", "is-ok");
    } catch (e) {
      setStatus("Gagal menyimpan", "err");
      toast("Gagal menyimpan: " + e.message, "is-err");
    } finally {
      busy = false;
      $("#btnSave").disabled = false;
    }
  }

  /* ---------- auth ---------- */
  async function login() {
    const val = $("#tokenInput").value.trim();
    if (!val) return toast("Masukkan token terlebih dahulu.", "is-err");
    token = val;
    setStatus("Memverifikasi…", "warn");
    try {
      const user = await gh("/user");
      localStorage.setItem(TOKEN_KEY, token);
      setStatus("Login: " + user.login, "ok");
      toast("Berhasil login sebagai " + user.login, "is-ok");
      const { json } = await loadFromGitHub();
      content = json;
      syncLoginUI();
      renderEditor();
    } catch (e) {
      token = "";
      localStorage.removeItem(TOKEN_KEY);
      setStatus("Token tidak valid", "err");
      toast("Token tidak valid / tanpa akses: " + e.message, "is-err");
    }
  }

  function logout() {
    token = "";
    localStorage.removeItem(TOKEN_KEY);
    setStatus("Pratinjau (belum login)", "warn");
    syncLoginUI();
    toast("Berhasil keluar. Perubahan belum tersimpan tidak akan dikirim.", "");
  }

  /* ---------- events ---------- */
  $("#btnLogin").addEventListener("click", login);
  $("#btnLogout").addEventListener("click", logout);
  $("#btnSave").addEventListener("click", save);
  $("#btnReload").addEventListener("click", boot);
  $("#btnPreview").addEventListener("click", () => window.open("index.html", "_blank"));
  $("#tokenInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") login();
  });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save();
    }
  });
  window.addEventListener("beforeunload", (e) => {
    if (busy) return;
    // tidak memblokir; hanya pengingat halus
  });

  boot();
})();
