const express = require("express");
const router = express.Router();
const {
  getUsers,
  blockUsers,
  unblockUsers,
  deleteUsers,
} = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", getUsers);
router.post("/block", blockUsers);
router.post("/unblock", unblockUsers);
router.delete("/", deleteUsers);

module.exports = router;
