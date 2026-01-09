import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  Bell,
  BarChart3,
  Settings,
  Gift,
  AlertTriangle,
  Activity,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo.png";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const sidebarItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/kyc", icon: ShieldCheck, label: "KYC Approval" },
    { path: "/admin/transactions", icon: FileText, label: "Transactions" },
    { path: "/admin/rewards", icon: Gift, label: "Rewards" },
    { path: "/admin/analytics", icon: Activity, label: "Analytics" },
    { path: "/admin/alerts", icon: AlertTriangle, label: "Alerts & Logs" },
    { path: "/admin/settings", icon: Settings, label: "Admin Settings" },
  ];


  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#eaf1f8" }}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Admin Logo" className="sidebar-logo-img" />
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            >
              <item.icon size={20} />
              <span className="sidebar-text">{item.label}</span>
            </Link>
          ))}
        </nav>

      <div
        onClick={handleLogout}
        className="sidebar-item"
        style={{ marginTop: "auto" }}
      >
        <LogOut size={20} />
        <span className="sidebar-text">Logout</span>
      </div>
      </aside>


      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
       

        <main className="dashboard-main" style={{ padding: 40 }}>
          <Outlet />
        </main>
      </div>

      {/* 🔥 SAME SIDEBAR STYLE AS USER */}
      <style>{`
        .sidebar {
          width: 72px;
          background: linear-gradient(
            180deg,
            #edf3fa 0%,
            #eaf1f8 50%,
            #e7eef6 100%
          );
          display: flex;
          flex-direction: column;
          padding: 20px 12px;
          transition: width 0.25s ease, background 0.25s ease;
          overflow: hidden;
          position: fixed;
          height: 100vh;
          top: 0;
          left: 0;
          z-index: 20;
        }

        .sidebar:hover {
          width: 220px;
          background: linear-gradient(
            135deg,
            #020617 0%,
            #020d1f 35%,
            #081a2e 65%,
            rgba(2,6,23,0.9) 100%
          );
          box-shadow: 6px 0 24px rgba(2,6,23,0.45);
        }

        .sidebar-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 56px;
          height: 48px;
        }

        .sidebar-logo-img {
          height: 36px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          border-radius: 10px;
          text-decoration: none;
          color: #334155;
          transition: background 0.2s ease, color 0.2s ease;
          white-space: nowrap;
        }

        .sidebar-item:hover {
          background: rgba(255,255,255,0.08);
        }

        .sidebar-item.active {
          background: rgba(255,255,255,0.18);
        }

        .sidebar-item svg {
          min-width: 20px;
          color: #334155;
          transition: color 0.2s ease;
        }

        .sidebar:hover .sidebar-item {
          color: #cbd5f5;
        }

        .sidebar:hover .sidebar-item svg {
          color: #ffffff;
        }

        .sidebar-text {
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .sidebar:hover .sidebar-text {
          opacity: 1;
          transform: translateX(0);
        }

        .dashboard-main {
          margin-left: 72px;
          transition: margin-left 0.25s ease;
        }

        .sidebar:hover ~ div .dashboard-main {
          margin-left: 220px;
        }

        .logout-item {
          color: #334155;
        }

        .sidebar:hover .logout-item {
          color: #cbd5f5;
        }

        .logout-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

      `}</style>
    </div>
  );
};

export default AdminLayout;


