const Message = require("../models/message");
const User = require("../models/user");

exports.profile_page_get = async (req, res, next) => {
  try {
    const userMessages = await Message.find({ user: req.user._id }).sort({
      post_date: "descending",
    });
    console.log(userMessages);
    res.render("profile-page", {
      user: res.locals.currentUser,
      userMessages: userMessages,
    });
  } catch (err) {
    return next(err);
  }
};

exports.admin_board_get = async (req, res, next) => {
  Promise.all([await User.find(), await Message.find()]).then((data) => {
    res.render("admin-board", {
      user: res.locals.currentUser,
      allUsers: data[0],
      allMessages: data[1],
    });
  });
};
