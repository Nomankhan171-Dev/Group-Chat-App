
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    sender: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
