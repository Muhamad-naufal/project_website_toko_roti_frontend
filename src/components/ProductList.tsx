import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

const ProductList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Dummy Data for Categories
  const dummyCategories = ["All", "Bread", "Cakes", "Pastries"];

  // Dummy Data for Products
  const dummyProducts = [
    {
      id: 1,
      name: "Chocolate Cake",
      category: "Cakes",
      price: 20.0,
      image_url:
        "https://th.bing.com/th/id/OIP.IbwF8KtUTzAvpGQzoSzlQwHaKP?rs=1&pid=ImgDetMain",
    },
    {
      id: 2,
      name: "Croissant",
      category: "Pastries",
      price: 5.0,
      image_url:
        "https://th.bing.com/th/id/OIP.G6AChkGWMQ3TA6JBWQCl2wHaEY?rs=1&pid=ImgDetMain",
    },
    {
      id: 3,
      name: "Banana Bread",
      category: "Bread",
      price: 12.0,
      image_url:
        "https://i0.wp.com/tangledwithtaste.com/wp-content/uploads/2018/01/BananaBread5.jpg?resize=1100%2C1453&ssl=1",
    },
    {
      id: 4,
      name: "Strawberry Tart",
      category: "Pastries",
      price: 15.0,
      image_url:
        "https://th.bing.com/th/id/OIP.8vzPylMGuhjtX4g7nUKgRgHaE8?rs=1&pid=ImgDetMain",
    },
  ];

  useEffect(() => {
    setCategories(dummyCategories);
  }, []);

  useEffect(() => {
    const filteredProducts =
      selectedCategory === "all"
        ? dummyProducts
        : dummyProducts.filter(
            (product) => product.category.toLowerCase() === selectedCategory
          );

    setProducts(filteredProducts);
  }, [selectedCategory]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Produk Kami</h1>

      {/* Category Selection */}
      <div className="flex space-x-4 mb-6">
        {categories.map((category, index) => (
          <motion.button
            key={index}
            onClick={() =>
              setSelectedCategory(
                category === "All" ? "all" : category.toLowerCase()
              )
            }
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
                  // onClick={() => handleAddToCart(product.id, 1)}
                  className="text-gray-800 py-2 px-4 rounded-md transition duration-300 hover:bg-yellow-600"
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                </Button>
                <Button
                  variant="link"
                  color="yellow"
                  className="text-gray-800 py-2 px-4 rounded-md transition duration-300 hover:bg-yellow-600"
                >
                  <a href={`/singleProduct`}>
                    <i className="fa-solid fa-eye"></i>
                  </a>
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
