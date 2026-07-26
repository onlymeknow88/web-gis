# WebGIS Design System

Dokumentasi design system untuk aplikasi WebGIS (Admin Panel + Map Viewer), dibangun di atas Laravel 11 + Inertia.js 2.0 + React 18 + OpenLayers 10.9.

---

## 1. Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel 11 |
| SPA Bridge | Inertia.js 2.0 |
| Frontend | React 18 + TypeScript/JSX |
| Styling | TailwindCSS 3 |
| Mapping | OpenLayers 10.9 |
| UI Components | Shadcn/ui + Headless UI + Lucide Icons |
| Table | TanStack React Table 8 |
| State | Inertia props + React hooks |
| Font | Inter (sans), JetBrains Mono (mono) |

---

## 2. Arsitektur Aplikasi

```
web-gis/
├── Backend (Laravel)
│   ├── Controllers: GisLayerController, MarkerController, UserController
│   ├── Models: GisLayer, GisMarker, GisFeatureStyle, User
│   └── Routes: Admin panel, Map viewer, Auth
│
└── Frontend (React + Inertia)
    ├── Pages/
    │   ├── Map/       — Peta interaktif publik
    │   ├── Admin/      — Panel admin (Layers, Markers, Users, Config, Logs)
    │   ├── Dashboard/  — Dashboard statistik
    │   └── Auth/       — Login, Register, Profile
    ├── Layouts/
    │   └── AuthenticatedLayout.jsx — Layout admin dengan sidebar
    └── Components/
        ├── Dashboard/  — Navbar, Sidebar, Footer
        └── ui/         — Komponen reusable (button, modal, dll)
```

---

## 3. Design Tokens

### 3.1 Color Palette
*(Material Design inspired)*

```css
/* Primary */
--primary: #000000;              /* Hitam — aksi utama */
--on-primary: #ffffff;
--primary-container: #131b2e;
--on-primary-container: #7c839b;

/* Secondary */
--secondary: #515f74;            /* Biru abu-abu */
--secondary-container: #d5e3fd;  /* Biru muda */
--on-secondary-container: #57657b;

/* Surface */
--surface: #f7f9fb;              /* Background utama, putih kebiruan */
--surface-container: #eceef0;
--surface-variant: #e0e3e5;
--on-surface: #191c1e;           /* Text utama */
--on-surface-variant: #45464d;

/* Functional */
--error: #ba1a1a;
--success-emerald: #1b6c31;
--operational-blue: #004c69;
--safety-orange: #a13f00;
--destructive-red: #ba1a1a;

/* Borders */
--outline: #76777d;
--outline-variant: #c6c6cd;
```

### 3.2 Typography

```
Font Family:
- Sans: Inter        → body text, UI
- Mono: JetBrains Mono → code, koordinat

Scale:
- text-[9px]  → scale labels, micro text
- text-xs     → caption, helper text
- text-sm     → body text, table cells
- text-base   → default, form inputs
- text-lg     → section headers
- text-xl     → page headers
- text-2xl    → hero titles
```

### 3.3 Spacing

```
margin-mobile:      16px
margin-desktop:      32px
gutter:              16px
base:                 4px
control-bar-height:  56px
sidebar-width:       280px
```

### 3.4 Border Radius

| Token | Value | Usage |
|---|---|---|
| DEFAULT | 0.125rem (2px) | Subtle |
| lg | 0.25rem (4px) | Cards |
| xl | 0.5rem (8px) | Modals |
| full | 0.75rem (12px) | Buttons |

---

## 4. Struktur UI — Halaman

### 4.1 Authenticated Layout (Admin Panel)
Dipakai di: Dashboard, Layers, Markers, Users, Config, Logs

```
┌─────────────────────────────────────────┐
│ Navbar (fixed top, h-16)                 │
├─────────┬─────────────────────────────────┤
│ Sidebar │ Main Content Area              │
│ (280px) │ - Dot grid background          │
│ fixed   │ - Max width 7xl                │
│         │ - Padding responsive           │
└─────────┴─────────────────────────────────┘
```

**Navbar:** logo + app name, hamburger (mobile), user dropdown (profile, logout), breadcrumb.

