/**
 * Total Earned Page
 *
 * What:
 * - Shows total earned rewards
 * - Backend-driven
 * - Lists completed rewards only
 *
 * Route:
 * - /dashboard/rewards/total-earned
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRewards } from "@/services/api";

const TotalEarned = () => {
  const navigate = useNavigate();

  const [completedRewards, setCompletedRewards] = useState([]);

  useEffect(() => {
    const fetchCompletedRewards = async () => {
      try {
        const res = await getRewards();

        const completed = res.data
          .filter((r) => r.program_name !== "string")
          .filter((r) => r.points_balance > 0)
          .map((r) => ({
            id: r.id,
            title: r.program_name,
            points: r.points_balance,
            date: new Date(r.last_updated).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          }));

        setCompletedRewards(completed);
      } catch (err) {
        console.error("Failed to load earned rewards", err);
      }
    };

    fetchCompletedRewards();
  }, []);

  const totalPoints = completedRewards.reduce(
    (sum, r) => sum + r.points,
    0
  );

  return (
    <div style={pageWrap}>
      {/* HEADER */}
      <div style={headerRow}>
        <h2 style={title}>Total Earned</h2>
        <button style={backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* SUMMARY CARD */}
      <div style={summaryCard}>
        <p style={label}>Total Points</p>
        <h1 style={points}>{totalPoints}</h1>
        <p style={subText}>1 point = ₹1</p>
      </div>

      {/* HISTORY */}
      <h3 style={sectionTitle}>Earnings History</h3>

      {completedRewards.length === 0 && (
        <p style={{ color: "#64748b" }}>No earnings yet</p>
      )}

      <div style={listWrap}>
        {completedRewards.map((r) => (
          <div key={r.id} style={listItem}>
            <div>
              <p style={itemTitle}>{r.title}</p>
              <p style={itemDate}>{r.date}</p>
            </div>
            <strong style={itemPoints}>+{r.points} pts</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TotalEarned;

/* ---------- STYLES ---------- */

const pageWrap = {
  maxWidth: "900px",
  margin: "0 auto",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const title = {
  fontSize: "22px",
};

const backBtn = {
  background: "transparent",
  border: "none",
  fontSize: "14px",
  cursor: "pointer",
  color: "#2E5A88",
};

const summaryCard = {
  background: "#ffffff",
  padding: "24px",
  borderRadius: "18px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
  marginBottom: "28px",
};

const label = {
  color: "#64748b",
  fontSize: "14px",
};

const points = {
  fontSize: "36px",
  margin: "6px 0",
};

const subText = {
  color: "#475569",
  fontSize: "14px",
};

const sectionTitle = {
  fontSize: "18px",
  marginBottom: "12px",
};

const listWrap = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const listItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#ffffff",
  padding: "16px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const itemTitle = {
  fontSize: "14px",
  fontWeight: 600,
};

const itemDate = {
  fontSize: "12px",
  color: "#64748b",
};

const itemPoints = {
  color: "#16A34A",
};
