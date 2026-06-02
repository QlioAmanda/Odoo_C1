from odoo import models, fields, api

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    is_fragile_product = fields.Boolean(
        string='Is Fragile Product',
        compute='_compute_is_fragile_product',
        store=True
    )

    @api.depends('categ_id')
    def _compute_is_fragile_product(self):
        for product in self:
            # Mencocokkan dengan nama kategori yang sudah kamu buat sebelumnya
            if product.categ_id.name in ['Barang Mudah Pecah atau Rusak', 'Dekorasi Sensitif']:
                product.is_fragile_product = True
            else:
                product.is_fragile_product = False