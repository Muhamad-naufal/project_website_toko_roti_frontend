import { motion } from "framer-motion";
import { FaPen, FaTrashAlt, FaPlus } from "react-icons/fa";

const Produk = () => {
  const products = [
    {
      id: 1,
      name: "Produk A",
      category: "Kategori 1",
      description: "Deskripsi produk A yang sangat menarik dan panjang",
      price: 50000,
      stock: 30,
    },
    {
      id: 2,
      name: "Produk B",
      category: "Kategori 2",
      description: "Deskripsi produk B yang hanya sedikit lebih panjang",
      price: 75000,
      stock: 15,
    },
    {
      id: 3,
      name: "Produk C",
      category: "Kategori 3",
      description: "Deskripsi produk C yang sangat menarik dan panjang",
      price: 90000,
      stock: 5,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <motion.div
        className="flex justify-between items-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">Produk</h1>
        <motion.button
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaPlus className="text-xl" />
        </motion.button>
      </motion.div>

      <motion.div
        className="overflow-x-auto bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Nama Produk</th>
              <th className="p-4 text-left">Kategori</th>
              <th className="p-4 text-left">Deskripsi</th>
              <th className="p-4 text-left">Harga</th>
              <th className="p-4 text-left">Stok</th>
              <th className="p-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <motion.tr
                key={product.id}
                className="border-b hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">
                  {product.description.length > 50
                    ? product.description.substring(0, 50) + "..."
                    : product.description}
                </td>
                <td className="p-4">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(product.price)}
                </td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <motion.button
                      className="text-yellow-600 hover:text-yellow-700"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaPen />
                    </motion.button>
                    <motion.button
                      className="text-red-600 hover:text-red-700"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FaTrashAlt />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default Produk;
