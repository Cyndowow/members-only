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
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      console.log(user);
      /*const result = await bcrypt.compare(password, user.password);
      console.log(result);*/
      if (!user) {
        return done(null, false, { message: "Incorrect Username" });
      }
      const result = await bcrypt.compare(password, user.password);
      if (result === true) {
        return done(null, user);
      } else if (result === false) {
        return done(null, false, { message: "Wrong password." });
      }
      /*bcrypt.compare(password, user.password, done, (err, isValid) => {
        if (err) throw err;
        if (isValid) {
          //pw match
          return done(null, user);
        } else {
          //pw no match
          return done(null, false, { message: "Incorrect password" });
        }
      });
      /*if (user.password !== password) {
        return done(null, false, { message: "Incorrect password" });
      }*/
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
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
