import {
  AlertTriangle,
  Dog,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

export default function ShelterLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) navigate("/admin/login");
    if (user?.role !== "shelter") navigate("/");
  }, [user, navigate]);

  return (
    <div className="flex flex-1 bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-white shadow-md p-6 fixed h-[calc(100vh-83px)] z-10 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-orange-600 mb-8">
            Shelter Admin
          </h2>
          <nav className="space-y-4">
            <NavButton
              to="/admin/overview"
              icon={LayoutDashboard}
              label="Overview"
            />
            <NavButton to="/admin/manage-pets" icon={Dog} label="Manage Pets" />
            <NavButton to="/admin/requests" icon={FileText} label="Requests" />
            <NavButton
              to="/admin/stray-reports"
              icon={AlertTriangle}
              label="Stray Reports"
            />
            <NavButton to="/admin/settings" icon={Settings} label="Settings" />
          </nav>
        </div>
        <div>
          <button
            className="sidebar-nav-button text-red-500 bg-red-100 hover:bg-red-200"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {children}
    </div>
  );
}

// HELPERS
function NavButton({ icon: Icon, label, to }) {
  return (
    <NavLink to={to} className="sidebar-nav-button">
      <Icon size={20} /> {label}
    </NavLink>
  );
}