**Sidebar:** menu navigasi (Dashboard, Layers, Markers, Users, Config, Logs), active state indicator, icon + label, collapsible di mobile, info user di bawah.

**Background pattern (dot grid):**
```css
background-image: radial-gradient(circle at 2px 2px, rgba(118,119,125,0.05) 1px, transparent 0);
background-size: 24px 24px;
```

### 4.2 Map Layout (Public Viewer)
File: `resources/js/Pages/Map/Map.jsx`

```
┌─────────────────────────────────────────────────────┐
│ MapHeader (fixed top, h-16, z-40)                    │
├──────────┬──────────────────────────────────────────┤
│ Map      │ Main Map Viewport (flex-1)                │
│ Sidebar  │  ┌──────────────┐                         │
│ (280px)  │  │ MapSearch    │ (top center, z-30)      │
│ z-40     │  └──────────────┘                         │
│          │                                            │
│ Layers   │        OpenLayers Map Canvas               │
│ Markers  │                                            │
│ Tools    │  ┌──────┐              ┌──────────────┐   │
│          │  │ HUD  │              │  Controls    │   │
│          │  └──────┘              └──────────────┘   │
│          │  (bottom-left, z-30)   (top-right, z-30)  │
│          │  ┌─────────────┐      ┌────────┐          │
│          │  │ Popup       │      │ Scale  │          │
│          │  └─────────────┘      └────────┘          │
│          │  (dynamic, z-50)      (bottom-right)       │
├──────────┴──────────────────────────────────────────┤
│ MapFooter (fixed bottom, h-8, z-20)                  │
└─────────────────────────────────────────────────────┘
```

**Props Map Page** (`MapPage`):
- `layers` — Array `GisLayer` (relasi: creator, permittedUsers, styles)
- `markers` — Array `GisMarker` (coordinates & metadata)
- `geoserver` — Config GeoServer (base_url, workspace)

**State dari `useMap` hook:**
`mapElement`, `popupElement`, `isSidebarOpen`, `activeLayers`, `measurementMode`, `searchQuery`, `pointerCoord`, `zoomLevel`, `popupInfo`.

---

## 5. Komponen UI — Pattern

### Buttons
```jsx
// Primary
"px-4 py-2 bg-primary text-on-primary rounded-full hover:bg-opacity-90 transition-all font-medium"

// Secondary
"px-4 py-2 bg-surface-container text-on-surface rounded-full hover:bg-surface-variant transition-all"

// Destructive
"px-4 py-2 bg-destructive-red text-white rounded-full hover:bg-opacity-90 transition-all"

// Icon Button
"w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-variant transition-all"
```

### Cards
```jsx
"bg-white rounded-lg border border-outline-variant shadow-sm hover:shadow-md transition-shadow p-6"
```

### Modal / Dialog
```jsx
// Backdrop
"fixed inset-0 bg-black/50 z-50"
// Container
"fixed inset-0 z-50 flex items-center justify-center p-4"
// Content
"bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
```

### Form Inputs
```jsx
// Input
"w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-on-surface"
// Label
"block text-sm font-medium text-on-surface mb-2"
// Error
"text-sm text-error mt-1"
```

### Tables
```jsx
// Container
"w-full overflow-x-auto bg-white rounded-lg border border-outline-variant"
// Header
"bg-surface-container text-on-surface text-sm font-semibold text-left px-3 py-3"
// Row
"border-b border-outline-variant hover:bg-surface-container-low transition-colors"
// Cell
"px-3 py-3 text-sm text-on-surface"
```

### Status Badges
```jsx
// Success  → "px-2 py-1 bg-success-emerald/10 text-success-emerald rounded text-xs font-medium"
// Error    → "px-2 py-1 bg-destructive-red/10 text-destructive-red rounded text-xs font-medium"
// Warning  → "px-2 py-1 bg-safety-orange/10 text-safety-orange rounded text-xs font-medium"
```

---

## 6. Map-Specific UI

### 6.1 Layer Control Panel
- Checkbox toggle per layer
- Nama layer + deskripsi
- Opacity slider (0–100%)
- Color picker untuk styling
- Reorder drag & drop
- Expand/collapse accordion
- Active layer count badge

