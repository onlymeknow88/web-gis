# UI Improvement Plan — Web-GIS
**Pendekatan:** Bertahap — Phase 1: Dashboard Admin, Phase 2: Map Live

---

## Konteks & Gap Analysis

### Referensi Visual
- `contoh/index.html` → target mockup Admin Dashboard
- `contoh/maplive.html` → target mockup Map Live

### Stack
React 18 + Inertia.js 2 + TailwindCSS 3 + Lucide Icons + shadcn/ui. Semua warna sudah tersedia di `tailwind.config.js` (Material Design tokens).

---

## PHASE 1 — Admin Dashboard

### Gap yang ditemukan

| Komponen | Kondisi Saat Ini | Target (index.html) |
|---|---|---|
| `DashboardHeader` | Greeting statis bahasa Inggris, tanpa tanggal | Greeting dengan nama user ("Selamat datang, Admin!") + date pill kanan |
| `DashboardStats` | 3 card (layers, markers, users) — grid `sm:grid-cols-3` | 4 card — tambah **"Aktivitas Hari Ini"** dari `stats.activity_today` |
| `Dashboard.jsx` | `DashboardChart` dan `DashboardRecentLogs` di-comment-out | Uncomment + aktifkan layout `grid-cols-3` (chart 2/3, logs 1/3) |
| `Dashboard.jsx` | Tidak ada panel "Peta Preview" dan "Informasi Sistem" | Tambah 2 panel baru di bawah chart/logs |
| `Sidebar` (admin) | `bg-surface-container`, nav item active: `bg-primary-container text-white` | `bg-white`, active state: `bg-primary text-on-primary` (sesuai mockup `.nav-item.active`) |
| `Sidebar` | Tidak ada user chip di footer | Tambah user chip (avatar + nama + role) di bagian bawah sidebar |
| `Navbar` | Logo sangat tinggi `h-20`, tanpa breadcrumb | Logo `h-8` atau `h-10`, tambah breadcrumb di sisi kiri setelah logo |

### Tasks Phase 1

#### T1 — `DashboardHeader.jsx`
- Terima prop `user` dari `Dashboard.jsx` (sudah tersedia via Inertia `auth.user`)
- Tampilkan: `"Selamat datang, {user.name}!"` + subtitle deskripsi
- Tambah **date pill** di kanan: tanggal hari ini (format: `25 Juli 2026, Sabtu`)
  ```jsx
  // date pill style sesuai mockup
  className="flex items-center gap-2 px-3 py-2 bg-white border border-outline-variant rounded-full text-sm font-medium"
  ```

#### T2 — `DashboardStats.jsx`
- Ubah grid dari `sm:grid-cols-3` → `sm:grid-cols-2 lg:grid-cols-4`
- Tambah card ke-4: **Aktivitas Hari Ini** (icon: `Activity`, warna bg: `#fdead2`, warna icon: `#a13f00`)
  - Value: `stats.activity_today` (perlu ditambahkan di backend `DashboardController`)
- Seragamkan style card: `bg-white border border-outline-variant rounded-sm p-5 flex items-start gap-3`
- Icon container: `w-12 h-12 rounded-full flex items-center justify-center` (lingkaran, bukan rounded-xl)
- Stat value: `text-[26px] font-extrabold`
- Trend indicator: badge kecil hijau dengan arrow-up + persentase

#### T3 — `Dashboard.jsx` — Uncomment & Layout
- Pass `user` prop ke `DashboardHeader`
- Uncomment `DashboardChart` dan `DashboardRecentLogs`
- Layout grid section: `grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4` (chart lebih lebar)
- Tambah row ketiga: `grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4` untuk panel baru

#### T4 — `DashboardChart.jsx`
- Bar chart sudah ada, sesuaikan styling:
  - Container: `bg-white border border-outline-variant rounded-sm p-0`
  - Panel head (border-bottom): judul + select pill periode
  - Bar: `bg-primary` (hitam), rounded-t-lg

#### T5 — Panel Baru: `DashboardMapPreview.jsx`
- File baru di `Pages/Dashboard/Partials/`
- Preview peta statis (placeholder div dengan gradient background sesuai mockup)
- Tombol zoom +/– (dekoratif, link ke halaman `/map`)
- Scale bar label "500 km"
- Panel head: "Peta Preview" + tombol "Buka Peta →"

#### T6 — Panel Baru: `DashboardSystemInfo.jsx`
- File baru di `Pages/Dashboard/Partials/`
- Data dari props baru `systemInfo` (dari `DashboardController`):
  - Versi Aplikasi, Versi Laravel, Versi Inertia.js, Versi React, Database, Storage bar
- Setiap row: label (kiri) + value JetBrains Mono (kanan)
- Storage: progress bar visual + "X GB / 10 GB"

