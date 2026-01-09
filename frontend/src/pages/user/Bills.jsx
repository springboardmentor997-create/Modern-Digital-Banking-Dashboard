import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import api from "@/services/api";

import AddBillModal from "../../components/user/bills/AddBillModal";

import MobileRechargeModal from "../../components/user/bills/MobileRechargeModal";
import ElectricityBillModal from "../../components/user/bills/ElectricityBillModal";
import SubscriptionModal from "../../components/user/bills/SubscriptionModal";
import FastagRechargeModal from "../../components/user/bills/FastagRechargeModal";
import GooglePlayRechargeModal from "../../components/user/bills/GooglePlayRechargeModal";
import CreditCardBillModal from "../../components/user/bills/CreditCardBillModal";


import {
  Smartphone,
  Tv,
  Lightbulb,
  CreditCard,
  Wifi,
  Droplet,
  Flame,
  GraduationCap,
  Home,
  Building,
  ShieldCheck,
  Repeat,
  FileText,
  Gift,
  Car
} from "lucide-react";

/* ✅ MODAL MAP (KEY → MODAL) */
const BILL_MODAL_MAP = {
  mobile: MobileRechargeModal,
  electricity: ElectricityBillModal,
  subscription: SubscriptionModal,
  fastag: FastagRechargeModal,
  "google-play": GooglePlayRechargeModal,
  "credit-card": CreditCardBillModal,
};

