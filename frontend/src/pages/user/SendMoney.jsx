/**
 * Payments dashboard page
 *
 * Part of:
 * - Dashboard layout (Dashboard.jsx)
 * - Route: /dashboard/transfers
 *
 * Connected Files:
 * - Navigates to: SendToUpi.jsx, SendToSelf.jsx, SendToBank.jsx
 * - Uses API from: services/api.js (accounts)
 *
 * Purpose:
 * Acts as the main payments hub where the user selects
 * an account and chooses the type of transfer.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Smartphone,
  User,
  Building2,
  Wallet,
  Zap,
  Repeat,
  Tv,
  Lightbulb,
  TrendingUp,
  Coins,
  Plane,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import api from "@/services/api";

const SendMoney = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  const hasAccounts = accounts.length > 0;

  useEffect(() => {
    api.get("/accounts").then((res) => {
      const data = res.data || [];
      setAccounts(data);

      if (data.length > 0) {
        setSelectedAccount(String(data[0].id));
      }
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold">Payments</h2>
        <button
          className="text-indigo-600 text-sm font-medium"
          onClick={() => navigate("/dashboard/balance")}
        >
          Check Balance
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Secure payments with bank-grade protection
      </p>

      {/* SELECT ACCOUNT */}
      <div className="bg-white p-5 rounded-xl shadow mb-8">
        <label className="block text-sm font-medium mb-2">
          Selected Account
        </label>

        {hasAccounts ? (
          <select
            className="w-full border p-3 rounded-lg bg-white"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={String(acc.id)}>
                {acc.bank_name} • {acc.account_type}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center justify-between border rounded-lg p-3">
            <span className="text-gray-500 text-sm">
              No accounts found
            </span>
            <button
              onClick={() => navigate("/dashboard/accounts")}
              className="text-indigo-600 text-sm font-medium"
            >
              + Add Account
            </button>
          </div>
        )}
      </div>

      {/* SEND MONEY */}
      <Section title="Send Money">
        <Card
          icon={<Smartphone size={20} />}
          title="To Mobile / UPI"
          variant="blue"
          onClick={() =>
            navigate("/dashboard/transfers/upi", {
              state: { fromAccountId: Number(selectedAccount) },
            })
          }
        />
        <Card
          icon={<User size={20} />}
          title="To My Account"
          variant="blue"
          onClick={() =>
            navigate("/dashboard/transfers/self", {
              state: { fromAccountId: Number(selectedAccount) },
            })
          }
        />
        <Card
          icon={<Building2 size={20} />}
          title="To Bank Account"
          variant="blue"
          onClick={() =>
            navigate("/dashboard/transfers/bank", {
              state: { fromAccountId: Number(selectedAccount) },
            })
          }
        />
      </Section>

      {/* WALLETS */}
      <Section title="Wallets" viewAll onViewAll={() => navigate("/dashboard/wallets")}>
        <Card icon={<Wallet size={20} />} title="Wallet" variant="violet" />
        <Card icon={<Zap size={20} />} title="UPI Lite" variant="violet" />
        <Card icon={<Repeat size={20} />} title="AutoPay" variant="violet" />
      </Section>

      {/* BILLS & RECHARGES */}
      <Section title="Bills & Recharges" viewAll onViewAll={() => navigate("/dashboard/bills")}>
        <Card
          icon={<Smartphone size={20} />}
          title="Mobile Recharge"
          variant="orange"
          onClick={() =>
            navigate("/dashboard/bills", {
              state: { fromAccountId: Number(selectedAccount) },
            })
          }
        />
        <Card
          icon={<Tv size={20} />}
          title="Subscription"
          variant="orange"
          onClick={() =>
            navigate("/dashboard/bills", {
              state: { fromAccountId: Number(selectedAccount) },
            })
          }
        />
        <Card
          icon={<Lightbulb size={20} />}
          title="Electricity Bill"
          variant="orange"
          onClick={() =>
            navigate("/dashboard/bills", {
              state: { fromAccountId: Number(selectedAccount) },
            })
          }
        />
      </Section>

      {/* FINANCE & INVESTMENTS */}
      <Section title="Finance & Investments">
        <Card icon={<TrendingUp size={20} />} title="Stocks" variant="green" coming />
        <Card icon={<Coins size={20} />} title="Gold & Silver" variant="green" coming />
        <Card icon={<Plane size={20} />} title="Travel" variant="green" coming />
        <Card icon={<ShieldCheck size={20} />} title="Insurance" variant="green" coming />
      </Section>
    </div>
  );
};

export default SendMoney;

/* ================= UI COMPONENTS ================= */

const Section = ({ title, viewAll, onViewAll, children }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {viewAll && (
        <button
          className="text-sm text-indigo-600 flex items-center gap-1"
          onClick={onViewAll}
        >
          View All <ChevronRight size={16} />
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

const Card = ({ icon, title, coming, onClick, variant = "blue" }) => {
  const iconColors = {
    blue: "bg-[#1e3a8a]",      // navy blue
    violet: "bg-[#4c1d95]",    // deep violet
    orange: "bg-orange-600",    // burnt orange
    green: "bg-[#065f46]",     // dark emerald
  };


  return (
    <div
      onClick={!coming ? onClick : undefined}
      className={`
        h-[96px]
        flex items-center gap-4
        px-6
        rounded-xl
        bg-gradient-to-br from-[#2563eb] to-[#1e40af]
        text-white
        shadow-[0_10px_25px_rgba(0,0,0,0.12)]
        transition-all
        hover:shadow-lg
        ${coming ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:-translate-y-1 hover:shadow-lg"}
      `}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColors[variant]}`}
      >
        {icon}
      </div>

      <div>
        <h4 className="text-sm font-medium tracking-wide">
          {title}
        </h4>
        {coming && (
          <span className="text-xs opacity-80">
            Coming Soon
          </span>
        )}
      </div>
    </div>
  );
};
