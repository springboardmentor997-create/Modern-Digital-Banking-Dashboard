import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 1. Import Contexts
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext"; // <--- ADD THIS LINE

// 2. Import Components
import ProtectedRouter from "./components/ProtectedRouter";

// 3. Import All Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import AccountDetails from "./pages/AccountDetails";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Bills from "./pages/Bills";
import Rewards from "./pages/Rewards";
import Alerts from "./pages/Alerts";
import Profile from "./pages/Profile";

function App() {
  return (
    // WRAP EVERYTHING in AuthProvider
    <AuthProvider>
      {/* WRAP ROUTER IN SIDEBAR PROVIDER */}
      <SidebarProvider> 
        <Router>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* --- Protected Routes --- */}
            <Route element={<ProtectedRouter />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/:id" element={<AccountDetails />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* --- Catch-All --- */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </SidebarProvider> {/* <--- CLOSE IT HERE */}
    </AuthProvider>
  );
}

export default App;