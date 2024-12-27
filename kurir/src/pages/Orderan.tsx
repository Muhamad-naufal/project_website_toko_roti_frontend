import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  order_id: number;
  user_name: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  user_address: string;
}

interface OrderData {
  [orderDate: string]: {
    [orderTime: string]: Order[];
  };
}

const Orderan: React.FC = () => {
  const [orderData, setOrderData] = useState<OrderData>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift();
        };

        const id_kurir = getCookie("kurir_id"); // Ambil ID kurir dari cookies
        if (!id_kurir) {
          setError("ID kurir tidak ditemukan di cookies.");
          return;
        }
        const response = await fetch(
          `http://localhost:5000/api/kurir/order/${id_kurir}`
        );
        if (response.ok) {
          const orders = await response.json();
          setOrderData(orders);
        } else {
          setError("Gagal mengambil data dari server.");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    fetchOrders();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = async (
    orderId: number,
    newStatus: string,
    orderDate: string,
    orderTime: string
  ) => {
    console.log("Selected status:", newStatus); // Log the new status to confirm
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // handle success
        window.location.reload(); // Reload the page to refresh the data
      } else {
        const errorData = await response.json(); // Get response data
        console.log("Error details:", errorData); // Log error details
        setError(
          `Gagal memperbarui status: ${errorData.message || "Unknown error"}`
        );
        Swal.fire({
          icon: "error",
          title: "Gagal memperbarui status",
          text: "Status tidak bisa dikembalikan",
        }).then(() => {
          window.location.reload(); // Reload the page to refresh the data
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const filteredOrders = Object.keys(orderData || {}).reduce(
    (acc, orderDate) => {
      const filteredTimes = Object.keys(orderData[orderDate] || {}).reduce(
        (timeAcc, orderTime) => {
          const ordersAtTime = orderData[orderDate][orderTime];
          if (!Array.isArray(ordersAtTime)) return timeAcc;

          const filteredOrders = ordersAtTime.filter(
            (order) =>
              (order.user_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
                order.items?.some((item) =>
                  item.product_name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )) &&
              (selectedStatuses.size === 0 ||
                selectedStatuses.has(order.status))
          );

          if (filteredOrders.length > 0) {
            timeAcc[orderTime] = filteredOrders;
          }

          return timeAcc;
        },
        {} as Record<string, Order[]>
      );

      if (Object.keys(filteredTimes).length > 0) {
        acc[orderDate] = filteredTimes;
      }

      return acc;
    },
    {} as OrderData
  );

  if (error) {
    return <p className="text-red-500 text-lg">{error}</p>;
  }

  if (Object.keys(orderData || {}).length === 0) {
    return (
      <p className="text-gray-500 text-lg text-center mt-10">
        Tidak ada data order ditemukan.
      </p>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <motion.h1
        className="text-4xl font-extrabold text-center text-gray-800 mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Orderan
      </motion.h1>
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau produk..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border border-gray-300 rounded-md shadow-sm p-3 w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </motion.div>
      <div className="space-y-8">
        {Object.keys(filteredOrders).map((orderDate) => (
          <motion.div
            key={orderDate}
            className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {orderDate}
            </h2>
            {Object.keys(filteredOrders[orderDate]).map((orderTime) => (
              <div key={orderTime} className="space-y-4">
                <h3 className="text-lg font-medium text-gray-600">
                  {orderTime}
                </h3>
                <ul className="space-y-6">
                  {filteredOrders[orderDate][orderTime].map((order) => (
                    <motion.li
                      key={order.order_id}
                      className="bg-gray-50 border rounded-lg p-4 shadow-sm hover:shadow-md transition flex flex-col gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="text-gray-800">
                            <strong>Nama:</strong> {order.user_name}
                          </p>
                          <p className="text-gray-800">
                            <strong>Alamat:</strong> {order.user_address}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <label
                            htmlFor={`status-${order.order_id}`}
                            className="text-sm text-gray-600"
                          >
                            <strong>Status:</strong>
                          </label>
                          <select
                            id={`status-${order.order_id}`}
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.order_id,
                                e.target.value,
                                orderDate,
                                orderTime
                              )
                            }
                            className="border rounded-md px-3 py-1.5 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Canceled">Canceled</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <ul className="divide-y divide-gray-200">
                        {order.items.map((item, index) => (
                          <li
                            key={index}
                            className="py-2 flex justify-between text-gray-700 text-sm"
                          >
                            <span>
                              {item.product_name} x{item.quantity}
                            </span>
                            <span className="font-semibold">
                              Rp{item.price.toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-gray-800 font-semibold mt-4 text-right">
                        <strong>Total:</strong> Rp
                        {order.totalPrice.toLocaleString()}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Orderan;
