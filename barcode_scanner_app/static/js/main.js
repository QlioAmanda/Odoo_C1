const debugEl = document.getElementById('debugInfo');
let html5Qrcode = null;
let sedangScan = false;

function debug(msg) {
    console.log(msg);
    debugEl.innerText = msg;
}

function showLog(title, message, type) {
    const card = document.getElementById('logCard');
    document.getElementById('logTitle').innerText = title;
    document.getElementById('logMsg').innerText = message;
    card.className = 'log-card ' + (type || '');
    card.style.display = 'block';
}

function hideLog() {
    document.getElementById('logCard').style.display = 'none';
}

// ============ FUNGSI UTAMA: MULAI KAMERA ============
async function mulaiKamera() {
    const btn = document.getElementById('startBtn');
    btn.disabled = true;
    btn.innerText = '⏳ Memuat kamera...';

    // Cek apakah library html5-qrcode berhasil dimuat
    if (typeof Html5Qrcode === 'undefined') {
        debug('ERROR: Library html5-qrcode GAGAL dimuat! File /static/html5-qrcode.min.js tidak ditemukan.');
        showLog('❌ Library Tidak Termuat', 'File kamera tidak ditemukan di server. Hubungi pengembang.', 'error');
        btn.innerText = '📷 Mulai Kamera';
        btn.disabled = false;
        return;
    }

    debug('Library html5-qrcode berhasil dimuat. Meminta izin kamera...');

    try {
        // Langkah 1: Minta izin kamera secara eksplisit
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        // Izin diberikan! Matikan stream sementara, biar html5-qrcode yang handle
        stream.getTracks().forEach(track => track.stop());
        debug('Izin kamera DIBERIKAN. Memulai scanner...');
    } catch (err) {
        debug('GAGAL mendapatkan izin kamera: ' + err.name + ' - ' + err.message);
        showLog('❌ Kamera Ditolak', 'Browser tidak mengizinkan akses kamera. Pastikan kamu sudah mengaktifkan "Insecure origins treated as secure" di chrome://flags dan mengizinkan kamera.', 'error');
        btn.innerText = '📷 Coba Lagi';
        btn.disabled = false;
        return;
    }

    // Langkah 2: Mulai scanner barcode
    try {
        html5Qrcode = new Html5Qrcode("reader");

        await html5Qrcode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onScanBerhasil,
            () => {} // abaikan error scan per-frame
        );

        sedangScan = true;
        btn.style.display = 'none';
        debug('✅ Kamera AKTIF. Arahkan ke barcode...');

    } catch (err) {
        debug('GAGAL memulai scanner: ' + err);
        showLog('❌ Scanner Gagal', 'Gagal memulai pemindai: ' + err, 'error');
        btn.innerText = '📷 Coba Lagi';
        btn.disabled = false;
    }
}

// ============ SAAT BARCODE BERHASIL TERBACA ============
async function onScanBerhasil(barcode) {
    if (!sedangScan) return;
    sedangScan = false;

    // Getar HP
    if ("vibrate" in navigator) navigator.vibrate(200);

    // Hentikan kamera
    try { await html5Qrcode.stop(); } catch(e) {}

    debug('Barcode terbaca: ' + barcode + '. Mengirim ke laptop...');
    showLog('📤 Mengirim...', 'Barcode ' + barcode + ' sedang dikirim ke laptop...', 'info');

    // Kirim ke server Flask di laptop
    try {
        const resp = await fetch('/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: barcode })
        });
        const data = await resp.json();

        if (data.success) {
            showLog('✅ Sukses!', 'Barcode ' + barcode + ' berhasil dipindai dan diketikkan ke Odoo!', '');
            debug('✅ Berhasil dikirim ke laptop.');
        } else {
            showLog('⚠️ Gagal', data.message, 'error');
        }
    } catch (err) {
        showLog('❌ Koneksi Error', 'Tidak bisa mengirim ke laptop: ' + err.message, 'error');
    }

    // Tampilkan tombol "Pindai Berikutnya"
    document.getElementById('nextBtn').style.display = 'block';
}

// ============ PINDAI LAGI ============
async function pindaiLagi() {
    hideLog();
    document.getElementById('nextBtn').style.display = 'none';
    debug('Memulai ulang kamera...');

    try {
        await html5Qrcode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onScanBerhasil,
            () => {}
        );
        sedangScan = true;
        debug('✅ Kamera AKTIF kembali. Arahkan ke barcode...');
    } catch (err) {
        debug('Gagal memulai ulang kamera: ' + err);
        showLog('❌ Error', 'Gagal memulai ulang: ' + err, 'error');
        // Tampilkan tombol start lagi
        const btn = document.getElementById('startBtn');
        btn.style.display = 'block';
        btn.disabled = false;
        btn.innerText = '📷 Mulai Kamera';
    }
}

// ============ CEK AWAL ============
document.addEventListener("DOMContentLoaded", () => {
    if (typeof Html5Qrcode !== 'undefined') {
        debug('✅ Library html5-qrcode siap. Tekan tombol "Mulai Kamera" untuk memulai.');
    } else {
        debug('❌ ERROR: Library html5-qrcode TIDAK termuat! Cek koneksi.');
        showLog('❌ Library Error', 'File pemindai barcode tidak berhasil dimuat. Coba refresh halaman.', 'error');
    }
});
