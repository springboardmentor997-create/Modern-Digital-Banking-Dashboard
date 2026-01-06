import axiosClient from './client';

// Support Ticket API
export const createSupportTicket = async (ticketData) => {
  try {
    const response = await axiosClient.post('/support/tickets', ticketData);
    return response.data;
  } catch (error) {
    console.error('Error creating support ticket:', error);
    throw error;
  }
};

export const getUserTickets = async () => {
  try {
    const response = await axiosClient.get('/support/tickets');
    return response.data;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

export const getTicketDetails = async (ticketId) => {
  try {
    const response = await axiosClient.get(`/support/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
};

// Live Chat API
export const sendChatMessage = async (message, conversationId) => {
  try {
    const response = await axiosClient.post('/support/chat', {
      message,
      conversation_id: conversationId
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const getChatHistory = async (conversationId) => {
  try {
    const response = await axiosClient.get(`/support/chat/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

// Admin Support API (for admin users)
export const getAllTickets = async () => {
  try {
    const response = await axiosClient.get('/support/admin/tickets');
    return response.data;
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    throw error;
  }
};

export const updateTicketStatus = async (ticketId, status) => {
  try {
    const response = await axiosClient.patch(`/support/admin/tickets/${ticketId}/status`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating ticket status:', error);
    throw error;
  }
};