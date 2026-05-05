const mongoose = require("mongoose");

const parkingLogSchema = new mongoose.Schema(
  {
    cardId: { type: String, required: true },
    ownerName: { type: String, required: true },
    carNumber: { type: String, required: true },
    carType: { type: String, required: true },
    slotNumber: { type: Number, required: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, default: null },
    duration: { type: Number, default: null },
    amountCharged: { type: Number, default: null },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ParkingLog", parkingLogSchema);
