const express = require('express');
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isOwner = require("../middlewares/isOwner");

router.post('/create', isOwner, upload.single("image"), async function(req, res) {
    try {
        let { name, description, price, discount, stock, category, bgcolor, panelcolor, textcolor, isFeatured } = req.body;

        let product = await productModel.create({
            image: req.file ? req.file.buffer : null,
            name,
            description: description || '',
            price: parseFloat(price),
            discount: parseFloat(discount) || 0,
            stock: parseInt(stock) || 0,
            category,
            bgcolor: bgcolor || '#ffffff',
            panelcolor: panelcolor || '#000000',
            textcolor: textcolor || '#000000',
            isFeatured: isFeatured === 'true',
            rating: (Math.random() * 1.5 + 3.5).toFixed(1),
            reviewCount: Math.floor(Math.random() * 150) + 25,
            wishlistCount: Math.floor(Math.random() * 30) + 5
        });
        
        req.flash("success", `Successfully created "${name}"! Stock: ${stock} items available. ${isFeatured === 'true' ? 'This product will be featured on the homepage.' : ''}`);
        res.redirect("/owners/create-product");
    } catch (err) {
        console.error('Product creation error:', err);
        req.flash("error", "Error creating product: " + err.message);
        res.redirect("/owners/create-product");
    }
});

router.post('/update/:id', isOwner, upload.single("image"), async function(req, res) {
    try {
        let { name, description, price, discount, stock, category, bgcolor, panelcolor, textcolor, isFeatured } = req.body;
        
        let updateData = {
            name,
            description: description || '',
            price: parseFloat(price),
            discount: parseFloat(discount) || 0,
            stock: parseInt(stock) || 0,
            category,
            bgcolor: bgcolor || '#ffffff',
            panelcolor: panelcolor || '#000000',
            textcolor: textcolor || '#000000',
            isFeatured: isFeatured === 'true'
        };

        if (req.file) {
            updateData.image = req.file.buffer;
        }

        await productModel.findByIdAndUpdate(req.params.id, updateData);
        
        req.flash("success", `Successfully updated "${name}"! Stock: ${stock} items available.`);
        res.redirect("/owners/manage-products");
    } catch (err) {
        req.flash("error", "Error updating product: " + err.message);
        res.redirect("/owners/edit-product/" + req.params.id);
    }
});

module.exports = router;
