const userModel = require("../models/user-model");
const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
    if (!req.cookies.token) {
        req.flash("error", "You need to login as an owner to access this page");
        return res.redirect("/users/login");
    }

    try {
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let user = await userModel.findOne({ email: decoded.email }).select("-password");

        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/users/login");
        }

        if (user.role !== 'owner') {
            req.flash("error", "Access denied. Owner privileges required.");
            return res.redirect("/");
        }

        req.user = user;
        next();
    } catch (err) {
        req.flash("error", "Invalid authentication. Please login again.");
        res.redirect("/users/login");
    }
};
