const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  post_date: { type: Date, default: new Date() },
});

MessageSchema.virtual("post_date_formatted").get(function () {
  return this.post_date.toLocaleString("de-DE");
});

MessageSchema.virtual("post_date_calendar").get(function () {
  return this.post_date.toLocaleString("de-DE").slice(0, 9);
});

MessageSchema.virtual("post_date_time").get(function () {
  return this.post_date.toLocaleString("de-DE").slice(11, 19);
});

module.exports = mongoose.model("Message", MessageSchema);
