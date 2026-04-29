//Navbar.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../components/Container";
import MainLogo from "./MainLogo/MainLogo";
import { Trophy, CalendarDays, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Book", href: "/book" },
  { label: "Availability", href: "/availability" },
  { label: "Reservations", href: "/reservations" },
  { label: "Tournaments", icon: Trophy, href: "/tournaments" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNav = (href: string) => {
    navigate(href);
    setMenuOpen(false);
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`w-full border-b border-gray-200 bg-white sticky top-0 z-50 transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <Container>
        <div className="flex items-center justify-between py-2">
          {/* Left: Logo */}
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNav("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MainLogo />
          </motion.div>

          {/* Middle: Links (desktop) */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map(({ label, href, icon: Icon }) => (
              <motion.button
                key={label}
                onClick={() => handleNav(href)}
                className={`relative flex items-center gap-2 text-xs font-medium cursor-pointer
                  ${isActive(href)
                    ? "text-pink-500"
                    : "text-black hover:text-pink-500"
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {Icon ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <CalendarDays className="w-4 h-4" />
                )}
                {label}
                {isActive(href) && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => handleNav("/admin/login")}
              className="hidden md:block text-black rounded-md text-xs font-medium cursor-pointer"
              whileHover={{ scale: 1.05, color: "#ec4899" }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
            <motion.button
              onClick={() => handleNav("/book")}
              className="hidden md:block text-white bg-gradient-to-r from-pink-400 to-pink-300 px-4 py-2 rounded-full text-xs font-medium cursor-pointer"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(236, 72, 153, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>

            {/* Hamburger (mobile) */}
            <motion.button
              className="md:hidden p-1 rounded-md hover:bg-gray-100 transition cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-100 overflow-hidden"
            >
              <div className="py-4 flex flex-col gap-4">
                {navLinks.map(({ label, href, icon: Icon }, index) => (
                  <motion.button
                    key={label}
                    onClick={() => handleNav(href)}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-2 text-sm font-medium px-1 cursor-pointer
                      ${isActive(href) ? "text-pink-500" : "text-black hover:text-pink-500"}
                    `}
                  >
                    {Icon ? (
                      <Icon className="w-4 h-4" />
                    ) : (
                      <CalendarDays className="w-4 h-4" />
                    )}
                    {label}
                  </motion.button>
                ))}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 pt-2 border-t border-gray-100"
                >
                  <button
                    onClick={() => handleNav("/admin/login")}
                    className="text-black text-xs font-medium px-2 py-1.5 cursor-pointer hover:text-pink-500 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav("/book")}
                    className="text-white bg-gradient-to-r from-pink-400 to-pink-300 px-4 py-2 rounded-full text-xs font-medium hover:opacity-90 transition cursor-pointer"
                  >
                    Get Started
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.div>
  );
};

export default Navbar;