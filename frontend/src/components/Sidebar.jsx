import React from "react";
import {
  Home,
  CreditCard,
  RefreshCcw,
  PieChart,
  ReceiptIndianRupee,
  Gift,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar({
  activePage,
  setActivePage,
  sidebarOpen,
  setSidebarOpen,
  userProfile,
  onLogout,
  loading,
}) {
  const MenuItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`
        flex items-center justify-center lg:justify-start gap-3
        px-3 py-2 rounded-lg transition-all
        ${
          activePage === page
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden lg:inline text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed z-40 shadow-lg transition-all duration-300
          
          /* MOBILE (TOP BAR) */
          top-0 left-0 w-full h-14 border-b

          /* DESKTOP (SIDE BAR) */
          lg:static lg:h-screen lg:border-b-0 lg:border-r
          ${sidebarOpen ? "lg:w-64" : "lg:w-20"}
        `}
      >
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-600">Tivra</h1>

          {/* Desktop toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 rounded hover:bg-gray-100"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Menu */}
        <nav
          className="
            flex items-center gap-2 px-2 h-14 overflow-x-auto
            lg:flex-col lg:h-auto lg:px-3 lg:space-y-2
          "
        >
          <MenuItem icon={Home} label="Home" page="Home" />
          <MenuItem icon={CreditCard} label="Accounts" page="accounts" />
          <MenuItem icon={RefreshCcw} label="Transactions" page="transactions" />
          <MenuItem icon={PieChart} label="Budget" page="budget" />
          <MenuItem icon={ReceiptIndianRupee} label="Bills" page="bills" />
          <MenuItem icon={Gift} label="Rewards" page="rewards" />
          <MenuItem icon={Settings} label="Settings" page="settings" />
        </nav>

        {/* Bottom profile (Desktop only) */}
        <div className="hidden lg:block absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>

            {sidebarOpen && (
              <div>
                <div className="font-medium text-sm">
                  {userProfile?.name || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {userProfile?.email || "user@email.com"}
                </div>
              </div>
            )}
          </div>

          {sidebarOpen && (
            <button
              onClick={onLogout}
              disabled={loading}
              className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              {loading ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
