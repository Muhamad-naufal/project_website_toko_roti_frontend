import React from "react";
import { motion } from "framer-motion";

const Jumbotron: React.FC = () => {
  return (
    <motion.div
      className="relative bg-cover bg-center h-[80vh] flex items-center justify-center text-center text-white"
      style={{
        backgroundImage:
          'url("https://www.masakapahariini.com/wp-content/uploads/2019/11/jenis-roti-4.jpg")',
      }} // Ganti dengan URL gambar latar belakang Anda
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>{" "}
      {/* Overlay untuk memperjelas teks */}
      <div className="relative z-10">
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-4">
          Selamat Datang di Toko Roti Kami!
        </h1>
        <p className="text-lg sm:text-2xl mb-6">
          Nikmati berbagai roti segar yang menggoda selera setiap hari.
        </p>

        {/* Menggunakan Button dari ShadCN UI */}
        <div className="mt-3">
          <a
            href="#products"
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 text-xl font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300"
          >
            Lihat Produk Kami
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default Jumbotron;
