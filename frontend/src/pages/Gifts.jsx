import React,{ useEffect, useState } from 'react';
import { fetchRewards } from '../api/rewards';
import { Gift } from 'lucide-react';
import toast from 'react-hot-toast';

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
      toast.error(err.message);
    }
  }

  return (
    <div className=" mx-auto">
        <h1 className="text-3xl font-bold">Rewards</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {rewards.map(reward => (
          <div key={reward.id} className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold">{reward.program_name}</h3>
            <p className="text-gray-600 mt-1">
              Points: <span className="font-semibold">{reward.points_balance}</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Last updated: {new Date(reward.last_updated).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
