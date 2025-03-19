import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-6">
          This page seems to have wandered off the narrow path 🛣️
        </p>
        <div className="mb-8 text-gray-700 italic">
          "Enter through the narrow gate. For wide is the gate and broad is the
          road that leads to destruction, and many enter through it." - Matthew
          7:13
        </div>
        <a
          href="/"
          className="text-blue-500 hover:text-blue-700 underline text-lg"
        >
          Let's guide you back to the right path
        </a>
      </div>
    </div>
  );
};

export default NotFound;
