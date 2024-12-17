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
  stock: number; // Tambahkan stok produk
}

const SingleProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Ambil ID produk dari route
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Ambil data produk berdasarkan ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );
        const data = await response.json();
        if (response.ok) {
          setProduct(data); // Set data produk termasuk stok
        } else {
          console.error("Error fetching product:", data.message);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  // Tambahkan kuantitas produk
  const handleIncreaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Stok Habis",
        text: "Jumlah tidak boleh melebihi stok yang tersedia.",
      });
    }
  };

  // Kurangi kuantitas produk
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  // Format harga ke mata uang IDR
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
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
          {/* Gambar Produk */}
          <motion.div
            className="w-full md:w-1/2"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <img
              src={`../../backend${product.image_url}`}
              alt={product.name}
              className="rounded-lg shadow-md"
            />
          </motion.div>

          {/* Detail Produk */}
          <motion.div
            className="w-full md:w-1/2 space-y-6"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-xl font-semibold text-yellow-500">
              {formatPrice(product.price)}
            </p>
            <p className="text-gray-500">
              Stok tersedia:{" "}
              <span className="font-semibold">{product.stock}</span>
            </p>

            {/* Selector Kuantitas */}
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

            {/* Tombol Tambah ke Keranjang */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                className="w-full md:w-auto"
                onClick={async () => {
                  if (product && quantity > product.stock) {
                    Swal.fire({
                      icon: "warning",
                      title: "Stok Tidak Cukup",
                      text: "Jumlah yang dipilih melebihi stok yang tersedia.",
                    });
                    return;
                  }

                  try {
                    const response = await fetch(
                      "http://localhost:5000/api/cart/add",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        credentials: "include", // Mengirim cookies
                        body: JSON.stringify({
                          productId: product.id,
                          quantity: quantity,
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
                      Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Login dulu",
                        showConfirmButton: false,
                        timer: 1500,
                      }).then(() => {
                        window.location.href = "/login";
                      });
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
