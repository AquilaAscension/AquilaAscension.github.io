const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Get all drinks
  router.get("/", (req, res) => {
    db.all("SELECT * FROM Drinks", (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  return router;
};
