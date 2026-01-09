/**
 * Rewards Page
 *
 * What:
 * - Displays user rewards
 * - Backend-driven (read-only)
 * - Refer & Earn always visible
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RewardsModal from "@/components/user/rewards/RewardsModal";
import api from "@/services/api";

const Rewards = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("AVAILABLE");
  const [search, setSearch] = useState("");
  const [selectedReward, setSelectedReward] = useState(null);
  const [availableRewards, setAvailableRewards] = useState([]);

  /* ---------- COUNTS ---------- */
  const totalEarned = availableRewards
    .filter((r) => r.status === "COMPLETED")
    .reduce((sum, r) => sum + r.points, 0);

  const completedCount = availableRewards.filter(
    (r) => r.status === "COMPLETED"
  ).length;

  /* ---------- FILTER ---------- */
  const filteredRewards = availableRewards.filter(
    (r) =>
      r.status === activeTab &&
      r.title.toLowerCase().includes(search.toLowerCase())
  );


  useEffect(() => {
    const fetchAvailableRewards = async () => {
      try {
        const res = await api.get("/rewards/available");

        const mapped = res.data.map(r => ({
          id: r.id,
          title: r.name,
          description: r.description || "Complete actions to earn rewards",
          points: Number(r.value),
          status: "AVAILABLE",
        }));

        // Always prepend Refer & Earn
        mapped.unshift({
          id: "refer",
          title: "Refer & Earn",
          description: "Invite friends and earn rewards",
          points: 50,
          status: "AVAILABLE",
        });

        setAvailableRewards(mapped);
      } catch {
        console.error("Failed to load available rewards");
      }
    };

    fetchAvailableRewards();
  }, []);


  return (
    <div>
      <h2 style={title}>Rewards</h2>

      {/* SUMMARY ROW */}
      <div style={summaryRow}>
        <SummaryCard
          label="Total Earned"
          value={totalEarned}
          accent="#2563EB"
          bg="#FFFFFF"
          onClick={() => navigate("/dashboard/rewards/total-earned")}
        />
        <SummaryCard
          label="Completed"
          value={completedCount}
          accent="#16A34A"
          bg="#FFFFFF"
          onClick={() => setActiveTab("COMPLETED")}
        />
      </div>

      {/* SEARCH */}
      <input
        style={searchStyle}
        placeholder="Search rewards..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABS */}
      <div style={tabsRow}>
        {["AVAILABLE", "COMPLETED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...tabBtn,
              background: activeTab === tab ? "#2E5A88" : "#E5E7EB",
              color: activeTab === tab ? "#fff" : "#111",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div style={cardsRow}>
        {filteredRewards.length === 0 && (
          <p style={{ color: "#64748b" }}>No rewards found</p>
        )}

        {filteredRewards.map((reward) => (
          <div
            key={reward.id}
            style={card}
            onClick={() => {
              if (reward.title === "Refer & Earn") {
                setSelectedReward(reward);
              }
            }}
          >
            <h4>{reward.title}</h4>
            <p style={desc}>{reward.description}</p>

            <div style={cardFooter}>
              <strong>+{reward.points}</strong>

              {reward.status === "AVAILABLE" && (
                <span style={{ ...viewBtn, opacity: 0.6 }}>
                  View Details
                </span>
              )}

              {reward.status === "COMPLETED" && (
                <span style={completedBadge}>Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* REFER MODAL */}
      {selectedReward && (
        <RewardsModal
          reward={selectedReward}
          onClose={() => setSelectedReward(null)}
        />
      )}
    </div>
  );
};

export default Rewards;

/* ---------- SMALL COMPONENT ---------- */
const SummaryCard = ({ label, value, bg, accent, onClick }) => (
  <div
    style={{
      ...summaryCard,
      background: bg,
      cursor: onClick ? "pointer" : "default",
    }}
    onClick={onClick}
  >
    <div style={{ ...accentBar, background: accent }} />
    <p style={{ color: "#64748b", fontSize: "13px" }}>{label}</p>
    <h3 style={{ color: "#0f172a", marginTop: "4px" }}>{value}</h3>
  </div>
);

/* ---------- STYLES ---------- */

const title = { fontSize: "22px", marginBottom: "16px" };

const summaryRow = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  marginBottom: "22px",
};

const summaryCard = {
  position: "relative",
  padding: "18px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const accentBar = {
  position: "absolute",
  left: 0,
  top: 0,
  height: "100%",
  width: "6px",
};

const searchStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #CBD5F5",
  marginBottom: "18px",
};

const tabsRow = {
  display: "flex",
  gap: "8px",
  marginBottom: "22px",
};

const tabBtn = {
  padding: "6px 14px",
  borderRadius: "18px",
  border: "none",
  cursor: "pointer",
};

const cardsRow = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "18px",
};

const card = {
  background: "#fff",
  padding: "18px",
  borderRadius: "18px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
  cursor: "pointer",
};

const desc = {
  color: "#64748b",
  fontSize: "14px",
};

const cardFooter = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "16px",
};

const viewBtn = {
  background: "#2E5A88",
  color: "#fff",
  padding: "6px 16px",
  borderRadius: "20px",
  fontSize: "13px",
};

const completedBadge = {
  background: "#22c55e",
  color: "#fff",
  padding: "6px 16px",
  borderRadius: "20px",
  fontSize: "13px",
};
