const express = require("express");
const router = express.Router();
const { registerUser, loginUser, updateProfile } = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/register", protect, adminOnly, registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateProfile);

module.exports = router;
