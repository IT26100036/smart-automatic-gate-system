const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/database");

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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
