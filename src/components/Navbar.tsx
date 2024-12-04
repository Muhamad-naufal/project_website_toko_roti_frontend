import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import Cookies from "js-cookie"; // Menggunakan js-cookie untuk mengakses cookies
import Swal from "sweetalert2"; // Menggunakan SweetAlert2

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Cek apakah user_id ada di cookies
    const userIdFromCookies = Cookies.get("user_id");
    setUserId(userIdFromCookies || null);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Kamu yakin ingin logout?",
      text: "Kamu akan diarahkan ke halaman login",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Iya, logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        // Hapus user_id dari cookies
        Cookies.remove("user_id");
        setUserId(null);
        // Redirect ke halaman login
        window.location.href = "/login";
      }
    });
  };

  return (
    <header className="bg-gray-800 text-white relative">
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-between items-center p-4 space-x-6">
        <a href="/" className="hover:text-gray-400">
          Home
        </a>
        <a href="/about" className="hover:text-gray-400">
          About
        </a>

        {userId ? (
          // Jika user_id ada, tampilkan ikon logout
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 hover:text-gray-400"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        ) : (
          <>
            <Button variant="destructive" className="hover:bg-gray-700">
              <a href="/login">Login</a>
            </Button>
            <Button variant="secondary" className="hover:bg-gray-700">
              <a href="/register">Register</a>
            </Button>
          </>
        )}

        <Button variant="default" className="hover:bg-gray-700">
          <a href="/cart">
            <i className="fas fa-shopping-cart"></i>
          </a>
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden p-4 flex justify-between items-center">
        <button
          onClick={toggleMobileMenu}
          className="text-2xl focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? "X" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isMobileMenuOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300 }}
        className="md:hidden fixed z-50 top-0 left-0 w-1/2 h-full bg-gray-800 text-white p-4 shadow-lg"
      >
        <button
          onClick={toggleMobileMenu}
          className="text-xl focus:outline-none mb-4"
          aria-label="Close Menu"
        >
          ✖
        </button>
        <div className="flex flex-col space-y-6">
          <a href="/" className="hover:text-gray-400">
            Home
          </a>
          <a href="/about" className="hover:text-gray-400">
            About
          </a>

          {userId ? (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 hover:text-gray-400"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          ) : (
            <>
              <Button variant="destructive" className="hover:bg-gray-700">
                <a href="/login">Login</a>
              </Button>
              <Button variant="secondary" className="hover:bg-gray-700">
                <a href="/register">Register</a>
              </Button>
            </>
          )}

          <Button variant="default" className="hover:bg-gray-700">
            <a href="/cart">
              <i className="fas fa-shopping-cart"></i>
            </a>
          </Button>
        </div>
      </motion.div>
    </header>
  );
};

export default Navbar;
