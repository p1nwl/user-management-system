const express = require("express");
const router = express.Router();
const {
  register,
  login,
  resetPasswordRequest,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password-request", resetPasswordRequest);

module.exports = router;