#### T7 — `Sidebar.jsx` (admin)
- Ubah background `aside`: dari `bg-surface-container` → `bg-white`
- Active nav item: `bg-primary text-on-primary` (hitam penuh, bukan `bg-primary-container`)
- Tambah **user footer chip** di bawah nav, sebelum akhir `<aside>`:
  ```jsx
  <div className="p-4 border-t border-outline-variant flex items-center justify-between">
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c839b] to-[#45464d] flex items-center justify-center text-white text-xs font-semibold shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-on-surface truncate">{user.name}</div>
        <div className="text-xs text-on-surface-variant">{user.role}</div>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
  </div>
  ```
- Section label "Menu Utama" di atas nav items

#### T8 — `Navbar.jsx`
- Kurangi tinggi logo: `h-20` → `h-10`
- Tambah **breadcrumb** di kanan logo (hanya desktop):
  ```jsx
  // Gunakan usePage().props.ziggy.location atau route().current()
  <div className="hidden md:flex items-center gap-2 text-sm ml-4">
    <span className="text-on-surface-variant">{parentLabel}</span>
    <ChevronRight className="w-3.5 h-3.5 text-outline" />
    <span className="font-semibold text-on-surface">{currentLabel}</span>
  </div>
  ```
- Tambah **notification bell** dengan badge count (dari `unread_notifications` prop atau hardcode 0 dulu):
  ```jsx
  <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container relative">
    <Bell className="w-5 h-5" />
    {count > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-destructive-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{count}</span>}
  </button>
  ```

#### T9 — Backend: `DashboardController`
- Tambahkan ke response data:
  - `stats.activity_today` — count ActivityLog hari ini (`whereDate('created_at', today)`)
  - `systemInfo` — array berisi versi aplikasi, Laravel, React, database name, storage usage

---

## PHASE 2 — Map Live

### Gap yang ditemukan

| Komponen | Kondisi Saat Ini | Target (maplive.html) |
|---|---|---|
| `MapHeader` | Logout button merah, tanpa user avatar/dropdown | User chip (avatar + nama) dengan dropdown (profile, logout), bell icon |
| `MapHeader` | Hamburger hanya mobile, sidebar toggle desktop tidak ada | Burger button selalu tampil (termasuk desktop) |
| `MapSidebar` | Layer item: checkbox kecil + label saja, tanpa opacity slider | Tambah opacity slider per layer, tampilkan layer type |
| `MapSidebar` | Marker list: list vertikal sederhana | Marker grid 2 kolom dengan pin dot warna + nama + tipe |
| `MapSidebar` | Background `bg-surface-container` | `bg-white` sesuai mockup |
| `MapHUD` | Belum ada implementasi HUD (placeholder) | HUD dark glass: bg rgba(0,0,0,0.72), koordinat lat/lon, zoom, status online |
| `MapFooter` | Belum diimplementasikan (kosong/komentar) | Dark footer `bg-[#0c1220]`, copyright + data sources dengan links |
| `MapControls` | Belum dilihat isinya | 5 tombol: ZoomIn, ZoomOut, Fullscreen, ResetView, (separator), style: `w-10 h-10 bg-white rounded-lg shadow-lg` |
| `MapPopup` | Belum dilihat isinya | Header (icon+title+close), rows key-value, "Detail Lokasi →" button |
| Scale bar | `<div>` sederhana | Proper scale bar: tick labels + striped bar (hitam/putih bergantian) |
| Minimap | Tidak ada | Minimap placeholder `150×110px` di bottom-right |

### Tasks Phase 2

#### T10 — `MapHeader.jsx`
- Burger button: selalu tampil (hapus `md:hidden`)
- Kiri: burger → logo → nav links (Dashboard/Live View)
- Kanan: bell icon → user avatar chip → dropdown (Profile, Logout)
  - Avatar: lingkaran gradient dengan initials, bukan button plain "Logout"

#### T11 — `MapSidebar.jsx`
- `aside` background: `bg-white` (dari `bg-surface-container`)
- Section separator: `border-bottom: 1px solid var(--surface-container)` → className `border-b border-surface-container`
- **Layer items** — tambah per layer:
  - `layer-type` subtitle (mis. `WMS · GeoServer`)
  - Gear icon di kanan
  - Opacity slider: `<input type="range" min="0" max="100">` dengan label "Opacity" dan nilai %
  - State opacity disimpan di `useState` lokal Map, dikirim via prop baru `layerOpacities` + `handleOpacityChange`
- **Marker section** — ubah dari list ke grid 2 kolom:
  ```jsx
  <div className="grid grid-cols-2 gap-2.5">
    {visible.map(marker => (
      <button className="flex items-center gap-2 text-left">
        <div className="w-4 h-4 rounded-full shrink-0" style={{background: marker.color || '#515f74'}} />
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold truncate">{marker.name}</div>
          <div className="text-[10.5px] text-on-surface-variant truncate">{marker.type}</div>
        </div>
      </button>
    ))}
  </div>
  ```
- Tool buttons: tingkatkan padding `py-2.5 px-2.5`, font `text-[13.5px]`

