import { useEffect, useState } from "react";
import {
  Users,
  ShieldAlert,
  ArrowUpRight,
  Bell,
} from "lucide-react";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";


const EMPTY_SUMMARY = {
  total_users: 0,
  kyc_pending: 0,
  today_transactions: 0,
  active_alerts: 0,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard/summary");
      setSummary(res.data);
    } catch (e) {
      console.error("Dashboard load error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          System overview and operational status
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={summary.total_users}
          icon={<Users />}
          bg="from-blue-500 to-blue-600"
          iconColor="text-blue-600"
        />

        <StatCard
          title="KYC Pending"
          value={summary.kyc_pending}
          icon={<ShieldAlert />}
          bg="from-amber-500 to-orange-500"
          iconColor="text-orange-500"
        />

        <StatCard
          title="Today Transactions"
          value={summary.today_transactions}
          icon={<ArrowUpRight />}
          bg="from-emerald-500 to-green-600"
          iconColor="text-green-600"
        />

        <StatCard
          title="Active Alerts"
          value={summary.active_alerts}
          icon={<Bell />}
          bg="from-rose-500 to-red-600"
          iconColor="text-red-600"
        />
      </div>

      {/* QUICK ADMIN ACTIONS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard
            title="Review KYC"
            description="Verify pending customer identities"
            icon={<ShieldAlert />}
            bg="bg-amber-100"
            iconColor="text-amber-600"
            onClick={() => navigate("/admin/kyc")}
          />

          <ActionCard
            title="Users"
            description="Manage registered users"
            icon={<Users />}
            bg="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => navigate("/admin/users")}
          />

          <ActionCard
            title="Transactions"
            description="Monitor transaction activity"
            icon={<ArrowUpRight />}
            bg="bg-green-100"
            iconColor="text-green-600"
            onClick={() => navigate("/admin/transactions")}
          />

          <ActionCard
            title="Alerts"
            description="View system alerts & risks"
            icon={<Bell />}
            bg="bg-rose-100"
            iconColor="text-rose-600"
            onClick={() => navigate("/admin/alerts")}
          />
        </div>
      </div>

  {/* SYSTEM HEALTH & STATUS */}
<div className="space-y-5">
  <h2 className="text-lg font-semibold text-gray-800">
    System Health & Status
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <SystemHealthCard
      title="Payment Gateway"
      status="Operational"
      description="All payment rails functioning normally"
      state="success"
    />

    <SystemHealthCard
      title="KYC Service"
      status="Active"
      description="Identity verification service online"
      state="success"
    />

    <SystemHealthCard
      title="Fraud Detection"
      status="Running"
      description="Real-time risk monitoring enabled"
      state="success"
    />

    <SystemHealthCard
      title="Data Synchronization"
      status="Last sync 2 mins ago"
      description="Core banking data synced"
      state="info"
    />
  </div>
</div>


    </div>
  );
};

/* ---------- UI COMPONENTS ---------- */

const StatCard = ({ title, value, icon, bg, iconColor }) => (
  <div
    className={`
      relative overflow-hidden rounded-xl p-5 text-white
      bg-gradient-to-br ${bg}
      shadow-md hover:shadow-xl transition-all
    `}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-3xl font-semibold mt-1">
          {value ?? 0}
        </p>
      </div>

      <div className="p-3 rounded-full bg-white shadow-lg">
        <div className={`text-xl ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

const ActionCard = ({ title, description, icon, bg, iconColor, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-full ${bg}`}>
        <div className={`text-xl ${iconColor}`}>
          {icon}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800">
          {title}
        </h3>
        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  </div>
);



const SystemHealthCard = ({
  title,
  status,
  description,
  state,
}) => {
  const stateStyles = {
    success: {
      border: "border-green-400",
      bg: "bg-green-50",
      badge: "bg-green-600 text-white",
      dot: "bg-green-500",
    },
    info: {
      border: "border-blue-400",
      bg: "bg-blue-50",
      badge: "bg-blue-600 text-white",
      dot: "bg-blue-500",
    },
    warning: {
      border: "border-amber-400",
      bg: "bg-amber-50",
      badge: "bg-amber-600 text-white",
      dot: "bg-amber-500",
    },
    error: {
      border: "border-red-400",
      bg: "bg-red-50",
      badge: "bg-red-600 text-white",
      dot: "bg-red-500",
    },
  };

  const s = stateStyles[state];

  return (
    <div
      className={`
        relative rounded-2xl border-l-4 ${s.border}
        bg-white shadow-md hover:shadow-lg transition-all
        p-6 min-h-[140px]
      `}
    >
      {/* STATUS DOT */}
      <span
        className={`absolute top-6 right-6 h-3 w-3 rounded-full ${s.dot}`}
      />

      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-800">
          {title}
        </h3>

        <p className="text-sm text-gray-600">
          {description}
        </p>

        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${s.badge}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};


export default AdminDashboard;
