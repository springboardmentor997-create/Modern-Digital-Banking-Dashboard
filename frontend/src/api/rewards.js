import { getAuthHeaders } from "./auth";

const API_BASE_URL = 'http://localhost:8000/api/rewards';

export async function fetchRewards() {
  const response = await fetch(`${API_BASE_URL}/`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch rewards');
  }

  return await response.json();
}

export async function createReward(data) {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      program_name: data.program_name,
      points_balance: data.points_balance,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create reward');
  }

  return await response.json();
}

export async function updateReward(id, data) {
  const response = await fetch(`${API_BASE_URL}/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      program_name: data.program_name,
      points_balance: data.points_balance,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update reward');
  }

  return await response.json();
}

export async function deleteReward(id) {
  const response = await fetch(`${API_BASE_URL}/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete reward');
  }
}