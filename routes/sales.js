const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // GET all sales
  router.get("/", (req, res) => {
    db.all("SELECT * FROM Sales", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // POST new sale
  router.post("/", (req, res) => {
    const { DrinkID, Timestamp, Quantity, PaymentMethod, Amount } = req.body;

    if (!DrinkID || !Timestamp || !Quantity || !PaymentMethod || !Amount) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const query = `
      INSERT INTO Sales (DrinkID, Timestamp, Quantity, PaymentMethod, Amount)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [DrinkID, Timestamp, Quantity, PaymentMethod, Amount],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Sale recorded", SaleID: this.lastID });
      }
    );
  });

  return router;
};
