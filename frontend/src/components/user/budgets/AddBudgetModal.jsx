import { useState, useRef, useEffect } from "react";
import { createBudget } from "@/services/api";


const AddBudgetModal = ({ onSave }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("budget"); // budget | limit

  // 🔹 category dropdown state
  const categories = ["Food", "Travel", "Shopping", "Bills", "Entertainment"];
  const [category, setCategory] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 🔹 duration states
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");

  const [startDate, setStartDate] = useState(
    firstDay.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    lastDay.toISOString().split("T")[0]
  );
  const [days, setDays] = useState(
    Math.ceil((lastDay - firstDay) / (1000 * 60 * 60 * 24)) + 1
  );

  const [success, setSuccess] = useState(false);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Days → End Date
  useEffect(() => {
    if (!startDate || !days) return;
    const d = new Date(startDate);
    d.setDate(d.getDate() + Number(days) - 1);
    setEndDate(d.toISOString().split("T")[0]);
  }, [days]);

  // End Date → Days
  useEffect(() => {
    if (!startDate || !endDate) return;
    const diff =
      (new Date(endDate) - new Date(startDate)) /
        (1000 * 60 * 60 * 24) +
      1;
    setDays(diff > 0 ? diff : "");
  }, [endDate]);

  const handleSave = () => {
    const limitValue =
      mode === "limit"
        ? Number(monthlyLimit)
        : Number(maxBudget);

    // 🚨 VALIDATION (THIS WAS MISSING)
    if (!category || !limitValue || limitValue <= 0) {
        alert("Please select a category and enter a valid budget amount");
        return;
    };
        
    const payload = {
      month: today.getMonth() + 1,
      year: today.getFullYear(),
      category,
      limit_amount: limitValue,
    };

    setSuccess(true);

    setTimeout(async() => {
        try {
        await createBudget(payload);
        
        setSuccess(true);              // ⬅️ show success ONLY if OK
        
        setTimeout(() => {
            setSuccess(false);
            setOpen(false);
            
            onSave?.(); // send new budget to parent
        }, 800);

        } catch (error) {
          alert("session expired. please login again.");
          setOpen(false);
        }
      }, 300);
  };

  return (
    <>
      {/* OPEN BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 
                   text-white px-6 py-2.5 
                   rounded-full font-medium shadow-sm
                   flex items-center gap-2"
      >
        <span className="text-lg leading-none">+</span>
        Add Budget
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-[420px] px-6 py-5">

            {success ? (
              <div className="text-center py-10 animate-fade-in">
                <div className="text-green-600 text-3xl mb-2">✓</div>
                <h3 className="text-lg font-semibold">Budget Added</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {category} • {days} days
                </p>
              </div>
            ) : (
              <>
                {/* HEADER */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">
                    {mode === "budget" ? "Add Budget" : "Set Monthly Budget"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {mode === "budget"
                      ? "Define minimum and maximum budget"
                      : "Set a monthly spending limit"}
                  </p>
                </div>

                {/* TOGGLE */}
                <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                  <button
                    onClick={() => setMode("budget")}
                    className={`flex-1 py-1.5 rounded-md text-sm
                      ${
                        mode === "budget"
                          ? "bg-white shadow text-blue-600"
                          : "text-gray-500"
                      }`}
                  >
                    Add Budget
                  </button>
                  <button
                    onClick={() => setMode("limit")}
                    className={`flex-1 py-1.5 rounded-md text-sm
                      ${
                        mode === "limit"
                          ? "bg-white shadow text-blue-600"
                          : "text-gray-500"
                      }`}
                  >
                    Set Limit
                  </button>
                </div>

                {/* FORM */}
                <div className="space-y-3">

                  {/* CATEGORY */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="text-xs font-medium">Category</label>
                    <input
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search or type"
                      className="w-full border-2 border-blue-500 rounded-lg px-3 py-2 text-sm"
                    />

                    {showDropdown && (
                      <div className="absolute mt-1 w-full bg-white border border-blue-300 rounded-xl shadow">
                        {categories
                          .filter((c) =>
                            c.toLowerCase().includes(category.toLowerCase())
                          )
                          .map((c) => (
                            <div
                              key={c}
                              onClick={() => {
                                setCategory(c);
                                setShowDropdown(false);
                              }}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50"
                            >
                              {c}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* BUDGET INPUTS */}
                  {mode === "budget" && (
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" placeholder="Min Budget" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                      <input type="number" placeholder="Max Budget" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                    </div>
                  )}

                  {mode === "limit" && (
                    <input type="number" placeholder="Monthly Budget" value={monthlyLimit} onChange={(e) => setMonthlyLimit(e.target.value)} className="border rounded-lg px-3 py-2 text-sm w-full" />
                  )}

                  {/* DURATION */}
                  <div className="pt-2 border-t text-center text-xs text-gray-400">
                    Choose duration (optional)
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
                  </div>

                  <div className="text-center text-xs text-gray-400">OR</div>

                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    placeholder="Number of days"
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  />

                  <textarea
                    rows="2"
                    placeholder="Optional note"
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                  />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 mt-5">
                  <button onClick={() => setOpen(false)} className="text-gray-500 text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm"
                  >
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AddBudgetModal;
