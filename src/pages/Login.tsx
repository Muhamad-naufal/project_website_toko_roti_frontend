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

  const navigate = useNavigate(); // Pindahkan useNavigate ke sini

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-gray-100 p-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium">
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
    </motion.div>
  );
};

export default Login;
