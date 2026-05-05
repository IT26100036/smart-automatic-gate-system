const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: { type: Number, required: true, unique: true },
    isOccupied: { type: Boolean, default: false },
    cardId: { type: String, default: null },
    carNumber: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ParkingSlot", parkingSlotSchema);
