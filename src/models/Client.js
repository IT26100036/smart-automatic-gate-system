const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, default: null },
    cardId: { type: String, ref: "Card", default: null },
    carNumber: { type: String, required: true, unique: true },
    carType: {
      type: String,
      enum: ["sedan", "suv", "van", "truck", "motorcycle", "other"],
      required: true,
    },
    carModel: { type: String, required: true },
    carColor: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Client", clientSchema);
