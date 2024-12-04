import express from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi ke database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "toko_roti",
});

// Cek koneksi
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to the database!");
  }
});

// Endpoint untuk mendapatkan produk
app.get("/api/products", (req, res) => {
  const query = "SELECT * FROM products";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching products" });
    } else {
      res.json(results);
    }
  });
});

// Endpoint untuk mendapatkan kategori
app.get("/api/categories", (req, res) => {
  const query = "SHOW COLUMNS FROM products LIKE 'category'";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching categories" });
    } else {
      const enumValues = results[0].Type.replace("enum(", "")
        .replace(")", "")
        .split(",")
        .map((value) => value.replace("'", "").trim());
      res.json(enumValues);
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
