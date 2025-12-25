import api from './api';

export const notificationService = {
  getNotifications: async (page = 0, size = 10) => {
    const response = await api.get('/users/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/users/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/users/notifications/${notificationId}/read`);
    return response.data;
  },
};