#### T12 — `MapHUD.jsx`
- Ubah style dari light ke **dark glass**:
  ```jsx
  className="absolute bottom-4 left-4 z-30 bg-black/[0.72] backdrop-blur-md rounded-lg px-4 py-3 font-mono text-xs text-[#e5e7eb] min-w-[150px]"
  ```
- Rows: Lat, Lon, (separator), Zoom, Skala, (separator), status dot + "Koneksi: Online"
- Status dot: `w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_0_3px_rgba(52,211,153,0.25)]`

#### T13 — `MapFooter.jsx`
- Dark background: `bg-[#0c1220] border-t border-white/[0.08]`
- Kiri: `© 2026 WebGIS Portal. All rights reserved.`
- Kanan: `Data sumber: GeoServer | OpenStreetMap | Ina-Geoportal` (link)
- Text color: `text-[#9aa0aa]`, link `text-[#c8cdd6] hover:text-white`

#### T14 — `MapControls.jsx`
- Sesuaikan style tombol: `w-10 h-10 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.18)] flex items-center justify-center hover:bg-surface-variant`
- Icon size: `w-[18px] h-[18px]`

#### T15 — `MapPopup.jsx`
- Width: `w-[230px]`
- Border radius: `rounded-xl` (0.75rem)
- Shadow: `shadow-[0_12px_30px_rgba(0,0,0,0.28)]`
- Header: icon (MapPin biru) + nama + tombol close (bulat, hover gray)
- Rows: key (gray) + value (bold) — `text-[12.5px]`
- Footer button: "Detail Lokasi →" dengan `bg-surface-container hover:bg-surface-variant`

#### T16 — Scale bar di `Map.jsx`
- Ganti div Scale sederhana dengan proper scale bar:
  ```jsx
  <div className="absolute bottom-4 right-4 z-30 bg-white/90 backdrop-blur-md rounded-md px-3 py-2 text-[11px]">
    <div className="flex justify-between font-mono text-[10px] text-on-surface-variant mb-1">
      <span>0</span><span>500</span><span>1000</span><span>1500 m</span>
    </div>
    <div className="flex h-[6px] w-[170px] border border-on-surface border-t-0">
      {[0,1,2,3,4,5].map(i => (
        <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-on-surface' : 'bg-white'}`} />
      ))}
    </div>
  </div>
  ```

#### T17 — Minimap placeholder di `Map.jsx`
- Tambah div minimap di atas scale bar (posisi bottom-[64px] right-4):
  ```jsx
  <div className="absolute bottom-16 right-4 z-[25] w-[150px] h-[110px] rounded-lg overflow-hidden border-2 border-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] bg-gradient-to-br from-[#1c3c26] to-[#0c3247] hidden md:block">
    <div className="absolute w-[34%] h-[30%] top-[38%] left-[38%] border-2 border-white bg-white/15" />
  </div>
  ```
  > Minimap ini adalah placeholder visual; implementasi OpenLayers minimap overview adalah out of scope fase ini.

---

## Urutan Implementasi

```
Phase 1:
T9 → T8 → T7 → T1 → T2 → T3 → T4 → T5 → T6

Phase 2:
T10 → T11 → T12 → T13 → T14 → T15 → T16 → T17
```

---

## Constraints & Risks

1. **T9 (backend)** — `stats.activity_today` dan `systemInfo` harus tersedia sebelum frontend menggunakannya. Cek `DashboardController` dan pastikan props di-pass ke Inertia.
2. **T11 opacity slider** — `useMap` hook perlu state baru `layerOpacities` dan setter, lalu OpenLayers layer opacity di-update real-time. Ini menyentuh `useMap.js` yang belum dibaca — perlu dibaca sebelum implementasi.
3. **Minimap OL** — OL overview map (`OverviewMap` control) bisa ditambahkan di `useMap.js` sebagai enhancement future; placeholder visual sudah cukup untuk fase ini.
4. **Naming conflict** — `Sidebar.jsx` ada di dua lokasi: `Components/Dashboard/Sidebar.jsx` (admin) dan `Components/Sidebar.jsx` (legacy, tidak dipakai). Jangan edit yang salah.
5. Semua perubahan styling hanya menggunakan token warna yang sudah ada di `tailwind.config.js` — **jangan tambahkan arbitrary hex baru** kecuali untuk map footer dark (`#0c1220`) dan minimap yang memang desain khusus.

---

## Validation

Setelah setiap phase:
1. Jalankan `npm run dev` — pastikan tidak ada compile error
2. Buka `/dashboard` — verifikasi 4 stat cards, greeting dengan nama, date pill, chart + logs aktif, sidebar putih dengan user chip
3. Buka `/map` — verifikasi header user chip, sidebar putih dengan opacity slider, HUD dark glass, footer dark, popup styling, scale bar proper
4. Test mobile (resize ke <768px) — sidebar overlay berfungsi di kedua halaman
