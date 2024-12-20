import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Orderan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderData, setOrderData] = useState<any>({});
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/order");

        if (response.ok) {
          const orders = await response.json();
          console.log("Fetched orders:", orders);

          if (Array.isArray(orders)) {
            // Sorting orders by `created_at` in descending order (latest first)
            orders.sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );

            const grouped = orders.reduce(
              (acc: Record<string, Record<string, any[]>>, order: any) => {
                const date = new Intl.DateTimeFormat("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }).format(new Date(order.created_at));

                const time = new Intl.DateTimeFormat("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(new Date(order.created_at));

                if (!acc[date]) {
                  acc[date] = {};
                }

                if (!acc[date][time]) {
                  acc[date][time] = [];
                }

                acc[date][time].push(order);
                return acc;
              },
              {}
            );

            setOrderData(grouped);
          } else {
            setError("Data tidak valid: Orders is not an array.");
          }
        } else {
          setError("Gagal mengambil data dari server.");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"; // Yellow background for Pending
      case "Delivered":
        return "bg-green-100 text-green-800"; // Green background for Delivered
      case "Completed":
        return "bg-blue-100 text-blue-800"; // Blue background for Completed
      case "Canceled":
        return "bg-red-100 text-red-800"; // Red background for Canceled
      default:
        return "bg-gray-100 text-gray-800"; // Default background for other statuses
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatuses((prevStatuses) => {
      const updatedStatuses = new Set(prevStatuses);
      if (updatedStatuses.has(status)) {
        updatedStatuses.delete(status);
      } else {
        updatedStatuses.add(status);
      }
      return updatedStatuses;
    });
  };

  const filteredOrders = Object.keys(orderData).reduce((acc, orderDate) => {
    const filteredTimes = Object.keys(orderData[orderDate]).reduce(
      (timeAcc, orderTime) => {
        const filteredOrders = orderData[orderDate][orderTime].filter(
          (order: any) =>
            (order.user_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
              order.items.some((item: any) =>
                item.product_name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              )) &&
            (selectedStatuses.size === 0 || selectedStatuses.has(order.status))
        );

        if (filteredOrders.length > 0) {
          timeAcc[orderTime] = filteredOrders;
        }

        return timeAcc;
      },
      {} as Record<string, any[]>
    );

    if (Object.keys(filteredTimes).length > 0) {
      acc[orderDate] = filteredTimes;
    }

    return acc;
  }, {} as Record<string, Record<string, any[]>>);

  return (
    <div className="p-8 bg-gray-50 space-y-8 rounded-lg shadow-lg">
      <motion.h1
        className="text-3xl font-extrabold text-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Orderan
      </motion.h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari order..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-300 ease-in-out shadow-md"
        />
      </div>

      <div className="mb-6 flex gap-8">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedStatuses.has("Pending")}
            onChange={() => handleStatusChange("Pending")}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          />
          <span className="text-lg font-medium text-gray-800">Pending</span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedStatuses.has("Delivered")}
            onChange={() => handleStatusChange("Delivered")}
            className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500 transition duration-300 ease-in-out"
          />
          <span className="text-lg font-medium text-gray-800">Delivered</span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedStatuses.has("Completed")}
            onChange={() => handleStatusChange("Completed")}
            className="h-5 w-5 text-blue-800 border-gray-300 rounded focus:ring-2 focus:ring-blue-700 transition duration-300 ease-in-out"
          />
          <span className="text-lg font-medium text-gray-800">Completed</span>
        </label>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedStatuses.has("Canceled")}
            onChange={() => handleStatusChange("Canceled")}
            className="h-5 w-5 text-red-600 border-gray-300 rounded focus:ring-2 focus:ring-red-500 transition duration-300 ease-in-out"
          />
          <span className="text-lg font-medium text-gray-800">Canceled</span>
        </label>
      </div>

      <div className="space-y-6">
        {Object.keys(filteredOrders).length > 0 ? (
          Object.keys(filteredOrders).map((orderDate) => (
            <div key={orderDate} className="space-y-8">
              <h2 className="text-2xl font-semibold text-gray-800">
                {orderDate}
              </h2>
              {Object.keys(filteredOrders[orderDate]).map((orderTime) => (
                <div key={orderTime} className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-700">
                    {orderTime}
                  </h3>
                  {filteredOrders[orderDate][orderTime].map((order: any) => (
                    <div
                      key={order.order_id}
                      className={`border-2 rounded-xl overflow-hidden ${getStatusClass(
                        order.status
                      )} shadow-lg transform transition-all hover:scale-105 duration-300 ease-in-out`}
                    >
                      <div className="p-6 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors duration-300 ease-in-out">
                        <h4 className="text-lg font-semibold text-gray-800">
                          {order.user_name}
                        </h4>
                        <span className="text-xl font-bold text-gray-900">
                          Rp{order.totalPrice}
                        </span>

                        <div className="mt-4 p-4 bg-white">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">
                            Detail Produk
                          </h4>
                          <ul className="space-y-3">
                            {order.items.map((item: any, index: number) => (
                              <li
                                key={index}
                                className="flex justify-between items-center text-gray-700"
                              >
                                <span className="w-1/3">
                                  {item.product_name}
                                </span>
                                <span className="w-1/3 text-center">
                                  x{item.quantity}
                                </span>
                                <span className="w-1/3 text-center">
                                  Rp{item.price}
                                </span>
                                <span className="w-1/3 text-right">
                                  Rp
                                  {(item.price * item.quantity).toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-6">
                            <h4 className="text-md font-medium text-gray-800">
                              Status:
                            </h4>
                            <p className="text-lg text-gray-700">
                              {order.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-lg">
            Tidak ada data order ditemukan.
          </p>
        )}
      </div>
    </div>
  );
};

export default Orderan;
