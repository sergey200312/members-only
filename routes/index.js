var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const passport = require('passport');
const User = require('../models/User');
const Message = require('../models/Message')
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const checkMembership = require('../middleware/auth')
const mongoose = require('mongoose')
require('dotenv').config();
// Отображение формы регистрации
router.get("/sign-up", asyncHandler(async (req, res, next) => {
  res.render("sign-up-form");
}));

// Обработка регистрации
router.post("/sign-up", [
  body("username")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Username length must be at least 4")
    .escape()
    .custom(async (username) => {
      const checkUsername = await User.findOne({ username }).exec();
      if (checkUsername) {
        throw new Error("This username is already occupied, come up with another one");
      }
    }),
  body("password", "The password must be at least 4 characters long")
    .trim()
    .isLength({ min: 4 })
    .escape(),
  body("re-password", "Passwords do not match")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .trim()
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    
    if (!errors.isEmpty()) {
      return res.render("sign-up-form", {
        user: req.body, 
        errors: errors.array(),
      });
    }

    
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      isMember: false,
      isAdmin: req.body.isAdmin === 'checked'
    });

    await user.save();
    res.redirect('/'); 
  })
]);

router.get('/join', asyncHandler(async(req, res, next) => {
  res.render('join-club-form', {user: req.user});
}))

router.post('/join', asyncHandler(async(req, res, next) => {
  if (req.body.code === process.env.CODE) {
    await User.findOneAndUpdate({_id: req.user.id}, {isMember: true});
    res.redirect('/');
  } else {
    res.redirect('/join')
  }
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

router.post("/delete/:id", asyncHandler(async(req, res, next) => {
  await Message.findByIdAndDelete(req.params.id).exec();
  res.redirect('/')
}))

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
