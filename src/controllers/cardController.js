const Card = require("../models/Card");
const Client = require("../models/Client");

// @desc    Get all cards
// @route   GET /api/cards
const getCards = async (req, res) => {
  try {
    const cards = await Card.find().populate(
      "clientId",
      "name email carNumber",
    );
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single card
// @route   GET /api/cards/:cardId
const getCard = async (req, res) => {
  try {
    const card = await Card.findOne({ cardId: req.params.cardId }).populate(
      "clientId",
    );
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    res.status(200).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create card
// @route   POST /api/cards
const createCard = async (req, res) => {
  try {
    const { cardId, clientId, balance } = req.body;

    const cardExists = await Card.findOne({ cardId });
    if (cardExists) {
      return res.status(400).json({ message: "Card already exists" });
    }

    const clientExists = await Client.findById(clientId);
    if (!clientExists) {
      return res.status(404).json({ message: "Client not found" });
    }

    const card = await Card.create({ cardId, clientId, balance });

    await Client.findByIdAndUpdate(clientId, { cardId: card._id });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Top up card balance
// @route   PUT /api/cards/:cardId/topup
const topUpCard = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    const card = await Card.findOne({ cardId: req.params.cardId });
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.balance += amount;
    await card.save();

    res.status(200).json({ message: "Balance updated", balance: card.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate card
// @route   PUT /api/cards/:cardId/deactivate
const deactivateCard = async (req, res) => {
  try {
    const card = await Card.findOne({ cardId: req.params.cardId });
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    card.isActive = false;
    await card.save();

    res.status(200).json({ message: "Card deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCards, getCard, createCard, topUpCard, deactivateCard };
