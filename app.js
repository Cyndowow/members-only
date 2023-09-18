require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// auth
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

var indexRouter = require("./routes/index");
var app = express();

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDB = process.env.DB;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const User = require("./models/user");
const bcrypt = require("bcryptjs");

// passport
passport.use(
  // same Usernames collide
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username.trim() }, (err, user) => {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: "Incorrect Username" });
      }
      bcrypt.compare(password, user.password, (req, res) => {
        if (res) {
          //passwords match
          return done(null, user);
        } else {
          //passwords do not match
          return done(null, false, { message: "Incorrect password" });
        }
      });
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
