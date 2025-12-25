import api from './api';

export const paymentService = {
  uploadPayment: async (file, referenceNumber) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('referenceNumber', referenceNumber);
    const response = await api.post('/payments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPaymentStatus: async () => {
    const response = await api.get('/payments/status');
    return response.data;
  },

  getMyPayments: async () => {
    const response = await api.get('/payments/my');
    return response.data;
  },
};

