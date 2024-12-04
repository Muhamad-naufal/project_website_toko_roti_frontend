import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

// Middleware untuk membaca JSON body
app.use(express.json());

// Middleware untuk mengizinkan CORS
app.use(cookieParser()); // Middleware untuk parsing cookies
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Pastikan credentials diizinkan
app.use(bodyParser.json());

// Konfigurasi CORS
const corsOptions = {
  origin: "http://localhost:5173", // Ganti dengan origin frontend Anda
  credentials: true, // Mengizinkan pengiriman cookies
  optionsSuccessStatus: 200, // Status untuk permintaan preflight yang berhasil
};

app.use(cors(corsOptions));

// Koneksi ke database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "toko_roti",
});
console.log("Connected to the database");

// Endpoint untuk mendapatkan produk
app.get("/api/products", (req, res) => {
  // Extract the page, limit, and category from the query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const category = req.query.category || "all";
  const offset = (page - 1) * limit;

  // Create the base query for filtering by category if necessary
  let query = "SELECT * FROM products";
  let countQuery = "SELECT COUNT(*) AS totalProducts FROM products";

  if (category !== "all") {
    query += ` WHERE category = '${category}'`;
    countQuery += ` WHERE category = '${category}'`;
  }

  // Query to fetch the products with pagination and filtering by category
  db.query(query + ` LIMIT ${limit} OFFSET ${offset}`, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching products" });
    }

    // Query to get the total number of products for the filtered category
    db.query(countQuery, (err, countResult) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Error fetching total product count" });
      }

      const totalProducts = countResult[0].totalProducts;
      const totalPages = Math.ceil(totalProducts / limit);

      // Respond with the filtered products and the total count for pagination
      res.json({
        products: results,
        totalProducts: totalProducts,
        totalPages: totalPages,
      });
    });
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

// Endpoint untuk menambahkan produk ke keranjang
app.post("/api/cart/add", async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.cookies.user_id; // Mengambil user_id dari cookies

  console.log("Cookies di backend:", req.cookies); // Debug semua cookies yang diterima
  console.log("User ID dari cookies:", userId); // Debug nilai user_id

  if (!userId) {
    return res.status(401).json({ message: "User tidak ditemukan." });
  }

  try {
    db.query(
      "SELECT id FROM carts WHERE user_id = ?",
      [userId],
      (err, results) => {
        if (err) throw err;

        let cartId;
        if (results.length > 0) {
          cartId = results[0].id;
          addItemToCart(cartId, productId, quantity);
        } else {
          db.query(
            "INSERT INTO carts (user_id) VALUES (?)",
            [userId],
            (err, result) => {
              if (err) throw err;
              cartId = result.insertId;
              addItemToCart(cartId, productId, quantity);
            }
          );
        }
      }
    );

    const addItemToCart = (cartId, productId, quantity) => {
      db.query(
        "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
        [cartId, productId],
        (err, results) => {
          if (err) throw err;

          if (results.length > 0) {
            db.query(
              "UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?",
              [quantity, cartId, productId],
              (err) => {
                if (err) throw err;
                return res.status(200).json({
                  message: "Produk berhasil diperbarui di keranjang.",
                });
              }
            );
          } else {
            db.query(
              "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
              [cartId, productId, quantity],
              (err) => {
                if (err) throw err;
                return res.status(201).json({
                  message: "Produk berhasil ditambahkan ke keranjang.",
                });
              }
            );
          }
        }
      );
    };
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

// Endpoint untuk mendapatkan cart
app.get("/api/cart", (req, res) => {
  const userId = req.cookies.user_id; // Get user_id from cookies
  console.log("Cookies in backend:", req.cookies); // Debugging cookies
  console.log("User ID from cookies:", userId); // Debugging user_id

  if (!userId) {
    return res.status(401).json({ message: "User not found." });
  }

  const query = `SELECT carts.*, cart_items.*, products.name, products.price, products.image_url 
                 FROM carts 
                 JOIN cart_items ON carts.id = cart_items.cart_id 
                 JOIN products ON cart_items.product_id = products.id 
                 WHERE user_id = ${userId}`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching cart" });
    } else {
      res.json(results);
    }
  });
});

// Endpoint untuk memperbarui quantity item di cart menggunakan PUT
app.put("/api/cart/:itemId", (req, res) => {
  const itemId = req.params.itemId;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Invalid quantity" });
  }

  const query = "UPDATE cart_items SET quantity = ? WHERE id = ?";
  db.query(query, [quantity, itemId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to update quantity", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Quantity updated successfully" });
  });
});

// Endpoint untuk menghapus item dari cart menggunakan DELETE
app.delete("/api/cart/:itemId", (req, res) => {
  const itemId = req.params.itemId;

  const query = "DELETE FROM cart_items WHERE id = ?";
  db.query(query, [itemId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Failed to delete item", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
