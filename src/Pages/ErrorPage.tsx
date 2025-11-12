import { Link } from "react-router";
import { motion } from "framer-motion";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 text-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Big 404 */}
        <h1 className="text-9xl font-extrabold drop-shadow-lg">404</h1>
        <p className="mt-4 text-2xl font-semibold">Oops! Page not found</p>
        <p className="mt-2 text-gray-200 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Go Home Button */}
        <Link
          to="/"
          className="mt-6 inline-block px-8 py-3 bg-white text-green-700 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
        >
          Go Home
        </Link>

        {/* Decorative wave */}
        <div className="mt-10">
          <svg
            className="w-40 h-40 mx-auto opacity-80"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
