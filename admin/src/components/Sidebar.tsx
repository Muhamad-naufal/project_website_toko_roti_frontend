import { motion } from "framer-motion";
import React from "react";
import { FaHome, FaBox, FaShoppingCart } from "react-icons/fa";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, link: "/dashboard" },
    { name: "Produk", icon: <FaBox />, link: "/produk" },
    { name: "Orderan", icon: <FaShoppingCart />, link: "/orderan" },
    { name: "Kategori", icon: <FaBox />, link: "/category" },
  ];

  return (
    <motion.div
      className={`bg-gradient-to-b from-blue-800 h-screen to-indigo-900 text-white shadow-lg flex flex-col ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      initial={{ width: 0 }}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
      transition={{ duration: 0.4 }}
      style={{ flex: 1 }} // Sidebar mengikuti tinggi kontainer induk
    >
      {/* Logo Section */}
      <div className="flex items-center justify-center py-6">
        <h1
          className={`text-xl font-bold transition-all duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          Admin Panel
        </h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1">
        {menuItems.map((item, index) => (
          <motion.a
            key={index}
            href={item.link}
            className="flex items-center gap-4 px-4 py-3 text-lg font-medium hover:bg-blue-700 hover:shadow-lg rounded-lg mx-2 transition duration-300"
            whileHover={{ scale: 1.05 }}
          >
            {/* Icon */}
            <span className="text-2xl">{item.icon}</span>
            {/* Text */}
            <span
              className={`transition-opacity duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              {item.name}
            </span>
          </motion.a>
        ))}
      </nav>

      {/* Footer (Optional) */}
      <div className="text-center py-4 text-sm opacity-75">
        {isSidebarOpen && <span>© 2024 Toko Roti</span>}
      </div>
    </motion.div>
  );
};

export default Sidebar;
