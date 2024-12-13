import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Orderan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [orderData, setOrderData] = useState<Order[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  interface Order {
    id: number;
    user_name: string;
    totalPrice: number;
    status: string;
    items: {
      product_name: string;
      quantity: number;
      price: number;
    }[];
  }

  const filteredOrders = orderData.filter(
    (order) =>
      order.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.totalPrice.toString().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/order/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setOrderData((prev) =>
          prev.map((order) =>
            order.id === id ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error("Failed to update status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersResponse, statusResponse] = await Promise.all([
          fetch("http://localhost:5000/api/order"),
          fetch("http://localhost:5000/api/status-options"),
        ]);

        if (ordersResponse.ok && statusResponse.ok) {
          const orders = await ordersResponse.json();
          const statuses = await statusResponse.json();

          const formattedOrders = orders.map((order: any) => ({
            id: order.id,
            user_name: order.user_name,
            totalPrice:
              order.items?.reduce(
                (total: number, item: any) =>
                  total + item.quantity * parseFloat(item.price),
                0
              ) || 0,
            status: order.status,
            items: Array.isArray(order.items)
              ? order.items.map((item: any) => ({
                  product_name: item.product_name,
                  quantity: item.quantity,
                  price: parseFloat(item.price),
                }))
              : [],
          }));

          setOrderData(formattedOrders);
          setStatusOptions(statuses);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

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

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari order..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
        />
      </div>

      <motion.div
        className="overflow-x-auto bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">ID Order</th>
              <th className="p-4 text-left">Nama User</th>
              <th className="p-4 text-left">Total Harga</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((order: Order) => (
                <motion.tr
                  key={order.id}
                  className="border-b hover:bg-gray-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <td className="p-4">{order.id}</td>
                  <td className="p-4">{order.user_name}</td>
                  <td className="p-4">Rp{order.totalPrice}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  Tidak ada data order ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            } hover:bg-blue-700 transition`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Orderan;
