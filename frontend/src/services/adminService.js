import api from './api';

export const adminService = {
  getPendingPayments: async () => {
    const response = await api.get('/admin/payments');
    return response.data;
  },

  verifyPayment: async (paymentId, status, adminNotes) => {
    const response = await api.put(`/admin/payments/${paymentId}/verify`, {
      status,
      adminNotes,
    });
    return response.data;
  },

  getPendingJobs: async () => {
    const response = await api.get('/admin/jobs/pending');
    return response.data;
  },

  approveJob: async (jobId) => {
    const response = await api.put(`/admin/jobs/${jobId}/approve`);
    return response.data;
  },

  rejectJob: async (jobId, reason) => {
    const response = await api.put(`/admin/jobs/${jobId}/reject`, null, {
      params: { reason },
    });
    return response.data;
  },

  // User Management Methods
  getUsersByRole: async (role) => {
    const response = await api.get('/admin/users', {
      params: { role },
    });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId, enabled) => {
    const response = await api.put(`/admin/users/${userId}/status`, null, {
      params: { enabled },
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
};

