import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gray-800 text-white relative">
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-between p-4">
        <div className="space-x-6">
          <a href="/" className="hover:text-gray-400">
            Home
          </a>
          <a href="/about" className="hover:text-gray-400">
            About
          </a>
          <Button variant="destructive" className="hover:bg-gray-700">
            <a href="/login">Login</a>
          </Button>
          <Button variant="secondary" className="hover:bg-gray-700">
            <a href="/register">Register</a>
          </Button>
          <Button variant="default" className="hover:bg-gray-700">
            <a href="/cart">
              <i className="fas fa-shopping-cart"></i>
            </a>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden p-4 flex justify-between">
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
          <Button variant="destructive" className="hover:bg-gray-700">
            <a href="/login">Login</a>
          </Button>
          <Button variant="secondary" className="hover:bg-gray-700">
            <a href="/register">Register</a>
          </Button>
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
