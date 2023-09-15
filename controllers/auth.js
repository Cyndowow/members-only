const User = require("../models/user");
const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const log_in_get = (req, res) => {
  res.render("log-in", { user: res.locals.currentUser });
};

const log_in_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
  failureFlash: true,
});

const log_out = (req, res) => {
  req.logout();
  res.redirect("/");
};

const sign_up_get = (req, res) => {
  res.render("sign-up", {
    user: res.locals.currentUser,
    errors: [],
    success: [],
  });
};

const sign_up_post = [
  body("first_name").trim().exists().escape(),
  body("last_name").trim().exists().escape(),
  body("username")
    .trim()
    .isLength({ min: 4 })
    .escape()
    .withMessage("Username must be at least 4 characters long."),
  body("password")
    .trim()
    .isLength({ min: 7 })
    .escape()
    .withMessage("Password must be at least 7 characters long."),

  async (req, res, next) => {
    const takenUsername = await User.find({ username: req.body.username });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("sign-up", {
        errors: errors.array(),
        success: [],
        user: res.locals.currentUser,
      });
    } else if (takenUsername.length > 0) {
      res.render("sign-up", {
        errors: [{ msg: "Username already taken." }],
        success: [],
        user: res.locals.currentUser,
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) return next(err);
        else {
          const user = new User({
            username: req.body.username,
            password: hashedPassword,
          }).save((err) => {
            if (err) next(err);
            res.render("sign-up", {
              errors: [],
              success: [{ msg: "You signed up successfully. Please log in." }],
              user: res.locals.currentUser,
            });
          });
        }
      });
    }
  },
];

module.exports = {
  log_in_get,
  log_in_post,
  log_out,
  sign_up_get,
  sign_up_post,
};
