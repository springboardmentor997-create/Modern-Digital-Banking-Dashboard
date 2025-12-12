import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, TrendingDown, TrendingUp } from "lucide-react";
import { getTransactions, importCSV } from "../api/transactions";
import { getAccount } from "../api/accounts";

export default function Transactions() {
  const navigate = useNavigate();
  const { id: accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccountData();
    fetchTransactions();
  }, [accountId]);

  const fetchAccountData = async () => {
    try {
      const data = await getAccount(accountId);
      setAccount(data);
    } catch (err) {
      setError("Failed to load account");
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions(accountId);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setError("");

    try {
      await importCSV(accountId, file);
      await fetchTransactions();
      e.target.value = "";
    } catch (err) {
      setError(err.detail || "Failed to import CSV");
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Account Header */}
        {account && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {account.bank_name} - {account.account_type}
            </h1>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">Account: {account.masked_account || "••••••••"}</p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  ${parseFloat(account.balance).toFixed(2)} {account.currency}
                </p>
              </div>
              <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition">
                <Upload className="w-5 h-5" />
                <span>{uploadLoading ? "Importing..." : "Import CSV"}</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploadLoading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-4">No transactions yet. Import a CSV file to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Merchant</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.txn_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.merchant || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {transaction.category ? (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {transaction.category}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-right">
                        <span
                          className={
                            transaction.txn_type === "credit"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.txn_type === "credit" ? "+" : "-"}$
                          {Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        {transaction.txn_type === "credit" ? (
                          <TrendingUp className="w-5 h-5 text-green-600 inline" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
