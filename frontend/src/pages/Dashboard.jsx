import { useState, useEffect } from 'react';
// 1. Removed Navbar import
import { getTransactions } from '../api/transactions';
import { getBudgets } from '../api/budgets';
import { getAlerts } from '../api/alerts';
import Loader from '../components/Loader';
import Table from '../components/Table';
import { ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsData, budgetsData, alertsData] = await Promise.all([
          getTransactions(),
          getBudgets(),
          getAlerts(),
        ]);
        setTransactions(transactionsData || []);
        setBudgets(budgetsData || []);
        setAlerts(alertsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader />;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalBalance = totalIncome - totalExpense;

  const transactionHeaders = ['Date', 'Description', 'Category', 'Amount'];
  const renderTransactionRow = (transaction, index) => (
    <tr key={transaction.id || index} className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(transaction.date).toLocaleDateString()}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{transaction.description}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
          {transaction.category}
        </span>
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
        {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
      </td>
    </tr>
  );

  return (
    <div className="space-y-6"> 
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Income</h3>
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹{totalIncome.toFixed(2)}</p>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Expenses</h3>
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹{totalExpense.toFixed(2)}</p>
          <p className="text-sm text-red-600 mt-2">+5% from last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Balance</h3>
            <div className="p-2 bg-sky-100 rounded-full text-sky-600">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹{totalBalance.toFixed(2)}</p>
        </div>

        {/* 1. ACTIVE BUDGETS CARD -> Clickable Link */}
        <Link 
          to="/budgets"
          className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 block cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Budgets</h3>
            <div className="p-2 bg-purple-100 rounded-full text-purple-600">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{budgets.length}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
             {transactions.length > 0 ? (
               <Table headers={transactionHeaders} data={transactions.slice(0, 5)} renderRow={renderTransactionRow} />
             ) : (
               <div className="p-6 text-center text-gray-500">No transactions found.</div>
             )}
          </div>
        </div>

        {/* Right Column: Budgets & Alerts */}
        <div className="space-y-8">
          
          {/* 2. BUDGET PROGRESS SECTION -> Clickable Link */}
          <Link 
            to="/budgets" 
            className="bg-white p-6 rounded-2xl shadow-sm block hover:shadow-md transition-shadow cursor-pointer"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Budget Progress</h2>
            <div className="space-y-4">
              {budgets.length > 0 ? budgets.map((budget) => (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{budget.category}</span>
                    <span className="text-gray-500">₹{budget.spent} / ₹{budget.limit}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${budget.color || 'bg-blue-500'}`}
                      style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )) : <p className="text-sm text-gray-500">No active budgets.</p>}
            </div>
          </Link>

          {/* Alerts */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Alerts</h2>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  alert.type === 'error' ? 'border-red-500 bg-red-50' :
                  alert.type === 'success' ? 'border-green-500 bg-green-50' :
                  'border-sky-500 bg-sky-50'
                }`}>
                  <p className="text-sm font-medium text-gray-800">
                    {alert.message ? alert.message.replace(/\$/g, '₹') : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
                </div>
              )) : <p className="text-sm text-gray-500">No new alerts.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;