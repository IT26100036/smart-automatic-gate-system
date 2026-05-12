const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const {
  globalLimiter,
  authLimiter,
  esp32Limiter,
} = require("./middleware/rateLimiter");

const authRoutes = require("./routes/authRoutes");
const clientRoutes = require("./routes/clientRoutes");
const cardRoutes = require("./routes/cardRoutes");
const parkingRoutes = require("./routes/parkingRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(globalLimiter);

app.get("/", (req, res) => res.send("Smart Gate API Running"));
app.get("/health", async (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    server: "running",
    database: state === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/parking/entry", esp32Limiter);
app.use("/api/parking/exit", esp32Limiter);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
