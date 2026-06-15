const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientWithCard,
} = require("../controllers/clientController");

router.get("/", protect, adminOnly, getClients);
router.get("/:id/card", protect, adminOnly, getClientWithCard);
router.get("/:id", protect, adminOnly, getClient);
router.post("/", protect, adminOnly, createClient);
router.put("/:id", protect, adminOnly, updateClient);
router.delete("/:id", protect, adminOnly, deleteClient);

module.exports = router;
