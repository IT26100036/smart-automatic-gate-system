const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const seedSlots = require("./config/seedSlots");
const { globalLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const cardRoutes = require("./routes/cardRoutes");
const parkingRoutes = require("./routes/parkingRoutes");

dotenv.config();
connectDB().then(() => seedSlots());

const app = express();
app.use(cors());
app.use(express.json());
app.use(globalLimiter);
app.set("trust proxy", 1);

app.get("/", (req, res) => res.send("Smart Gate API Running"));
app.get("/health", async (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    server: "running",
    database: state === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/parking", parkingRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
