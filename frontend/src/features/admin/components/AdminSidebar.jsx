import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin",
  },
  {
    name: "Add Product",
    path: "/admin/products/add",
  },
  {
    name: "Products",
    path: "/admin/products",
  },
  {
    name: "Orders",
    path: "/admin/orders",
  },
  {
    name: "Customers",
    path: "/admin/customers",
  },
];

const AdminSidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white p-5">
      <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `rounded-lg px-4 py-3 transition ${
                isActive
                  ? "bg-white text-gray-900 font-semibold"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;