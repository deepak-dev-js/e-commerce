
import { useState, useEffect, useRef } from "react";
import { assets } from "../assets/assets.js";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X
} from "lucide-react";
import { logoutUser } from "../features/auth/services/authService.js";
import { useCart } from "../context/useCart.js";
import { fetchCart } from "../services/cartService.js";

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const { cartItems, setCartItems } = useCart();

  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      console.log("api call");
      try {
        const data = await fetchCart();
        setCartItems(data.cart.items);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };

    loadCart();
  }, [setCartItems]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const navLinkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 transition-colors ${isActive
      ? "bg-gray-100 font-semibold text-black"
      : "text-gray-600 hover:bg-gray-50 hover:text-black"
    }`;

  return (
    <nav className="flex items-center justify-between px-8 shadow-md">
      <Link to="/" className="text-2xl font-bold">
        <img className="w-16 h-16 md:w-24 md:h-24" src={assets.logo} alt="Logo" />
      </Link>

      {/* Navigation Links */}
      <ul className="hidden md:flex items-center gap-8">
        <li>
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
        </li>

        <li>
          <NavLink to="/collection" className={navLinkClass}>
            Collection
          </NavLink>
        </li>

        <li>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </li>

        <li>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </li>
      </ul>

      {/* Search, Cart and Profile */}
      <div className="flex items-center gap-5">
        <button
          aria-label="Search"
          className="text-xl hover:text-gray-500"
        >
          <Search />
        </button>

        <NavLink
          to="/cart"
          aria-label="Shopping cart"
          className="relative text-xl"
        >
          <ShoppingCart size={22} strokeWidth={1.5} />

          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white">
            {cartItems.length}
          </span>
        </NavLink>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="User menu"
            aria-expanded={isProfileOpen}
            className="text-xl hover:text-gray-500"
          >
            <User />
          </button>


          {isProfileOpen && (
            <div className="absolute right-0 top-8 z-50 w-40 overflow-hidden rounded-md border border-gray-100 bg-white shadow-lg">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/my-profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-3 text-sm hover:bg-gray-100"
                  >
                    My Profile
                  </NavLink>

                  <NavLink
                    to="/my-orders"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-3 text-sm hover:bg-gray-100"
                  >
                    My Orders
                  </NavLink>

                   <NavLink
                    to="/wishlist"
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-3 text-sm hover:bg-gray-100"
                  >
                    Wishlist
                  </NavLink>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="block w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/login");
                    }}
                    className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/register");
                    }}
                    className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}


        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open navigation menu"
          className="md:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Overlay */}
        {isMenuOpen && (
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed right-0 top-0 z-50 h-screen w-72 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b px-5 py-5">
            <span className="text-lg font-semibold">Menu</span>

            <button
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <ul className="flex flex-col gap-1 p-4">
            <li>
              <NavLink
                to="/"
                end
                onClick={() => setIsMenuOpen(false)}
                className={navLinkClass}
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className={navLinkClass}
              >
                About
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={navLinkClass}
              >
                Contact
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className={navLinkClass}
              >
                Register
              </NavLink>
            </li>
          </ul>
        </aside>


      </div>
    </nav>
  );
};

export default Navbar;

