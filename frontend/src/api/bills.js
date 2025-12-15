import { getAuthHeaders } from "./auth";

const BASE_URL = 'http://localhost:8000/api/rewards';

export const getBills = async () => {
  const res = await fetch(BASE_URL, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch bills');
  return res.json();
};

export const addBill = async (payload) => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add bill');
};

export const updateBill = async (id, payload) => {
  const res = await fetch(`${BASE_URL}${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update bill');
};

export const deleteBill = async (id) => {
  const res = await fetch(`${BASE_URL}${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete bill');
};

export const markPaid = async (id) => {
  const res = await fetch(`${BASE_URL}${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: 'paid' }),
  });
  if (!res.ok) throw new Error('Failed to mark paid');
};
