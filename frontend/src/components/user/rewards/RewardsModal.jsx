/**
 * Rewards Modal
 *
 * What:
 * - Shows full reward details
 * - Allows swipe-to-share action (Refer & Earn only)
 *
 * Used In:
 * - Rewards.jsx
 */

import { useState } from "react";

const RewardsModal = ({ reward, onClose }) => {
  const [swipe, setSwipe] = useState(0);
  const [showShare, setShowShare] = useState(false);

  const handleSwipe = (e) => {
    const value = Number(e.target.value);
    setSwipe(value);

    if (value >= 100) {
      setShowShare(true);
    }
  };

  const handleShare = () => {
    const url = "http://localhost:5173/register";
    const text = `Join Modern Digital Banking using my referral 🎁`;

    if (navigator.share) {
      navigator.share({
        title: "Modern Digital Banking",
        text,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied! Share with your friends.");
    }

    onClose();
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h2>{reward.title}</h2>
        <p style={desc}>{reward.description}</p>

        <div style={pointsBox}>
          <span>Reward</span>
          <strong>+{reward.points} Points</strong>
        </div>

        <div style={rules}>
          <p>• Invite friends to join</p>
          <p>• Earn points on successful signup</p>
          <p>• Backend auto-tracks completion</p>
        </div>

        {!showShare && (
          <>
            <p style={swipeText}>Swipe to share</p>
            <input
              type="range"
              min="0"
              max="100"
              value={swipe}
              onChange={handleSwipe}
              style={slider}
            />
          </>
        )}

        {showShare && (
          <button onClick={handleShare} style={shareBtn}>
            Share with Friends
          </button>
        )}

        <button onClick={onClose} style={cancelBtn}>
          Close
        </button>
      </div>
    </div>
  );
};

export default RewardsModal;

/* ---------- STYLES ---------- */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  width: "420px",
  background: "#fff",
  padding: "26px",
  borderRadius: "20px",
  boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
};

const desc = {
  color: "#64748b",
  marginBottom: "18px",
};

const pointsBox = {
  display: "flex",
  justifyContent: "space-between",
  padding: "14px 16px",
  background: "#f1f5f9",
  borderRadius: "12px",
  marginBottom: "18px",
  fontSize: "14px",
};

const rules = {
  fontSize: "13px",
  color: "#475569",
  marginBottom: "18px",
};

const swipeText = {
  fontSize: "13px",
  marginBottom: "6px",
};

const slider = {
  width: "100%",
  cursor: "pointer",
};

const shareBtn = {
  marginTop: "16px",
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const cancelBtn = {
  marginTop: "12px",
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "none",
  background: "#e5e7eb",
  fontWeight: 600,
  cursor: "pointer",
};
