var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const User = require('../models/User');
const Message = require('../models/Message')
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const checkMembership = require('../middleware/auth')
// Отображение формы регистрации
router.get("/sign-up", asyncHandler(async (req, res, next) => {
  res.render("sign-up-form");
}));

// Обработка регистрации
router.post("/sign-up", [
  body("username")
    .trim()
    .isLength({ min: 4 })
    .withMessage("username length must be at least 4")
    .escape()
    .custom(async (username) => {
      const checkusername = await User.findOne({username}).exec()
      if (checkusername) {
        throw new Error("This username is already occupied, come up with another one")
      }
    }),
  body("password", "the password must be at least 4 characters long")
    .trim()
    .isLength({ min: 4 })
    .escape(),
  body("re-password", "Password does not match")
    .custom(async(value, { req }) => {
      return value === req.body.password
    })
    .trim()
    .escape(),
  asyncHandler(async (req, res, next) => {

    const errors = validationResult(req);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      isMember: false,
      isAdmin: req.body.isAdmin === 'checked'
    });

    if (!errors.isEmpty()) {
      res.render("sign-up-form", {
        user: user,
        errors: errors.array(),
      })
    } else {
      await user.save();
      res.redirect('/');
    }

  })]);

router.get('/join', asyncHandler(async(req, res, next) => {
  res.render('join-club-form', {user: req.user});
}))

router.get('/create', checkMembership, asyncHandler(async(req, res, next) => {
  res.render('create-message-form', {user: req.user});
}));

router.post('/create', [
  body('message', "The message should not be empty")
      .trim()
      .isLength({min: 1})
      .escape(),
  asyncHandler(async(req, res, next) => {
      const errors = validationResult(req);

      const newMessage = new Message({
        content: req.body.message,
        user: req.user._id,
        date: new Date(),
      })

      if(!errors.isEmpty()) {
        res.render('create-message-form', {
          user: req.user,
          errors: errors.array(),
        })
      } 
      else {
        await newMessage.save();
        res.redirect('/');
      }
})])

router.get('/log-in', asyncHandler(async (req, res, next) => {
  res.render('log-in-form', {user: req.user});
}));
// Обработка входа
router.post("/log-in", asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      return res.render("log-in-form", { error: info.message });
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.redirect("/");
    });
  })(req, res, next);
}));

// Отображение главной страницы
router.get("/", asyncHandler(async (req, res, next) => {
  const listMessages = await Message.find().sort({date: 1}).populate('user').exec();
  res.render("index", { user: req.user, listMsg: listMessages });
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
