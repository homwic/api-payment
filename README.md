


````markdown
# qris-cli

CLI sederhana untuk membuat order pembayaran QRIS, menampilkan URL QR, lalu memantau status pembayaran sampai **PAID**, **EXPIRED**, atau **CANCELED**. Script memakai endpoint `https://api.lutify.my.id/index.php`.

## Fitur

- Input nominal dari terminal (tanpa kode unik)
- Membuat order dan menampilkan detail (orderId, base, unik, total, URL QR, masa berlaku)
- Polling status pembayaran setiap interval tertentu
- Opsi *keep-alive poll* terpisah untuk “menyentil” server
- *Timeout* otomatis bila terlalu lama menunggu

## Prasyarat

- **Node.js**: disarankan v16+ (direkomendasikan LTS terbaru)
- **npm** (untuk menginstal dependensi)

## Instalasi

1. Clone / salin kode ini ke folder lokal.
2. Instal dependensi:

```bash
npm init -y
npm i axios
````

> Script sudah menggunakan `readline` (bawaan Node.js), jadi cukup `axios` saja.

## Menjalankan

Simpan file Anda (mis. `qris-cli.js`), lalu:

```bash
node qris-cli.js
```

Anda akan diminta memasukkan nominal:

```
Masukkan nominal (tanpa kode unik): 25000
```

Contoh keluaran:

```
2025-08-17T03:10:22.345Z - Membuat order di server...
2025-08-17T03:10:22.789Z - OrderId=12345, base=25000, unik=123, total=25123
2025-08-17T03:10:22.789Z - QR URL: https://...
2025-08-17T03:10:22.789Z - Berlaku s/d: 2025-08-17 03:20:22
2025-08-17T03:10:22.789Z - Menunggu pembayaran...
2025-08-17T03:10:27.912Z - Status: PENDING - menunggu...
...
2025-08-17T03:11:42.001Z - ✅ LUNAS: paid_at=2025-08-17 03:11:41, mutation_id=ABCDE12345
```

Jika pembayaran tidak terjadi dalam batas waktu:

```
2025-08-17T03:20:23.001Z - ❌ Timeout menunggu pembayaran.
```

## Konfigurasi Cepat

Konstanta yang dapat Anda sesuaikan di awal file:

```js
const PHP_BASE = 'https://api.lutify.my.id'; // basis API
const INTERVAL_MS = 5000;    // jeda polling status (ms)
const TIMEOUT_MS  = 600000;  // batas waktu menunggu (ms)
const WITH_POLL_HIT = true;  // panggil endpoint poll tambahan
```

* **PHP\_BASE**: basis URL backend PHP.
* **INTERVAL\_MS**: seberapa sering cek status.
* **TIMEOUT\_MS**: berapa lama maksimal menunggu hingga batal.
* **WITH\_POLL\_HIT**: bila `true`, script akan memanggil `action=poll` (tiap ±10 detik) untuk menjaga server tetap aktif / memicu sinkronisasi (bergantung implementasi backend).

## Alur Kerja

1. **Input nominal** → validasi minimal `100`.
2. **create\_order** (`action=create_order&amount=...`)
3. Tampilkan detail order & **qris\_url**.
4. Mulai polling:

   * **status** (`action=status&id=...`) setiap `INTERVAL_MS`.
   * Opsional **poll** (`action=poll`) tiap \~10 detik jika `WITH_POLL_HIT=true`.
5. Berhenti jika:

   * `status === 'PAID'` → keluar dengan kode `0`.
   * `status === 'EXPIRED'` atau `CANCELED` → keluar dengan kode `1`.
   * Mencapai `TIMEOUT_MS` → keluar dengan kode `1`.
6. Error tak terduga → log dan keluar dengan kode `2`.

## Kode Keluar (Exit Codes)

* `0` — sukses, pembayaran **PAID**
* `1` — *expired/canceled/timeout* atau validasi gagal (mis. nominal < 100)
* `2` — error tak terduga (jaringan, parsing, dll.)

## Tips Pemakaian

* **Tampilkan QR**: `qris_url` bisa dibuka di browser atau di-*render* ke gambar/terminal QR (tool pihak ketiga).
* **Integrasi**: Jalankan via proses *child* dari aplikasi lain, baca `stdout` untuk *event-driven* handling.

