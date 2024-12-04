import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import axios from "axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback to empty array if cartItems is undefined
  const totalPrice = (cartItems || []).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const updateQuantity = (itemId: number, increment: boolean) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: increment ? item.quantity + 1 : item.quantity - 1,
            }
          : item
      )
    );
  };

  const removeFromCart = (itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  // Fetch cart items from the server based on user_id from cookies
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const userId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user_id="))
          ?.split("=")[1];
        if (userId) {
          const response = await axios.get(`/api/cart/${userId}`);
          setCartItems(response.data.cartItems || []); // Ensure it's an array
        } else {
          console.error("User ID not found in cookies");
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  if (loading) {
    return <p>Loading your cart...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Keranjangmu</h1>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-md"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-md object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-600">
                    Price: ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, false)}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 12h-15"
                        />
                      </svg>
                    </button>
                    <p>{item.quantity}</p>
                    <button
                      onClick={() => updateQuantity(item.id, true)}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 5.25v13.5m7.5-7.5h-15"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <p className="font-bold text-xl">
                  ${item.price * item.quantity}
                </p>
                <button
                  onClick={() => {
                    setItemToDelete(item.id);
                    setShowModal(true);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}

        <div className="flex justify-between items-center mt-4">
          <h2 className="text-2xl font-bold">
            Total: ${totalPrice.toFixed(2)}
          </h2>
          <Button variant="default" className="hover:bg-gray-800">
            Checkout
          </Button>
        </div>
      </motion.div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg w-96">
            <p>Are you sure you want to remove this item from your cart?</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => {
                  removeFromCart(itemToDelete as number);
                  setShowModal(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