const Bills = () => {
  const [mostUsed, setMostUsed] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [showAddBill, setShowAddBill] = useState(false);
  const [userBills, setUserBills] = useState([]);

  const [editingBill, setEditingBill] = useState(null);

  const [accounts, setAccounts] = useState([]);

  const fetchBills = async () => {
    try {
      const res = await api.get("/bills");

      const mappedBills = res.data.map((bill) => ({
        id: bill.id,
        billerName: bill.biller_name,
        amount: bill.amount_due,
        dueDate: bill.due_date,
        status: bill.status,
        autoPay: bill.auto_pay,
        account: bill.account_id
      }));

      setUserBills(mappedBills || []);
    } catch (err) {
      console.error("Failed to fetch bills", err);
    }
  };
  
  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data || []);
      } catch (err) {
       console.error("Failed to load accounts", err);
      }
    };

    fetchAccounts();
  }, []);


  const bills = [
    { label: "Electricity", icon: <Lightbulb />, key: "electricity" },
    { label: "Credit Card Bill", icon: <CreditCard />, key: "credit-card" },
    { label: "Subscription", icon: <Repeat />, key: "subscription" }
  ];

  const recharges = [
    { label: "Mobile Recharge", icon: <Smartphone />, key: "mobile" },
    { label: "FASTag Recharge", icon: <Car />, key: "fastag" },
    { label: "Google Play", icon: <Gift />, key: "google-play" },
  ];

  const allItems = [...bills, ...recharges];

  const defaultMostUsedKeys = [
    "mobile",
    "fastag",
    "google-play",
    "electricity",
    "subscription",
    "credit-card"
  ];

  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem("mostUsedBills"));
    if (!stored) {
      stored = defaultMostUsedKeys;
      localStorage.setItem("mostUsedBills", JSON.stringify(stored));
    }

    setMostUsed(
      stored.map((k) => allItems.find((i) => i.key === k)).filter(Boolean)
    );
  }, []);

  const handleClick = (item) => {
    let stored = JSON.parse(localStorage.getItem("mostUsedBills")) || [];
    stored = stored.filter((k) => k !== item.key);
    stored.unshift(item.key);
    stored = stored.slice(0, 6);

    localStorage.setItem("mostUsedBills", JSON.stringify(stored));
    setMostUsed(stored.map((k) => allItems.find((i) => i.key === k)).filter(Boolean));
    setActiveItem(item);
  };

  const isMostUsed = (key) => mostUsed.some((i) => i.key === key);
  const getBillStatus = (bill) => {
  if (bill.status === "Paid") return "Paid";

  const today = new Date();
  const due = new Date(bill.dueDate);

  if (due < today) return "Overdue";
  return "Upcoming";
};


  /* ================= CARD UI ================= */
  const Card = ({ item }) => {
    const clickable = isMostUsed(item.key);

    return (
      <div
        onClick={clickable ? () => handleClick(item) : undefined}
        className={`
          h-[96px]
          px-6
          flex items-center gap-4
          rounded-xl
          text-white
          bg-gradient-to-r from-blue-500 to-indigo-600
          shadow-md
          transition
          ${clickable ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg" : "opacity-90"}
        `}
      >
        {/* ICON (ORANGE like Send Money) */}
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
          {item.icon}
        </div>

        {/* TEXT */}
        <h4 className="text-sm font-semibold tracking-wide">
          {item.label}
        </h4>
      </div>
    );
  };

  return (
  <div className="space-y-12">
    {/* HEADER */}
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold">Recharge & Bills</h1>
        <p className="text-sm text-gray-500">
          Pay your utility bills and recharges securely
        </p>
      </div>

      {/* ADD BILL — BELOW GLOBAL ICONS */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddBill(true)}
          className="
            flex items-center gap-2
            px-4 py-2
            bg-orange-500
            text-white
            text-sm
            font-medium
            rounded-lg
            shadow
            hover:bg-orange-600
            transition
          "
        >
          + Add Remainder
        </button>
      </div>
    </div>
    {/* ================= BILL SUMMARY ================= */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* TOTAL DUE */}
      <div className="bg-white rounded-xl p-5 shadow border-l-4 border-orange-500">
        <p className="text-sm text-gray-500">Total Due</p>
        <h3 className="text-2xl font-semibold mt-1">
          ₹{userBills
            .filter((b) => getBillStatus(b) !== "Paid")
            .reduce((sum, b) => sum + Number(b.amount || 0), 0)}
        </h3>
      </div>

      {/* UPCOMING BILLS */}
      <div className="bg-white rounded-xl p-5 shadow border-l-4 border-blue-500">
        <p className="text-sm text-gray-500">Upcoming Bills</p>
        <h3 className="text-2xl font-semibold mt-1">
          {userBills.filter((b) => getBillStatus(b) === "Upcoming").length}
        </h3>
      </div>

      {/* AUTO PAY */}
      <div className="bg-white rounded-xl p-5 shadow border-l-4 border-green-500">
        <p className="text-sm text-gray-500">Auto-Pay Enabled</p>
        <h3 className="text-2xl font-semibold mt-1">
          {userBills.filter((b) => b.autoPay).length}
        </h3>
      </div>
    </div>


    {/* USER ADDED BILLS */}
     {userBills.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    {userBills.map((bill) => {
      const status = getBillStatus(bill);

      return (
        <div
          key={bill.id}
          className="bg-white rounded-xl p-5 shadow border flex flex-col gap-3"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">{bill.billerName}</h4>

            <span
              className={`px-3 py-1 text-xs rounded-full
                ${
                  status === "Paid"
                    ? "bg-green-100 text-green-700"
                    : status === "Overdue"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {status}
            </span>
          </div>

          {/* DUE DATE */}
          <p className="text-sm text-gray-500">
            Due: {bill.dueDate}
          </p>

          {/* AMOUNT */}
          <p className="text-lg font-semibold">
            ₹{bill.amount}
          </p>

          {/* ACTIONS */}
          <div className="flex gap-3 mt-2">
            {/* PAY BUTTON */}
            {status !== "Paid" && (
              <button
                onClick={async () => {
                  if (!window.confirm("Remove this reminder?")) return;
                  try {
                    await api.delete(`/bills/${bill.id}`);
                    await fetchBills();
                  } catch (err) {
                    console.error("Failed to remove bill", err);
                  }
                }}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 transition"
              >
                Remove
              </button>
            )}

            {/* EDIT BUTTON */}
            <button
              onClick={() => {
                setEditingBill(bill);
                setShowAddBill(true);
              }}
              className="flex-1 border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-100 transition"
            >
              Edit
            </button>
          </div>
        </div>
      );
    })}
  </div>
)}


    {/* MOST USED */}
    <div>
      <h2 className="text-lg font-medium mb-4">Most Used</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mostUsed.map((item) => (
          <Card key={item.key} item={item} />
        ))}
      </div>
    </div>

    {/* BILLS */}
    <div>
      <h2 className="text-lg font-medium mb-4">Bills</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map((item) => (
          <Card key={item.key} item={item} />
        ))}
      </div>
    </div>
    

    {/* RECHARGES */}
    <div>
      <h2 className="text-lg font-medium mb-4">Recharges</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recharges.map((item) => (
          <Card key={item.key} item={item} />
        ))}
      </div>
    </div>
    {/* ADD BILL MODAL */}
    {showAddBill &&
      createPortal(
        <AddBillModal
          accounts={accounts}
          initialData={editingBill}
          onClose={() => {
            setShowAddBill(false);
            setEditingBill(null);
          }}
          onAdd={async (bill) => {
            try {
              if (editingBill) {
                await api.put(`/bills/${editingBill.id}`, {
                  biller_name: bill.billerName,
                  amount_due: bill.amount,
                  due_date: bill.dueDate,
                  auto_pay: bill.autoPay,
                  account_id: bill.account,
                  status: bill.status,
                });
              }else{
                await api.post("/bills", {
                  biller_name: bill.billerName,
                  due_date: bill.dueDate,
                  amount_due: Number(bill.amount),
                  auto_pay: bill.autoPay,
                  account_id: Number(bill.account),
                });
              }

              await fetchBills();
              setShowAddBill(false);
              setEditingBill(null);
            } catch (err) {
              console.error("Failed to save bill", err);
            }
          
          


            
          }}
        />,
        document.getElementById("modal-root")
      )}

    {/* MODALS */}
    
    {activeItem &&
      BILL_MODAL_MAP[activeItem.key] &&
      createPortal(
        (() => {
          const ActiveModal = BILL_MODAL_MAP[activeItem.key];
          return <ActiveModal onClose={() => setActiveItem(null)} />;
        })(),
        document.getElementById("modal-root")
      )}
  </div>
);

};

export default Bills;