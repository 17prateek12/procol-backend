const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  logoutUser,
} = require("../controller/usercontroller.js"); // Adjust path if needed
const protect = require("../middleware/authMiddleware.js"); // Middleware for authentication

const router = express.Router();

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

// Current user route (protected)
router.get("/current", protect, currentUser);

// Logout route
router.post("/logout", logoutUser);

module.exports = router;