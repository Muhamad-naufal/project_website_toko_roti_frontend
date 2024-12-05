import { motion } from "framer-motion";

const Orderan = () => {
  const orders = [
    {
      id: 1,
      user: "John Doe",
      product: "Produk A",
      quantity: 2,
      totalPrice: 100000,
      status: "Pending",
    },
    {
      id: 2,
      user: "Jane Smith",
      product: "Produk B",
      quantity: 1,
      totalPrice: 75000,
      status: "Shipped",
    },
    {
      id: 3,
      user: "Alice Brown",
      product: "Produk C",
      quantity: 3,
      totalPrice: 270000,
      status: "Delivered",
    },
  ];

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
            {orders.map((order) => (
              <motion.tr
                key={order.id}
                className="border-b hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <td className="p-4">{order.user}</td>
                <td className="p-4">{order.product}</td>
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
