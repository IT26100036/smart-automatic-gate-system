const express = require("express");
const { esp32Limiter } = require("../middleware/rateLimiter");
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
router.post("/entry", esp32Limiter, deviceAuth, handleEntry);
router.post("/exit", esp32Limiter, deviceAuth, handleExit);

module.exports = router;
