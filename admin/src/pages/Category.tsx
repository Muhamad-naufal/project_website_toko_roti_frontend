import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaPen, FaTrashAlt, FaPlus } from "react-icons/fa";

const CategoryList = () => {
  interface Category {
    id: number;
    nama_category: string;
  }

  const [category, setCategory] = useState<Category[]>([]); // Initializing as an empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter products based on search query
  const filteredProducts = category.filter((category) =>
    category.nama_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Safely calculate totalPages with a null check for products
  const totalPages = category
    ? Math.ceil(filteredProducts.length / itemsPerPage)
    : 0;

  // Fetch data produk
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Pastikan data yang diterima sesuai
        setCategory(data); // Jika data sudah berbentuk array langsung, langsung gunakan data
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching category data:", err);
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
        `http://localhost:5000/api/categories/delete/${id}`,
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
      setCategory((prevCategory) =>
        prevCategory.filter((category) => category.id !== id)
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
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

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
        <h1 className="text-2xl font-bold text-gray-800">Category</h1>
        <motion.button
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <a href="/add-category">
            <FaPlus className="text-xl" />
          </a>
        </motion.button>
      </motion.div>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari category..."
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
              <th className="p-4 text-left">Nama Category</th>
              <th className="p-4 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((category) => (
              <motion.tr
                key={category.id}
                className="border-b hover:bg-gray-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <td className="p-4">{category.nama_category}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <motion.button
                      className="text-yellow-600 hover:text-yellow-700"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <a href={`/edit-category/${category.id}`}>
                        <FaPen />
                      </a>
                    </motion.button>
                    <motion.button
                      className="text-red-600 hover:text-red-700"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => deleteProduct(category.id)}
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

      {/* Pagination */}
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

export default CategoryList;
