import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

// Middleware untuk membaca JSON body
app.use(express.json());

// Middleware untuk mengizinkan CORS
app.use(cookieParser()); // Middleware untuk parsing cookies

// Configure CORS to allow both origins
const corsOptions = {
  origin: [
    "http://localhost:5173", // Allow this origin
    "http://localhost:5175", // Allow this origin as well
  ],
  credentials: true, // Mengizinkan pengiriman cookies
  optionsSuccessStatus: 200, // Status untuk permintaan preflight yang berhasil
};

// Use the single CORS middleware configuration
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(express.json()); // Untuk menangani data JSON
app.use(express.urlencoded({ extended: true })); // Untuk menangani data URL-encoded
app.use("/uploads", express.static("uploads"));

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your other routes and logic...

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
    // Cek apakah produk tersedia
    db.query(
      "SELECT stock FROM products WHERE id = ?",
      [productId],
      (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
          return res.status(404).json({ message: "Produk tidak ditemukan." });
        }

        const currentStock = results[0].stock;

        // Pastikan stok mencukupi, tanpa mengurangi stok
        if (currentStock < quantity) {
          return res
            .status(400)
            .json({ message: "Stok tidak mencukupi untuk produk ini." });
        }

        // Lanjutkan proses menambahkan ke keranjang
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

// Endpoint untuk mengambil jumlah user
app.get("/api/user/count", (req, res) => {
  const query = "SELECT COUNT(*) AS count FROM users"; // gunakan alias `count`
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Error fetching user count" });
    }
    res.json({ count: results[0].count }); // gunakan `count`
  });
});

// Endpoint untuk mengambil jumlah produk
app.get("/api/produk/count", (req, res) => {
  console.log("Endpoint hit: /api/products/count");
  const query = "SELECT COUNT(*) AS count FROM products";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Error fetching product count" });
    }
    res.json({ count: results[0].count });
  });
});

// Endpoint untuk mengambil jumlah orderan
app.get("/api/order/count", (req, res) => {
  const query = "SELECT COUNT(*) AS count FROM orders";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Error fetching order count" });
    }
    res.json({ count: results[0].count });
  });
});

// Endpoint untuk mengambil data orderan
app.get("/api/order", (req, res) => {
  const query =
    "SELECT u.name, p.name as product_name, oi.quantity, o.total_price, o.status FROM orders as o JOIN users as u ON o.user_id = u.id JOIN order_items as oi ON o.id = oi.order_id JOIN products as p ON oi.product_id = p.id";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Error fetching orders" });
    }
    res.json(results);
  });
});

// Endpoint untuk mengambil total penjualan
app.get("/api/sales/count", (req, res) => {
  const query = "SELECT SUM(total_price) AS total_sales FROM orders";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Error fetching total sales" });
    }
    const totalSales = results[0].total_sales || 0; // Jika null atau undefined, set ke 0
    res.json({ total_sales: totalSales });
  });
});

// Endpoint untuk menambahkan produk ke database
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads/"); // Gambar disimpan di folder 'uploads'
  },
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Menambahkan timestamp untuk nama file
  },
});

const upload = multer({ storage: storage });

// Endpoint untuk menambahkan produk dengan gambar
app.post("/api/products/add", upload.single("image"), (req, res) => {
  console.log(req.body); // Untuk debugging
  const { name, description, price, stock, category } = req.body;
  const image = req.file ? req.file.filename : null; // Mendapatkan nama file gambar

  if (!name || !description || !price || !stock || !category || !image) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql =
    "INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, description, price, stock, category, `/uploads/${image}`], // Menyimpan path gambar
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: results.insertId });
    }
  );
});

// Endpoint untuk mengupdate produk
app.put("/api/products/update/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body;
  const image = req.file ? req.file.filename : null;

  // Query untuk mendapatkan URL gambar lama
  const getImageQuery = `SELECT image_url FROM products WHERE id = ?`;

  db.query(getImageQuery, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Jika tidak ada hasil, produk tidak ditemukan
    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Jika ada hasil, ambil URL gambar lama
    const previousImageUrl = results[0].image_url;

    // Gunakan gambar lama jika gambar baru tidak diunggah
    const imageUrl = image ? `/uploads/${image}` : previousImageUrl;

    // Query untuk mengupdate data produk
    const updateQuery = `
      UPDATE products
      SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ?
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [name, description, price, stock, category, imageUrl, id],
      (updateErr) => {
        if (updateErr)
          return res.status(500).json({ error: updateErr.message });

        res.json({ success: true, message: "Product updated successfully" });
      }
    );
  });
});

app.delete("/api/products/delete/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Attempting to delete product with id: ${id}`);

  const getImageQuery = `SELECT image_url FROM products WHERE id = ?`;

  db.query(getImageQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching product image:", err);
      return res.status(500).json({ error: "Error fetching product image" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const imageUrl = results[0].image_url;

    // Delete the related cart items first
    const deleteCartItemsQuery = `DELETE FROM cart_items WHERE product_id = ?`;

    db.query(deleteCartItemsQuery, [id], (cartItemsErr) => {
      if (cartItemsErr) {
        console.error("Error deleting cart items:", cartItemsErr);
        return res.status(500).json({ error: "Error deleting cart items" });
      }

      const deleteProductQuery = `DELETE FROM products WHERE id = ?`;

      db.query(deleteProductQuery, [id], (deleteErr) => {
        if (deleteErr) {
          console.error("Error deleting product:", deleteErr);
          return res.status(500).json({ error: "Error deleting product" });
        }

        if (imageUrl) {
          const imagePath = path.join(__dirname, imageUrl);
          fs.unlink(imagePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error("Error deleting image:", unlinkErr);
            }
          });
        }

        res.json({ success: true, message: "Product deleted successfully" });
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
