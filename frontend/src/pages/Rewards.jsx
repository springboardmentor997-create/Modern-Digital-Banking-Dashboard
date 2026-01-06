import React,{ useEffect, useState } from 'react';
import { fetchRewards, createReward, updateReward, deleteReward } from '../api/rewards';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);

  const [form, setForm] = useState({
    program_name: '',
    points_balance: '',
  });

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

  function openAddModal() {
    setEditMode(false);
    setCurrentReward(null);
    setForm({ program_name: '', points_balance: '' });
    setShowModal(true);
  }

  function openEditModal(reward) {
    setEditMode(true);
    setCurrentReward(reward);
    setForm({
      program_name: reward.program_name,
      points_balance: reward.points_balance,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditMode(false);
    setCurrentReward(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editMode) {
        await updateReward(currentReward.id, form);
      } else {
        await createReward(form);
      }
      await loadRewards();
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this reward program?')) return;
    try {
      await deleteReward(id);
      await loadRewards();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rewards</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Program
        </button>
      </div>

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

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => openEditModal(reward)}
                className="px-3 py-2 border rounded-lg text-orange-600"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(reward.id)}
                className="px-3 py-2 border rounded-lg text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editMode ? 'Edit Reward' : 'Add Reward'}
              </h2>
              <button onClick={closeModal}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Program Name</label>
                <input
                  type="text"
                  value={form.program_name}
                  onChange={e => setForm({ ...form, program_name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Points Balance</label>
                <input
                  type="number"
                  value={form.points_balance}
                  onChange={e => setForm({ ...form, points_balance: Number(e.target.value) })}
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {editMode ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
