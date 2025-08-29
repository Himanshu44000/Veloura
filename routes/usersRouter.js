const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const emailService = require('../services/emailService');

router.get("/", function (req, res) {
    res.send("hey its working");
});

// GET route to display registration form
router.get("/register", function (req, res) {
    let error = req.flash("error");
    let success = req.flash("success");
    res.render("register", { error, success });
});

// GET route to display login form
router.get("/login", function (req, res) {
    let error = req.flash("error");
    let success = req.flash("success");
    res.render("login", { error, success });
});

// POST route to handle registration form submission
router.post("/register", async function (req, res) {
    try {
        let { email, password, username, role } = req.body;

        // Check if user already exists
        let user = await userModel.findOne({ email: email });
        if (user) {
            req.flash("error", "User already registered.");
            return res.redirect("/users/register");
        }

        // Hash password and create user
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) {
                    req.flash("error", "Error in registration.");
                    return res.redirect("/users/register");
                }

                try {
                    // Create user
                    let user = await userModel.create({
                        username,
                        email,
                        password: hash,
                        role: role || 'user'
                    });

                    // Generate token
                    let token = jwt.sign({ email: email, userid: user._id }, process.env.JWT_KEY);
                    res.cookie("token", token);

                    // Send welcome email (ADD THIS BLOCK)
                    emailService.sendWelcomeEmail(email, username).then(result => {
                        if (result.success) {
                            console.log('✅ Welcome email sent successfully to:', email);
                        } else {
                            console.log('❌ Failed to send welcome email:', result.error);
                        }
                    }).catch(err => {
                        console.error('❌ Email service error:', err);
                    });

                    // Flash success and redirect
                    if (user.role === 'owner') {
                        req.flash("success", "Account created successfully! Welcome to Veloura Admin! Check your email for a welcome message.");
                        res.redirect("/owners/dashboard");
                    } else {
                        req.flash("success", "Welcome to Veloura! Check your email for a welcome message.");
                        res.redirect("/");
                    }
                } catch (userCreationError) {
                    console.error('User creation error:', userCreationError);
                    req.flash("error", "Error creating user account.");
                    res.redirect("/users/register");
                }
            });
        });
    } catch (err) {
        console.error('Registration error:', err);
        req.flash("error", "Something went wrong during registration.");
        res.redirect("/users/register");
    }
});

// POST route to handle login form submission
router.post("/login", async function (req, res) {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email: email });
    if (!user) {
        req.flash("error", "Email or Password incorrect");
        return res.redirect("/users/login");
    }

    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, process.env.JWT_KEY);
            res.cookie("token", token);
            
            if (user.role === 'owner') {
                req.flash("success", "Welcome back to Veloura Admin!");
                res.redirect("/owners/dashboard");
            } else {
                req.flash("success", "Welcome back to Veloura!");
                res.redirect("/");
            }
        } else {
            req.flash("error", "Email or Password incorrect");
            res.redirect("/users/login");
        }
    });
});

// GET route for logout
router.get("/logout", function (req, res) {
    res.cookie("token", "");
    res.redirect("/");
});

// POST route for testing emails
router.post("/test-email", async function (req, res) {
    try {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and name are required' 
            });
        }

        const result = await emailService.sendWelcomeEmail(email, name);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
