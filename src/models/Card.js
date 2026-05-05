const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    cardId: { type: String, required: true, unique: true },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    balance: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Card", cardSchema);