### 6.2 Marker List
- Searchable list
- Preview icon marker
- Klik → fly to location
- Filter by category
- Pagination / infinite scroll

### 6.3 Measurement Tools
| Tool | Geometri | Output |
|---|---|---|
| Measure Distance | LineString | Meter / kilometer, kumulatif |
| Measure Area | Polygon | m² atau hektar |
| Clear Measurements | — | Hapus semua drawing |

**UI State:** tool aktif → highlighted; sedang mengukur → tombol "Cancel" muncul; hasil → overlay di peta.

### 6.4 Map Controls (Floating)
Posisi: `absolute top-4 right-4`, `z-10`

```jsx
"absolute top-4 right-4 flex flex-col gap-2 z-10"
```
Tombol: Zoom In (+), Zoom Out (–), Fullscreen, Reset View (home), Measurement (ruler).
Style tombol: `w-10 h-10 bg-white rounded-lg shadow-lg hover:bg-surface-variant`.

### 6.5 HUD (Heads-Up Display)
Posisi: `absolute bottom-4 left-4`

```jsx
"absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3 font-mono text-xs"
```
Menampilkan: koordinat kursor (lat/lon, 6 desimal), zoom level (integer), scale bar.

### 6.6 Sub-komponen Map (`Pages/Map/Partials/`)

| Komponen | Props utama | Posisi / z-index |
|---|---|---|
| `MapHeader` | `user`, `isSidebarOpen`, `setIsSidebarOpen` | fixed top, h-16, z-40 |
| `MapSidebar` | `layers`, `markers`, `activeLayers`, `handleLayerToggle`, `searchQuery`, `handleMarkerClick`, `measurementMode`, `startMeasurement`, `cancelMeasurement`, `clearMeasurements` | fixed left, w-280px, z-40 |
| `MapSearch` | `searchQuery`, `setSearchQuery` | top-4, center, z-30 |
| `MapControls` | `handleZoomIn`, `handleZoomOut`, `handleFullScreen`, `handleResetView` | top-4 right-4, z-30 |
| `MapHUD` | `pointerCoord`, `zoomLevel` | bottom-12 left-4, z-30 |
| `MapPopup` | `popupElement`, `popupInfo`, `closePopup`, `copyToClipboard` | dynamic (OL Overlay), z-50 |
| `MapFooter` | `connectionStatus?` | fixed bottom, h-8, z-20 |

**MapSearch:**
```jsx
<div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-md w-full px-4 z-30">
  <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-outline-variant">
    <input
      type="search"
      placeholder="Cari marker..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full px-6 py-3 rounded-full bg-transparent focus:outline-none text-sm"
    />
  </div>
</div>
```
Fitur: debounced search (300ms), tombol clear (X), highlight marker yang cocok di peta.

**MapPopup:**
- Header: nama fitur + tombol close
- Body: daftar key–value dari `properties`
- Footer: tombol "Copy Coordinates" (jika ada `coordinates`)

**MapFooter:**
```jsx
<footer className="fixed bottom-0 left-0 right-0 h-8 bg-white border-t border-outline-variant flex items-center justify-between px-4 z-20">
  <div className="text-xs text-on-surface-variant">© 2026 WebGIS Portal. All rights reserved.</div>
  <div className="flex items-center gap-2 text-xs">
    <span className="w-2 h-2 rounded-full bg-success-emerald animate-pulse"></span>
    <span className="text-on-surface-variant">Connected to GIS Server</span>
  </div>
</footer>
```

---

## 7. OpenLayers Integration

Inisialisasi map dilakukan dalam custom hook `useMap` (`resources/js/Pages/Map/Hooks/useMap.js`).

