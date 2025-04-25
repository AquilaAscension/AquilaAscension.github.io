const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // GET all personnel
  router.get("/", (req, res) => {
    db.all("SELECT * FROM DeliveryPersonnel", (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // POST new personnel
  router.post("/", (req, res) => {
    const { Name, Email, Phone, Zone } = req.body;

    if (!Name || !Email || !Phone || !Zone) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const query = `
      INSERT INTO DeliveryPersonnel (Name, Email, Phone, Zone)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [Name, Email, Phone, Zone], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res
        .status(201)
        .json({ message: "Personnel added", PersonID: this.lastID });
    });
  });

  // DELETE personnel by ID
  router.delete("/:id", (req, res) => {
    const id = req.params.id;
    db.run(
      "DELETE FROM DeliveryPersonnel WHERE PersonID = ?",
      [id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Personnel ${id} deleted`, changes: this.changes });
      }
    );
  });

  return router;
};
