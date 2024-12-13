import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
  }

  // Helper function to format price into IDR currency format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Calculate total price in IDR
  const totalPrice = (cartItems || []).reduce(
    (total: number, item: CartItem) => total + item.price * item.quantity,
    0
  );

  const updateQuantity = (itemId: number, increment: boolean) => {
    // Update cartItems state
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: increment
                ? item.quantity + 1
                : item.quantity > 1
                ? item.quantity - 1
                : item.quantity, // Prevent quantity from going below 1
            }
          : item
      );

      // Find the updated item
      const updatedItem = updatedItems.find((item) => item.id === itemId);
      if (updatedItem) {
        fetch(`http://localhost:5000/api/cart/${updatedItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: updatedItem.quantity }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to update quantity");
            }
          })
          .catch((error) => {
            console.error("Error updating quantity:", error);
          });
      }

      return updatedItems;
    });
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      // Update the cartItems state to remove the deleted item
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
      setShowModal(false); // Close the modal after item removal
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // Fetch cart items from the server based on user_id from cookies
  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true); // Set loading to true when starting the fetch
      try {
        const response = await fetch("http://localhost:5000/api/cart", {
          method: "GET",
          credentials: "include", // Ensure cookies are sent with the request
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cart items");
        }

        const data = await response.json();
        setCartItems(data); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setCartItems([]); // Set to an empty array in case of error
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    fetchCartItems();
  }, []);

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
                  src={`../../backend${item.image_url}`}
                  alt={item.name}
                  className="w-20 h-20 rounded-md object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-600">
                    Harga: {formatCurrency(item.price)}
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
                <p className="font-bold text-xl mt-2 me-4">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  color="red"
                  onClick={() => {
                    setItemToDelete(item.id);
                    setShowModal(true);
                  }}
                  className="text-red-500 hover:text-red-700 text-xl items-center p-5 rounded-lg"
                >
                  <i className="fa-solid fa-trash"></i>
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4">
              Keranjang belanja kamu kosong
            </h2>
            <p className="text-gray-600 mb-6">
              Ayo tambahkan roti favoritmu ke keranjang!
            </p>
            <Button
              variant="default"
              className="hover:bg-gray-800"
              onClick={() => (window.location.href = "/")}
            >
              Belanja Sekarang
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <h2 className="text-2xl font-bold">
            Total: {formatCurrency(totalPrice)}
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
                  if (itemToDelete !== null) {
                    removeFromCart(itemToDelete); // Remove the item
                  }
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
