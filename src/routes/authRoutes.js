const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { authLimiter, registerLimiter } = require("../middleware/rateLimiter");

router.post("/register", registerLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

module.exports = router;
