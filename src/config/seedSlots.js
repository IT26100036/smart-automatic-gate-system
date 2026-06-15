const ParkingSlot = require("../models/ParkingSlot");

const seedSlots = async () => {
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
};

module.exports = seedSlots;
