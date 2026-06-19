const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const deviceAuth = require("../middleware/deviceAuth");
const router = express.Router();
const {
  getSlots,
  updateSlotStatus,
  handleEntry,
  handleExit,
  getLogs,
  getAvailableSlotCount,
} = require("../controllers/parkingController");

router.get("/slots/available-count", getAvailableSlotCount);
router.get("/slots", protect, getSlots);
router.put("/slots/:slotNumber/status", protect, updateSlotStatus);
router.get("/logs", protect, adminOnly, getLogs);
router.post("/entry", deviceAuth, handleEntry);
router.post("/exit", deviceAuth, handleExit);

module.exports = router;
