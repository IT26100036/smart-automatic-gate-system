const Client = require("../models/Client");
const Card = require("../models/Card");

// @desc    Get all clients
// @route   GET /api/clients
const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create client
// @route   POST /api/clients
const CAR_NUMBER_REGEX = /^[A-Z]{2,3}-\d{4}$/;

const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      carNumber,
      carType,
      carModel,
      carColor,
    } = req.body;

    if (!name || !email || !phone || !carNumber || !carType || !carModel || !carColor) {
      return res.status(400).json({ message: "name, email, phone, carNumber, carType, carModel, and carColor are required" });
    }

    if (!CAR_NUMBER_REGEX.test(carNumber)) {
      return res.status(400).json({ message: "carNumber must follow the format AB-1234 or ABC-1234" });
    }

    const clientExists = await Client.findOne({ email });
    if (clientExists) {
      return res.status(400).json({ message: "Client already exists" });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      address,
      carNumber,
      carType,
      carModel,
      carColor,
    });

    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const { name, email, phone, address, carNumber, carType, carModel, carColor } = req.body;

    if (carNumber && !CAR_NUMBER_REGEX.test(carNumber)) {
      return res.status(400).json({ message: "carNumber must follow the format AB-1234 or ABC-1234" });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, carNumber, carType, carModel, carColor },
      { new: true, runValidators: true },
    );

    res.status(200).json(updatedClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    await client.deleteOne();
    res.status(200).json({ message: "Client removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get client with their card and current balance
// @route   GET /api/clients/:id/card
const getClientWithCard = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    const card = await Card.findOne({ clientId: client._id });
    res.status(200).json({ ...client.toObject(), card: card || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientWithCard,
};
