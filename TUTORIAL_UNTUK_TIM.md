# Tutorial Setup Project Odoo C1 (Untuk Tim / Anggota)

---

## 1. Memasukkan Modul ke Odoo Anda
1. Lakukan *pull* atau *download* repository GitHub ini.
2. *Copy* folder `pos_fragile_notification`.
3. *Paste* (tempel) folder tersebut ke dalam folder `addons` di direktori instalasi Odoo di laptop Anda (misalnya di `C:\Program Files\Odoo...\server\odoo\addons`).
4. Restart service Odoo di laptop Anda.

---

## 2. Me-Restore Database (Agar Produk & Cabang Sama Persis)
Di dalam folder project yang baru saja Anda download/pull ini, terdapat sebuah file `.zip` database dari pemilik project. File ini berisi seluruh produk, gambar, dan pengaturan cabang.

1. Buka browser dan masuk ke halaman login Odoo Anda (contoh: `http://localhost:8069`).
2. Jangan login. Klik tulisan **Manage Databases** di bagian bawah.
3. Klik tombol **Restore Database**.
4. Masukkan **Master Password** Odoo di laptop Anda.
5. Klik *Choose File*, lalu pilih file `.zip` database yang ada di dalam folder project ini.
6. Beri nama database baru (misalnya `odoo_c1_team`).
7. Klik **Continue** dan tunggu hingga proses selesai.
8. Login ke Odoo dengan database yang baru saja di-restore.
9. Buka menu **Apps** (Aplikasi), cari modul **POS Fragile Notification**, klik titik tiga lalu pilih **Upgrade**.
10. Selesai! Anda sekarang punya seluruh data dan tampilan yang sama persis.

---

## 3. Cara Menjalankan Barcode Scanner HP (`app.py`)
Aplikasi ini memungkinkan kamera HP Anda berubah menjadi *scanner barcode* sungguhan untuk kasir Odoo.

1. Buka aplikasi **Terminal** (atau Command Prompt / VS Code) di laptop Anda.
2. Masuk ke dalam folder `barcode_scanner_app`.
3. Install library yang wajib ada dengan mengetik:
   ```bash
   pip install flask flask-cors keyboard
   ```
4. Jalankan aplikasinya dengan perintah:
   ```bash
   python app.py
   ```
5. Akan muncul informasi di layar, biarkan terminal ini tetap terbuka (jangan di-close).

---

## 4. Cara Menghubungkan HP ke Laptop (Rekomendasi via Kabel USB)
Jika koneksi WiFi di kampus/kosan lambat, sangat disarankan menggunakan kabel USB agar hasil scan tidak *delay*.

1. Colokkan kabel USB dari HP ke laptop Anda.
2. Di HP Anda, buka **Pengaturan** > **Hotspot / Koneksi**.
3. Aktifkan **Penambatan USB (USB Tethering)**.
4. Di laptop Anda, buka Command Prompt (CMD), ketik `ipconfig` lalu tekan Enter.
5. Cari bagian Ethernet yang baru muncul (biasanya bernama *Ethernet adapter* atau *Remote NDIS based Internet Sharing Device*). 
6. Temukan tulisan **IPv4 Address** dan catat nomornya (Misal: `192.168.42.129`). Ini adalah IP Anda.

---

## 5. Setting Wajib Google Chrome di HP (Agar Kamera Bisa Nyala)
Supaya HP Anda mengizinkan akses kamera (karena kita tidak pakai HTTPS), Anda harus mengubah sedikit settingan rahasia di Chrome HP Anda. **Lakukan ini 1 kali saja selamanya:**

1. Buka browser **Google Chrome** di HP Anda.
2. Ketik alamat ini di kolom pencarian paling atas: `chrome://flags`
3. Di kotak pencarian (*Search flags*), ketik: **insecure origins**
4. Anda akan melihat menu bernama: *Insecure origins treated as secure*.
5. Di kolom teks di bawahnya, masukkan IP Laptop yang Anda catat di Langkah 4, ditambah port 5500. 
   *(Contoh penulisan: `http://192.168.42.129:5500`)*
6. Ubah tombol *Disabled* menjadi **Enabled**.
7. Klik tombol biru **Relaunch** di pojok kanan bawah untuk me-restart Chrome Anda.
8. Sekarang, ketikkan alamat `http://192.168.42.129:5500` secara normal di Chrome HP. 
9. Setujui izin kamera. Selesai! Kamera HP siap digunakan untuk memindai barang di Odoo!
