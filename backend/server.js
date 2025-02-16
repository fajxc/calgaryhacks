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
    password: "#aberharT2005",  // 🔹 Try putting in quotes if needed: "#aberharT2005"
    database: "nextchapter_db",
    multipleStatements: true
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        return;
    }
    console.log("✅ Connected to MySQL database.");
});

app.post("/register", (req, res) => {
    const { name, age, city, education, email, password, salary, spending } = req.body;

    if (!name || !age || !city || !education || !email || !password || !salary || !spending) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = "INSERT INTO users (name, age, city, education, email, password, salary, spending) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(query, [name, age, city, education, email, password, salary, spending], (err, result) => {
        if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ error: "Database error: " + err.message });
        }
        console.log("✅ User registered successfully:", result);
        res.status(200).json({ message: "✅ User registered successfully" });
    });
});

// **Route to Save User Data**
app.post("/saveUser", (req, res) => {
    console.log("📥 Incoming request data:", req.body); // 🔥 Debugging Log

    const { name, age, city, education, email, password, salary, spending } = req.body;

    if (!name || !age || !city || !education || !email || !password || !salary || !spending) {
        console.error("⚠️ Missing fields:", { name, age, city, education, email, password, salary, spending });
        return res.status(400).json({ error: "⚠️ Missing required fields" });
    }

    const query = "INSERT INTO users (name, age, city, education, email, password, salary, spending) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(query, [name, age, city, education, email, password, salary, spending], (err, result) => {
        if (err) {
            console.error("❌ Database error:", err.message);
            return res.status(500).json({ error: "Database error: " + err.message });
        }
        console.log("✅ User data saved successfully:", result);
        res.status(200).json({ message: "✅ User data saved successfully" });
    });
});


// **Start the Server**
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
