import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
}

const ProductList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]); // Ensure initial state is an empty array
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1); // Track current page
  const [totalPages, setTotalPages] = useState<number>(1); // Track total pages

  // Jumlah produk per halaman
  const productsPerPage = 12;

  // Fetching categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();

        // Clean category names to remove extra spaces or characters
        const cleanedCategories = data.map(
          (category: string) => category.trim().replace(/['"]/g, "") // Remove single and double quotes
        );

        setCategories(["All", ...cleanedCategories]); // Add "All" as a default category
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetching products based on the selected category and current page
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/products?page=${currentPage}&limit=${productsPerPage}&category=${selectedCategory}`
        );
        const data = await response.json();

        const filteredProducts =
          Array.isArray(data.products) && selectedCategory === "all"
            ? data.products
            : Array.isArray(data.products)
            ? data.products.filter(
                (product: Product) =>
                  product.category.toLowerCase() ===
                  selectedCategory.toLowerCase()
              )
            : [];

        setProducts(filteredProducts);
        setTotalPages(data.totalPages); // Update totalPages from the response
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory, currentPage]);

  // Format the price to IDR currency
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 mt-4 text-center">Produk Kami</h1>

      {/* Category Selection */}
      <div className="flex space-x-4 mb-6">
        {categories.map((category, index) => (
          <motion.button
            key={index}
            onClick={() => {
              // If the category is "All", set it to 'all', otherwise use category name
              setSelectedCategory(
                category === "All" ? "all" : category.toLowerCase()
              );
            }}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedCategory ===
              (category === "All" ? "all" : category.toLowerCase())
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-800"
            } hover:bg-yellow-400`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {category}
          </motion.button>
        ))}
      </div>

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
          <p className="text-center text-gray-500">
            No products found in this category.
          </p>
        )}
      </motion.div>
      {/* Pagination Controls */}
      <div className="flex justify-center space-x-4 mt-6">
        <Button
          variant="link"
          color="yellow"
          className="px-4 py-2 rounded-lg"
          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="text-xl">{`Page ${currentPage} of ${totalPages}`}</span>
        <Button
          variant="link"
          color="yellow"
          className="px-4 py-2 rounded-lg"
          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ProductList;
