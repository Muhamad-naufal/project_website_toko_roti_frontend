import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Orderan = () => {
  interface Order {
    id: number;
    name: string;
    product_name: string;
    quantity: number;
    totalPrice: number;
    status: string;
  }
  const [orderData, setOrderData] = useState<Order[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/order");
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched order data:", data);

          // Map data untuk memastikan total_price adalah angka
          const formattedData = data.map((order: any, index: number) => ({
            id: index + 1, // Tambahkan id jika tidak ada
            name: order.name,
            product_name: order.product_name,
            quantity: order.quantity,
            totalPrice: parseFloat(order.total_price) || 0, // Konversi total_price ke angka
            status: order.status,
          }));

          setOrderData(formattedData);
        } else {
          console.error("Failed to fetch order data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <motion.h1
        className="text-2xl font-bold text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Orderan
      </motion.h1>

      <motion.div
        className="overflow-x-auto bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Nama User</th>
              <th className="p-4 text-left">Nama Produk</th>
              <th className="p-4 text-left">Jumlah Pesanan</th>
              <th className="p-4 text-left">Total Harga</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orderData.map((order: Order) => (
              <motion.tr
                key={order.id}
                className="border-b hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <td className="p-4">{order.name}</td>
                <td className="p-4">{order.product_name}</td>
                <td className="p-4">{order.quantity}</td>
                <td className="p-4">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(order.totalPrice)}
                </td>
                <td className="p-4">{order.status}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Orderan;
