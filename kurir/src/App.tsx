import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Cookies from "js-cookie";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Orderan from "./pages/Orderan";
import Login from "./pages/Login";
import History from "./pages/History";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = Cookies.get("kurir_id");
    setIsAuthenticated(!!userId && !isNaN(Number(userId))); // Validasi angka
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Tampilan loading sementara
  }

  // Redirect to login if not authenticated and not already on the login page
  if (!isAuthenticated && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  const isLoginPage = location.pathname === "/login";

  if (isAuthenticated && isLoginPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen">
      {!isLoginPage && (
        <>
          <SidebarContainer isSidebarOpen={isSidebarOpen} />
          <div className="flex-1 flex flex-col">
            <Header onToggleSidebar={toggleSidebar} />
            <div className="flex-1 overflow-y-auto">
              <RoutesContainer isAuthenticated={isAuthenticated} />
            </div>
          </div>
        </>
      )}
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
      <div className="hidden md:block">
        <Sidebar isSidebarOpen={isSidebarOpen} />
      </div>
      <div className="block md:hidden">
        {isSidebarOpen && <Sidebar isSidebarOpen={isSidebarOpen} />}
      </div>
    </>
  );
}

// Routes Container Component
function RoutesContainer({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/order"
        element={isAuthenticated ? <Orderan /> : <Navigate to="/login" />}
      />
      <Route
        path="/history"
        element={isAuthenticated ? <History /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}