**Ringkasan tanggung jawab hook:**
1. Inisialisasi `Map` + `View` (base layer OSM, default center Yogyakarta `[110.3695, -7.7956]`, zoom 12, min 5 / max 20).
2. Popup `Overlay` dengan positioning `bottom-center`.
3. Event handler: `pointermove` (update `pointerCoord`), `change:resolution` (update `zoomLevel`), `click` (feature info → `popupInfo`).
4. Menambahkan layer WMS dari GeoServer berdasarkan `activeLayers` (via `TileWMS`).
5. Menambahkan marker sebagai `VectorLayer` dari `GisMarker[]`, styling dengan `Icon`.
6. Measurement tools via `Draw` interaction (`LineString` untuk jarak, `Polygon` untuk luas), dihitung dengan `getLength` / `getArea` dari `ol/sphere`.
7. Helper: `handleLayerToggle`, `handleMarkerClick` (fly-to + zoom 15, animasi 1000ms), `handleZoomIn/Out`, `handleFullScreen`, `handleResetView`, `closePopup`.

**Dependency utama:** `ol/Map`, `ol/View`, `ol/layer/Tile`, `ol/layer/Vector`, `ol/source` (`OSM`, `TileWMS`, `Vector`), `ol/proj` (`fromLonLat`, `toLonLat`), `ol/geom/Point`, `ol/Feature`, `ol/style` (`Icon`, `Style`, `Fill`, `Stroke`), `ol/Overlay`, `ol/interaction/Draw`, `ol/sphere` (`getLength`, `getArea`).

---

## 8. Admin Panel UI

### 8.1 Dashboard Stats Cards
Grid 4 kolom (1 col mobile, 2 col tablet, 4 col desktop).

**Struktur kartu:** icon (Lucide) dengan ring warna background, label (`text-sm`, `text-on-surface-variant`), value (`text-2xl`, `font-bold`), trend indicator opsional (↑↓ berwarna).

Contoh kartu: Total Layers (Map icon), Total Markers (MapPin icon), Active Users (Users icon), System Status (Activity icon).

### 8.2 Data Tables (Layers, Markers, Users)
1. Header: title + tombol "Create New".
2. Filters: search real-time, status dropdown (Active/Inactive/All), entries per page (10/20/30/50/All).
3. Table: sortable columns, pagination, row actions (Edit/Delete/View), bulk selection.
4. Empty state dengan ilustrasi.

**Konfigurasi TanStack Table:** column definitions dengan accessor, pagination state, sorting state, filter state, row selection state.

### 8.3 Modals (Create/Edit)
- Header: title + close (X)
- Body: form fields grid responsif, error validasi, helper text
- Footer: Cancel (secondary) + Submit (primary), loading state

Validasi: real-time, error message di bawah input, submit disabled sampai valid, spinner saat submit.

### 8.4 Filter Bar
Layout: flex horizontal, `gap-3`, wrap di mobile.
1. Search input (icon + placeholder "Cari...", debounce 300ms)
2. Status select (Semua / Aktif / Nonaktif, default Semua)
3. Limit select (10 / 20 / 30 / 50 / Semua, default 10)
4. Clear filters (icon only, tampil hanya saat filter aktif)

---

## 9. Interaction Patterns

### Loading States
- **Page**: skeleton loader untuk tabel, spinner untuk cards.
- **Button**: disabled + spinner + "Loading...", width tetap (no layout shift).
- **Inline**: spinner kecil + teks "Memuat data...".

### Toast Notifications
| Tipe | Warna | Icon |
|---|---|---|
| Success | Hijau | Check |
| Error | Merah | X |
| Warning | Oranye | Alert |
| Info | Biru | Info |

Posisi: top-right. Durasi: 3–5 detik. Animasi: slide in dari kanan, fade out.

### Confirmations (Destructive Actions)
Modal dengan aksen merah. Judul: "Konfirmasi Hapus". Tombol: "Batal" + "Hapus" (merah).

> Contoh pesan: *"Anda yakin ingin menghapus layer '{name}'? Tindakan ini tidak dapat dibatalkan."*

### Empty States
```jsx
"flex flex-col items-center justify-center py-12 text-center"
```
Struktur: ilustrasi/icon besar (muted), heading "Tidak ada data", deskripsi, tombol aksi "Tambah Data Pertama".

---

## 10. Responsive Design

### Breakpoints
```
sm:  640px   — Mobile landscape
md:  768px   — Tablet
lg:  1024px  — Desktop
xl:  1280px  — Large desktop
2xl: 1536px  — Extra large
```

### Adaptasi Mobile

