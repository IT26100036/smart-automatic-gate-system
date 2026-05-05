const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    cardId: { type: String, required: true, unique: true },
    ownerName: { type: String, required: true },
    ownerPhone: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    carNumber: { type: String, required: true, unique: true },
    carType: {
      type: String,
      enum: ["sedan", "suv", "van", "truck", "motorcycle", "other"],
      required: true,
    },
    carModel: { type: String, required: true },
    carColor: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Card", cardSchema);
