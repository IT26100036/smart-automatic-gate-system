const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
const errorHandler = require("./src/middleware/errorHandler");

const authRoutes = require("./src/routes/authRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const cardRoutes = require("./src/routes/cardRoutes");
const parkingRoutes = require("./src/routes/parkingRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