| Elemen | Desktop | Mobile |
|---|---|---|
| Sidebar (Admin) | Fixed 280px | Hidden default, full-screen overlay, slide dari kiri |
| Map Sidebar | Fixed 280px, always visible | Overlay full-screen, slide animation, close (X) |
| Tables | Full columns | Horizontal scroll, kolom non-kritikal disembunyikan, card view |
| Modals | Centered, max-w | Full screen, max-height + scroll |
| Map Controls | Ukuran standar | Tombol lebih kecil, toolbar konsolidasi, bottom sheet |
| Map Search | max-w-md center | Full width dengan padding |
| HUD | Standar | Compact, font lebih kecil |

**Animasi:**
```
Sidebar slide      : transform 300ms ease-in-out
Button hover        : background-color 200ms, transform 150ms (scale 1.05)
Map zoom/pan         : duration 1000ms
Popup fade           : opacity 200ms ease-in-out
```

---

## 11. Implementasi — Guidelines

### File Organization
```
resources/js/
├── Pages/
│   └── [Feature]/
│       ├── [FeatureName].jsx   (main page)
│       ├── Partials/           (sub-components)
│       └── Hooks/              (custom hooks)
├── Layouts/
│   └── [LayoutName].jsx
├── Components/
│   ├── Dashboard/  (shared dashboard components)
│   └── ui/         (reusable UI components)
└── lib/
    └── utils.js    (helper functions)
```

### Naming Conventions
- **Component**: PascalCase — mis. `MapSidebar`, bukan `Sidebar2`
- **Props / functions**: camelCase
- Nama deskriptif, hindari singkatan ambigu

### State Management
```jsx
// Local state
const [isOpen, setIsOpen] = useState(false);

// Inertia props
const { layers, markers } = usePage().props;

// Custom hooks
const { mapElement, activeLayers } = useMap();
```

### API Integration (Inertia)
```jsx
import { router } from '@inertiajs/react';

// Create / Update
router.post('/admin/layers', data, {
  onSuccess: () => toast.success('Berhasil'),
  onError: (errors) => setErrors(errors),
});

// Delete
router.delete(`/admin/layers/${id}`, {
  onBefore: () => confirm('Yakin hapus?'),
});
```

---

## 12. Accessibility

### Keyboard Navigation
- `Tab` — fokus navigasi
- `Enter` / `Space` — aktivasi
- `Escape` — tutup modal/sidebar/popup
- Arrow keys — dropdown, opsional pan peta

### ARIA
```jsx
<button aria-label="Close modal">
<input aria-describedby="error-message">
<div role="alert" aria-live="polite">
<div role="region" aria-label="Map controls">
<div aria-live="polite" className="sr-only">Zoom level changed to {zoomLevel}</div>
```

### Color Contrast
- Teks: minimum rasio 4.5:1
- Teks besar: minimum 3:1
- Icon: minimum 3:1

### Focus State
```jsx
"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

---

## 13. Performance Tips

- **Lazy load pages** — dynamic import per route
- **Memoize komponen berat** — `React.memo` (contoh: `MapControls`, `MapHUD`)
- **Debounce search** — 300ms delay
- **Virtual scrolling** — untuk list panjang (markers)
- **Tile caching** — otomatis oleh OpenLayers
- **Vector simplification** — simplifikasi geometri untuk performa
- **Image optimization** — WebP, lazy loading
- **Code splitting** — pisahkan vendor bundle

---

## 14. Referensi Implementasi

Dua deliverable statis yang sudah dibuat sebagai referensi visual (HTML mockup, sebelum dikonversi ke komponen React/Inertia):

| File | Halaman |
|---|---|
| `dashboard.html` | Admin Panel — Dashboard (stat cards, peta preview, distribusi layer, aktivitas terbaru, info sistem) |
| `map_live.html` | Map Viewer — halaman peta interaktif publik (sidebar layer/marker/tools, search, controls, HUD, popup, scale bar, minimap) |

Langkah selanjutnya: pecah kedua mockup ini menjadi komponen React sesuai struktur di bagian 11 (`Pages/Dashboard/`, `Pages/Map/Partials/`), lalu sambungkan ke `useMap` hook dan Inertia props sesuai kontrak di bagian 4.2 dan 7.
