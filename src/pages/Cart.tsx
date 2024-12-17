import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import Swal from "sweetalert2";

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  interface CartItem {
    id: number;
    product_id: number;
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

  const updateQuantity = async (product_id: number, increment: boolean) => {
    try {
      // Fetch the latest stock from the backend
      const stockResponse = await fetch(
        `http://localhost:5000/api/products/${product_id}/stock`
      );
      console.log(product_id);

      if (!stockResponse.ok) {
        throw new Error("Failed to fetch product stock");
      }

      const { stock } = await stockResponse.json();

      setCartItems((prevItems) => {
        const updatedItems = prevItems.map((item) => {
          if (item.id === product_id) {
            const newQuantity = increment
              ? item.quantity + 1
              : item.quantity > 1
              ? item.quantity - 1
              : item.quantity;

            // Check if new quantity exceeds the stock
            if (newQuantity > stock) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Stok barang tidak mencukupi!",
              });
              return item; // Prevent updates
            }

            // Update quantity on the server
            fetch(`http://localhost:5000/api/cart/${product_id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ quantity: newQuantity }),
            }).catch((error) =>
              console.error("Error updating quantity on server:", error)
            );

            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        return updatedItems;
      });
    } catch (error) {
      console.error("Error fetching or updating stock:", error);
    }
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
        className="space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <motion.div
              key={item.id}
              className="flex items-center justify-between bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={`../../backend${item.image_url}`}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.name}
                  </h2>
                  <p className="text-gray-500">
                    Harga: {formatCurrency(item.price)}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.id, false)}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
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
                    <p className="font-medium text-gray-800">{item.quantity}</p>
                    <button
                      onClick={() => updateQuantity(item.id, true)}
                      className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
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

              <div className="flex items-center gap-4">
                <p className="font-bold text-xl text-gray-700">
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
                  className="text-red-500 hover:text-red-700 text-xl p-3 rounded-lg transition-colors duration-200"
                >
                  <i className="fa-solid fa-trash"></i>
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
            <img
              src="/empty.png"
              alt="Empty State"
              className="w-[300px] h-[300px] mb-6 transform hover:scale-105 transition-transform duration-300"
            />
            <p className="text-white font-bold text-lg mb-6">
              Keranjang Anda Kosong
            </p>
            <Button
              variant="default"
              className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-full border border-gray-300 transition-colors duration-300"
              onClick={() => (window.location.href = "/")}
            >
              Kembali ke Beranda
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Total: {formatCurrency(totalPrice)}
          </h2>
          <Button
            variant="default"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            <i className="fa-solid fa-credit-card"></i>
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
