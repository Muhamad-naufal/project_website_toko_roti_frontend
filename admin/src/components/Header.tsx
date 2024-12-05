import { motion } from "framer-motion";
import React from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          className="text-2xl font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Admin Panel
        </motion.div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Toggle Sidebar Button (Mobile Only) */}
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-blue-500 rounded-lg hover:bg-blue-700 transition duration-300 md:hidden"
          >
            ☰
          </button>

          {/* Logout Button */}
          <button
            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 hidden md:block"
            onClick={() => alert("Logout clicked")}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
