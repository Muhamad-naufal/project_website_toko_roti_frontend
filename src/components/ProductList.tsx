import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url: string;
}

const ProductList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

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

  // Fetching products based on the selected category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();

        // Apply filter based on the selected category
        const filteredProducts =
          selectedCategory === "all"
            ? data
            : data.filter(
                (product: Product) =>
                  product.category.toLowerCase() ===
                  selectedCategory.toLowerCase()
              );
        setProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Produk Kami</h1>

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
                ${product.price}
              </p>

              <div className="relative flex">
                <Button
                  variant="link"
                  color="yellow"
                  className="text-gray-800 py-2 px-4 rounded-md transition duration-300 hover:bg-yellow-600"
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
    </div>
  );
};

export default ProductList;
