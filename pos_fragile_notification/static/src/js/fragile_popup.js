/** @odoo-module **/

import { ProductCard } from "@point_of_sale/app/components/product_card/product_card";
import { PosStore } from "@point_of_sale/app/services/pos_store";
import { patch } from "@web/core/utils/patch";

// Premium Compact Glassmorphic Dialog — Ukuran Pas, Tidak Mengganggu Layar POS
function showPremiumFragileWarning(productName, onConfirm) {
    // 1. Overlay background blur
    const overlay = document.createElement("div");
    overlay.id = "fragile_overlay";
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.25s ease;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    `;

    // 2. Kartu dialog — compact, max-width 380px
    const card = document.createElement("div");
    card.style.cssText = `
        background: linear-gradient(145deg, #1e1b4b 0%, #2d1a3e 100%);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 18px;
        padding: 24px 28px;
        width: 85%;
        max-width: 380px;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px rgba(239,68,68,0.15);
        text-align: center;
        color: #f8fafc;
        transform: scale(0.92) translateY(15px);
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    `;

    // 3. Konten kartu — lebih compact
    card.innerHTML = `
        <div style="font-size: 38px; margin-bottom: 10px; animation: fragilePulse 2s infinite;">⚠️</div>
        <h2 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 800; background: linear-gradient(to right, #fca5a5, #f87171, #ef4444); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; letter-spacing: 0.01em;">
            PERINGATAN: BARANG PECAH BELAH!
        </h2>
        <h3 style="margin: 0 0 14px 0; font-size: 14px; font-weight: 700; color: #f87171;">
            Rekomendasi Pengemasan Ekstra (Rp 3.000)
        </h3>
        <p style="margin: 0 0 14px 0; font-size: 12.5px; color: #94a3b8; font-weight: 500;">
            Produk: <span style="color: #fca5a5; font-weight: 700;">${productName}</span>
        </p>
        
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 14px 16px; border-radius: 12px; margin-bottom: 16px; text-align: left;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 10px; font-size: 12px; color: #e2e8f0;">
                <span style="color: #ef4444; margin-right: 8px; font-weight: 900; margin-top: 2px;">•</span>
                <span style="line-height: 1.4;">Tawarkan pelanggan untuk menggunakan tambahan <strong style="color:#fff;">Bubble Wrap &amp; Kardus Double Wall</strong> agar aman.</span>
            </div>
            <div style="display: flex; align-items: flex-start; font-size: 12px; color: #e2e8f0;">
                <span style="color: #ef4444; margin-right: 8px; font-weight: 900; margin-top: 2px;">•</span>
                <span style="line-height: 1.4;"><strong style="color:#f87171;">PENTING:</strong> Beritahu pelanggan bahwa jika tawaran ini ditolak, segala kerusakan barang setelah meninggalkan toko adalah <strong style="color:#fff;">di luar tanggung jawab pihak Toko Utama Sentosa</strong>.</span>
            </div>
        </div>
    `;

    // 4. Tombol — compact
    const btn = document.createElement("button");
    btn.style.cssText = `
        background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
        color: white;
        border: none;
        padding: 11px 24px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.02em;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        width: 100%;
    `;
    btn.innerText = "SAYA MENGERTI & LANJUTKAN";
    
    btn.onmouseover = () => {
        btn.style.transform = "translateY(-1px)";
        btn.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.5)";
    };
    btn.onmouseout = () => {
        btn.style.transform = "none";
        btn.style.boxShadow = "0 4px 14px rgba(239, 68, 68, 0.35)";
    };

    // 5. Penutupan AMAN — hanya hapus overlay sendiri
    btn.onclick = () => {
        overlay.style.opacity = "0";
        card.style.transform = "scale(0.92) translateY(15px)";
        setTimeout(() => {
            overlay.remove();
            if (onConfirm) onConfirm();
        }, 250);
    };

    card.appendChild(btn);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // 6. Animasi keyframes
    if (!document.getElementById("fragile-keyframes")) {
        const style = document.createElement("style");
        style.id = "fragile-keyframes";
        style.innerHTML = `
            @keyframes fragilePulse {
                0% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(239,68,68,0.4)); }
                50% { transform: scale(1.06); filter: drop-shadow(0 0 12px rgba(239,68,68,0.7)); }
                100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(239,68,68,0.4)); }
            }
        `;
        document.head.appendChild(style);
    }

    // Animasi masuk
    setTimeout(() => {
        overlay.style.opacity = "1";
        card.style.transform = "scale(1) translateY(0)";
    }, 10);
}

// Patch PosStore — intercept addLineToCurrentOrder for BOTH clicks and barcodes
try {
    patch(PosStore.prototype, {
        async addLineToCurrentOrder(vals, opts = {}, configure = true) {
            const product = vals.product_tmpl_id || vals.product_id || (vals.id ? vals : null);
            if (product) {
                const name = product.name || product.display_name || (vals.product_id && vals.product_id.display_name) || "";
                const lowerName = name.toLowerCase();
                
                const sensitiveKeywords = ["kaca", "keramik", "cermin", "bingkai", "vas", "glass", "porcelain", "pecah", "mug", "piring", "mangkok", "toples", "cangkir", "botol", "frame"];
                const isSensitive = sensitiveKeywords.some(keyword => lowerName.includes(keyword));
                
                if (isSensitive) {
                    await new Promise((resolve) => {
                        showPremiumFragileWarning(name, resolve);
                    });
                }
            }
            return super.addLineToCurrentOrder(...arguments);
        }
    });
    console.log("✅ Fragile POS: PosStore patched (intercepts both clicks & barcodes).");
} catch (error) {
    console.error("❌ Fragile POS: PosStore Patch failed:", error);
}

// Patch ProductCard — add isFragileProduct getter for XML
try {
    patch(ProductCard.prototype, {
        get isFragileProduct() {
            const name = this.props.name || (this.props.product && this.props.product.display_name) || "";
            const lowerName = name.toLowerCase();
            const sensitiveKeywords = ["kaca", "keramik", "cermin", "bingkai", "vas", "glass", "porcelain", "pecah", "mug", "piring", "mangkok", "toples", "cangkir", "botol", "frame"];
            return sensitiveKeywords.some(keyword => lowerName.includes(keyword));
        }
    });
    console.log("✅ Fragile POS: ProductCard patched.");
} catch (error) {
    console.error("❌ Fragile POS: ProductCard patch failed:", error);
}
