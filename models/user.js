const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true },
  member: { type: Boolean, default: false },
  join_date: { type: Date, default: new Date() },
});

UserSchema.virtual("join_date_formatted").get(function () {
  return this.join_date.toLocaleDateString("de-DE");
});

module.exports = mongoose.model("User", UserSchema);
