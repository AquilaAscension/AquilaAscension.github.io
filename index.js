const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Database setup
const dbPath = "./db/vending.db";
const sqlInitPath = "./db/create.sql";

if (!fs.existsSync(dbPath)) {
  const db = new sqlite3.Database(dbPath);
  const schema = fs.readFileSync(sqlInitPath, "utf-8");
  db.exec(schema, (err) => {
    if (err) {
      console.error("Failed to initialize database:", err.message);
    } else {
      console.log("Database initialized from create.sql");
    }
    db.close();
  });
}

// Re-open db connection for API usage
const db = new sqlite3.Database(dbPath);

const drinksRoute = require("./routes/drinks")(db);
app.use("/drinks", drinksRoute);

// Sample route
app.get("/", (req, res) => {
  res.send("Smart Vending Machine backend is running!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
