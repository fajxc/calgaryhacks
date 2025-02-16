require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",  // Make sure this matches your MySQL Workbench
    database: "nextchapter_db"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("✅ Connected to MySQL database.");
});

// Route to save user data
app.post("/saveUser", (req, res) => {
    const { name, age, city, education, email, password, salary, spending } = req.body;

    if (!name || !age || !city || !education || !email || !password || !salary || !spending) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = "INSERT INTO users (name, age, city, education, email, password, salary, spending) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(query, [name, age, city, education, email, password, salary, spending], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log("✅ User data saved:", result);
        res.status(200).json({ message: "User data saved successfully" });
    });
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
