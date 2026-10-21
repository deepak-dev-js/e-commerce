
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import ProductDetails from "../features/products/pages/ProductDetails";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import AdminLayout from "../features/admin/components/AdminLayout";
import AdminRoute from "./AdminRoute";
import AddProduct from "../features/admin/pages/AddProduct";
import Orders from "../features/admin/pages/Orders";
import Customers from "../features/admin/pages/Customers";
import Products from "../features/admin/pages/Products";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/product/:id"
        element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        }
      />


      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />

          <Route
            path="products/add"
            element={<AddProduct />}
          />
          <Route
            path="products"
            element={<Products />}
          />
          <Route
            path="orders"
            element={<Orders />}
          />
          <Route
            path="customers"
            element={<Customers />}
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

