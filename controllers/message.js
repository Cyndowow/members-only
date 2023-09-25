const User = require("../models/user");
const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.create_message_get = (req, res) => {
  res.render("create-message-form", {
    user: res.locals.currentUser,
    errors: [],
  });
};

exports.create_message_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Message must have a title."),
  body("message")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Message must have at least 1 character."),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const message = new Message({
      user: req.user._id,
      title: req.body.title,
      message: req.body.message,
    });
    if (!errors.isEmpty()) {
      res.render("create-message-form", {
        errors: errors.array(),
        user: res.locals.currentUser,
      });
    } else {
      await message.save();
      res.redirect("/");
    }
  }),
];

exports.delete_message_get_admin = (req, res) => {
  Message.findById(req.params.id)
    .populate("user")
    .then((result) => {
      console.log(result);
      res.render("delete-msg-admin", {
        user: res.locals.currentUser,
        message: result,
        errMsg: [],
      });
    });
};

exports.delete_message_get = (req, res) => {
  Message.findById(req.params.id)
    .populate("user")
    .then((result) => {
      console.log(result);
      res.render("delete-msg", {
        user: res.locals.currentUser,
        message: result,
        errMsg: [],
      });
    });
};

exports.delete_message_post = (req, res) => {
  if (req.body.password !== process.env.DELETE_PW) {
    Message.findById(req.params.id)
      .populate("user")
      .then((result) => {
        console.log(result);
        res.render("delete-msg-admin", {
          user: res.locals.currentUser,
          message: result,
          errMsg: [{ msg: "Incorrect password" }],
        });
      });
  } else {
    Message.findByIdAndRemove(req.params.id).then(() => res.redirect("/"));
  }
};

exports.member_get = (req, res) => {
  res.render("become-member", {
    user: res.locals.currentUser,
    errMessages: [],
  });
};

exports.member_post = asyncHandler(async (req, res, next) => {
  if (req.body.password !== process.env.MEMBER_PW) {
    res.render("become-member", {
      errMessages: ["Wrong password"],
      user: res.locals.currentUser,
    });
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { member: true },
    });
    res.redirect("/");
  }
});

exports.admin_get = (req, res) => {
  res.render("become-admin", { user: res.locals.currentUser, errMessages: [] });
};

exports.admin_post = asyncHandler(async (req, res, next) => {
  if (req.body.password !== process.env.ADMIN_PW) {
    res.render("become-admin", {
      errMessages: ["Wrong password"],
      user: res.locals.currentUser,
    });
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      $set: { admin: true },
    });
    res.redirect("/admin-board");
  }
});
