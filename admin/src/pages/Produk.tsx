import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaPen, FaTrashAlt, FaPlus } from "react-icons/fa";

const Produk = () => {
  interface Product {
    id: number;
    name: string;
    category: string;
    description: string;
    price: number;
    stock: number;
  }

  const [products, setProducts] = useState<Product[]>([]); // Initializing as an empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Safely calculate totalPages with a null check for products
  const totalPages = products ? Math.ceil(products.length / itemsPerPage) : 0;

  // Fetch data produk
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/products/all");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Pastikan data yang diterima sesuai
        setProducts(data); // Jika data sudah berbentuk array langsung, langsung gunakan data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching product data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Function to delete product
  const deleteProduct = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/delete/${id}`,
        {
          method: "DELETE",
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error || `HTTP error! status: ${response.status}`
        );
      }
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (products || []).slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  console.log(currentItems); // Check if data is correctly sliced

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

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
          <a href="/add-product">
            <FaPlus className="text-xl" />
          </a>
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
            {currentItems.map((product) => (
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
                      <a href={`/edit-product/${product.id}`}>
                        <FaPen />
                      </a>
                    </motion.button>
                    <motion.button
                      className="text-red-600 hover:text-red-700"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => deleteProduct(product.id)}
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

export default Produk;
