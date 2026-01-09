/**
 * Notifications Page
 *
 * What:
 * - Shows user notifications
 * - Future: push / real-time updates
 *
 * Difference from Alerts:
 * - Alerts = system warnings
 * - Notifications = user-facing info
 */

import { useEffect, useState } from "react";
import api from "@/services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/alerts");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchNotifications();
      await api.post("/alerts/mark-read");
    };
    load();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>
        Notifications
      </h2>

      {loading && <p>Loading notifications...</p>}

      {!loading && notifications.length === 0 && (
        <p style={{ color: "#64748b" }}>No notifications</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {notifications.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#ffffff",
              padding: "14px 16px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ margin: 0 }}>{item.message}</p>
            <small style={{ color: "#64748b" }}>
              {new Date(item.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
