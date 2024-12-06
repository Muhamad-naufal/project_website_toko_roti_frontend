import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Produk from "./pages/Produk";
import Orderan from "./pages/Orderan";
import Login from "./pages/Login";
import AddProduct from "./pages/AddProduct";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <AppWithSidebarHeader
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
    </Router>
  );
}

// This component contains the logic for conditional Sidebar/Header rendering
function AppWithSidebarHeader({
  isSidebarOpen,
  toggleSidebar,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  const location = useLocation(); // Now inside Router context

  return (
    <div className="flex h-full w-full">
      {/* Conditionally render Sidebar and Header based on the current route */}
      {location.pathname !== "/login" && (
        <>
          {/* Sidebar (Desktop and Mobile) */}
          <div className="hidden md:block h-full">
            <Sidebar isSidebarOpen={isSidebarOpen} />
          </div>
          <div className="block md:hidden h-full">
            {isSidebarOpen && <Sidebar isSidebarOpen={isSidebarOpen} />}
          </div>

          {/* Header */}
          <div className="flex-1 flex flex-col">
            <Header onToggleSidebar={toggleSidebar} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/produk" element={<Produk />} />
              <Route path="/orderan" element={<Orderan />} />
              <Route path="/add-product" element={<AddProduct />} />
            </Routes>
          </div>
        </>
      )}
      {location.pathname === "/login" && (
        <div className="w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      )}
    </div>
  );
}
