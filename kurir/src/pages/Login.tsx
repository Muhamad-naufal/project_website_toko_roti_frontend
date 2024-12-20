import { motion } from "framer-motion";
import { useState } from "react";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      Swal.fire("Error", "Username and password are required", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/kurir/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_name: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan ID user ke dalam cookie
        Cookies.set("kurir_id", data.user_id, { expires: 7 }); // Diset selama 7 hari
        Swal.fire({
          title: "Success",
          text: "Login successful!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = "/"; // Redirect ke halaman utama
        });
      } else {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire("Error", "Server error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Kurir Login
        </h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <motion.button
            type="submit"
            className={`w-full bg-blue-600 text-white py-3 rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            whileHover={!loading ? { scale: 1.05 } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
