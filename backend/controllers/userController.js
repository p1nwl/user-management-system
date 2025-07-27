const db = require("../config/db");

const getUsers = (req, res) => {
  const query =
    "SELECT id, name, email, last_login, status, created_at FROM users ORDER BY last_login DESC NULLS LAST";

  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error getting list of users" });
    }
    res.json(result.rows);
  });
};

const blockUsers = (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "Incorrect user list" });
  }

  const idsToBlock = userIds.filter((id) => id != req.user.id);

  if (idsToBlock.length === 0) {
    return res
      .status(400)
      .json({ message: "It is impossible to block yourself" });
  }

  const query = `UPDATE users SET status = 'blocked' WHERE id = ANY($1::int[])`;
  db.query(query, [idsToBlock], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error blocking users" });
    }
    res.json({ message: `Users blocked: ${result.rowCount}` });
  });
};

const unblockUsers = (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "Incorrect user list" });
  }

  const query = `UPDATE users SET status = 'active' WHERE id = ANY($1::int[])`;
  db.query(query, [userIds], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error unblocking users" });
    }
    res.json({ message: `Users unblocked: ${result.rowCount}` });
  });
};

const deleteUsers = (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "Incorrect user list" });
  }

  const idsToDelete = userIds.filter((id) => {
    const numId = Number(id);
    const currentUserId = Number(req.user.id);
    return !isNaN(numId) && numId !== currentUserId;
  });

  if (idsToDelete.length === 0) {
    return res
      .status(400)
      .json({ message: "It is impossible to delete yourself" });
  }

  const query = `DELETE FROM users WHERE id = ANY($1::int[])`;
  db.query(query, [idsToDelete], (err, result) => {
    if (err) {
      console.error("Error deleting users:", err);
      return res.status(500).json({ message: "Error deleting users" });
    }
    res.json({
      message: `Users deleted (marked as deleted): ${result.rowCount}`,
    });
  });
};

module.exports = { getUsers, blockUsers, unblockUsers, deleteUsers };
