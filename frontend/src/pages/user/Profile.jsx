/**
 * User profile page
 *
 * Route: /dashboard/profile
 * Purpose:
 * Shows user overview, security status and preferences
 */

import { useState, useEffect } from "react";
import api from "@/services/api";

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user.name || "User");
  const [email, setEmail] = useState(user.email || "user@example.com");
  const [phone, setPhone] = useState(user.phone || "9876543210");

  const role = user.is_admin ? "Admin" : "Standard User";


  useEffect(() => {
    const syncUser = async () => {
      try {
        const res = await api.get("/user/me");
        localStorage.setItem("user", JSON.stringify(res.data));
        setUser(res.data);
      } catch (err) {
        console.error("Failed to sync user", err);
      }
    };

    syncUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    setUsername(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
  }, [user]);


  const kycMap = {
    unverified: "pending",
    verified: "approved",
    rejected: "rejected",
  };

  const kyc_status = kycMap[user.kyc_status] || "pending";

  const kycConfig = {
    approved: { text: "Approved", color: "#16a34a", tick: true },
    pending: { text: "Pending", color: "#facc15" },
    rejected: { text: "Rejected", color: "#ef4444" },
  };

  const lastLogin = user.last_login
    ? new Date(user.last_login).toLocaleString()
    : "—";

  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: username,
      email,
      phone,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditing(false);
    alert("Profile updated successfully");
  };

  return (
    <div style={page}>
      {/* PAGE HEADER */}
      <div style={pageHeader}>
        <h1 style={title}>Profile</h1>
        <p style={subtitle}>Your account overview and preferences</p>
      </div>

      {/* CENTERED PROFILE CARD */}
      <div style={cardWrap}>
        <div style={card}>
          {/* TOP HEADER */}
          <div style={headerStrip}>
            <div style={avatar}>
              {username.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 style={{ marginBottom: 4 }}>{username}</h2>
              <p style={mutedText}>
                {role} • <span style={{ color: "#16a34a" }}>Active</span>
              </p>
            </div>
          </div>

          {/* SECTIONS */}
          <div style={grid}>
            {/* PERSONAL INFO */}
            <Section title="Personal Information">
              <EditableField
                label="Username"
                value={username}
                editing={editing}
                onChange={setUsername}
              />
              <EditableField
                label="Email"
                value={email}
                editing={editing}
                onChange={setEmail}
              />
              <EditableField
                label="Phone Number"
                value={phone}
                editing={editing}
                onChange={setPhone}
              />
            </Section>

            {/* SECURITY */}
            <Section title="Security">
              <StaticField
                label="Account Status"
                value="Active"
                color="#16a34a"
              />

              <StaticField
                label="KYC Status"
                value={kycConfig[kyc_status].text}
                color={kycConfig[kyc_status].color}
                tick={kycConfig[kyc_status].tick}
              />

              <StaticField label="Last Login" value={lastLogin} />

              </Section>
              
              

            {/* PREFERENCES */}
            <Section title="Preferences">
              <StaticField label="Language" value="English" />
              <StaticField label="Notifications" value="Enabled" />
            </Section>
          </div>

          {/* ACTIONS */}
          <div style={actions}>
            {!editing ? (
              <button style={primaryBtn} onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button style={primaryBtn} onClick={handleSave}>
                  💾 Save Changes
                </button>
                <button
                  style={secondaryBtn}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

/* ================= SUB COMPONENTS ================= */

const Section = ({ title, children }) => (
  <div style={section}>
    <h3 style={sectionTitle}>{title}</h3>
    <div style={sectionGrid}>{children}</div>
  </div>
);

const EditableField = ({ label, value, editing, onChange }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {editing ? (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      />
    ) : (
      <div style={valueStyle}>{value}</div>
    )}
  </div>
);

const StaticField = ({ label, value, color, tick }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div
      style={{
        ...valueStyle,
        color: color || "#0f172a",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {value}
      {tick && <span style={{ fontSize: 16, color: "#16a34a" }}>✔</span>}
    </div>
  </div>
);

/* ================= STYLES ================= */

const page = { padding: "28px 32px" };
const pageHeader = { marginBottom: 24 };

const title = {
  fontSize: 26,
  fontWeight: 700,
  color: "#0f172a",
};

const subtitle = { color: "#64748b" };

const cardWrap = {
  display: "flex",
  justifyContent: "center",
};

const card = {
  width: "100%",
  maxWidth: 900,
  background: "#ffffff",
  borderRadius: 22,
  padding: 32,
  boxShadow: "0 20px 45px rgba(0,0,0,0.08)",
};

const headerStrip = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  paddingBottom: 24,
  borderBottom: "1px solid #e5e7eb",
  marginBottom: 28,
};

const avatar = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  background: "#2563eb",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 30,
  fontWeight: 700,
};

const mutedText = {
  color: "#64748b",
  fontSize: 14,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 22,
};

const section = {
  background: "#f1f5f9",
  padding: 20,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
};

const sectionTitle = {
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 16,
  color: "#020617",
};

const sectionGrid = {
  display: "grid",
  gap: 14,
};

const labelStyle = {
  fontSize: 12,
  color: "#64748b",
};

const valueStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#0f172a",
};

const input = {
  width: "100%",
  padding: 11,
  borderRadius: 8,
  border: "1px solid #d1d5db",
};

const actions = {
  marginTop: 28,
  display: "flex",
  justifyContent: "center",
  gap: 12,
};

const primaryBtn = {
  padding: "12px 20px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "12px 20px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
};