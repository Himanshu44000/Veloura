const express = require("express");
const router = express.Router();
const isloggedin = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

// Set consistent API version
const CASHFREE_API_VERSION = "2023-08-01"; // Use this consistently

router.get("/", async function (req, res) {
    let error = req.flash("error");
    let success = req.flash("success");
    let loggedin = false;
    let isOwner = false;
    let cartCount = 0;
    let wishlistCount = 0;

    if (req.cookies.token) {
        try {
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
            const user = await userModel.findOne({ email: decoded.email });
            if (user) {
                loggedin = true;
                isOwner = user.role === 'owner';

                // Calculate cart count (total quantity of all items)
                if (user.cart && user.cart.length > 0) {
                    cartCount = user.cart.reduce((total, item) => total + (item.quantity || 1), 0);
                }

                // Calculate wishlist count
                wishlistCount = user.wishlist ? user.wishlist.length : 0;
            }
        } catch (err) {
            loggedin = false;
        }
    }

    const featuredChains = await productModel.find({
        isFeatured: true,
        category: 'chain'
    }).limit(3);

    const featuredRings = await productModel.find({
        isFeatured: true,
        category: 'ring'
    }).limit(3);

    const featuredBracelets = await productModel.find({
        isFeatured: true,
        category: 'bracelet'
    }).limit(3);

    if (featuredChains.length === 0) {
        const fallbackChains = await productModel.find({ category: 'chain' }).limit(3);
        featuredChains.push(...fallbackChains);
    }

    if (featuredRings.length === 0) {
        const fallbackRings = await productModel.find({ category: 'ring' }).limit(3);
        featuredRings.push(...fallbackRings);
    }

    if (featuredBracelets.length === 0) {
        const fallbackBracelets = await productModel.find({ category: 'bracelet' }).limit(3);
        featuredBracelets.push(...fallbackBracelets);
    }

    // Use public folder paths served by express.static
    // Either pass strings or objects with imageUrl
    const heroImages = [
        { imageUrl: '/chain.jpeg', title: 'Premium Chain Collection' },
        { imageUrl: '/ring.jpeg', title: 'Exquisite Ring Designs' },
        { imageUrl: '/bracelet.jpeg', title: 'Stunning Bracelet Collection' }
    ];

    res.render("index", {
        error,
        success,
        loggedin,
        isOwner,
        cartCount,
        wishlistCount,
        featuredChains,
        featuredRings,
        featuredBracelets,
        heroImages
    });
});

// Advanced Shop route with filtering, search, and pagination
router.get("/shop", isloggedin, async function (req, res) {
    try {
        let success = req.flash("success");
        let user = null;

        // Get current user
        if (req.cookies.token) {
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
                user = await userModel.findOne({ email: decoded.email });
            } catch (err) {
                // Handle JWT error
            }
        }

        // Pagination settings - ENSURE THESE ARE ALWAYS DEFINED
        const productsPerPage = 10;
        const currentPage = parseInt(req.query.page) || 1;
        const skip = (currentPage - 1) * productsPerPage;

        // Build filter query
        let filterQuery = {};
        let sortQuery = {};

        // Search functionality
        const searchTerm = req.query.search || ''; // DEFAULT TO EMPTY STRING

        if (searchTerm) {
            filterQuery.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { category: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Category filter
        const categories = req.query.category;
        if (categories) {
            if (Array.isArray(categories)) {
                filterQuery.category = { $in: categories };
            } else {
                filterQuery.category = categories;
            }
        }

        // Stock filter
        const stockFilters = req.query.stock;
        if (stockFilters) {
            const stockArray = Array.isArray(stockFilters) ? stockFilters : [stockFilters];
            if (stockArray.includes('inStock') && stockArray.includes('outOfStock')) {
                // No filter needed if both are selected
            } else if (stockArray.includes('inStock')) {
                filterQuery.stock = { $gt: 0 };
            } else if (stockArray.includes('outOfStock')) {
                filterQuery.stock = { $eq: 0 };
            }
        }

        // Rating filter
        const ratingFilters = req.query.rating;
        if (ratingFilters) {
            const ratingArray = Array.isArray(ratingFilters) ? ratingFilters : [ratingFilters];
            const minRating = Math.min(...ratingArray.map(r => parseFloat(r)));
            filterQuery.rating = { $gte: minRating };
        }

        // Featured filter
        if (req.query.featured === 'true') {
            filterQuery.isFeatured = true;
        }

        // Discount filter
        if (req.query.discount === 'true') {
            filterQuery.discount = { $gt: 0 };
        }

        // Price sorting
        const priceSort = req.query.priceSort;
        if (priceSort === 'lowToHigh') {
            sortQuery.price = 1;
        } else if (priceSort === 'highToLow') {
            sortQuery.price = -1;
        } else {
            sortQuery.createdAt = -1; // Default sort by newest first
        }

        // Get total count for pagination
        const totalProducts = await productModel.countDocuments(filterQuery);
        const totalPages = Math.ceil(totalProducts / productsPerPage) || 1; // ENSURE AT LEAST 1

        // Get products with filters, sorting, and pagination
        let products = await productModel.find(filterQuery)
            .sort(sortQuery)
            .skip(skip)
            .limit(productsPerPage);

        // ENSURE ALL VARIABLES ARE DEFINED BEFORE RENDERING
        res.render("shop", {
            products: products || [],                    // Default to empty array
            success: success || '',                      // Default to empty string
            searchTerm: searchTerm,                      // Already defaulted above
            currentPage: currentPage,                    // Already defined
            totalPages: totalPages,                      // Already defined with fallback
            totalProducts: totalProducts || 0,           // Default to 0
            productsPerPage: productsPerPage,           // Already defined
            user: user || null                           // Default to null
        });

    } catch (err) {
        console.error('Shop route error:', err);
        req.flash("error", "Error loading shop page");

        // RENDER WITH DEFAULT VALUES IN CASE OF ERROR
        res.render("shop", {
            products: [],
            success: '',
            searchTerm: '',
            currentPage: 1,
            totalPages: 1,
            totalProducts: 0,
            productsPerPage: 10,
            user: null
        });
    }
});

// User profile route
router.get("/user/profile", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email }).populate('cart.product wishlist');
        let success = req.flash("success");
        let error = req.flash("error");

        res.render("user-profile", {
            user,
            success,
            error
        });
    } catch (err) {
        console.error('User profile error:', err);
        req.flash("error", "Error loading profile.");
        res.redirect("/");
    }
});

