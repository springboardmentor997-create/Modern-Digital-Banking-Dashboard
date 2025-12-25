import React,{ useEffect, useState } from 'react';
import { fetchRewards } from '../api/rewards';
import { Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import formatError from '../utils/formatError';

export default function Gifts() {
  const [rewards, setRewards] = useState([]);
  const [currentReward, setCurrentReward] = useState(null);

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      const data = await fetchRewards();
      setRewards(data);
    } catch (err) {
      toast.error(formatError(err));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
  <div className="mx-auto max-w-6xl">
    <div className="mb-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Rewards</h1>
      <p className="text-gray-600">Manage and track your reward points</p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rewards.map(reward => (
        <div
          key={reward.id}
          className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300"
        >
          <div className="absolute top-0 left-0 w-1 h-24 bg-gradient-to-b from-blue-500 to-blue-300"></div>

          <div className="p-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Gift className="w-7 h-7 text-blue-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              {reward.program_name}
            </h3>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Available Points</p>
              <p className="text-3xl font-bold text-blue-600">
                {reward.points_balance.toLocaleString()}
              </p>
            </div>

            <p className="text-xs text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Updated: {new Date(reward.last_updated).toLocaleString()}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-transparent px-8 py-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>

    {rewards.length === 0 && (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rewards Yet</h3>
        <p className="text-gray-600">Start earning rewards with your transactions</p>
      </div>
    )}
  </div>
</div>
  );
}
