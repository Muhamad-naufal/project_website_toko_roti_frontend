import { motion } from "framer-motion";
import { FaUser, FaBox, FaShoppingCart } from "react-icons/fa";
import { useState, useEffect } from "react";

const Dashboard = () => {
  // Fetching data user count
  const [OrderCanceled, setOrderCanceled] = useState(0);
  const [orderCompleted, setOrderCompleted] = useState(0);
  const [orderPending, setOrderPending] = useState(0);

  // Fetching data user count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/total/canceled",
          {
            credentials: "include", // Pastikan cookies dikirim
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrderCanceled(data.count);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };

    fetchData();
  }, []);

  // Fetching data order completed
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/total/completed",
          {
            credentials: "include", // Pastikan cookies dikirim
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrderCompleted(data.count);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };

    fetchData();
  }, []);

  // Fetching pending order Count data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/total/delivered",
          {
            credentials: "include", // Pastikan cookies dikirim
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrderPending(data.count);
      } catch (error) {
        console.error("Error fetching order count:", error);
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
              <h3 className="text-lg font-semibold">Order Canceled</h3>
              <p className="text-2xl">{OrderCanceled}</p>
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
              <h3 className="text-lg font-semibold">Order Completed</h3>
              <p className="text-2xl">{orderCompleted}</p>
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
              <h3 className="text-lg font-semibold">Orders Pending</h3>
              <p className="text-2xl">{orderPending}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
