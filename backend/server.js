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
    "http://localhost:5173",
    "http://localhost:5174", // Allow this origin
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

// Create a connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "toko_roti",
  waitForConnections: true, // Wait for available connections if all are in use
  connectionLimit: 10, // Limit the number of connections in the pool
  queueLimit: 0, // No limit for queueing requests
});

// Export the pool
export default db.promise();

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
  db.query(
    query + ` ORDER BY updated_at DESC LIMIT ${limit} OFFSET ${offset}`,
    (err, results) => {
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
    }
  );
});

// Product search
app.get("/api/products/search", async (req, res) => {
  const { page = 1, limit = 8, category = "all", search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `SELECT * FROM products WHERE 1=1`;
    let queryParams = [];

    // Filter by category
    if (category !== "all") {
      query += ` AND category = ?`;
      queryParams.push(category);
    }

    // Filter by search query
    if (search) {
      query += ` AND name LIKE ?`;
      queryParams.push(`%${search}%`);
    }

    // Apply pagination
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    // Get the filtered products
    const [products] = db.execute(query, queryParams);

    // Get the total count for pagination
    const [countResult] = db.execute("SELECT COUNT(*) AS total FROM products");
    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    res.json({ products, totalPages });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Endpoint untuk memunculkan semua produk admin
app.get("/api/products/all", (req, res) => {
  const query =
    "SELECT p.*, c.nama_category FROM products as p join category as c on p.category_id = c.id";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching products" });
    }
    res.json(results); // Mengirimkan data langsung
  });
});

// const untuk mendapatkan produk berdasarkan ID
const getProductById = (productId, callback) => {
  const query =
    "SELECT p.*, c.nama_category FROM products as p join category as c on p.category_id = c.id WHERE p.id = ?"; // Query to fetch the product by ID
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

    // Check if the name already exists
    const checkNameQuery = "SELECT * FROM users WHERE name = ?";
    db.query(checkNameQuery, [name], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Name already in use" });
      }
    });

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

// Endpoint untuk mengambil semua data orderan
app.get("/api/order", async (req, res) => {
  const query = `
  SELECT 
    o.id AS order_id,
    u.name AS user_name, 
    p.name AS product_name, 
    oi.quantity, 
    oi.price, 
    o.total_price, 
    oi.status, 
    o.created_at
  FROM 
    orders AS o 
    JOIN users AS u ON o.user_id = u.id 
    JOIN order_items AS oi ON o.id = oi.order_id 
    JOIN products AS p ON oi.product_id = p.id
    ORDER BY o.created_at DESC
`;

  try {
    const [results] = await db.promise().query(query);

    // Ensure data is an array and properly structured
    const groupedOrders = results.reduce((acc, row) => {
      const {
        order_id,
        user_name,
        product_name,
        quantity,
        price,
        total_price,
        status,
        created_at, // We now include created_at in the order data
      } = row;

      if (!acc[order_id]) {
        acc[order_id] = {
          id: order_id,
          user_name,
          totalPrice: total_price,
          status,
          items: [],
          created_at, // Include created_at in the order data
        };
      }

      acc[order_id].items.push({
        product_name,
        quantity,
        price,
      });

      return acc;
    }, {});

    // Convert groupedOrders object to an array before sending
    res.json(Object.values(groupedOrders)); // This should be an array
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Endpoint untuk menampilkan orderan user
app.get("/api/order/user", (req, res) => {
  const userId = req.cookies.user_id; // Get user_id from cookies
  console.log("Cookies in backend:", req.cookies); // Debugging cookies
  console.log("User ID from cookies:", userId); // Debugging user_id

  if (!userId) {
    return res.status(401).json({ message: "User not found." });
  }

  const query = `SELECT orders.*, order_items.*, products.name as product_name, products.price, products.image_url, users.name as user_name
                  FROM orders Join order_items ON orders.id = order_items.order_id join products ON order_items.product_id = products.id join users ON orders.user_id = users.id
                 WHERE user_id = ${userId}
                 ORDER BY order_items.created_at DESC`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Error fetching cart" });
    } else {
      res.json(results);
    }
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

  const { name, description, price, stock, category } = req.body; // Ganti 'category' menjadi 'category_id'
  const image = req.file ? req.file.filename : null; // Mendapatkan nama file gambar

  // Validasi input
  if (!name || !description || !price || !stock || !category || !image) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Query untuk menambahkan produk ke tabel products
  const sql =
    "INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, description, price, stock, category, `/uploads/${image}`], // Gunakan 'category_id'
    (err, results) => {
      if (err) {
        console.error(err); // Log error untuk debugging
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, id: results.insertId }); // Kembalikan ID produk yang baru ditambahkan
    }
  );
});

