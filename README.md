# 🌐 rafihaidar.my.id — Digital CV

Landing page Curriculum Vitae dengan desain **Gen Z / modern** untuk
**Muhammad Rafi Haidar Arsyad (M.Kom)** — Dosen Sains Data & Digital Strategist.

Dibangun sebagai **static site** (HTML + CSS + JS murni, tanpa build step) sehingga
langsung bisa di-hosting di **GitHub Pages**.

---

## ✨ Fitur

- **Desain Gen Z**: dark theme, gradien neon (lime/violet/pink/cyan), grain texture, glow cursor.
- **Animasi**: reveal on scroll, animated counters, typing effect, marquee, floating blobs, parallax tilt.
- **Bento grid** untuk Core Expertise.
- **Timeline karir** interaktif.
- **Galeri bertab** dengan **lightbox** (navigasi keyboard ← → dan Esc).
- **Full responsive** (mobile, tablet, desktop) + dukungan `prefers-reduced-motion`.
- **SEO**: meta tags, Open Graph, Twitter Card, JSON-LD `Person`, `sitemap.xml`, `robots.txt`.
- **404 page**, **CNAME** untuk domain kustom, `.nojekyll`.

## 📁 Struktur

```
.
├── index.html            # Halaman utama
├── 404.html              # Halaman error
├── CNAME                 # Domain kustom → rafihaidar.my.id
├── robots.txt
├── sitemap.xml
├── .nojekyll
└── assets
    ├── css/style.css
    ├── js/main.js
    └── img/              # Foto profil, logo bisnis, dokumentasi galeri
```

## 🚀 Deploy ke GitHub Pages

```bash
git init
git add .
git commit -m "feat: landing page CV Gen Z"
git branch -M main
git remote add origin https://github.com/muhrafihdr/cvmuhrafihdr.git
git push -u origin main
```

Lalu di GitHub repo → **Settings → Pages**:
- **Source**: `Deploy from a branch`
- **Branch**: `main` / **folder** `/(root)` → **Save**

Situs akan aktif di `https://muhrafihdr.github.io/cvmuhrafihdr/`.

## 🌍 Menghubungkan domain `rafihaidar.my.id`

File `CNAME` sudah berisi `rafihaidar.my.id`.

### Di GitHub
**Settings → Pages → Custom domain** → isi `rafihaidar.my.id` → **Save** →
centang **Enforce HTTPS**.

### Di DNS provider (tempat domain dibeli)
Tambahkan record berikut:

| Type  | Name  | Value                    |
|-------|-------|--------------------------|
| A     | `@`   | `185.199.108.153`        |
| A     | `@`   | `185.199.109.153`        |
| A     | `@`   | `185.199.110.153`        |
| A     | `@`   | `185.199.111.153`        |
| CNAME | `www` | `muhrafihdr.github.io.`  |

> Propagasi DNS bisa memakan waktu hingga 24 jam. Setelah itu HTTPS akan
> terbit otomatis.

## 🖥️ Pratinjau lokal

```bash
python3 -m http.server 8080
# buka http://localhost:8080
```

## ✏️ Kustomisasi

- **Warna & tema**: ubah CSS variables di bagian `:root` pada `assets/css/style.css`.
- **Konten**: edit langsung teks pada `index.html` (data terstruktur per section).
- **Foto/galeri**: ganti file di `assets/img/` dengan nama yang sama.

---

© 2026 Muhammad Rafi Haidar Arsyad. All Rights Reserved.
