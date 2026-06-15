const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getCards,
  getCard,
  createCard,
  topUpCard,
  deactivateCard,
} = require("../controllers/cardController");

router.get("/", protect, adminOnly, getCards);
router.get("/:cardId", protect, adminOnly, getCard);
router.post("/", protect, adminOnly, createCard);
router.put("/:cardId/topup", protect, topUpCard);
router.put("/:cardId/deactivate", protect, adminOnly, deactivateCard);

module.exports = router;
