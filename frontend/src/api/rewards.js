import axiosClient from './client';

export const getRewards = async () => {
  const response = await axiosClient.get('/api/rewards');
  return response.data;
};

export const claimReward = async (rewardId) => {
  const response = await axiosClient.post(`/api/rewards/${rewardId}/claim`);
  return response.data;
};

export const createReward = async (title, description, points) => {
  const response = await axiosClient.post('/api/rewards', {
    title,
    description,
    points
  });
  return response.data;
};

export const getCurrencyRates = async () => {
  const response = await axiosClient.get('/api/rewards/currency/rates');
  return response.data;
};

export const redeemPoints = async (points, redemptionType) => {
  const response = await axiosClient.post('/api/rewards/redeem', {
    points,
    redemption_type: redemptionType
  });
  return response.data;
};