
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import AppRoutes from "../routes/AppRoutes";

const MainLayout = () => {
  const location = useLocation();

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <AppRoutes />
    </>
  );
};

export default MainLayout;

