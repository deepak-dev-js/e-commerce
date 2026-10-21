
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <AdminNavbar />

        <main className="p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

