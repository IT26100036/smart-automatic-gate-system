const express = require("express");
const { esp32Limiter } = require("../middleware/rateLimiter");
const router = express.Router();
const {
  getSlots,
  handleEntry,
  handleExit,
  getLogs,
} = require("../controllers/parkingController");

router.get("/slots", getSlots);
router.get("/logs", getLogs);
router.post("/entry", esp32Limiter, handleEntry);
router.post("/exit", esp32Limiter, handleExit);

module.exports = router;
