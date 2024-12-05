import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

// Product Type (can be customized based on your project structure)
interface Product {
  id: number;
  name: string;
  image_url: string;
  category: string;
  price: number;
}

const Recommended: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProductAndRecommended = async () => {
      try {
        // Fetch all products
        const productsResponse = await fetch(
          "http://localhost:5000/api/products"
        );
        const productsData = await productsResponse.json();

        if (productsResponse.ok) {
          // Check if 'products' is an array inside the response object
          const productsArray = productsData.products;

          if (Array.isArray(productsArray)) {
            // Shuffle all products to get a random order and select the first 4
            const shuffledProducts = productsArray.sort(
              () => Math.random() - 0.5
            );
            const randomProducts = shuffledProducts.slice(0, 4);

            setProducts(randomProducts); // Set the 4 random products
          } else {
            console.error("Products data is not an array:", productsArray);
          }
        } else {
          console.error("Error fetching products:", productsData.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchProductAndRecommended();
  }, []); // Re-run once on component mount

  // Format the price to IDR currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 mt-6 text-center">Rekomendasi</h1>

      {/* Product List */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {products.length > 0 ? (
          products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-lg shadow-md p-4 mb-10"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="text-gray-600">{product.category}</p>
              <p className="text-lg font-bold text-yellow-500">
                {formatPrice(product.price)}
              </p>

              <div className="relative flex">
                <Button
                  variant="link"
                  color="yellow"
                  className="text-gray-800 py-2 px-4 rounded-md transition duration-300 hover:bg-yellow-600"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "http://localhost:5000/api/cart/add",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          credentials: "include", // Untuk mengirim cookies
                          body: JSON.stringify({
                            productId: product.id,
                            quantity: 1, // Default quantity
                          }),
                        }
                      );

                      if (response.ok) {
                        Swal.fire({
                          icon: "success",
                          title: "Success",
                          text: "Produk berhasil ditambahkan ke keranjang.",
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      } else {
                        alert("Gagal menambahkan produk ke keranjang.");
                      }
                    } catch (error) {
                      console.error("Error:", error);
                    }
                  }}
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                </Button>

                <Button
                  variant="link"
                  color="yellow"
                  className="text-gray-800 py-2 px-4 rounded-md transition duration-300 hover:bg-yellow-600"
                >
                  <Link to={`/product/${product.id}`}>
                    <i className="fa-solid fa-eye"></i>
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-500">No products found.</p>
        )}
      </motion.div>
    </div>
  );
};

export default Recommended;
