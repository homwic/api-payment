# 🚀 qris-cli

[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**qris-cli** adalah CLI sederhana untuk membuat order pembayaran **QRIS**, menampilkan URL QR, lalu memantau status pembayaran hingga **PAID**, **EXPIRED**, atau **CANCELED**.  
Script ini berkomunikasi dengan endpoint: `https://api.lutify.my.id/index.php`.

---

## ✨ Fitur

✅ Input nominal langsung dari terminal  
✅ Membuat order + detail (orderId, base, unik, total, masa berlaku)  
✅ Menampilkan URL QR (bisa dibuka di browser / di-render ke QR image)  
✅ Polling status pembayaran otomatis  
✅ *Keep-alive poll* opsional untuk “menyentil” server  
✅ Timeout otomatis bila terlalu lama menunggu  

---

## 📦 Prasyarat

- **Node.js** v16 atau lebih baru (disarankan LTS terbaru)  
- **npm** untuk instalasi dependensi  

---

## ⚡ Instalasi

1. Clone / salin proyek ini
2. Instal dependensi:

```bash
npm init -y
npm install axios
```

---

## ▶️ Cara Menjalankan

Jalankan file:

```bash
node qris-cli.js
```

Masukkan nominal (contoh):

```
Masukkan nominal (tanpa kode unik): 25000
```

Contoh output:

```
2025-08-17T03:10:22.345Z - Membuat order di server...
2025-08-17T03:10:22.789Z - OrderId=12345, base=25000, unik=123, total=25123
2025-08-17T03:10:22.789Z - QR URL: https://...
2025-08-17T03:10:22.789Z - Berlaku s/d: 2025-08-17 03:20:22
2025-08-17T03:10:22.789Z - Menunggu pembayaran...
2025-08-17T03:11:42.001Z - ✅ LUNAS: paid_at=2025-08-17 03:11:41, mutation_id=ABCDE12345
```

---

## ⚙️ Konfigurasi

Parameter di awal file bisa disesuakan:

| Konstanta       | Default               | Deskripsi |
|-----------------|-------------------------| -----------|
| `PHH_BASE`      | `https://api.lutify.my.id` | Basis URL backend |
| `INTERVAL_MS`   | `5000` (5s)            | Interval polling status |
| `TIMEOUT_MS`    | `600000` (10m)        | Batas maksimal menunggu |
| `WITH_POLL_HIP  | `true`                | Panggil endpoint `poll` setiap ±10 detik |

---

## 🔄 Alur Kerja

1. Input nominal → validasi minimal `100`
2. **create_order** → kirim request `action=create_order&amount=...`
3. Tampilkan detail order & `qris_url`
4. Mulai polling status:
   - `action=status&id=...` setiap `INTERVAL_MS`
   - Opsional `action=poll` bila `WITH_POLL_HIT=true`
5. Berhenti jika:
   - `PAID` → keluar dengan kode **0**
   - `EXPIRED` / `CANCELED` → keluar dengan kode **1**
   - Timeout tercapai → keluar dengan kode **1**
6. Error fatal → keluar dengan kode **2**

---

## 📋 Exit Codes

| Code | Arti |
|------|------|
| `0`  | ✅ Pembayaran sukses (**PAID**) |
| `1`  | ❌ Gagal (EXPIRED / CANCELED / TIMEOUT / validasi gagal) |
| `2`  | ⚠️ Error tak terduga (jaringan, parsing, dsb.) |

---

## 💡 Tips Pemakaian

- **Tampilkan QR**: buka `qris_url` di browser, atau render jadi QR code di terminal dengan tool pihak ketiga.  
- **Integrasi**: bisa dijalankan via *child process* dari aplikasi lain, baca `stdout` untuk event-driven handling.  
- **Logging**: setiap log diberi stempel waktu ISO — memudahkan debugging.  

---

## 📜 Lisensi

Proyek ini dirilis di bawah lisensi **MIT**.  
Bebas digunakan, dimodifikasi, dan disebarluaskan dengan atribusi.

---

