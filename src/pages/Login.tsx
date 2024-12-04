"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center justify-center w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Bagian Gambar */}
        <motion.div
          className="hidden md:block md:w-1/2"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="https://www.rumahmesin.com/wp-content/uploads/2017/02/macam-macam-roti-25-jenis-roti-terkenal-yang-ada-di-indonesia-dan-di-dunia-26-1024x640.jpg"
            alt="Login Illustration"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Bagian Form */}
        <motion.div
          className="w-full md:w-1/2 p-6"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
          <form>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium"
              >
                Email
              </label>
              <motion.input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none"
                required
                whileFocus={{ scale: 1.05 }}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium"
              >
                Password
              </label>
              <motion.input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none"
                required
                whileFocus={{ scale: 1.05 }}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md"
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                setLoading(true);
                // Simulate login process
                setTimeout(() => {
                  setLoading(false);
                  Swal.fire("Berhasil", "Anda berhasil masuk!", "success");
                  navigate("/");
                }, 2000);
              }}
            >
              {loading ? "Memuat..." : "Masuk"}
            </Button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
