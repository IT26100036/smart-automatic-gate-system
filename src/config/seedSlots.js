const ParkingSlot = require("../models/ParkingSlot");

const seedSlots = async () => {
  try {
    const count = await ParkingSlot.countDocuments();
    if (count === 0) {
      await ParkingSlot.insertMany([
        { slotNumber: 1 },
        { slotNumber: 2 },
        { slotNumber: 3 },
        { slotNumber: 4 },
      ]);
      console.log("Parking slots seeded");
    }
  } catch (err) {
    console.error("Failed to seed parking slots:", err.message);
  }
};

module.exports = seedSlots;
