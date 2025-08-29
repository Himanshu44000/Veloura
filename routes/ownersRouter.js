const express = require('express');
const router = express.Router();
const isOwner = require("../middlewares/isOwner");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

// Owner Dashboard - Main admin page
router.get('/dashboard', isOwner, async function(req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    
    // Get stats for dashboard
    const totalProducts = await productModel.countDocuments();
    const totalUsers = await userModel.countDocuments({role: 'user'});
    const totalOrders = 0; // You can implement order counting later
    const featuredProducts = await productModel.countDocuments({isFeatured: true});
    
    const recentProducts = await productModel.find().sort({_id: -1}).limit(5);
    
    res.render('owner-dashboard', {
        success,
        error,
        user: req.user,
        stats: {
            totalProducts,
            totalUsers,
            totalOrders,
            featuredProducts
        },
        recentProducts
    });
});

// Create Products Page
router.get('/create-product', isOwner, function(req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    res.render('createproducts', {success, error, user: req.user});
});

// Manage Products Page
router.get('/manage-products', isOwner, async function(req, res) {
    let success = req.flash("success");
    let error = req.flash("error");
    const products = await productModel.find().sort({_id: -1});
    res.render('manage-products', {success, error, user: req.user, products});
});

// Edit Product Page
router.get('/edit-product/:id', isOwner, async function(req, res) {
    try {
        const product = await productModel.findById(req.params.id);
        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect("/owners/manage-products");
        }
        
        let success = req.flash("success");
        let error = req.flash("error");
        res.render('edit-product', {success, error, user: req.user, product});
    } catch (err) {
        req.flash("error", "Error loading product");
        res.redirect("/owners/manage-products");
    }
});

// Delete Product
router.get('/delete-product/:id', isOwner, async function(req, res) {
    try {
        await productModel.findByIdAndDelete(req.params.id);
        req.flash("success", "Product deleted successfully");
    } catch (err) {
        req.flash("error", "Error deleting product");
    }
    res.redirect("/owners/manage-products");
});

// Legacy route for backward compatibility
router.get('/admin', isOwner, function(req, res) {
    res.redirect('/owners/dashboard');
});

module.exports = router;
