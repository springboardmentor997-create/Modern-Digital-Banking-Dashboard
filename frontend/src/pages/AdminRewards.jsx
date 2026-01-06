import React, { useState, useEffect } from 'react';
import { Gift, Users, Plus, Star, Trophy, DollarSign } from 'lucide-react';
import axiosClient from '../api/client';

const AdminRewards = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [rewardData, setRewardData] = useState({
    points: '',
    message: '',
    title: '',
    reward_type: 'points',
    reward_value: ''
  });
  const [loading, setLoading] = useState(false);
  const [recentRewards, setRecentRewards] = useState([]);
  const [editingReward, setEditingReward] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const predefinedRewards = [
    { title: 'Welcome Bonus', points: 500, message: 'Welcome to our banking system! Enjoy your bonus points.', type: 'points', value: '500' },
    { title: 'Loyalty Reward', points: 1000, message: 'Thank you for being a loyal customer!', type: 'points', value: '1000' },
    { title: 'Transaction Milestone', points: 750, message: 'Congratulations on completing 50 transactions!', type: 'points', value: '750' },
    { title: 'Bill Payment Bonus', points: 300, message: 'Great job on paying your bills on time!', type: 'points', value: '300' },
    { title: 'Savings Achievement', points: 1500, message: 'Excellent savings performance this month!', type: 'points', value: '1500' },
    { title: 'Premium Customer', points: 2000, message: 'Special reward for our premium customers!', type: 'points', value: '2000' },
    { title: 'Cashback Reward', points: 0, message: 'Enjoy ₹25 cashback to your account!', type: 'cashback', value: '25' },
    { title: 'Gift Card', points: 0, message: '₹50 Amazon Gift Card - Check your email!', type: 'gift_card', value: '50' },
    { title: 'Free Premium Month', points: 0, message: 'Enjoy 1 month of premium features for free!', type: 'premium', value: '1' },
    { title: 'Interest Rate Boost', points: 0, message: '0.5% interest rate boost for 3 months!', type: 'interest_boost', value: '0.5' },
    { title: 'Fee Waiver', points: 0, message: 'All transaction fees waived for 1 month!', type: 'fee_waiver', value: '30' },
    { title: 'VIP Support Access', points: 0, message: 'Priority customer support for 6 months!', type: 'vip_support', value: '6' }
  ];

  useEffect(() => {
    fetchUsers();
    fetchRecentRewards();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/admin/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchRecentRewards = async () => {
    try {
      const response = await axiosClient.get('/admin/rewards/recent');
      setRecentRewards(response.data || []);
    } catch (error) {
      console.error('Failed to fetch recent rewards:', error);
    }
  };

  const handleGiveReward = async (e) => {
    e.preventDefault();
    if (!selectedUser || !rewardData.points) return;

    setLoading(true);
    try {
      await axiosClient.post(`/admin/users/${selectedUser}/give-reward`, {
        points: parseInt(rewardData.points),
        admin_message: rewardData.message,
        title: rewardData.title
      });
      
      alert('Reward given successfully!');
      setRewardData({ points: '', message: '', title: '' });
      setSelectedUser('');
      fetchRecentRewards();
    } catch (error) {
      console.error('Failed to give reward:', error);
      alert('Failed to give reward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedReward = (reward) => {
    setRewardData({
      title: reward.title,
      points: reward.points.toString(),
      message: reward.message,
      reward_type: reward.type,
      reward_value: reward.value
    });
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setRewardData({
      title: reward.title || 'Admin Reward',
      points: reward.points?.toString() || '0',
      message: reward.admin_message || '',
      reward_type: 'points',
      reward_value: reward.points?.toString() || '0'
    });
    setShowEditModal(true);
  };

  const handleUpdateReward = async (e) => {
    e.preventDefault();
    if (!editingReward) return;

    setLoading(true);
    try {
      await axiosClient.put(`/admin/rewards/${editingReward.id}`, {
        title: rewardData.title,
        points: parseInt(rewardData.points) || 0,
        admin_message: rewardData.message,
        reward_type: rewardData.reward_type,
        reward_value: rewardData.reward_value
      });
      
      alert('Reward updated successfully!');
      setRewardData({ title: '', points: '', message: '', reward_type: 'points', reward_value: '' });
      setEditingReward(null);
      setShowEditModal(false);
      fetchRecentRewards();
    } catch (error) {
      console.error('Failed to update reward:', error);
      alert('Failed to update reward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rewards Management</h1>
            <p className="text-gray-600">Give rewards to users and track reward history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Give Reward Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Give Reward</h2>
            </div>

            <form onSubmit={handleGiveReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Title
                </label>
                <input
                  type="text"
                  value={rewardData.title}
                  onChange={(e) => setRewardData({...rewardData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Welcome Bonus"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Type
                </label>
                <select
                  name="reward_type"
                  value={rewardData.reward_type}
                  onChange={(e) => setRewardData({...rewardData, reward_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="points">Points</option>
                  <option value="cashback">Cashback (₹)</option>
                  <option value="gift_card">Gift Card (₹)</option>
                  <option value="premium">Premium Access (months)</option>
                  <option value="interest_boost">Interest Rate Boost (%)</option>
                  <option value="fee_waiver">Fee Waiver (days)</option>
                  <option value="vip_support">VIP Support (months)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {rewardData.reward_type === 'points' ? 'Points' : 
                   rewardData.reward_type === 'cashback' ? 'Cashback Amount (₹)' :
                   rewardData.reward_type === 'gift_card' ? 'Gift Card Value (₹)' :
                   rewardData.reward_type === 'premium' ? 'Premium Months' :
                   rewardData.reward_type === 'interest_boost' ? 'Interest Rate (%)' :
                   rewardData.reward_type === 'fee_waiver' ? 'Days' :
                   rewardData.reward_type === 'vip_support' ? 'Support Months' : 'Value'}
                </label>
                <input
                  type="number"
                  value={rewardData.reward_type === 'points' ? rewardData.points : rewardData.reward_value}
                  onChange={(e) => {
                    if (rewardData.reward_type === 'points') {
                      setRewardData({...rewardData, points: e.target.value, reward_value: e.target.value});
                    } else {
                      setRewardData({...rewardData, reward_value: e.target.value, points: '0'});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter value"
                  min="0"
                  step={rewardData.reward_type === 'interest_boost' ? '0.1' : '1'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={rewardData.message}
                  onChange={(e) => setRewardData({...rewardData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Add a personal message for the user..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Giving Reward...' : 'Give Reward'}
              </button>
            </form>
          </div>

          {/* Predefined Rewards */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-gray-900">Quick Rewards</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {predefinedRewards.map((reward, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedReward(reward)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{reward.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {reward.type === 'points' ? 'Points' :
                         reward.type === 'cashback' ? 'Cashback' :
                         reward.type === 'gift_card' ? 'Gift Card' :
                         reward.type === 'premium' ? 'Premium' :
                         reward.type === 'interest_boost' ? 'Interest Boost' :
                         reward.type === 'fee_waiver' ? 'Fee Waiver' :
                         reward.type === 'vip_support' ? 'VIP Support' : 'Reward'}
                      </span>
                      <span className="text-purple-600 font-bold">
                        {reward.type === 'points' ? `${reward.points} pts` :
                         reward.type === 'cashback' ? `₹${reward.value}` :
                         reward.type === 'gift_card' ? `₹${reward.value}` :
                         reward.type === 'premium' ? `${reward.value}mo` :
                         reward.type === 'interest_boost' ? `${reward.value}%` :
                         reward.type === 'fee_waiver' ? `${reward.value}d` :
                         reward.type === 'vip_support' ? `${reward.value}mo` : reward.value}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{reward.message}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Rewards */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Recent Rewards Given</h2>
          </div>

          {recentRewards.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Reward</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Points</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRewards.map((reward) => (
                    <tr key={reward.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{reward.user?.name}</div>
                          <div className="text-sm text-gray-500">{reward.user?.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{reward.title || 'Admin Reward'}</div>
                          <div className="text-sm text-gray-500">{reward.admin_message}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                          <DollarSign size={14} />
                          {reward.points}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(reward.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEditReward(reward)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No rewards given yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Reward Modal */}
      {showEditModal && editingReward && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📝 Edit Reward
            </h2>
            
            <form onSubmit={handleUpdateReward} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reward Title
                </label>
                <input
                  type="text"
                  value={rewardData.title}
                  onChange={(e) => setRewardData({...rewardData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Welcome Bonus"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  value={rewardData.points}
                  onChange={(e) => setRewardData({...rewardData, points: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter points amount"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={rewardData.message}
                  onChange={(e) => setRewardData({...rewardData, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Add a personal message for the user..."
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReward(null);
                    setRewardData({ title: '', points: '', message: '', reward_type: 'points', reward_value: '' });
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRewards;