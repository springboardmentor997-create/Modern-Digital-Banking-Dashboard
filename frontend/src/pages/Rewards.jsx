import React, { useEffect, useState } from 'react';
import { fetchRewards, createReward, updateReward, deleteReward } from '../api/rewards';
import { Plus, Edit2, Trash2, Save, X, Award, Users as UsersIcon, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Load from '../components/Loader';

export default function Rewards({ users }) {
  const [rewards, setRewards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentReward, setCurrentReward] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [form, setForm] = useState({
    program_name: '',
    points_balance: '',
  });

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      setLoading(true);
      const data = await fetchRewards();
      setRewards(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getGroupedRewards() {
    const grouped = {};
    rewards.forEach(reward => {
      const key = reward.program_name;
      if (!grouped[key]) {
        grouped[key] = {
          ids: [],
          program_name: reward.program_name,
          points_balance: reward.points_balance,
          userIds: [],
          users: []
        };
      }
      grouped[key].ids.push(reward.id);
      grouped[key].userIds.push(reward.user_id);
      const user = users.find(u => u.id === reward.user_id);
      if (user) {
        grouped[key].users.push(user);
      }
    });
    return Object.values(grouped);
  }

  function openAddModal() {
    setEditMode(false);
    setCurrentReward(null);
    setForm({ program_name: '', points_balance: '' });
    setSelectedUsers([]);
    setShowModal(true);
  }

  function openEditModal(groupedReward) {
    setEditMode(true);
    setCurrentReward(groupedReward);
    setForm({
      program_name: groupedReward.program_name,
      points_balance: groupedReward.points_balance,
    });
    setSelectedUsers(groupedReward.users);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditMode(false);
    setCurrentReward(null);
    setSelectedUsers([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      toast.error('Select at least one user');
      return;
    }

    const payload = {
      program_name: form.program_name,
      points_balance: Number(form.points_balance),
      user_ids: selectedUsers.map(u => u.id),
    };

    try {
      setLoading(true);

      if (editMode) {
        for (const id of currentReward.ids) {
          await deleteReward(id);
        }
      }

      await createReward(payload);
      await loadRewards();
      closeModal();
      toast.success(editMode ? 'Reward updated' : 'Reward created & assigned');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete(onConfirm) {
    toast.custom((t) => (
      <div className="bg-white rounded-xl shadow-lg p-4 w-80">
        <p className="text-gray-800 font-medium mb-4">
          Are you sure you want to delete this Budget?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  }

  async function handleDelete(programName) {
    if (!confirm('Delete this reward program and all assignments?')) return;

    try {
      setLoading(true);
      const programRewards = rewards.filter(r => r.program_name === programName);
      
      for (const reward of programRewards) {
        await deleteReward(reward.id);
      }
      
      await loadRewards();
      toast.success('Reward deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Load />;

  const groupedRewards = getGroupedRewards();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            Rewards Programs
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage reward programs and user assignments
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-5 py-3 bg-[#1FB6A6] text-white rounded-lg
                    flex items-center justify-center gap-2
                    transition-all shadow-lg hover:opacity-90"
        >
          <Plus size={20} />
          <span>Add Reward Program</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedRewards.map(reward => (
          <div 
            key={reward.program_name} 
            className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-white/40 transition-all duration-300 overflow-hidden group"
          >
            <div className="bg-gradient-to-r from-[#1FB6A6] to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{reward.program_name}</h3>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-[#1fb6a6]/30 to-pink-100/50 rounded-xl p-4 border border-purple-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-700 font-medium">Points Offered</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{reward.points_balance}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-gray-600" />
                  <p className="text-sm font-semibold text-gray-700">
                    Assigned to {reward.users.length} user{reward.users.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto">
                  {reward.users.length > 0 ? (
                    reward.users.map(user => (
                      <div key={user.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200/50 hover:border-purple-300 transition">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-2">No users assigned</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => openEditModal(reward)}
                  className="flex-1 px-4 py-2.5 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
                >
                  <Edit2 size={16} className="group-hover:scale-110 transition" />
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete( () => handleDelete(reward.program_name))}
                  className="flex-1 px-4 py-2.5 border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all flex items-center justify-center gap-2 group"
                >
                  <Trash2 size={16} className="group-hover:scale-110 transition" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {groupedRewards.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No reward programs yet</p>
          <p className="text-gray-400 text-sm">Create one to get started</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r to-[#1FB6A6] from-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editMode ? 'Edit Reward Program' : 'Create New Reward'}
              </h2>
              <button onClick={closeModal} className="text-white/80 hover:text-white transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Program Name</label>
                <input
                  type="text"
                  value={form.program_name}
                  onChange={e => setForm({ ...form, program_name: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-600 transition-colors"
                  required
                  placeholder="e.g., Loyalty Plus"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Points Balance</label>
                <div className="relative">
                  <Zap className="absolute left-3 top-3 w-5 h-5 text-orange-600" />
                  <input
                    type="number"
                    value={form.points_balance}
                    onChange={e => setForm({ ...form, points_balance: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:border-orange-600 transition-colors"
                    required
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Assign Users</label>
                <select
                  multiple
                  value={selectedUsers.map(u => u.id)}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, o => Number(o.value));
                    setSelectedUsers(users.filter(u => values.includes(u.id)));
                  }}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 h-40 focus:outline-none focus:border-orange-600 transition-colors"
                  required
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
              </div>

              {selectedUsers.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-900">
                    <span className="font-semibold">{selectedUsers.length}</span> user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg"
              >
                <Save size={20} />
                {editMode ? 'Update Reward' : 'Create & Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}