router.get("/cart", isloggedin, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email }).populate('cart.product');
    let success = req.flash("success");
    let error = req.flash("error");

    // Calculate total items and subtotal
    let totalItems = 0;
    let subtotal = 0;

    if (user.cart && user.cart.length > 0) {
        user.cart.forEach(item => {
            if (item.product) {
                totalItems += item.quantity;
                const itemPrice = item.product.price - (item.product.discount || 0);
                subtotal += itemPrice * item.quantity;
            }
        });
    }

    res.render("cart", { user, totalItems, subtotal, success, error });
});

router.get("/wishlist", isloggedin, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email }).populate("wishlist");
    res.render("wishlist", { user });
});

// FIXED Updated add to cart route with better AJAX detection
router.get("/addtocart/:productid", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        let product = await productModel.findById(req.params.productid);

        const isAjax = req.xhr ||
            req.headers.accept.indexOf('json') > -1 ||
            req.headers['x-requested-with'] === 'XMLHttpRequest';

        if (!product) {
            if (isAjax) {
                return res.json({ success: false, message: "Product not found." });
            }
            req.flash("error", "Product not found.");
            return res.redirect("/shop");
        }

        if (product.stock <= 0) {
            if (isAjax) {
                return res.json({ success: false, message: "Sorry, this product is out of stock." });
            }
            req.flash("error", "Sorry, this product is out of stock.");
            return res.redirect("/shop");
        }

        // Check if product already exists in cart
        const existingCartItem = user.cart.find(item => item.product.toString() === req.params.productid);

        if (existingCartItem) {
            if (existingCartItem.quantity >= product.stock) {
                if (isAjax) {
                    return res.json({ success: false, message: `Sorry, only ${product.stock} items available in stock.` });
                }
                req.flash("error", `Sorry, only ${product.stock} items available in stock.`);
                return res.redirect("/shop");
            }
            existingCartItem.quantity += 1;
        } else {
            user.cart.push({
                product: req.params.productid,
                quantity: 1
            });
        }

        await user.save();

        // Calculate new cart count
        const cartCount = user.cart.reduce((total, item) => total + (item.quantity || 1), 0);

        if (isAjax) {
            return res.json({
                success: true,
                message: "Added to cart.",
                cartCount: cartCount
            });
        }

        req.flash("success", "Added to cart.");
        res.redirect("/shop");
    } catch (err) {
        console.error('Add to cart error:', err);
        const isAjax = req.xhr ||
            req.headers.accept.indexOf('json') > -1 ||
            req.headers['x-requested-with'] === 'XMLHttpRequest';
        if (isAjax) {
            return res.json({ success: false, message: "Error adding to cart." });
        }
        req.flash("error", "Error adding to cart.");
        res.redirect("/shop");
    }
});

