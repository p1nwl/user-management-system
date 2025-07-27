const jwt = require("jsonwebtoken");
const db = require("../config/db");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.sendStatus(403);
    }

    const query = "SELECT id, status FROM users WHERE id = $1";
    db.query(query, [decodedUser.userId], (dbErr, dbRes) => {
      if (dbErr) {
        console.error("DB Error in authMiddleware:", dbErr);
        if (res.headersSent) {
          console.error("Headers already sent, cannot send 500");
          return;
        }
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (res.headersSent) {
        console.error("Headers already sent before user check");
        return;
      }

      if (dbRes.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userStatus = dbRes.rows[0].status;
      if (userStatus === "blocked" || userStatus === "deleted") {
        return res
          .status(401)
          .json({
            message: "User is blocked or deleted. Please log in again.",
          });
      }

      req.user = { id: dbRes.rows[0].id, status: userStatus };
      next();
    });
  });
};

module.exports = authenticateToken;
