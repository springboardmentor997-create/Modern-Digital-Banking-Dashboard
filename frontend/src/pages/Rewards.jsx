import { useState, useEffect } from 'react';
import { Gift, Star, Trophy } from 'lucide-react';
// 1. Removed Navbar import
import Loader from '../components/Loader';
import { getRewards } from '../api/rewards';

const Rewards = () => {
  const [rewards, setRewards] = useState({ points: 0, history: [], available: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const data = await getRewards();
      // Safety check to ensure data exists
      setRewards(data || { points: 0, history: [], available: [] });
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    // 2. Removed "flex flex-col h-full" wrapper. 
    // Just use a simple container with spacing.
    <div className="space-y-8">
      
      {/* 3. Removed <Navbar /> */}

      {/* Main Points Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-2">Available Points</p>
            <h2 className="text-4xl font-bold mb-4">{rewards.points?.toLocaleString()}</h2>
            <p className="text-sm text-purple-100">~ ₹{(rewards.points / 100).toFixed(2)} value</p>
          </div>
          <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
            <Trophy size={48} className="text-yellow-300" />
          </div>
        </div>
      </div>

      {/* Rewards Grid Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6">Available Rewards</h3>
        
        {rewards.available && rewards.available.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.available.map((reward) => (
              <div key={reward.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  <Gift size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{reward.title}</h4>
                <p className="text-sm text-gray-500 mb-4">{reward.description}</p>
                <button 
                  className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                    rewards.points >= reward.cost 
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={rewards.points < reward.cost}
                >
                  Redeem for {reward.cost} pts
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500">No rewards available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;