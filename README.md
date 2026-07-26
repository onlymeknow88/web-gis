# Web-GIS Application

Aplikasi Web-GIS berbasis **Laravel**, **React (InertiaJS)**, dan **OpenLayers** yang terintegrasi secara dinamis dengan **GeoServer** untuk manajemen dan visualisasi data spasial (polygon, line, point).

---

## 🚀 Fitur Utama

### 1. Peta Interaktif (Interactive GIS Map)
*   **OpenLayers Map Engine**: Peta interaktif yang responsif dengan dukungan layer switcher, zoom, dan pencarian.
*   **WMS Integration**: Merender layer spasial secara dinamis langsung dari server GIS (GeoServer) menggunakan Styled Layer Descriptor (SLD) default layer.
*   **Pop-up Detail Objek**: Klik pada peta/polygon untuk menampilkan properti dan informasi data spasial (WFS/WMS GetFeatureInfo).
*   **Automatic Center Markers**: Menampilkan penanda/marker koordinat tengah layer untuk navigasi peta yang cepat.

### 2. Dashboard Manajemen Layer (Admin Panel)
*   **Manajemen Layer WMS**: Tambah, ubah, dan hapus referensi layer GeoServer secara manual.
*   **Upload Shapefile (.zip)**: Upload file `.shp` dalam format ZIP yang otomatis diproses dan disinkronkan ke database.
*   **Kustomisasi Warna Dasar**: Pengaturan warna dasar polygon dan border per layer melalui UI input warna manual.
*   **Generasi Marker Otomatis**: Fitur untuk menghitung titik tengah (centroid) dari layer spasial di GeoServer secara otomatis dan menyimpannya ke database.
*   **Pagination & Filter**: Daftar layer yang responsif dengan fitur pencarian, filter status aktif, dan pagination (TanStack Table).

### 3. Kontrol Akses Layer Spasial (Role & User Access Control)
*   **Akses Spesifik Pengguna**: Pembatasan layer peta sehingga hanya pengguna (user) yang diberi izin yang dapat memuat dan melihat layer tertentu di peta utama.
*   **Multiple User Assignment Modal**: Kemudahan bagi admin untuk mengatur akses banyak pengguna sekaligus ke suatu layer.
*   **In-Layer User Lists**: Daftar pengguna yang memiliki izin akses langsung ditampilkan pada tabel manajemen layer.

### 4. Integrasi Proxy GeoServer Aman
*   **Secure Routing**: Melewatkan request tile peta dari client melalui Proxy Controller Laravel untuk menghindari masalah Cross-Origin Resource Sharing (CORS).
*   **Anonymous Fallback**: Otomatis menggunakan otentikasi anonim jika konfigurasi otentikasi dasar (Basic Auth) GeoServer mengembalikan status `401 Unauthorized`.

---

## 🛠️ Tech Stack

*   **Backend**: Laravel (PHP 8.x)
*   **Frontend**: React, InertiaJS, TailwindCSS, Lucide React
*   **Peta & Spasial**: OpenLayers, OpenStreetMap (OSM)
*   **GIS Engine**: GeoServer (Workspace: `Indonesia`)
*   **Database**: MySQL / PostgreSQL (dengan dukungan koordinat spasial)

---

## ⚙️ Kebutuhan Sistem & Instalasi

### 1. Clone Repositori
```bash
git clone <repository-url>
cd web-gis
```

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` ke `.env` dan sesuaikan dengan konfigurasi database serta kredensial environment Anda.

### 3. Instalasi Dependency Backend (Composer)
```bash
composer install
php artisan key:generate
```

### 4. Jalankan Migrasi & Seeder Database
Untuk membuat tabel yang diperlukan termasuk tabel pengguna bawaan:
```bash
php artisan migrate --seed
```
*Catatan: Pastikan untuk menjalankan seeder agar akun admin dan data dasar layer/pengguna terisi.*

### 5. Instalasi Dependency Frontend (NPM)
```bash
npm install
```

### 6. Menjalankan Server Aplikasi
Jalankan dev server PHP dan aset Javascript secara bersamaan:

*   **Terminal 1 (Backend)**:
    ```bash
    php artisan serve
    ```
*   **Terminal 2 (Frontend)**:
    ```bash
    npm run dev
    ```

---

## 🗺️ Integrasi GeoServer

Aplikasi ini dirancang untuk bekerja langsung dengan server GeoServer. Pengaturan dasar:
*   **Default Workspace**: `Indonesia`
*   **GeoServer Endpoint**: `http://localhost:8080/geoserver`
*   **Authentication**: Menggunakan kredensial yang tersimpan pada tabel `geoserver_configs` dengan fallback aman ke request publik/anonim jika kredensial tidak cocok.

---

## 📂 Struktur Direktori Penting

*   `app/Http/Controllers/GisLayerController.php` — Logika backend untuk CRUD layer, unggah shapefile, penentuan akses user, dan request data spasial WFS.
*   `app/Http/Controllers/MapController.php` — Mengatur halaman peta utama dan menangani request proxy data GeoServer.
*   `resources/js/Pages/Map/` — Komponen visualisasi peta utama berbasis React dan OpenLayers.
*   `resources/js/Pages/Map/Hooks/useMap.js` — Custom hook yang menangani inisialisasi peta OpenLayers, penarikan data layer WMS, pembentukan style SLD, dan interaksi spasial.
*   `resources/js/Pages/Admin/Layer/` — Dashboard administrasi untuk manajemen GIS layer dan hak akses pengguna.
