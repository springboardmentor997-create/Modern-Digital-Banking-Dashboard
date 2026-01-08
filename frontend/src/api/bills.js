import axiosClient from './client';

export const getBills = async () => {
  const response = await axiosClient.get('/api/bills');
  return response.data;
};

export const createBill = async (name, amount, dueDate) => {
  const response = await axiosClient.post('/api/bills', {
    name: name,
    amount: amount,
    due_date: dueDate
  });
  return response.data;
};

export const fetchExchangeRates = async () => {
  try {
    const response = await axiosClient.get('/api/bills/exchange-rates');
    return response.data;
  } catch (error) {
    // Return default rates if API fails
    return { USD: 83.12, EUR: 89.45, GBP: 104.23 };
  }
};