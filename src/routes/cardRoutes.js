const express = require("express");
const router = express.Router();
const {
  getCards,
  getCard,
  createCard,
  topUpCard,
  deactivateCard,
} = require("../controllers/cardController");

router.get("/", getCards);
router.get("/:cardId", getCard);
router.post("/", createCard);
router.put("/:cardId/topup", topUpCard);
router.put("/:cardId/deactivate", deactivateCard);

module.exports = router;
