import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";

const Order = () => {
  const [, setLoading] = useState(true);
  const [groupedOrders, setGroupedOrders] = useState<Record<string, any[]>>({});

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

        // Group orders by date
        const grouped = data.reduce(
          (acc: Record<string, any[]>, order: any) => {
            const date = new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }).format(new Date(order.created_at));

            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(order);
            return acc;
          },
          {}
        );

        setGroupedOrders(grouped);
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
        className="space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {Object.keys(groupedOrders).length > 0 ? (
          Object.entries(groupedOrders).map(([date, orders]) => (
            <div key={date} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{date}</h2>
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="flex items-center justify-between bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {order.product_name}
                      </h3>
                      <p className="text-gray-600">
                        Jumlah: {order.quantity} pcs
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`font-medium text-lg p-2 rounded-lg ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "Process"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "Completed"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "Canceled"
                            ? "bg-red-100 text-red-700"
                            : ""
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
            <img
              src="/empty.png"
              alt="Empty State"
              className="w-[300px] h-[300px] mb-6 transform hover:scale-105 transition-transform duration-300"
            />
            <p className="text-white font-bold text-lg mb-6">
              Tidak ada pesanan untuk ditampilkan
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
      </motion.div>
    </div>
  );
};

export default Order;
