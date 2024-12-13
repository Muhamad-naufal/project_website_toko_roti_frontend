import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";

const Order = () => {
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrderItem = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/order/user`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch order items");
        }
        const data = await response.json();
        console.log("Fetched order items:", data); // Add this line
        setOrderItems(data);
      } catch (error) {
        console.error("Error fetching order items:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderItem();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 mt-10">Orderanmu</h1>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {orderItems.length > 0 ? (
          orderItems.map((order) => (
            <motion.div
              key={order.id}
              className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-md"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {order.product_name}
                  </h2>
                </div>
                <div>
                  <p className="text-gray-600">Jumlah: {order.quantity} pcs</p>
                </div>
              </div>
              <div className="flex gap-2">
                <p className="font-bold text-xl mt-2 me-4">{order.status}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10">
            <h2 className="text-2xl font-semibold mb-4">
              Kamu belum memiliki pesanan
            </h2>
            <p className="text-gray-600 mb-6">Ayo, Pesan Sekarang</p>
            <Button
              variant="default"
              className="hover:bg-gray-800"
              onClick={() => (window.location.href = "/")}
            >
              Belanja Sekarang
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Order;
