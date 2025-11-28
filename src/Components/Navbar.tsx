import { Link, NavLink } from "react-router";
import Container from "./Container";
import { useAuth } from "../Hooks/useAuth";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const role = user?.role;
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/turfs", label: "Turfs" },
    { to: "/gallery", label: "Gallery" },
    { to: "/contact", label: "Contact" },
  ];

  const getDashboardRoute = () => {
    if (role === "admin") return "/dashboard/admin/statistic";
    if (role === "manager") return "/dashboard/manager/statistics";
    return "/dashboard/profile";
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50"
            : "bg-white/95 backdrop-blur-md"
        }`}
      >
        <Container>
          <div className="flex justify-between items-center py-2 mx-2">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link to="/" className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-12 h-12 md:w-18 md:h-18 rounded-xl md:rounded-2xl flex items-center justify-center">
                    <span>
                      <a href="/">
                        <img
                          src="/khelbiNakiLogo.png"
                          className="text-lg md:text-2xl font-black text-white tracking-tight"
                          alt="Logo"
                        />
                      </a>
                    </span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent tracking-tight">
                  Khelbi <span className="text-sm md:text-base text-green-600">নাকি</span>
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group ${
                      isActive
                        ? "text-green-600"
                        : "text-gray-600 hover:text-green-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{link.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-green-50 rounded-xl"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                </NavLink>
              ))}

              {user && (
                <NavLink
                  to={getDashboardRoute()}
                  className={({ isActive }) =>
                    `relative px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 group ${
                      isActive
                        ? "text-green-600"
                        : "text-gray-600 hover:text-green-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10 flex items-center gap-2">
                        <LayoutDashboard size={16} />
                        Dashboard
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute inset-0 bg-green-50 rounded-xl"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                </NavLink>
              )}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100/80 hover:from-gray-100 hover:to-gray-200/80 border border-gray-200/60 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-500/30">
                      {user.name?.charAt(0)?.toUpperCase() || <User size={18} />}
                    </div>
                    <span className="font-semibold text-gray-700 text-sm max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-300 ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-gray-200/60 border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-3 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize mt-0.5">
                              {user.role}
                            </p>
                          </div>
                          <div className="p-2">
                            <Link
                              to="/dashboard/profile"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium text-sm group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                              <span>Profile</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all duration-200 font-medium text-sm group"
                            >
                              <LogOut size={16} className="text-gray-400 group-hover:text-red-600 transition-colors" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <Link to="/auth/login">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-green-600 hover:text-green-600 hover:bg-green-50/50 transition-all duration-300"
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/auth/register">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative px-5 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden group shadow-lg shadow-green-600/30 hover:shadow-green-600/50 transition-shadow duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-700 to-green-600 bg-[length:200%_100%] animate-gradient"></div>
                      <span className="relative z-10">Register</span>
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={22} className="text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={22} className="text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </Container>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl mt-4 mx-4 lg:mb-0 mb-4 p-6 shadow-xl border border-gray-100"
            >
              <div className="flex flex-col space-y-4">
                {/* User Info */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-2 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/30">
                        {user.name?.charAt(0)?.toUpperCase() || <User size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links */}
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <NavLink
                      to={link.to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          isActive
                            ? "text-white bg-gradient-to-r from-green-600 to-green-700 shadow-lg transform scale-105"
                            : "text-gray-700 hover:text-green-600 hover:bg-green-50 hover:transform hover:scale-105"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}

                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <NavLink
                      to={getDashboardRoute()}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                          isActive
                            ? "text-white bg-gradient-to-r from-green-600 to-green-700 shadow-lg transform scale-105"
                            : "text-gray-700 hover:text-green-600 hover:bg-green-50 hover:transform hover:scale-105"
                        }`
                      }
                    >
                      <LayoutDashboard size={18} />
                      {role === "admin" ? "Admin Dashboard" : "Dashboard"}
                    </NavLink>
                  </motion.div>
                )}

                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  {user ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-3"
                    >
                      <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                        <button className="w-full px-6 py-3 border-2 border-green-600 text-green-600 rounded-xl font-medium hover:bg-green-700 hover:text-white transition-all duration-300">
                          Login
                        </button>
                      </Link>
                      <Link to="/auth/register" onClick={() => setIsOpen(false)}>
                        <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group lg:mt-0 mt-2">
                          <span className="relative z-10">Register</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close mobile menu when clicking outside */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      <style>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;