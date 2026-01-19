import { useState, useEffect } from 'react';
import { Gift, Users, Award, Plus, Edit, Trash2, Eye, Search, Filter, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const RewardsManagement = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [usersData] = await Promise.all([
        adminApi.getAllUsers()
      ]);
      
      setUsers(usersData || []);
      
      // Mock rewards data
      setRewards([
        {
          id: 1,
          user_id: 123,
          user_name: 'John Doe',
          user_email: 'john@example.com',
          reward_type: 'cashback',
          amount: 50.00,
          description: 'Monthly cashback reward',
          status: 'active',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          user_id: 456,
          user_name: 'Jane Smith',
          user_email: 'jane@example.com',
          reward_type: 'points',
          amount: 1000,
          description: 'Transaction milestone reward',
          status: 'redeemed',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          user_id: 789,
          user_name: 'Mike Johnson',
          user_email: 'mike@example.com',
          reward_type: 'bonus',
          amount: 25.00,
          description: 'Welcome bonus',
          status: 'expired',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          expires_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } catch (error) {
      console.error('Failed to load rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReward = async (rewardData) => {
    try {
      const newReward = {
        id: Date.now(),
        ...rewardData,
        status: 'active',
        created_at: new Date().toISOString()
      };
      setRewards(prev => [newReward, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create reward:', error);
    }
  };

  const deleteReward = async (rewardId) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      setRewards(prev => prev.filter(r => r.id !== rewardId));
    }
  };

  const filteredRewards = rewards.filter(reward => {
    if (filter !== 'all' && reward.status !== filter) return false;
    if (searchTerm && !reward.user_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !reward.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const rewardStats = {
    total: rewards.length,
    active: rewards.filter(r => r.status === 'active').length,
    redeemed: rewards.filter(r => r.status === 'redeemed').length,
    expired: rewards.filter(r => r.status === 'expired').length,
    totalValue: rewards.reduce((sum, r) => sum + parseFloat(r.amount), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Rewards Management
        </h1>
        <p className="text-gray-600">Manage and distribute rewards to users</p>
      </div>

      {/* Rewards Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3">
            <Gift className="text-blue-600" size={20} />
            <div>
              <p className="text-xs text-gray-500">Total Rewards</p>
              <p className="text-xl font-bold text-gray-900">{rewardStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3">
            <Award className="text-green-600" size={20} />
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold text-green-600">{rewardStats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3">
            <Users className="text-purple-600" size={20} />
            <div>
              <p className="text-xs text-gray-500">Redeemed</p>
              <p className="text-xl font-bold text-purple-600">{rewardStats.redeemed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-red-600 rounded-full" />
            <div>
              <p className="text-xs text-gray-500">Expired</p>
              <p className="text-xl font-bold text-red-600">{rewardStats.expired}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-3">
            <DollarSign className="text-orange-600" size={20} />
            <div>
              <p className="text-xs text-gray-500">Total Value</p>
              <p className="text-xl font-bold text-orange-600">₹{rewardStats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="redeemed">Redeemed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search rewards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
              />
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Plus size={16} />
            <span>Create Reward</span>
          </button>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Reward Type</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Expires</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRewards.map(reward => (
                <tr key={reward.id} className="hover:bg-gray-50/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {reward.user_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{reward.user_name}</p>
                        <p className="text-xs text-gray-500">{reward.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      reward.reward_type === 'cashback' ? 'bg-green-100 text-green-800' :
                      reward.reward_type === 'points' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {reward.reward_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-gray-900">
                      {reward.reward_type === 'cashback' ? `₹${(parseFloat(reward.amount) || 0).toLocaleString()}` : 
                       reward.reward_type === 'points' ? `${reward.amount || 0} pts` : 
                       `₹${(parseFloat(reward.amount) || 0).toLocaleString()}`}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-700">{reward.description}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      reward.status === 'active' ? 'bg-green-100 text-green-800' :
                      reward.status === 'redeemed' ? 'bg-blue-100 text-blue-800' :
                      reward.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {reward.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {reward.expires_at ? new Date(reward.expires_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteReward(reward.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Reward Modal */}
      {showCreateModal && (
        <CreateRewardModal
          users={users}
          onClose={() => setShowCreateModal(false)}
          onCreate={createReward}
        />
      )}
    </div>
  );
};

const CreateRewardModal = ({ users, onClose, onCreate }) => {
  const [formData, setFormData] = useState(() => ({
    user_id: '',
    reward_type: 'cashback',
    amount: '',
    description: '',
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedUser = users.find(u => u.id === parseInt(formData.user_id));
    onCreate({
      ...formData,
      user_id: parseInt(formData.user_id),
      user_name: selectedUser?.name || 'Unknown User',
      user_email: selectedUser?.email || '',
      amount: parseFloat(formData.amount),
      expires_at: new Date(formData.expires_at).toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Reward</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type</label>
            <select
              value={formData.reward_type}
              onChange={(e) => setFormData(prev => ({ ...prev, reward_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="cashback">Cashback</option>
              <option value="points">Points</option>
              <option value="bonus">Bonus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expires On</label>
            <input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Reward
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RewardsManagement;