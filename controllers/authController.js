const userModel = require("../models/user-model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const {generateToken} = require("../utils/generateToken")

module.exports.registerUser = async function (req, res) {
    try {
        let { email, username, password, role } = req.body;

        let user = await userModel.findOne({email});
        if (user) {
            req.flash("error", "You already have an account, please login");
            return res.redirect("/users/register");
        }

        // Only allow owner creation in development mode for security
        if (role === 'owner' && process.env.NODE_ENV !== 'development') {
            req.flash("error", "Owner account creation is restricted");
            return res.redirect("/users/register");
        }

        bcrypt.genSalt(12, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    return res.redirect("/users/register");
                } else {
                    let user = await userModel.create({
                        email,
                        username,
                        password: hash,
                        role: role || 'user'  // Default to user if no role specified
                    });

                    let token = generateToken(user);
                    res.cookie("token", token);
                    
                    if (user.role === 'owner') {
                        req.flash("success", "Owner account created successfully! Welcome to Veloura Admin");
                        res.redirect("/owners/dashboard");
                    } else {
                        req.flash("success", "Account created successfully! Welcome to Veloura");
                        res.redirect("/");
                    }
                }
            })
        })

    } catch (err) {
        req.flash("error", "Something went wrong");
        res.redirect("/users/register");
    }
}

module.exports.loginUser = async function (req, res) {
    let {email, password} = req.body;

    let user = await userModel.findOne({email});
    if(!user) {
        req.flash("error", "Email or Password Incorrect");
        return res.redirect("/users/login");
    }

    bcrypt.compare(password, user.password, function (err, result){
        if(result) {
            let token = generateToken(user);
            res.cookie("token", token);
            
            if (user.role === 'owner') {
                req.flash("success", "Welcome back to Veloura Admin!");
                res.redirect("/owners/dashboard");
            } else {
                req.flash("success", "Welcome back to Veloura!");
                res.redirect("/");
            }
        } else {
            req.flash("error", "Email or Password Incorrect");
            return res.redirect("/users/login");
        }
    })
}

module.exports.logout = function (req, res){
    res.cookie("token", "");
    req.flash("success", "Logged out successfully");
    res.redirect("/");
}
