const asyncHandler = require('express-async-handler');
const User = require("../models/User");
const passport = require('passport');


exports.sign_up_get = asyncHandler(async(req, res, next) => {
    res.render("sign-up-form");
})

exports.sign_up_post = asyncHandler(async(req, res, next) => {
    try {
        const user = new User({
          username: req.body.username,
          password: req.body.password
        });
        const result = await user.save();
        res.redirect("/");
      } catch(err) {
        return next(err);
      };
})

exports.log_in = asyncHandler(async(req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/"
      })
})

exports.log_out = asyncHandler(async(req, res, next) => {
    req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
})

exports.index = asyncHandler(async(req, res, next) => {
    res.render("index", { user: req.user });
})