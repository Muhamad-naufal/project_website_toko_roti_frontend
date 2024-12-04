import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Menggunakan AuthContext

interface PrivateRouteProps {
  redirectTo: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ redirectTo }) => {
  const { token } = useAuth(); // Mengambil token dari AuthContext

  // Periksa apakah token ada
  if (!token) {
    return <Navigate to={redirectTo} replace />; // Arahkan ke halaman login jika belum login
  }

  return <Outlet />; // Render komponen anak jika sudah login
};

export default PrivateRoute;
