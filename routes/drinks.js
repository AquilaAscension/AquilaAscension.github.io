const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // GET all drinks
  router.get("/", (req, res) => {
    db.all("SELECT * FROM Drinks", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // POST new drink
  router.post("/", (req, res) => {
    const { Name, Price, CurrentStock, MinThreshold, Capacity } = req.body;

    if (!Name || !Price || !CurrentStock || !MinThreshold || !Capacity) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const query = `
      INSERT INTO Drinks (Name, Price, CurrentStock, MinThreshold, Capacity)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [Name, Price, CurrentStock, MinThreshold, Capacity],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Drink added", DrinkID: this.lastID });
      }
    );
  });

  return router;
};
