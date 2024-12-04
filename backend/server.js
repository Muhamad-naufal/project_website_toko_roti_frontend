import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import User from "./models/user.js";

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

// const untuk mendapatkan produk berdasarkan ID
const getProductById = (productId, callback) => {
  const query = "SELECT * FROM products WHERE id = ?"; // Query to fetch the product by ID
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Error fetching product:", err);
      callback(err, null);
    } else {
      callback(null, results[0]); // Return the first result
    }
  });
};

// Endpoint untuk mendapatkan produk berdasarkan ID
app.get("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  getProductById(productId, (err, product) => {
    if (err) {
      res.status(500).json({ message: "Error fetching product" });
    } else if (!product) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.json(product); // Send product data as JSON
    }
  });
});

// Helper function to hash passwords
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the email already exists
  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the new user into the database
    const insertUserQuery =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertUserQuery, [name, email, hashedPassword], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Error registering user" });
      }

      const userId = results.insertId; // Get the newly created user ID
      console.log("User ID:", userId); // Log the user ID to the console
      res.status(201).json({ userId }); // Respond with the user ID
    });
  });
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari pengguna berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Email tidak ditemukan" });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah" });
    }

    // Berhasil login, kembalikan user_id
    res.status(200).json({ user_id: user.id }); // Gunakan user.id, bukan user._id
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
