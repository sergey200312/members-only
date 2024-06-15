var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const User = require('../models/User');

// Отображение формы регистрации
router.get("/sign-up", asyncHandler(async (req, res, next) => {
  res.render("sign-up-form");
}));

// Обработка регистрации
router.post("/sign-up", asyncHandler(async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
    const result = await user.save();
    res.redirect("/");
  } catch (err) {
    return next(err);
  }
}));

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
