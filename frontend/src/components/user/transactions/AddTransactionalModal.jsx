import { useState } from "react";

const AddTransactionModal = ({ onClose, onAdd }) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [txnType, setTxnType] = useState("");
  const [txnDate, setTxnDate] = useState("");

  const handleAdd = () => {
    if (!description || !amount || !txnDate) {
      alert("Please fill all fields");
      return;
    }

    onAdd({
      id: Date.now(),
      description,
      amount: Number(amount),
      txn_type: txnType,
      txn_date: txnDate,
    });

    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          width: "420px",
          borderRadius: "14px",
          padding: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "14px" }}>
          Add Transaction
        </h2>

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={inputStyle}
        />

        <select
          value={txnType}
          onChange={(e) => setTxnType(e.target.value)}
          style={inputStyle}
        > 
          <option value="">Select</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>

        <input
          type="date"
          value={txnDate}
          onChange={(e) => setTxnDate(e.target.value)}
          style={inputStyle}
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
          <button onClick={onClose} style={cancelBtn}>
            Cancel
          </button>
          <button onClick={handleAdd} style={addBtn}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",
  fontSize: "14px",
};

const cancelBtn = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#fff",
};

const addBtn = {
  padding: "8px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "#fff",
};

export default AddTransactionModal;
