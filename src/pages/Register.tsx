import { useState } from "react";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    alamat: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Update form data

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate password
  interface ValidatePassword {
    (password: string): boolean;
  }

  const validatePassword: ValidatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle form submission
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(formData.password)) {
      Swal.fire(
        "Gagal",
        "Password harus minimal 8 karakter, mengandung 1 huruf besar, dan angka.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const response: Response = await fetch(
        "http://localhost:5000/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data: { message: string } = await response.json();
        setError(data.message);
        return;
      }

      const data: { userId: string } = await response.json();
      console.log("User ID:", data.userId); // Log the user ID

      Swal.fire("Berhasil", "Anda berhasil Mendaftar!", "success");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      setError("Terjadi kesalahan. Coba lagi.");
      Swal.fire("Gagal", "Terjadi kesalahan. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl flex bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left side: Form */}
        <motion.div
          className="w-full md:w-1/2 p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-semibold text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-lg font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-lg font-semibold text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <div>
              <label
                htmlFor="alamat"
                className="block text-lg font-semibold text-gray-700"
              >
                Alamat
              </label>
              <input
                type="alamat"
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter your Address"
                required
              />
            </div>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md"
              disabled={loading}
            >
              {loading ? "Memuat..." : "Daftar"}
            </Button>
          </form>
        </motion.div>

        {/* Right side: Image */}
        <motion.div
          className="hidden md:block w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://www.mundoboaforma.com.br/wp-content/uploads/2020/10/Pao.jpg')`,
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        ></motion.div>
      </div>
    </div>
  );
};

export default Register;
