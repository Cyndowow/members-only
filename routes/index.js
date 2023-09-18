var express = require("express");
var router = express.Router();
const Message = require("../models/message");

const auth_controller = require("../controllers/auth");
const message_controller = require("../controllers/message");

//check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/log-in");
  }
}

//check message-delete authentication
function isAuthorizedDelete(req, res, next) {
  Message.findOne({ _id: req.params.id })
    .populate("User")
    .then((messageOwner) => {
      const isOwner =
        JSON.stringify(messageOwner.user._id) === JSON.stringify(req.user.id);
      if (isOwner || req.user.admin) {
        next();
      } else {
        console.log("Not authorized to delete message.");
        res.redirect("/");
      }
    })
    .catch((err) => next(err));
}

//check if user is admin
function isAdmin(req, res, next) {
  if (req.user.admin) {
    next();
  } else {
    res.redirect("/");
  }
}

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Members Only" });
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

module.exports = router;
