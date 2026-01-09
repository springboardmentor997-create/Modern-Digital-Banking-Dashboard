import { useEffect, useState } from "react";
import {
  Bell,
  ShieldCheck,
  AlertTriangle,
  Search,
} from "lucide-react";
import api from "@/services/api";

const AdminAlerts = () => {
  const [tab, setTab] = useState("alerts");

  /* ALERTS */
  const [alerts, setAlerts] = useState([]);
  const [alertType, setAlertType] = useState("");
  const [alertsLoading, setAlertsLoading] = useState(false);

  /* LOGS */
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState("");
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setAlertsLoading(true);
      const res = await api.get("/admin/alerts", {
        params: { type: alertType || undefined },
      });
      setAlerts(res.data.items || []);
    } catch {
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get("/admin/logs", {
        params: { action: action || undefined },
      });
      setLogs(res.data.items || []);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    tab === "alerts" ? fetchAlerts() : fetchLogs();
    // eslint-disable-next-line
  }, [tab]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Alerts & Logs
        </h1>
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl shadow border p-2 inline-flex gap-2">
        <button
          onClick={() => setTab("alerts")}
          className={`px-6 py-2 rounded-lg text-sm font-medium ${
            tab === "alerts"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Alerts
        </button>

        <button
          onClick={() => setTab("logs")}
          className={`px-6 py-2 rounded-lg text-sm font-medium ${
            tab === "logs"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow border px-6 py-5 flex items-center gap-8">
        {tab === "alerts" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alert Type
              </label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="h-10 w-60 px-4 rounded-lg border border-slate-300 text-sm"
              >
                <option value="">All Alerts</option>
                <option value="low_balance">Low Balance</option>
                <option value="bill_due">Bill Due</option>
                <option value="budget_exceeded">Budget Exceeded</option>
                <option value="suspicious_activity">Suspicious Activity</option>
              </select>
            </div>

            <button
              onClick={fetchAlerts}
              className="ml-auto h-10 px-6 bg-slate-900 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <Search size={16} />
              Apply
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Action Type
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="h-10 w-60 px-4 rounded-lg border border-slate-300 text-sm"
              >
                <option value="">All</option>
                <option value="kyc_approved">KYC Approved</option>
                <option value="kyc_rejected">KYC Rejected</option>
                <option value="reward_updated">Reward Updated</option>
                <option value="account_action">Account Action</option>
              </select>
            </div>

            <button
              onClick={fetchLogs}
              className="ml-auto h-10 px-6 bg-slate-900 text-white rounded-lg flex items-center gap-2 text-sm"
            >
              <Search size={16} />
              Apply
            </button>
          </>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        {tab === "alerts" ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">User</th>
                <th className="px-6 py-4 text-left">Type</th>
                <th className="px-6 py-4 text-left">Message</th>
              </tr>
            </thead>
            <tbody>
              {alertsLoading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500">
                    Loading alerts…
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-14 text-center text-slate-500">
                    <AlertTriangle size={36} className="mx-auto mb-2" />
                    No alerts found
                  </td>
                </tr>
              ) : (
                alerts.map((a, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4">{a.created_at}</td>
                    <td className="px-6 py-4 font-medium">{a.user_name}</td>
                    <td className="px-6 py-4">
                      {a.type.replaceAll("_", " ")}
                    </td>
                    <td className="px-6 py-4">{a.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Date & Time</th>
                <th className="px-6 py-4 text-left">Admin</th>
                <th className="px-6 py-4 text-left">Action</th>
                <th className="px-6 py-4 text-left">Target</th>
                <th className="px-6 py-4 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    Loading logs…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-14 text-center text-slate-500">
                    <ShieldCheck size={36} className="mx-auto mb-2" />
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((l, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-4">{l.timestamp}</td>
                    <td className="px-6 py-4 font-medium">{l.admin_name}</td>
                    <td className="px-6 py-4">
                      {l.action.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      {l.target_type} #{l.target_id}
                    </td>
                    <td className="px-6 py-4">{l.details || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAlerts;
