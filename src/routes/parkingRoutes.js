const express = require("express");
const router = express.Router();
const {
  getSlots,
  handleEntry,
  handleExit,
  getLogs,
} = require("../controllers/parkingController");

router.get("/slots", getSlots);
router.get("/logs", getLogs);
router.post("/entry", handleEntry);
router.post("/exit", handleExit);

module.exports = router;
