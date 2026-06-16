from flask import Flask, render_template, request, jsonify
from flask_cors import CORS  # type: ignore[import-untyped]
import keyboard  # type: ignore[import-untyped]
import ctypes
import ctypes.wintypes as wintypes
import logging
import threading
import time

# Nonaktifkan logging Flask yang berlebihan di terminal
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
CORS(app)

# ============ WINDOWS API: FOKUSKAN WINDOW BROWSER ============
user32 = ctypes.windll.user32

def focus_odoo_window():
    """Cari window browser yang membuka Odoo POS, lalu paksa ke depan."""
    target = [None]

    @ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    def enum_callback(hwnd, lparam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buf = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buf, length + 1)
                title = buf.value.lower()
                # Cari window yang mengandung kata 'odoo' di judulnya
                if 'odoo' in title:
                    target[0] = hwnd
                    return False  # Berhenti mencari
        return True  # Lanjut cari

    user32.EnumWindows(enum_callback, 0)

    if target[0]:
        try:
            # Trik Windows agar SetForegroundWindow berhasil dari background process
            foreground_hwnd = user32.GetForegroundWindow()
            foreground_tid = user32.GetWindowThreadProcessId(foreground_hwnd, None)
            current_tid = ctypes.windll.kernel32.GetCurrentThreadId()

            user32.AttachThreadInput(current_tid, foreground_tid, True)
            # Jika diminimize, restore dulu
            if user32.IsIconic(target[0]):
                user32.ShowWindow(target[0], 9)  # SW_RESTORE
            else:
                user32.ShowWindow(target[0], 5)  # SW_SHOW - tampilkan tanpa ubah ukuran
            user32.BringWindowToTop(target[0])
            user32.SetForegroundWindow(target[0])
            user32.AttachThreadInput(current_tid, foreground_tid, False)

            print("[FOCUS] Window Odoo berhasil difokuskan.")
            return True
        except Exception as e:
            print(f"[WARN] Gagal memfokuskan window: {e}")
            return False
    else:
        print("[WARN] Window Odoo tidak ditemukan. Pastikan Odoo POS terbuka di browser.")
        return False


# ============ FLASK ROUTES ============
@app.route('/')
def index():
    return render_template('index.html')

def simulate_keyboard(barcode_data):
    try:
        # Langkah 1: Fokuskan window browser Odoo POS
        focus_odoo_window()
        time.sleep(0.5)  # Tunggu window benar-benar aktif

        # Langkah 2: Ketik barcode menggunakan keyboard driver level OS
        keyboard.write(barcode_data, delay=0.02)
        time.sleep(0.05)
        keyboard.press_and_release('enter')

        print(f"[OK] Barcode '{barcode_data}' berhasil diketikkan ke Odoo.")
    except Exception as e:
        print(f"[ERROR] Error: {e}")

@app.route('/scan', methods=['POST'])
def receive_scan():
    try:
        data = request.get_json()
        barcode = data.get('barcode', '').strip()

        if not barcode:
            return jsonify({'success': False, 'message': 'Barcode kosong!'}), 400

        print(f"\n[SCAN] Menerima barcode dari HP: {barcode}")

        thread = threading.Thread(target=simulate_keyboard, args=(barcode,))
        thread.start()

        return jsonify({
            'success': True,
            'message': f'Barcode {barcode} berhasil diterima dan diketikkan.'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    print("=====================================================")
    print("[OK] Phone to PC Barcode Scanner sedang berjalan!")
    print("=====================================================")
    print("Pastikan Odoo POS terbuka di browser laptop.")
    print("Barcode akan OTOMATIS difokuskan ke window Odoo.")
    print("-----------------------------------------------------")
    print("Buka URL berikut di browser HP:")
    print("-> http://<IP_LAPTOP>:5500")
    print("=====================================================")

    app.run(host='0.0.0.0', port=5500, debug=False)
