import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const linkClass = (path) =>
    `px-4 py-1.5 rounded-full text-base font-medium tracking-wide transition-all duration-300 ease-in-out transform
     ${
       location.pathname === path
         ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105"
         : "text-gray-700 hover:text-blue-600 hover:scale-105"
     }`;

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 
                 bg-white/60 backdrop-blur-md border-b border-gray-200 
                 shadow-md px-10 py-4 flex items-center justify-between 
                 font-[Poppins]"
    >
      {/* Logo */}
      <Link
        to="/"
        className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text tracking-tight transition-all duration-300 hover:opacity-90"
      >
        OpenTalks
      </Link>

      {/* Navigation Links */}
      <ul className="flex gap-6 text-[16px] items-center font-semibold">
        {isLoggedIn ? (
          <>
            <li>
              <Link to="/chat" className={linkClass("/chat")}>
                Chat Room
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 hover:scale-105 transition-all duration-300"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={linkClass("/login")}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className={linkClass("/register")}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
