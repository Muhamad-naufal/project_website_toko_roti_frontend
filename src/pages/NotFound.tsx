import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-6xl font-bold text-red-500 mb-4"
          initial={{ x: "-100vw" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          404
        </motion.h1>
        <motion.p
          className="text-xl font-semibold text-gray-700"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Oops! Page not found.
        </motion.p>
        <motion.p
          className="mt-4 text-gray-600"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          The page you're looking for might have been moved or deleted.
        </motion.p>
        <motion.button
          className="mt-6 px-6 py-2 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <a href="/">Go back home</a>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFound;
