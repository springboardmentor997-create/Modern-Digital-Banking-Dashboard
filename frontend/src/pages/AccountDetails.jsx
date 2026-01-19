import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Loader from '../components/Loader';
import { getAccountDetails } from '../api/accounts';

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountDetails();
  }, [id]);

  const fetchAccountDetails = async () => {
    try {
      const data = await getAccountDetails(id);
      setAccount(data);
    } catch (error) {
      console.error('Failed to fetch account details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!account) return <div className="p-6">Account not found</div>;

  const headers = ['Date', 'Description', 'Type', 'Amount', 'Status'];

  const renderRow = (transaction) => (
    <tr key={transaction.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 text-gray-600">
        {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
      </td>
      <td className="px-6 py-4 font-medium text-gray-900">
        {transaction.description}
      </td>
      <td className="px-6 py-4 capitalize text-gray-600">
        {transaction.category}
      </td>
      <td className={`px-6 py-4 font-medium ${
        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
      }`}>
        {transaction.type === 'income' ? '+' : '-'}₹{(Math.abs(transaction.amount) || 0).toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {transaction.status}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="Account Details" />
      
      <div className="p-6 flex-1 overflow-auto">
        <button 
          onClick={() => navigate('/accounts')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Accounts</span>
        </button>

        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sky-100 mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold">₹{(account.balance || 0).toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <CreditCard size={32} className="text-white" />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div>
              <p className="text-sky-100 text-sm mb-1">Account Number</p>
              <p className="font-mono text-lg">**** **** **** {account.account_number?.slice(-4)}</p>
            </div>
            <div>
              <p className="text-sky-100 text-sm mb-1">Account Type</p>
              <p className="font-medium capitalize">{account.type}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
              <Download size={18} />
              <span>Export</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <Table 
            headers={headers}
            data={account.transactions || []}
            renderRow={renderRow}
          />
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
