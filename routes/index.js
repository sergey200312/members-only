var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const User = require('../models/User');
const { body, validationResult } = require("express-validator");

// Отображение формы регистрации
router.get("/sign-up", asyncHandler(async (req, res, next) => {
  res.render("sign-up-form");
}));

// Обработка регистрации
router.post("/sign-up", [
  body("username", "username length must be at least 4")
    .trim()
    .isLength({ min: 4 })
    .escape(),
  body("password","the password must be at least 4 characters long" )
    .trim()
    .isLength({ min: 4 })
    .escape(),
  body("re-password", "Password does not match")
    .custom((value, {req}) => {
      return value === req.body.password
    })
    .trim()
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      username: req.body.username,
      password: req.body.password,
      isMember: false,
      isAdmin: req.body.isAdmin === 'checked'
    });

    if(!errors.isEmpty()) {
      res.render("sign-up-form", {
        user: user,
        errors: errors.array(),
      })
    } else {
      await user.save();
      res.redirect('/');
    }
    
  })]);


// Обработка входа
router.post("/log-in", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
}));

// Отображение главной страницы
router.get("/", asyncHandler(async (req, res, next) => {
  res.render("index", { user: req.user });
}));

// Обработка выхода
router.get("/log-out", asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
}));

module.exports = router;
