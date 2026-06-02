/** @odoo-module **/

import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { patch } from "@web/core/utils/patch";

// Debounce helper untuk mencegah dialog ganda jika diklik sangat cepat
window.lastFragileAlertTime = window.lastFragileAlertTime || 0;

function checkAndAlert(productName) {
    if (!productName) return false;
    const lowerName = productName.toLowerCase();
    
    // Daftar kata kunci produk rentan / sensitif (Kaca, Keramik, Bingkai Foto, Cermin, Vas, dll.)
    const sensitiveKeywords = ["kaca", "keramik", "cermin", "bingkai", "vas", "glass", "porcelain", "pecah"];
    
    // Periksa apakah nama produk mengandung salah satu kata kunci di atas
    const isSensitive = sensitiveKeywords.some(keyword => lowerName.includes(keyword));
    
    if (isSensitive) {
        const now = Date.now();
        // Debounce 1.5 detik
        if (now - window.lastFragileAlertTime > 1500) {
            window.lastFragileAlertTime = now;
            
            // Wajib menggunakan window.alert() native browser sesuai instruksi teknis Anda
            window.alert(
                "⚠️ PERINGATAN: BARANG PECAH BELAH / SENSITIF! ⚠️\n\n" +
                "SOP PENGEMASAN:\n" +
                "- Gunakan pelindung Bubble Wrap tebal.\n" +
                "- Gunakan kardus Double Wall.\n" +
                "- Wajib tempelkan stiker FRAGILE."
            );
        }
        return true;
    }
    return false;
}

// Intersepsi OWL: Patch ProductScreen.prototype (Solusi Utama, Bersih & Presisi Tinggi)
try {
    patch(ProductScreen.prototype, {
        async addProductToOrder(product) {
            if (product) {
                // Membaca nama produk secara langsung dari model (sangat presisi, bukan teks halaman DOM)
                const name = product.name || product.display_name || "";
                checkAndAlert(name);
            }
            return super.addProductToOrder(...arguments);
        }
    });
    console.log("✅ Fragile POS alert: ProductScreen successfully patched.");
} catch (error) {
    console.error("❌ Fragile POS alert: Failed to patch ProductScreen. Error: ", error);
}