// Clear all wishlist route
router.post("/wishlist/clear-all", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });

        // Clear all wishlist items
        user.wishlist = [];
        await user.save();

        // Check if request expects JSON (from AJAX)
        const isAjax = req.xhr ||
            req.headers.accept.indexOf('json') > -1 ||
            req.headers['x-requested-with'] === 'XMLHttpRequest';

        if (isAjax) {
            return res.json({
                success: true,
                message: "Wishlist cleared successfully."
            });
        }

        req.flash("success", "Wishlist cleared successfully.");
        res.redirect("/wishlist");
    } catch (err) {
        console.error('Clear wishlist error:', err);
        const isAjax = req.xhr ||
            req.headers.accept.indexOf('json') > -1 ||
            req.headers['x-requested-with'] === 'XMLHttpRequest';
        if (isAjax) {
            return res.json({ success: false, message: "Error clearing wishlist." });
        }
        req.flash("error", "Error clearing wishlist.");
        res.redirect("/wishlist");
    }
});

// Update cart quantity route
router.post("/cart/update", isloggedin, async function (req, res) {
    try {
        const { productId, action } = req.body;
        let user = await userModel.findOne({ email: req.user.email });
        let product = await productModel.findById(productId);

        const cartItem = user.cart.find(item => item.product.toString() === productId);

        if (cartItem && product) {
            if (action === 'increase') {
                if (cartItem.quantity >= product.stock) {
                    req.flash("error", `Sorry, only ${product.stock} items available in stock.`);
                } else {
                    cartItem.quantity += 1;
                    await user.save();
                    req.flash("success", "Cart updated.");
                }
            } else if (action === 'decrease') {
                if (cartItem.quantity > 1) {
                    cartItem.quantity -= 1;
                    await user.save();
                    req.flash("success", "Cart updated.");
                } else {
                    req.flash("error", "Minimum quantity is 1. Use delete to remove item.");
                }
            }
        }

        res.redirect("/cart");
    } catch (err) {
        req.flash("error", "Error updating cart.");
        res.redirect("/cart");
    }
});

// Remove from cart route
router.get("/cart/remove/:productid", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        user.cart = user.cart.filter(item => item.product.toString() !== req.params.productid);
        await user.save();
        req.flash("success", "Item removed from cart.");
        res.redirect("/cart");
    } catch (err) {
        req.flash("error", "Error removing item from cart.");
        res.redirect("/cart");
    }
});

// FIXED Updated add to wishlist route with TOGGLE functionality and better AJAX detection
router.get("/addtowishlist/:productid", isloggedin, async function (req, res) {
    try {
        let user = await userModel.findOne({ email: req.user.email });
        let isInWishlist = user.wishlist.includes(req.params.productid);
        let message = '';

        const isAjax = req.xhr ||
            req.headers.accept.indexOf('json') > -1 ||
            req.headers['x-requested-with'] === 'XMLHttpRequest';

        if (isInWishlist) {
            // Remove from wishlist
            user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productid);
            await user.save();

            await productModel.findByIdAndUpdate(
                req.params.productid,
                { $inc: { wishlistCount: -1 } }
            );

            message = "Removed from wishlist.";
        } else {
            // Add to wishlist
            user.wishlist.push(req.params.productid);
            await user.save();

            await productModel.findByIdAndUpdate(
                req.params.productid,
                { $inc: { wishlistCount: 1 } }
            );

            message = "Added to wishlist.";
        }

        if (isAjax) {
            return res.json({
                success: true,
                message: message,
                wishlistCount: user.wishlist.length,
                isInWishlist: !isInWishlist
            });
        }

        req.flash("success", message);
        res.redirect(req.get('Referrer') || '/');
    } catch (err) {
        console.error('Add to wishlist error:', err);
        const isAjax = req.xhr ||
            req.headers.accept.indexOf('json') > -1 ||
            req.headers['x-requested-with'] === 'XMLHttpRequest';
        if (isAjax) {
            return res.json({ success: false, message: "Error updating wishlist." });
        }
        req.flash("error", "Error updating wishlist.");
        res.redirect(req.get('Referrer') || '/');
    }
});

// Contact Us Page
router.get("/contact-us", (req, res) => {
    let loggedin = false;
    if (req.cookies.token) {
        try {
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
            loggedin = true;
        } catch (err) {
            loggedin = false;
        }
    }
    res.render("contact-us", { loggedin });
});

// Size Guide Page
router.get("/size-guide", (req, res) => {
    let loggedin = false;
    if (req.cookies.token) {
        try {
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
            loggedin = true;
        } catch (err) {
            loggedin = false;
        }
    }
    res.render("size-guide", { loggedin });
});

// Care Instructions Page
router.get("/care-instructions", (req, res) => {
    let loggedin = false;
    if (req.cookies.token) {
        try {
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
            loggedin = true;
        } catch (err) {
            loggedin = false;
        }
    }
    res.render("care-instructions", { loggedin });
});

// Warranty Page
router.get("/warranty", (req, res) => {
    let loggedin = false;
    if (req.cookies.token) {
        try {
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
            loggedin = true;
        } catch (err) {
            loggedin = false;
        }
    }
    res.render("warranty", { loggedin });
});

module.exports = router;
