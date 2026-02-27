import axiosClient from './client';

export const getAlerts = async () => {
  try {
    const response = await axiosClient.get('/api/alerts');
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
};

export const createAlert = async (title, message, priority = 'info') => {
  try {
    const alertData = {
      title: title,
      message: message,
      priority: priority
    };
    const response = await axiosClient.post('/api/alerts/', alertData);
    return response.data;
  } catch (error) {
    console.error("Error creating alert:", error);
    throw error;
  }
};

export const checkBillReminders = async () => {
  try {
    const response = await axiosClient.post('/api/alerts/bill-reminders');
    return response.data;
  } catch (error) {
    console.error("Error checking bill reminders:", error);
    throw error;
  }
};

export const getAlertsSummary = async () => {
  try {
    const response = await axiosClient.get('/api/alerts/summary/');
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts summary:", error);
    return { count: 0, unread: 0 };
  }
};

export const markAlertAsRead = async (alertId) => {
  try {
    const response = await axiosClient.patch(`/api/alerts/${alertId}/read`);
    return response.data;
  } catch (error) {
    console.error(`Error marking alert ${alertId} as read:`, error);
    throw error;
  }
};

export const deleteAlert = async (alertId) => {
  try {
    const response = await axiosClient.delete(`/api/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting alert ${alertId}:`, error);
    throw error;
  }
};

export const markAlertsAsRead = async (alertIds) => {
  try {
    await Promise.all(alertIds.map(id => markAlertAsRead(id)));
    return true;
  } catch (error) {
    console.error('Error marking alerts as read:', error);
    throw error;
  }
};

export const deleteAlerts = async (alertIds) => {
  try {
    await Promise.all(alertIds.map(id => deleteAlert(id)));
    return true;
  } catch (error) {
    console.error('Error deleting alerts:', error);
    throw error;
  }
};