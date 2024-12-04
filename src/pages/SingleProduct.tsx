import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import Recomended from "../components/Recomended";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
  description: string;
}

const SingleProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the product id from the route
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );
        const data = await response.json();
        if (response.ok) {
          setProduct(data); // Set the fetched product
        } else {
          console.error("Error fetching product:", data.message);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]); // Trigger re-fetch when the id changes

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="container mx-auto p-4">
      {product ? (
        <motion.div
          className="flex flex-col md:flex-row items-center gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Product Image */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="rounded-lg shadow-md"
            />
          </motion.div>

          {/* Product Details */}
          <motion.div
            className="w-full md:w-1/2 space-y-6"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-xl font-semibold text-yellow-500">
              ${product.price}
            </p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleDecreaseQuantity}
                className="text-xl"
              >
                -
              </Button>
              <span className="text-xl">{quantity}</span>
              <Button
                variant="outline"
                onClick={handleIncreaseQuantity}
                className="text-xl"
              >
                +
              </Button>
            </div>

            {/* Add to Cart Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className="w-full md:w-auto"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      "http://localhost:5000/api/cart/add",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        credentials: "include", // To send cookies
                        body: JSON.stringify({
                          productId: product.id,
                          quantity: quantity, // Send the selected quantity
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
                Add to Cart
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        <p>Loading product...</p>
      )}
      <Recomended />
    </div>
  );
};

export default SingleProduct;
