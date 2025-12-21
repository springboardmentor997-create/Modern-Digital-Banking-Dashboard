import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';
// import Navbar from '../components/Navbar'; // Removed import
import Table from '../components/Table';
import Loader from '../components/Loader';
import { getBills } from '../api/bills';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const data = await getBills();
      setBills(data);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const headers = ['Bill Name', 'Due Date', 'Amount', 'Status', 'Auto-Pay'];

  const renderRow = (bill) => {
    const isOverdue = new Date(bill.dueDate) < new Date() && bill.status !== 'paid';
    
    return (
      <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <span className="font-medium text-gray-900">{bill.name}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            {isOverdue && <AlertCircle size={16} />}
            <span>{new Date(bill.dueDate).toLocaleDateString()}</span>
          </div>
        </td>
        <td className="px-6 py-4 font-medium text-gray-900">
          ₹{bill.amount.toLocaleString()}
        </td>
        <td className="px-6 py-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            bill.status === 'paid' 
              ? 'bg-green-100 text-green-700' 
              : isOverdue 
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
          }`}>
            {bill.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
          </span>
        </td>
        <td className="px-6 py-4">
          {bill.autoPay ? (
            <span className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle size={16} /> On
            </span>
          ) : (
            <span className="text-gray-400 text-sm">Off</span>
          )}
        </td>
      </tr>
    );
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      {/* <Navbar title="Bills & Payments" /> */} {/* Removed Navbar component */}
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Total Due</h3>
            <p className="text-2xl font-bold text-gray-900">₹1,250.00</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Upcoming (7 Days)</h3>
            <p className="text-2xl font-bold text-orange-600">3 Bills</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium mb-2">Paid This Month</h3>
            <p className="text-2xl font-bold text-green-600">₹450.00</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Upcoming Bills</h3>
          </div>
          <Table 
            headers={headers}
            data={bills}
            renderRow={renderRow}
          />
        </div>
      </div>
    </div>
  );
};

export default Bills;