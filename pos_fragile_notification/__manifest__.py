{
    'name': 'POS Fragile Notification',
    'version': '1.0',
    'category': 'Point of Sale',
    'summary': 'Memunculkan pop-up SOP pengemasan untuk barang pecah belah di POS',
    'description': """
        Modul ini menambahkan fitur notifikasi peringatan pengemasan khusus di modul PoS 
        untuk pembelian produk tertentu (barang pecah belah, keramik, kaca, hiasan dinding).
        
        Fitur:
        - Auto-deteksi produk fragile saat diklik
        - Menampilkan warning visual dengan SOP pengemasan
        - Integrasi dengan POS Odoo 19
    """,
    'author': 'Kelompok 1 - D3 Teknik Informatika Polban',
    'depends': ['point_of_sale', 'product', 'stock'],
    'data': [
        'views/fragile_dialog.xml',
        'views/res_partner_views.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_fragile_notification/static/src/js/fragile_popup.js',
            'pos_fragile_notification/static/src/css/pos_partner_form.css',
            'pos_fragile_notification/static/src/css/pos_product_card.css',
            'pos_fragile_notification/static/src/css/pos_order_summary.css',
            'pos_fragile_notification/static/src/css/pos_login_screen.css',
            'pos_fragile_notification/static/src/css/pos_dark_theme.css',
            'pos_fragile_notification/static/src/xml/product_card_override.xml',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}