import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import Recomended from "../components/Recomended";
import Swal from "sweetalert2";

interface Product {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const SingleProduct = () => {
  const [product] = useState<Product>({
    name: "Classic Bread Loaf",
    description:
      "Our Classic Bread Loaf is made with only the finest ingredients, offering a soft and fluffy texture with a golden crust. Perfect for sandwiches or enjoying with a spread.",
    price: 25000,
    imageUrl:
      "https://th.bing.com/th/id/OIP.sWrESiw26KsdURaORHasGAHaFW?rs=1&pid=ImgDetMain", // Replace with your image URL
  });
  const [quantity, setQuantity] = useState(1);

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    // Logic to add to cart
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Product has been added to cart!",
    });
  };

  return (
    <div className="container mx-auto p-4">
      {product ? (
        <>
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
                src={product.imageUrl}
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
                Rp {product.price.toLocaleString()}
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="default"
                  className="w-full md:w-auto"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          {/* Recommended */}
          <Recomended />
        </>
      ) : (
        <p>Loading product...</p>
      )}
    </div>
  );
};

export default SingleProduct;
