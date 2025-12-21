import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
// 1. REMOVED Navbar import
import Loader from '../components/Loader';
import { getAlerts, markAlertAsRead } from '../api/alerts';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAlertAsRead(id);
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-orange-500" />;
      case 'success': return <CheckCircle className="text-green-500" />;
      case 'info': return <Info className="text-blue-500" />;
      default: return <Bell className="text-gray-500" />;
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      {/* 2. REMOVED Navbar Component here */}
      
      <div className="p-6 flex-1 overflow-auto max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {alerts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 flex gap-4 transition-colors ${
                    !alert.read ? 'bg-sky-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="mt-1">{getIcon(alert.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium ${!alert.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {alert.title}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.date).toLocaleDateString()}
                      </span>
                    </div>
                    {/* CHANGED: Replaces '$' with '₹' in the message text */}
                    <p className="text-sm text-gray-600 mb-2">
                      {alert.message ? alert.message.replace(/\$/g, '₹') : ''}
                    </p>
                    {!alert.read && (
                      <button 
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="text-xs font-medium text-sky-600 hover:text-sky-700"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;