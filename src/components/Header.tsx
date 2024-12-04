import { motion } from "framer-motion";
import Navbar from "./Navbar";

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 text-white p-4"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Toko Roti</h1>

        {/* Navbar */}
        <Navbar />
      </div>
    </motion.header>
  );
}

export default Header;
