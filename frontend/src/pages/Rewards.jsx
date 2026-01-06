import { useState, useEffect } from 'react';
import { Gift, Star, Trophy, RefreshCw, DollarSign, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { getRewards } from '../api/rewards';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    fetchRewardsData();
    calculateUserPoints();
  }, []);

  const fetchRewardsData = async () => {
    try {
      const rewardsRes = await getRewards();
      console.log('Rewards API response:', rewardsRes);
      
      // Handle both array and object responses
      let rewardsList = [];
      if (Array.isArray(rewardsRes)) {
        rewardsList = rewardsRes;
      } else if (rewardsRes && Array.isArray(rewardsRes.rewards)) {
        rewardsList = rewardsRes.rewards;
      }
      
      // Filter for admin-given rewards
      const adminRewards = rewardsList.filter(reward => reward.given_by_admin === true);
      console.log('Admin rewards found:', adminRewards);
      setRewards(adminRewards);
    } catch (error) {
      console.error('Failed to fetch rewards data:', error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserPoints = () => {
    const basePoints = 1250;
    const transactionBonus = Math.floor(Math.random() * 300);
    const billPaymentBonus = Math.floor(Math.random() * 200);
    const totalPoints = basePoints + transactionBonus + billPaymentBonus;
    setUserPoints(totalPoints);
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="Rewards" />
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Rewards</h1>
          <button
            onClick={fetchRewardsData}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Points Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 mb-2">Available Points</p>
                <h2 className="text-4xl font-bold mb-4">{userPoints.toLocaleString()}</h2>
                <div className="flex items-center gap-4 text-sm text-purple-100">
                  <span>~ ₹{(userPoints / 10).toFixed(2)} value</span>
                  <span>•</span>
                  <span>Rank: {userPoints > 2000 ? 'Gold' : userPoints > 1000 ? 'Silver' : 'Bronze'}</span>
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm">
                <Trophy size={48} className="text-yellow-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign size={24} />
              <h3 className="text-lg font-semibold">Cash Value</h3>
            </div>
            <div className="text-3xl font-bold">₹{(userPoints / 10).toFixed(2)}</div>
            <div className="text-sm opacity-90">Equivalent cash value</div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={24} />
              <h3 className="text-lg font-semibold">Admin Rewards</h3>
            </div>
            <div className="text-3xl font-bold">{rewards.length}</div>
            <div className="text-sm opacity-90">Rewards received</div>
          </div>
        </div>

        {/* Admin Given Rewards */}
        {rewards.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rewards from Admin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div key={reward.id} className="bg-white p-6 rounded-2xl shadow-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="text-purple-600" size={20} />
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                      Admin Reward
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{reward.title || 'Special Reward'}</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {reward.description || 'Congratulations! You received a special reward from admin.'}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-purple-600">+{reward.points || reward.points_required || 0} points</span>
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div className="text-xs text-gray-400">
                    Received: {new Date(reward.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-lg text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Rewards Yet</h3>
            <p className="text-gray-500">
              You haven't received any rewards from admin yet. Keep using our services to earn rewards!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;