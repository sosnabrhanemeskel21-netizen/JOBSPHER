import api from './api';

export const companyService = {
  createCompany: async (companyData) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  getMyCompany: async () => {
    const response = await api.get('/companies/my');
    return response.data;
  },

  updateCompany: async (companyData) => {
    const response = await api.put('/companies/my', companyData);
    return response.data;
  },
};

