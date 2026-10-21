import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAdminDashboard } from "../services/adminService";

const AdminRoute = () => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    const checkAdmin = async () => {
      try {
        const data = await getAdminDashboard();

        if (active) {
          setStatus(data.success ? "allowed" : "denied");
        }
      } catch (error) {
        console.error("Admin authorization error:", error);

        if (active) {
          setStatus("denied");
        }
      }
    };

    checkAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <p className="p-6">Checking admin access...</p>;
  }

  if (status === "denied") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;