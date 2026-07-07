const ParkingSlot = require("../models/ParkingSlot");
const ParkingLog = require("../models/ParkingLog");
const Card = require("../models/Card");

// @desc    Get all parking slots
// @route   GET /api/parking/slots
const getSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find().sort({ slotNumber: 1 });
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Slot status
// @route   POST /api/slots/:slotNumber/status
const updateSlotStatus = async (req, res) => {
  try {
    const { isOccupied } = req.body;
    const slot = await ParkingSlot.findOneAndUpdate(
      { slotNumber: req.params.slotNumber },
      isOccupied
        ? { isOccupied }
        : { isOccupied, cardId: null, carNumber: null, entryTime: null },
      { new: true },
    );
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle entry - triggered by ESP32 on RFID scan at entry gate
// @route   POST /api/parking/entry
const handleEntry = async (req, res) => {
  try {
    const { cardId } = req.body;

    const card = await Card.findOne({ cardId }).populate("clientId");
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    if (!card.isActive) {
      return res.status(403).json({ message: "Card is inactive" });
    }
    if (card.balance <= 0) {
      return res.status(403).json({ message: "Insufficient balance" });
    }

    const activeSession = await ParkingLog.findOne({ cardId, exitTime: null });
    if (activeSession) {
      return res.status(400).json({ message: "Card already has an active parking session" });
    }

    const availableSlot = await ParkingSlot.findOneAndUpdate(
      { isOccupied: false, cardId: null },
      { isOccupied: true, cardId, carNumber: card.clientId.carNumber, entryTime: new Date() },
      { new: true },
    );

    if (!availableSlot) {
      return res.status(400).json({ message: "No available slots" });
    }

    const log = await ParkingLog.create({
      cardId,
      clientId: card.clientId._id,
      slotNumber: availableSlot.slotNumber,
      entryTime: new Date(),
    });

    res.status(200).json({
      message: "Entry granted",
      slotNumber: availableSlot.slotNumber,
      logId: log._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Handle exit - triggered by ESP32 on RFID scan at exit gate
// @route   POST /api/parking/exit
const handleExit = async (req, res) => {
  try {
    const { cardId } = req.body;

    const card = await Card.findOne({ cardId });
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const log = await ParkingLog.findOne({ cardId, exitTime: null });
    if (!log) {
      return res
        .status(404)
        .json({ message: "No active parking session found" });
    }

    const exitTime = new Date();
    const durationMs = exitTime - log.entryTime;
    const durationMinutes = Math.ceil(durationMs / 60000);
    const ratePerMinute = 2.5; // LKR 150 per hour
    const amountCharged = durationMinutes * ratePerMinute;

    if (card.balance < amountCharged) {
      return res.status(403).json({ message: "Insufficient balance" });
    }

    card.balance -= amountCharged;
    await card.save();

    log.exitTime = exitTime;
    log.duration = durationMinutes;
    log.amountCharged = amountCharged;
    log.paymentStatus = "paid";
    await log.save();

    const slot = await ParkingSlot.findOne({ slotNumber: log.slotNumber });
    if (!slot) {
      return res.status(404).json({ message: "Parking slot not found" });
    }
    slot.isOccupied = false;
    slot.cardId = null;
    slot.carNumber = null;
    slot.entryTime = null;
    await slot.save();

    res.status(200).json({
      message: "Exit granted",
      duration: durationMinutes,
      amountCharged,
      remainingBalance: card.balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all parking logs
// @route   GET /api/parking/logs
const getLogs = async (req, res) => {
  try {
    const logs = await ParkingLog.find().populate("clientId", "name carNumber");
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get count of available (free) parking slots
// @route   GET /api/parking/slots/available-count
const getAvailableSlotCount = async (req, res) => {
  try {
    const count = await ParkingSlot.countDocuments({ isOccupied: false });
    res.status(200).json({ availableSlots: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSlots,
  updateSlotStatus,
  handleEntry,
  handleExit,
  getLogs,
  getAvailableSlotCount,
};
