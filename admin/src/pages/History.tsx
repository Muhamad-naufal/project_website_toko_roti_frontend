import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Orderan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderData, setOrderData] = useState<any>({});
  const [selectedStatuses] = useState<Set<string>>(new Set());
  const [, setCouriers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setSelectedOrder] = useState<any>(null);

  const handleOpenModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/kurir");
        if (response.ok) {
          const couriersData = await response.json();
          setCouriers(couriersData);
        } else {
          setError("Gagal mengambil data kurir dari server.");
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
      }
    };

    fetchCouriers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:5000/api/order/all-completed"
        );

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
        History Pemesanan
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

      <div className="space-y-10 p-6 bg-gray-50 min-h-screen">
        {Object.keys(filteredOrders).length > 0 ? (
          Object.keys(filteredOrders).map((orderDate) => (
            <div key={orderDate} className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 border-b pb-2">
                {orderDate}
              </h2>
              {Object.keys(filteredOrders[orderDate]).map((orderTime) => (
                <div key={orderTime} className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-700 border-l-4 border-blue-500 pl-4">
                    {orderTime}
                  </h3>
                  {filteredOrders[orderDate][orderTime].map((order) => (
                    <motion.div
                      key={order.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden transform hover:shadow-lg transition duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {order.user_name}
                          </h4>
                          <span className="text-xl font-bold text-blue-600">
                            Rp{order.totalPrice.toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg">
                          <h4 className="text-md font-semibold text-gray-800 mb-3">
                            Detail Produk
                          </h4>
                          <ul className="divide-y divide-gray-300">
                            {order.items.map((item: any, index: number) => (
                              <li
                                key={index}
                                className="flex justify-between items-center py-2"
                              >
                                <span className="w-1/3 truncate">
                                  {item.product_name}
                                </span>
                                <span className="w-1/3 text-center">
                                  x{item.quantity}
                                </span>
                                <span className="w-1/3 text-right font-medium">
                                  Rp
                                  {(item.price * item.quantity).toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <h4 className="text-md font-medium text-gray-800">
                            Status:
                          </h4>
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <button
                            onClick={() => handleOpenModal(order.order_id)}
                            className="text-blue-500 hover:text-blue-700 transition duration-300"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="w-6 h-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89-5.26a2 2 0 012.22 0L21 8m-9 4v8m-4-4h8"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-lg text-center py-10">
            Tidak ada data order ditemukan.
          </p>
        )}
        {Object.keys(filteredOrders).length > 0 &&
          Object.keys(filteredOrders).map((orderDate) => (
            <div key={orderDate} className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 border-b pb-2">
                {orderDate}
              </h2>
              {Object.keys(filteredOrders[orderDate]).map((orderTime) => (
                <div key={orderTime} className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-700 border-l-4 border-blue-500 pl-4">
                    {orderTime}
                  </h3>
                  {filteredOrders[orderDate][orderTime].map((order) => (
                    <motion.div
                      key={order.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden transform hover:shadow-lg transition duration-300"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="bg-gray-100 min-h-screen p-8">
                        {isModalOpen && (
                          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
                            <motion.div
                              initial={{ opacity: 0, y: -50 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -50 }}
                              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
                            >
                              <form className="space-y-4">
                                <label className="w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-100 transition">
                                  {order.bukti}
                                </label>
                                <div className="flex justify-end mt-4 space-x-2">
                                  <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition"
                                  >
                                    Tutup
                                  </button>
                                </div>
                              </form>
                            </motion.div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Orderan;
