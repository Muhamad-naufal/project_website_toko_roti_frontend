import { motion } from "framer-motion";
import React from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
import { FaLongArrowAltRight } from "react-icons/fa";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Hapus cookie user_id
        Cookies.remove("kurir_id");
        // Redirect ke halaman login
        window.location.href = "/login";
        Swal.fire(
          "Logged out!",
          "You have been logged out successfully.",
          "success"
        );
      }
    });
  };

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
          Kurir Panel
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
            onClick={handleLogout}
          >
            <FaLongArrowAltRight />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
