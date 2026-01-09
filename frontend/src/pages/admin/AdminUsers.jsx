import { useEffect, useState } from "react";
import { Search, ShieldCheck, User } from "lucide-react";
import api from "@/services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, kycFilter]);

  const updateKyc = async (userId, status) => {
    try {
      await api.patch(`/admin/users/${userId}/kyc`, {
        status,
      });
      fetchUsers(); // 🔄 refresh list
    } catch (err) {
      alert("Failed to update KYC");
    }
  };


  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/admin/users", {
        params: {
          search: search || undefined,
          kyc_status: kycFilter === "ALL" ? undefined : kycFilter.toLowerCase(),
        },
      });

      const formatted = res.data.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        kycStatus: u.kyc_status?.toUpperCase(),
      }));

      setUsers(formatted);
    } catch (err) {
      console.error("Failed to load users", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <h1 style={{ fontSize: "28px", marginBottom: "6px" }}>Users</h1>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        View and monitor registered platform users.
      </p>

      {/* FILTER BAR */}
      <div style={filters}>
        <div style={inputWrap}>
          <Search size={16} style={inputIcon} />
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </div>

        <div style={selectWrap}>
          <ShieldCheck size={16} style={inputIcon} />
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            style={filterSelect}
          >
            <option value="ALL">All KYC Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>KYC Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: "24px", textAlign: "center" }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div
                    style={{
                      padding: "48px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    <User size={36} style={{ marginBottom: "10px", opacity: 0.8 }} />
                    <div style={{ fontSize: "16px", fontWeight: 600 }}>
                      No users found
                    </div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      Try adjusting search or filter criteria
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  style={row}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.boxShadow = "inset 4px 0 0 #2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <td style={td}>{u.id}</td>
                  <td style={td}>{u.name}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>{u.phone || "-"}</td>

                  <td style={td}>
                    <KycBadge status={u.kycStatus} />
                  </td>


                  
                 
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

/* ---------------- COMPONENTS ---------------- */

const KycBadge = ({ status }) => {
  const colors = {
    APPROVED: "#22c55e",
    PENDING: "#facc15",
    REJECTED: "#ef4444",
  };

  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        color: "#fff",
        background: colors[status] || "#64748b",
      }}
    >
      {status}
    </span>
  );
};

/* ---------------- STYLES ---------------- */

const filters = {
  display: "flex",
  gap: "10px",
  background: "#ffffff",
  padding: "14px",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  marginBottom: "20px",
};

const inputWrap = {
  position: "relative",
  flex: 1,
};

const selectWrap = {
  position: "relative",
  width: "220px",
};

const inputIcon = {
  position: "absolute",
  left: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#64748b",
};

const searchInput = {
  width: "100%",
  padding: "10px 10px 10px 36px",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",
};

const filterSelect = {
  width: "100%",
  padding: "10px 10px 10px 36px",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",
  background: "#fff",
};

const card = {
  background: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  overflow: "hidden",
};

const th = {
  padding: "16px",
  fontSize: "14px",
  textAlign: "left",
  color: "#475569",
};

const td = {
  padding: "16px",
  fontSize: "14px",
  color: "#0f172a",
};

const row = {
  borderBottom: "1px solid #f1f5f9",
  cursor: "pointer",
  transition: "all 0.2s ease",
};


const approveBtn = {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#22c55e",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const rejectBtn = {
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#ef4444",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};
