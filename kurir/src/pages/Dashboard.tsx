import { motion } from "framer-motion";
import { FaUser, FaBox, FaShoppingCart } from "react-icons/fa";
import { useState, useEffect } from "react";

// Function to format numbers to IDR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

const Dashboard = () => {
  // Dummy data for the chart
  const [orderCount, setOrderCount] = useState(800);

  // Fetching data user count
  const [userCount, setUserCount] = useState(0);

  // Fetching data user count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/user/count"); // endpoint disesuaikan
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUserCount(data.count); // gunakan nama `count` agar konsisten
      } catch (error) {
        console.error("Error fetching user count:", error);
      }
    };

    fetchData();
  }, []);

  // Fetching Product Count data
  const [productCount, setProductCount] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/produk/count");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProductCount(data.count);
      } catch (error) {
        console.error("Error fetching product count:", error);
      }
    };
    fetchData();
  }, []);

  // Fetching Order Count data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/order/count");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrderCount(data.count);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };
    fetchData();
  }, []);

  // Fetching Total Sales data
  const [totalSales, setTotalSales] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sales/count");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Total Sales API Response:", data);
        // Pastikan `totalSales` dikonversi ke angka jika perlu
        setTotalSales(data.total_sales);
      } catch (error) {
        console.error("Error fetching total sales:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <motion.h1
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Dashboard
      </motion.h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* User Count */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white rounded-lg shadow-lg flex items-center justify-between"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <FaUser className="text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Users</h3>
              <p className="text-2xl">{userCount}</p>
            </div>
          </div>
        </motion.div>

        {/* Product Count */}
        <motion.div
          className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white rounded-lg shadow-lg flex items-center justify-between"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <FaBox className="text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Products</h3>
              <p className="text-2xl">{productCount}</p>
            </div>
          </div>
        </motion.div>

        {/* Order Count */}
        <motion.div
          className="bg-gradient-to-r from-orange-600 to-yellow-600 p-6 text-white rounded-lg shadow-lg flex items-center justify-between"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <FaShoppingCart className="text-3xl" />
            <div>
              <h3 className="text-lg font-semibold">Orders</h3>
              <p className="text-2xl">{orderCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Total Sales */}
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Total Omset
        </h3>
        <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
