var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const indexRouter = require('./routes/index');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/User');
const bcrypt = require('bcryptjs');

var app = express();

// Настройка шаблонизатора
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);

// Подключение к MongoDB
const mongoDB = 'mongodb+srv://admin:admin@cluster0.64wpmrj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.set("strictQuery", false);

async function main() {
  try {
    await mongoose.connect(mongoDB);
    console.log("Подключено к MongoDB");
  } catch (err) {
    console.error("Ошибка подключения к MongoDB", err);
  }
}
main();

// Настройка локальной стратегии passport
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: "incorrect username" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: "incorrect password" });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Обработка 404 ошибки и перенаправление к обработчику ошибок
app.use(function (req, res, next) {
  next(createError(404));
});

// Обработчик ошибок
app.use(function (err, req, res, next) {
  // Установка локальных переменных, предоставляя только ошибку в разработке
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Рендеринг страницы ошибки
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
