var express = require("express");
var router = express.Router();
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");

const auth_controller = require("../controllers/auth");
const message_controller = require("../controllers/message");
const profile_controller = require("../controllers/profile");

//check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/log-in");
  }
}

//check message-delete authentication
const isAuthorizedDelete = asyncHandler(async (req, res, next) => {
  const message = await Message.findOne({ _id: req.params.id }).populate(
    "user"
  );
  const isOwner =
    JSON.stringify(message.user._id) === JSON.stringify(req.user.id);
  console.log(isOwner);
  if (isOwner || req.user.admin) {
    next();
  } else {
    console.log("Not authorized to delete message");
    res.redirect("/");
  }
});

//check if user is admin
function isAdmin(req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    res.redirect("/");
  }
}

/* GET home page. */
router.get("/", async (req, res, next) => {
  try {
    const allMessages = await Message.find()
      .sort([["post_date", "descending"]])
      .populate("user");
    console.log("user: " + res.locals.currentUser);

    res.render("index", {
      title: "Members Only",
      user: res.locals.currentUser,
      messages: allMessages,
    });
  } catch (err) {
    return next(err);
  }
});

// Auth routes
router.get("/log-in", auth_controller.log_in_get);

router.post("/log-in", auth_controller.log_in_post);

router.get("/log-out", auth_controller.log_out);

router.get("/sign-up", auth_controller.sign_up_get);

router.post("/sign-up", auth_controller.sign_up_post);

// navbar/message routes
router.get(
  "/create-message",
  isLoggedIn,
  message_controller.create_message_get
);

router.post("/create-message", message_controller.create_message_post);

router.get(
  "/delete-message/admin/:id",
  isAuthorizedDelete,
  isLoggedIn,
  message_controller.delete_message_get_admin
);

router.get(
  "/delete-message/:id",
  isLoggedIn,
  isAuthorizedDelete,
  message_controller.delete_message_get
);

router.post(
  "/delete-message/:id",
  isLoggedIn,
  isAuthorizedDelete,
  message_controller.delete_message_post
);

router.get("/become-member", isLoggedIn, message_controller.member_get);

router.post("/become-member", isLoggedIn, message_controller.member_post);

router.get("/become-admin", isLoggedIn, message_controller.admin_get);

router.post("/become-admin", message_controller.admin_post);

// profile routes

router.get("/user/:id", isLoggedIn, profile_controller.profile_page_get);

router.get(
  "/admin-board",
  isLoggedIn,
  isAdmin,
  profile_controller.admin_board_get
);

module.exports = router;
