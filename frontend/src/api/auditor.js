import axiosClient from './client';

// Read-Only User Data
export const getUsersAudit = async () => {
  const response = await axiosClient.get('/api/auditor/users');
  return response.data;
};

export const getUserDetailAudit = async (userId) => {
  const response = await axiosClient.get(`/api/auditor/users/${userId}`);
  return response.data;
};

// Read-Only Account Data
export const getAccountsAudit = async () => {
  const response = await axiosClient.get('/api/auditor/accounts');
  return response.data;
};

export const getAccountDetailAudit = async (accountId) => {
  const response = await axiosClient.get(`/api/auditor/accounts/${accountId}`);
  return response.data;
};

// Read-Only Transaction Data
export const getTransactionsAudit = async (params = {}) => {
  const response = await axiosClient.get('/api/auditor/transactions', { params });
  return response.data;
};

// System Logs and Compliance
export const getSystemLogsAudit = async () => {
  const response = await axiosClient.get('/api/auditor/system-logs');
  return response.data;
};

export const getAlertsAudit = async () => {
  const response = await axiosClient.get('/api/auditor/alerts');
  return response.data;
};

export const getComplianceSummary = async () => {
  const response = await axiosClient.get('/api/auditor/compliance-summary');
  return response.data;
};

export const getTransactionPatterns = async () => {
  const response = await axiosClient.get('/api/auditor/transaction-patterns');
  return response.data;
};

export const getUserActivityReport = async () => {
  const response = await axiosClient.get('/api/auditor/user-activity-report');
  return response.data;
};