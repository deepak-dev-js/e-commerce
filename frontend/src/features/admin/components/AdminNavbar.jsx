import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/admin", end: true },
  { name: "Add Product", path: "/admin/products/add", end: true },
  { name: "Products", path: "/admin/products", end: true },
  { name: "Orders", path: "/admin/orders", end: true },
  { name: "Customers", path: "/admin/customers", end: true },
];

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Admin logout failed:", error);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const renderMenuItems = () =>
    menuItems.map((item) => (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        onClick={closeMenu}
        className={({ isActive }) =>
          `inline-flex w-28 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
            ? "bg-gray-900 text-white"
            : "text-gray-600 hover:bg-gray-100"
          }`
        }
      >
        {item.name}
      </NavLink>
    ));

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <div>
          <h1 className="text-lg font-bold text-gray-800 md:text-xl">
            ApnaShop Admin
          </h1>

          <p className="text-sm text-gray-500">
            Manage your store
          </p>
        </div>

        
      {/* Desktop Navbar */}
      <nav className="hidden flex-wrap items-center gap-2 px-8 pb-4 lg:flex">
        {renderMenuItems()}
      </nav>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 lg:ml-4"
        >
          Logout
        </button>
      </div>


      {/* Mobile Arrow Button */}
      <div className="flex justify-center border-t py-1 lg:hidden">
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="flex w-full items-center justify-end mr-2 text-gray-600 hover:text-gray-900"
        >
          {isMenuOpen ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out lg:hidden ${isMenuOpen
          ? "grid-rows-[1fr]"
          : "grid-rows-[0fr]"
          }`}
      >
        <nav className="overflow-hidden">
          <div className="flex flex-col gap-2 px-4 pb-3 pt-2">
            {renderMenuItems()}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminNavbar;