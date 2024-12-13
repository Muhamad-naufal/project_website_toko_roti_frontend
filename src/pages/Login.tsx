import { useState } from "react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
// Pastikan kamu sudah menginstal js-cookie

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!validatePassword(password)) {
      Swal.fire(
        "Gagal",
        "Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Jika login berhasil, simpan ID user ke dalam cookie
        Cookies.set("user_id", data.user_id, { expires: 7 }); // Cookie diset selama 7 hari
        console.log("User ID:", data.user_id); // Menampilkan user_id di console
        Swal.fire({
          title: "Berhasil",
          text: "Anda berhasil masuk!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/"); // Redirect ke halaman utama
          // refresh halaman agar navbar menampilkan menu logout
          window.location.reload();
        });
      } else {
        Swal.fire("Gagal", data.message, "error");
      }
    } catch (error) {
      console.error("Error login:", error);
      Swal.fire("Gagal", "Terjadi kesalahan pada server", "error");
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={handleLogin}>
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
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none"
                required
                whileFocus={{ scale: 1.05 }}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md"
              disabled={loading}
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
