import { motion } from "framer-motion";
import { FaUser, FaBox, FaShoppingCart } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useState, useEffect } from "react";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Function to format numbers to IDR
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

const Dashboard = () => {
  // Dummy data for the chart
  const [userCount, setUserCount] = useState(1200);
  const [productCount, setProductCount] = useState(450);
  const [orderCount, setOrderCount] = useState(800);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setUserCount(1350); // Simulating fetching data
      setProductCount(500); // Simulating fetching data
      setOrderCount(950); // Simulating fetching data
    }, 1500);
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
          Total Sales
        </h3>
        <p className="text-2xl font-bold">{formatCurrency(3500000)}</p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
