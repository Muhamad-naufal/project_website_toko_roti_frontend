import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Produk from "./pages/Produk";
import Orderan from "./pages/Orderan";
import Login from "./pages/Login";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <MainLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </Router>
  );
}

// Main Layout Component
function MainLayout({
  isSidebarOpen,
  toggleSidebar,
}: {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}) {
  const location = useLocation();

  // Check if the current route is "/login"
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="flex h-screen">
      {/* Render Sidebar and Header only if not on the Login page */}
      {!isLoginPage && (
        <>
          {/* Sidebar */}
          <SidebarContainer isSidebarOpen={isSidebarOpen} />

          {/* Main Content with Header */}
          <div className="flex-1 flex flex-col">
            <Header onToggleSidebar={toggleSidebar} />
            <div className="flex-1 overflow-y-auto">
              <RoutesContainer />
            </div>
          </div>
        </>
      )}

      {/* Login Page */}
      {isLoginPage && (
        <div className="w-full">
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

// Sidebar Container Component
function SidebarContainer({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  return (
    <>
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar isSidebarOpen={isSidebarOpen} />
      </div>

      {/* Sidebar for mobile */}
      <div className="block md:hidden">
        {isSidebarOpen && <Sidebar isSidebarOpen={isSidebarOpen} />}
      </div>
    </>
  );
}

// Routes Container Component
function RoutesContainer() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/produk" element={<Produk />} />
      <Route path="/orderan" element={<Orderan />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/edit-product/:id" element={<EditProduct />} />
    </Routes>
  );
}
