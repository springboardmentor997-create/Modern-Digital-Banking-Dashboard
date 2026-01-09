/**
 * Alerts Page
 *
 * What:
 * - Displays system-generated alerts
 * - Includes bill due alerts, warnings, reminders
 *
 * Connected To:
 * - Backend alerts table
 * - bill_reminders task
 *
 * Note:
 * - Read-only for now
 */

import { useEffect, useState } from "react";
import api from "@/services/api";


const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts");
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchAlerts();
      await api.post("/alerts/mark-read");
    }
    load();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>Alerts</h2>

      {loading && <p>Loading alerts...</p>}

      {!loading && alerts.length === 0 && (
        <p style={{ color: "#64748b" }}>No alerts available</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              background: "#ffffff",
              padding: "14px 16px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ margin: 0, fontWeight: 500 }}>
              {alert.message}
            </p>
            <small style={{ color: "#64748b" }}>
              {new Date(alert.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