// Endpoint untuk mengupdate produk
app.put("/api/products/update/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, category } = req.body; // Tangkap "name_product"
  const image = req.file ? req.file.filename : null;

  // Validasi input
  if (!name || !description || !price || !stock || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Query untuk mendapatkan URL gambar lama
  const getImageQuery = `SELECT image_url FROM products WHERE id = ?`;

  db.query(getImageQuery, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Jika tidak ada hasil, produk tidak ditemukan
    if (results.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Ambil URL gambar lama dan tentukan gambar yang akan disimpan
    const previousImageUrl = results[0].image_url;
    const imageUrl = image ? `/uploads/${image}` : previousImageUrl;

    // Query untuk mengupdate data produk
    const updateQuery = `
      UPDATE products
      SET name = ?, description = ?, price = ?, stock = ?, category_id = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.query(
      updateQuery,
      [name, description, price, stock, category, imageUrl, id],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }
        res.json({ success: true, message: "Product updated successfully" });
      }
    );
  });
});

// Endpoint untuk menghapus produk
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

    // Delete related rows in order_items first
    const deleteOrderItemsQuery = `DELETE FROM order_items WHERE product_id = ?`;

    db.query(deleteOrderItemsQuery, [id], (orderItemsErr) => {
      if (orderItemsErr) {
        console.error("Error deleting order items:", orderItemsErr);
        return res.status(500).json({ error: "Error deleting order items" });
      }

      // Then delete related rows in cart_items
      const deleteCartItemsQuery = `DELETE FROM cart_items WHERE product_id = ?`;

      db.query(deleteCartItemsQuery, [id], (cartItemsErr) => {
        if (cartItemsErr) {
          console.error("Error deleting cart items:", cartItemsErr);
          return res.status(500).json({ error: "Error deleting cart items" });
        }

        // Finally, delete the product
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
});

// Endpoint untuk menampilkan semua category
app.get("/api/categories", (req, res) => {
  const query = "SELECT * FROM category";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching categories" });
    }
    res.json(results);
  });
});

// Endpoint untuk menambah category
app.post("/api/categories/add", (req, res) => {
  const { categoryName } = req.body;

  // Check if the category already exists
  const checkQuery = `SELECT * FROM category WHERE nama_category = ?`;
  db.query(checkQuery, [categoryName], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error checking category" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // If category does not exist, insert it
    const insertQuery = `INSERT INTO category (nama_category) VALUES (?)`;
    db.query(insertQuery, [categoryName], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error adding category" });
      }
      res.json({ message: "Category added successfully" });
    });
  });
});

// Endpoint untuk menampilkan category berdasarkan ID
app.get("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  const query =
    "SELECT products.name, category.nama_category FROM products LEFT JOIN category ON products.category_id = category.id WHERE products.id = ?;";

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err); // Logging error detail
      return res.status(500).json({ message: "Error fetching category" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Format response to include category and products
    const category = {
      nama_category: results[0].nama_category,
      products: results.map((row) => row.nama_produk),
    };

    res.json(category);
  });
});

// Endpoint untuk update category
app.put("/api/categories/update/:id", (req, res) => {
  const { id } = req.params;
  const { nama_category } = req.body;

  if (!nama_category) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const query = "UPDATE category SET nama_category = ? WHERE id = ?";
  db.query(query, [nama_category, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating category" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category updated successfully" });
  });
});

// Endpoint untuk menghapus category
app.delete("/api/categories/delete/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM category WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error deleting category" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  });
});

// Route: GET /api/products/:id/stock
app.get("/api/products/:cart_id/stock", (req, res) => {
  const { cart_id } = req.params;

  // Query untuk JOIN tabel carts dan products
  const query = `
    SELECT p.id AS product_id, p.stock 
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.id = ?

  `;

  db.query(query, [cart_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching stock" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    res.json({ stock: results[0].stock });
  });
});

// Endpoint untuk login admin
app.post("/api/admin/login", (req, res) => {
  const { user_name, password } = req.body;

  const query = "SELECT * FROM admin WHERE user_name = ? AND password = ?";
  db.query(query, [user_name, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    res.json({ user_id: results[0].id });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
