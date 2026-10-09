
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, unique: true, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    emoji: { type: String, default: "💬" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);
