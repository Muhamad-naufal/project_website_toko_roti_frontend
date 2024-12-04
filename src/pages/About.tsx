import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
      <motion.div
        className="container max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Left Section - Text */}
        <motion.div
          className="flex-1 space-y-4"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-4xl font-bold text-gray-800">About Us</h1>
          <p className="text-xl text-gray-600">
            We are a team of passionate individuals dedicated to bringing you
            the best digital experiences. With years of experience in the
            industry, we specialize in creating innovative websites and
            solutions to help businesses thrive in the digital world.
          </p>
          <p className="text-lg text-gray-500">
            Our goal is to craft beautiful, functional, and user-friendly
            websites that elevate your brand and engage your audience. Whether
            you're a startup or an established business, we have the expertise
            to help you succeed online.
          </p>
        </motion.div>

        {/* Right Section - Image */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <img
            src="https://via.placeholder.com/400x300"
            alt="About Us"
            className="rounded-lg shadow-lg w-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;
