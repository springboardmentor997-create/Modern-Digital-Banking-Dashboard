import { useEffect, useState } from "react";
import api from "@/services/api";
import { User } from "lucide-react";

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      const res = await api.get("/admin/profile");
      setAdmin(res.data);
    } catch {
      const localUser = JSON.parse(localStorage.getItem("user")) || {};
      setAdmin({
        name: localUser.name || "",
        email: localUser.email || "",
        phone: localUser.phone || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put("/admin/profile", {
        name: admin.name,
        phone: admin.phone,
      });
      alert("Admin profile updated");
    } catch {
      alert("Failed to save admin details");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading settings…</div>;
  }

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">
          Administrative configuration and preferences
        </p>
      </div>

      {/* ADMIN PROFILE */}
      <Section
        icon={<User />}
        title="Admin Profile"
        description="Your administrator account information"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Name">
            <input
              className="input"
              value={admin.name}
              onChange={(e) =>
                setAdmin({ ...admin, name: e.target.value })
              }
            />
          </Field>

          <Field label="Email">
            <input
              className="input bg-gray-100 cursor-not-allowed"
              value={admin.email}
              disabled
            />
          </Field>

          <Field label="Phone">
            <input
              className="input"
              value={admin.phone}
              onChange={(e) =>
                setAdmin({ ...admin, phone: e.target.value })
              }
            />
          </Field>
        </div>

        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
      </Section>

      {/* SAVE */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2 rounded-md text-sm hover:bg-black disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-1">Change Password</h2>
            <p className="text-sm text-gray-500 mb-4">
              Update your administrator password
            </p>

            <PasswordField
              label="Current Password"
              value={passwords.current}
              onChange={(v) =>
                setPasswords({ ...passwords, current: v })
              }
            />

            <PasswordField
              label="New Password"
              value={passwords.new}
              onChange={(v) =>
                setPasswords({ ...passwords, new: v })
              }
            />

            <PasswordField
              label="Confirm New Password"
              value={passwords.confirm}
              onChange={(v) =>
                setPasswords({ ...passwords, confirm: v })
              }
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="border px-4 py-2 rounded-md"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>

              <button
                className="bg-gray-900 text-white px-4 py-2 rounded-md"
                onClick={async () => {
                  if (passwords.new !== passwords.confirm) {
                    alert("Passwords do not match");
                    return;
                  }

                  if (passwords.new.length < 8) {
                    alert("Password must be at least 8 characters");
                    return;
                  }

                  try {
                    await api.put("/admin/change-password", {
                      current_password: passwords.current,
                      new_password: passwords.new,
                    });

                    alert("Password updated successfully");

                    setPasswords({ current: "", new: "", confirm: "" });
                    setShowPasswordModal(false);
                  } catch (err) {
                    alert(
                      err?.response?.data?.detail ||
                      "Failed to update password"
                    );
                  }
                }}
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;


/* ---------- UI HELPERS ---------- */

const Section = ({ icon, title, description, children }) => (
  <div className="bg-white rounded-xl border shadow-sm p-6 space-y-5">
    <div className="flex gap-3">
      <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

/* ---------- INPUT STYLE ---------- */
const style = document.createElement("style");
style.innerHTML = `
  .input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5f5;
    font-size: 14px;
  }
`;
document.head.appendChild(style);

const PasswordField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="password"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);
