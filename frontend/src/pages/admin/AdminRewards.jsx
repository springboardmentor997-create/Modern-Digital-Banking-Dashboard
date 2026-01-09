import { useEffect, useState } from "react";
import { Search, Gift, Calendar, Coins, Check, Trash2 } from "lucide-react";
import api from "@/services/api";

const AdminRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [showAddReward, setShowAddReward] = useState(false);

  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    type: "Cashback",
    appliesTo: ["Savings"],
    value: "",
    status: "Pending",
  });

  useEffect(() => {
    fetchRewards();
}, []);

  const fetchRewards = async () => {
    try {
      const res = await api.get("/admin/rewards");
      setRewards(res.data);
    } catch (err) {
      console.error("Failed to load rewards", err);
    }
  };


  const handleAddReward = async () => {
    if (!newReward.name || !newReward.value) {
      alert("Please fill required fields");
      return;
    }

    try {
      await api.post("/admin/rewards", {
        name: newReward.name,
        description: newReward.description,
        reward_type: newReward.type,
        applies_to: newReward.appliesTo,
        value: newReward.value,
      });

      setShowAddReward(false);
      fetchRewards();

      setNewReward({
        name: "",
        description: "",
        type: "Cashback",
        appliesTo: ["Savings"],
        value: "",
      });
    } catch (err) {
      alert("Failed to create reward");
    }
  };



  const approveReward = async (id) => {
    try {
      await api.patch(`/admin/rewards/${id}/approve`);
      fetchRewards();
    } catch (err) {
      alert("Failed to approve reward");
    }
  };

  const removeReward = async (id) => {
    if (!window.confirm("Remove this reward?")) return;
    
    try {
      await api.delete(`/admin/rewards/${id}`);
      fetchRewards();
    } catch (err) {
      alert("Failed to remove reward");
    }
  };

  const toggleApply = (type) => {
    setNewReward((prev) => ({
      ...prev,
      appliesTo: prev.appliesTo.includes(type)
        ? prev.appliesTo.filter((t) => t !== type)
        : [...prev.appliesTo, type],
    }));
  };

  return (
    <div>
      <h1 style={{ fontSize: "28px", marginBottom: "6px" }}>Rewards</h1>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        Monitor and manage user reward activities
      </p>

      <div style={{ ...filters, justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "10px", flex: 1 }}>
          <div style={inputWrap}>
            <Search size={16} style={inputIcon} />
            <input placeholder="Search rewards..." style={search} />
          </div>

          <div style={selectWrap}>
            <Gift size={16} style={inputIcon} />
            <select style={filterSelect}>
              <option>All Rewards</option>
              <option>Cashback</option>
              <option>Offer</option>
              <option>Referral</option>
            </select>
          </div>


          <div style={dateWrap}>
            <Calendar size={16} style={inputIcon} />
            <input type="date" style={date} />
          </div>
        </div>

        <button onClick={() => setShowAddReward(true)} style={addBtn}>
          + Add Reward
        </button>
      </div>

      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={th}>Reward</th>
              <th style={th}>Type</th>
              <th style={th}>Applies To</th>
              <th style={th}>Points</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {rewards.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div style={emptyState}>
                    <Coins size={32} />
                    <div>No rewards created</div>
                  </div>
                </td>
              </tr>
            ) : (
              rewards.map((r) => (
                <tr key={r.id} style={row}>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.reward_type}</td>
                  <td style={td}>{r.applies_to.join(", ")}</td>
                  <td style={td}>{r.value}</td>
                  <td style={td}>{r.status}</td>
                  <td style={td}>
                    {r.status === "Pending" && (
                      <button
                        onClick={() => approveReward(r.id)}
                        style={approveBtn}
                      >
                        <Check size={14} /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => removeReward(r.id)}
                      style={removeBtn}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddReward && (
        <div style={modalOverlay}>
          <div style={{ ...modal, width: "420px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "4px", fontWeight: 600 }}>
              Add Reward
            </h3>
            <p style={{ marginBottom: "18px", fontSize: "13px", color: "#64748b" }}>
              Create reward rule (approval required)
            </p>

            <input
              placeholder="Reward Name"
              style={modalInput}
              value={newReward.name}
              onChange={(e) =>
                setNewReward({ ...newReward, name: e.target.value })
              }
            />

            <textarea
              placeholder="Reward Description"
              style={{ ...modalInput, height: "60px" }}
              value={newReward.description}
              onChange={(e) =>
                setNewReward({ ...newReward, description: e.target.value })
              }
            />

            <select
              style={modalInput}
              value={newReward.type}
              onChange={(e) =>
                setNewReward({ ...newReward, type: e.target.value })
              }
            >
              <option>Cashback</option>
              <option>Offer</option>
              <option>Referral</option>
            </select>

            {/* ✅ ONLY UI FIX HERE */}
            <div
              style={{
                marginBottom: "14px",
                padding: "10px 12px",
                border: "1px solid #cbd5f5",
                borderRadius: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "8px",
                background: "#f8fafc",
              }}
            >
              {["Savings", "Debit", "Credit", "UPI"].map((t) => (
                <label
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={newReward.appliesTo.includes(t)}
                    onChange={() => toggleApply(t)}
                  />
                  {t}
                </label>
              ))}
            </div>

            <input
              placeholder="Points / % / ₹"
              style={modalInput}
              value={newReward.value}
              onChange={(e) =>
                setNewReward({ ...newReward, value: e.target.value })
              }
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleAddReward} style={primaryBtn}>
                Save
              </button>
              <button
                onClick={() => setShowAddReward(false)}
                style={secondaryBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRewards;

/* ================= STYLES ================= */

const filters = {
  display: "flex",
  gap: "10px",
  background: "#fff",
  padding: "14px",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  marginBottom: "20px",
};

const inputWrap = { position: "relative", flex: 1 };
const selectWrap = { position: "relative" };
const dateWrap = { position: "relative" };

const inputIcon = {
  position: "absolute",
  left: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#64748b",
};

const search = {
  width: "100%",
  padding: "10px 10px 10px 36px",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",
};

const filterSelect = search;
const date = search;

const addBtn = {
  padding: "10px 16px",
  background: "#2E5A88",
  color: "#fff",
  borderRadius: "10px",
  border: "none",
  fontWeight: 600,
};

const card = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const th = { padding: "16px", textAlign: "left", color: "#475569" };
const td = { padding: "16px" };
const row = { borderBottom: "1px solid #f1f5f9" };

const emptyState = {
  padding: "48px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "#64748b",
};

const approveBtn = {
  marginRight: "6px",
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "6px 10px",
};

const removeBtn = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "6px 8px",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.25)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal = {
  background: "#fff",
  padding: "24px",
  borderRadius: "16px",
};

const modalInput = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #cbd5f5",
};

const primaryBtn = {
  flex: 1,
  background: "#2E5A88",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px",
};

const secondaryBtn = {
  flex: 1,
  background: "#e5e7eb",
  border: "none",
  borderRadius: "8px",
  padding: "10px",
};
