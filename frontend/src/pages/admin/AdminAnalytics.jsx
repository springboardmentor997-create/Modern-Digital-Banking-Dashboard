import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ArrowUpRight,
  Gift,
} from "lucide-react";
import api from "@/services/api";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    totalUsers: 0,
    kycApproved: 0,
    kycPending: 0,
    kycRejected: 0,
    totalTransactions: 0,
    rewardsIssued: 0,
  });

  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);

      // 🔹 summary analytics
      const summaryRes = await api.get("/admin/analytics/summary");
      setSummary(summaryRes.data);

      // 🔹 top users analytics
      const topUsersRes = await api.get("/admin/analytics/top-users");
      setTopUsers(topUsersRes.data || []);
    } catch (err) {
      console.error("Failed to load admin analytics", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Admin Analytics
        </h1>
        <p className="text-sm text-gray-500">
          System-wide insights and compliance overview
        </p>
      </div>

      {loading && (
        <div className="py-10 text-center text-gray-500">
          Loading analytics…
        </div>
      )}

      {!loading && (
          <>
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnalyticsCard
            title="Total Users"
            value={summary.totalUsers}
            icon={<Users className="text-blue-600" />}
          />
          <AnalyticsCard
            title="KYC Approved"
            value={summary.kycApproved}
            icon={<ShieldCheck className="text-green-600" />}
          />
          <AnalyticsCard
            title="KYC Pending"
            value={summary.kycPending}
            icon={<ShieldAlert className="text-yellow-600" />}
          />
          <AnalyticsCard
            title="KYC Rejected"
            value={summary.kycRejected}
            icon={<ShieldX className="text-red-600" />}
          />
          <AnalyticsCard
            title="Total Transactions"
            value={summary.totalTransactions}
            icon={<ArrowUpRight className="text-indigo-600" />}
          />
          <AnalyticsCard
            title="Rewards Issued"
            value={summary.rewardsIssued}
            icon={<Gift className="text-purple-600" />}
          />
        </div>

        {/* ANALYTICS BLOCKS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KYC OVERVIEW */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              KYC Status Overview
            </h3>

            <div className="space-y-3 text-sm">
              <StatusRow
                label="Approved"
                value={summary.kycApproved}
                color="bg-green-500"
              />
              <StatusRow
                label="Pending"
                value={summary.kycPending}
                color="bg-yellow-500"
              />
              <StatusRow
                label="Rejected"
                value={summary.kycRejected}
                color="bg-red-500"
              />
            </div>
          </div>

          {/* TRANSACTION OVERVIEW */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Transaction Overview
            </h3>

            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <span className="font-medium">Total Transactions:</span>{" "}
                {summary.totalTransactions}
              </p>
              <p>
                <span className="font-medium">Average per User:</span>{" "}
                {summary.totalUsers > 0
                  ? Math.round(
                      summary.totalTransactions / summary.totalUsers
                    )
                  : 0}
              </p>
              <p>
                <span className="font-medium">System Status:</span>{" "}
                <span className="text-green-600 font-medium">
                  Normal Operation
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* TOP USERS TABLE */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium text-gray-800">
              Top Users by Activity
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Transactions</th>
                  <th className="px-4 py-3 text-left">Total Amount</th>
                  <th className="px-4 py-3 text-left">KYC Status</th>
                </tr>
              </thead>

              <tbody>
                {!loading && topUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No analytics data available
                    </td>
                  </tr>
                )}

                {topUsers.map((u, i) => (
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.transaction_count}</td>
                    <td className="px-4 py-3">₹{u.total_amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          u.kyc_status === "approved"
                            ? "bg-green-100 text-green-700"
                            : u.kyc_status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {u.kyc_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}
    </div>
  );
};

/* ---------- COMPONENTS ---------- */

const AnalyticsCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
    <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
  </div>
);

const StatusRow = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-gray-700">{label}</span>
    </div>
    <span className="font-medium text-gray-800">{value}</span>
  </div>
);

export default AdminAnalytics;
