const express = require("express");
const { esp32Limiter } = require("../middleware/rateLimiter");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();
const {
  getSlots,
  handleEntry,
  handleExit,
  getLogs,
} = require("../controllers/parkingController");

router.get("/slots", protect, getSlots);
router.get("/logs", protect, adminOnly, getLogs);
router.post("/entry", esp32Limiter, handleEntry);
router.post("/exit", esp32Limiter, handleExit);

module.exports = router;
