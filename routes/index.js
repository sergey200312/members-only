var express = require('express');
var router = express.Router();
const messageController = require('../controllers/messageController');
const userController = require('../controllers/userController');
const passport = require('passport')
const app = express();
const User = require('../models/User');

/* GET home page. */
// router.get('/', userController.index);

// router.get('/sign-up', userController.sign_up_get);

// router.post('/sign-up', userController.sign_up_post);

// router.post('/log-in', userController.log_in);

// router.get('/log-out', userController.log_out);

router.get("/", (req, res) => {
    res.render("index", { user: req.user });
  });
//// app.js

router.get("/sign-up", (req, res) => res.render("sign-up-form"));
router.post("/sign-up", async (req, res, next) => {
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
  });
  router.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/"
    })
  );  
  router.get("/", (req, res) => {
    res.render("index", { user: req.user });
  });
  router.get("/log-out", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });  


module.exports = router;
