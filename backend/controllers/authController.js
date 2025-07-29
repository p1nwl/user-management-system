const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Password hashing failed" });
    }

    const query =
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id";
    db.query(query, [name, email, hash], (dbErr, dbRes) => {
      if (dbErr) {
        if (dbErr.code === "23505") {
          return res.status(409).json({ message: "Email already exists" });
        }
        console.error(dbErr);
        return res.status(500).json({ message: "Registration failed" });
      }

      const userId = dbRes.rows[0].id;
      res.status(201).json({ message: "Registration successful", userId });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const query =
    "SELECT id, name, email, password_hash, status FROM users WHERE email = $1";
  db.query(query, [email], (dbErr, dbRes) => {
    if (dbErr) {
      console.error(dbErr);
      return res
        .status(500)
        .json({ message: "Database error occured while loggin in" });
    }

    if (dbRes.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = dbRes.rows[0];

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Account is blocked" });
    }
    if (user.status === "deleted") {
      return res
        .status(403)
        .json({ message: "Account is deleted. You can register again" });
    }

    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: "Password comparison failed",
        });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const updateLoginTimeQuery =
        "UPDATE users SET last_login = NOW() WHERE id = $1";
      db.query(updateLoginTimeQuery, [user.id], (updateErr) => {
        if (updateErr) {
          console.error("Error updating login time:", updateErr);
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res.json({
          message: "Login successful",
          token,
          user: { id: user.id, name: user.name, email: user.email },
        });
      });
    });
  });
};

const resetPasswordRequest = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const findUserQuery = "SELECT id FROM users WHERE email = $1";
  db.query(findUserQuery, [email], (findErr, findRes) => {
    if (findErr) {
      console.error("Error finding user for password reset:", findErr);
      return res.status(500).json({ message: "Error processing request" });
    }
    if (findRes.rows.length === 0) {
      return res.json({
        message:
          'If an account exists for this email, a password reset link would be sent. (In a real app, an email would be sent.) For this demo, the password has been reset to "newpassword123".',
      });
    }

    const userId = findRes.rows[0].id;
    const newPassword = "newpassword123";
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    const updatePasswordQuery =
      "UPDATE users SET password_hash = $1 WHERE id = $2";
    db.query(updatePasswordQuery, [hashedNewPassword, userId], (updateErr) => {
      if (updateErr) {
        console.error("Error updating password:", updateErr);
        return res.status(500).json({ message: "Error resetting password" });
      }
      res.json({
        message: `Password for ${email} has been reset. The new temporary password is: ${newPassword}. Please change it after logging in.`,
      });
    });
  });
};

module.exports = { register, login, resetPasswordRequest };
