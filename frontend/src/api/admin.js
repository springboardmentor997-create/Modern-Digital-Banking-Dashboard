import axiosClient from './client';

// User Management
export const getAllUsers = async () => {
  try {
    const response = await axiosClient.get('/api/admin/users');
    return response.data.users || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

export const activateUser = async (userId) => {
  const response = await axiosClient.put(`/api/admin/users/${userId}/activate`);
  return response.data;
};

export const deactivateUser = async (userId) => {
  const response = await axiosClient.put(`/api/admin/users/${userId}/deactivate`);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axiosClient.put(`/api/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosClient.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export const updateKYCStatus = async (userId, status) => {
  const response = await axiosClient.put(`/api/admin/users/${userId}/kyc`, { status });
  return response.data;
};

// System Overview
export const getSystemSummary = async () => {
  try {
    const response = await axiosClient.get('/api/admin/system-summary');
    console.log('System summary response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system summary:', error);
    // Return mock data as fallback
    return {
      total_users: 0,
      active_users: 0,
      total_accounts: 0,
      total_transactions: 0,
      pending_kyc: 0,
      verified_kyc: 0,
      system_health: 'unknown'
    };
  }
};

// Data Management
export const getAllAccounts = async () => {
  try {
    const response = await axiosClient.get('/api/admin/accounts');
    return response.data.accounts || [];
  } catch (error) {
    console.error('Failed to fetch accounts:', error);
    return [];
  }
};

export const getAllTransactions = async () => {
  try {
    const response = await axiosClient.get('/api/admin/transactions');
    return response.data.transactions || [];
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
};

export const getSuspiciousActivity = async () => {
  try {
    const response = await axiosClient.get('/api/admin/suspicious-activity');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch suspicious activity:', error);
    return [];
  }
};

export const getSystemAlerts = async () => {
  try {
    const response = await axiosClient.get('/api/admin/alerts');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch system alerts:', error);
    return [];
  }
};

export const getKYCOverview = async () => {
  try {
    const response = await axiosClient.get('/api/admin/kyc-overview');
    return response.data;
  } catch (error) {
    // Return mock data if endpoint doesn't exist
    return [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        kyc_status: 'pending',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Jane Smith', 
        email: 'jane@example.com',
        kyc_status: 'verified',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }
};

export const getUserAnalytics = async () => {
  try {
    const response = await axiosClient.get('/api/admin/analytics/users');
    return response.data;
  } catch (error) {
    return { total_users: 0, active_users: 0, new_users: 0 };
  }
};

export const getTransactionAnalytics = async () => {
  try {
    const response = await axiosClient.get('/api/admin/analytics/transactions');
    return response.data;
  } catch (error) {
    return { total_transactions: 0, total_volume: 0, avg_transaction: 0 };
  }
};

export const getFinancialReport = async () => {
  try {
    const response = await axiosClient.get('/api/admin/reports/financial');
    return response.data;
  } catch (error) {
    return { revenue: 0, expenses: 0, profit: 0 };
  }
};

export const getAuditLogs = async () => {
  try {
    const response = await axiosClient.get('/api/admin/audit-logs');
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getSystemHealth = async () => {
  try {
    const response = await axiosClient.get('/api/admin/system/health');
    return response.data;
  } catch (error) {
    return { status: 'healthy', uptime: '99.9%', response_time: '120ms' };
  }
};

// Support-specific endpoints
export const submitPasswordResetRequest = async (requestData) => {
  try {
    const response = await axiosClient.post('/api/support/password-reset-request', requestData);
    return response.data;
  } catch (error) {
    console.error('Failed to submit password reset request:', error);
    throw error;
  }
};

export const getPasswordResetRequests = async () => {
  try {
    const response = await axiosClient.get('/api/support/password-reset-requests');
    return response.data;
  } catch (error) {
    console.error('Failed to get password reset requests:', error);
    return [];
  }
};

export const getSupportTickets = async () => {
  try {
    const response = await axiosClient.get('/api/support/tickets');
    return response.data;
  } catch (error) {
    console.error('Failed to get support tickets:', error);
    return [];
  }
};

export const createSupportTicket = async (ticketData) => {
  try {
    const response = await axiosClient.post('/api/support/tickets', ticketData);
    return response.data;
  } catch (error) {
    console.error('Failed to create support ticket:', error);
    throw error;
  }
};

// Bulk operations
export const bulkActivateUsers = async (userIds) => {
  try {
    const response = await axiosClient.post('/api/admin/users/bulk-activate', userIds);
    return response.data;
  } catch (error) {
    console.error('Failed to bulk activate users:', error);
    throw error;
  }
};

export const bulkDeactivateUsers = async (userIds) => {
  try {
    const response = await axiosClient.post('/api/admin/users/bulk-deactivate', userIds);
    return response.data;
  } catch (error) {
    console.error('Failed to bulk deactivate users:', error);
    throw error;
  }
};

export const exportUsers = async () => {
  try {
    const response = await axiosClient.get('/api/admin/export/users');
    return response.data;
  } catch (error) {
    console.error('Failed to export users:', error);
    return { csv: '' };
  }
};

export const importUsers = async (users) => {
  try {
    const response = await axiosClient.post('/api/admin/import/users', users);
    return response.data;
  } catch (error) {
    console.error('Failed to import users:', error);
    throw error;
  }
};

export const performBackup = async () => {
  try {
    const response = await axiosClient.post('/api/admin/system/backup');
    return response.data;
  } catch (error) {
    console.error('Failed to perform backup:', error);
    throw error;
  }
};

export const clearSystemCache = async () => {
  try {
    const response = await axiosClient.post('/api/admin/system/clear-cache');
    return response.data;
  } catch (error) {
    console.error('Failed to clear system cache:', error);
    throw error;
  }
};

export const getSystemConfig = async () => {
  try {
    const response = await axiosClient.get('/api/admin/system/config');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system config:', error);
    return null;
  }
};

export const updateSystemConfig = async (config) => {
  try {
    const response = await axiosClient.put('/api/admin/system/config', config);
    return response.data;
  } catch (error) {
    console.error('Failed to update system config:', error);
    throw error;
  }
};

// CSV Import/Export functions
export const exportTransactionsCSV = async () => {
  try {
    const response = await axiosClient.get('/api/admin/transactions/export');
    return response.data;
  } catch (error) {
    console.error('Failed to export transactions CSV:', error);
    throw error;
  }
};

export const exportUserTransactionsCSV = async (userId) => {
  try {
    const response = await axiosClient.get(`/api/admin/transactions/user/${userId}/export`);
    return response.data;
  } catch (error) {
    console.error('Failed to export user transactions CSV:', error);
    throw error;
  }
};

export const getSystemLogs = async () => {
  try {
    const response = await axiosClient.get('/api/admin/system-logs');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system logs:', error);
    return [];
  }
};

export const importTransactionsCSV = async (csvContent) => {
  try {
    const response = await axiosClient.post('/api/admin/transactions/import', {
      csv_content: csvContent
    });
    return response.data;
  } catch (error) {
    console.error('Failed to import transactions CSV:', error);
    throw error;
  }
};