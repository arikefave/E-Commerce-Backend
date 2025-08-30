const express = require("express");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const auth = require("../middleware/auth");
const router = express.Router();

//public
router.post("/register", register);
router.post("/login", login);

//protected routes
router.get("/profile", auth, getProfile);
module.exports = router;
