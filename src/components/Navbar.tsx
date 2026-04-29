import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (href: string) => {
    navigate(href);
    setMenuOpen(false);
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <Container>
        <div className="flex items-center justify-between py-2">
          {/* Left: Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNav("/")}
          >
            <MainLogo />
          </div>

          {/* Middle: Links (desktop) */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map(({ label, href, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleNav(href)}
                className={`flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer
                  ${isActive(href)
                    ? "text-pink-500"
                    : "text-black hover:text-pink-500"
                  }
                `}
              >
                {Icon ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <CalendarDays className="w-4 h-4" />
                )}
                {label}
                {isActive(href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNav("/admin/login")}
              className="hidden md:block text-black rounded-md text-xs font-medium hover:text-pink-500 transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNav("/book")}
              className="hidden md:block text-white bg-gradient-to-r from-pink-400 to-pink-300 px-4 py-2 rounded-full text-xs font-medium hover:opacity-90 transition cursor-pointer"
            >
              Get Started
            </button>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden p-1 rounded-md hover:bg-gray-100 transition cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-4">
            {navLinks.map(({ label, href, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleNav(href)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors px-1 cursor-pointer
                  ${isActive(href) ? "text-pink-500" : "text-black hover:text-pink-500"}
                `}
              >
                {Icon ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <CalendarDays className="w-4 h-4" />
                )}
                {label}
              </button>
            ))}

            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
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
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Navbar;